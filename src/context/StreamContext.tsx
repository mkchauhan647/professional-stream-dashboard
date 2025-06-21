// src/context/StreamContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { socket } from '../services/socket';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'; // Make sure you have uuid installed: npm install uuid @types/uuid
import { useAudioMixer, type AudioSourceType } from '../hooks/useAudioMixer';

// --- Type Definitions ---
export interface Platform {
  id: string;
  name: string;
  rtmpUrl: string;
  streamKey: string;
}
export interface PlatformStatus {
  status: 'idle' | 'live' | 'reconnecting' | 'failed';
}
export interface StreamStatusPayload {
    message: string;
    active: boolean;
    platforms: Record<string, PlatformStatus>;
}

// --- Updated Interface ---
interface IStreamContext {
  isConnected: boolean;
  isStreaming: boolean;
  ffmpegStatus: StreamStatusPayload;
  previewStream: MediaStream | null;
  latency: number;
  audioSource: AudioSourceType;
  setAudioSource: (source: AudioSourceType) => void;
  quality: string;
  setQuality: (q: string) => void;
  useScreen: boolean;
  setUseScreen: (use: boolean) => void;
  
  // Platform State (Replaces youtubeKey, facebookKey)
  platforms: Platform[];
  addPlatform: () => void;
  updatePlatform: (id: string, newPlatformData: Partial<Platform>) => void;
  removePlatform: (id: string) => void;
  
  startStream: () => Promise<void>;
  stopStream: () => void;
  connectToServer: () => void;
}

const StreamContext = createContext<IStreamContext | null>(null);

export const useStream = () => {
    const context = useContext(StreamContext);
    if (!context) throw new Error("useStream must be used within a StreamProvider");
    return context;
};

export const StreamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [audioSource, setAudioSourceState] = useState<AudioSourceType>('mic');
  const [latency, setLatency] = useState(0);
  const [ffmpegStatus, setFfmpegStatus] = useState<StreamStatusPayload>({ active: false, message: 'FFmpeg not running', platforms: {} });
  const [quality, setQuality] = useState('720p');
  const [useScreen, setUseScreen] = useState(false);
  
  // --- Updated State for Platforms ---
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: uuidv4(), name: 'YouTube', rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2', streamKey: '' },
    { id: uuidv4(), name: 'Facebook', rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp', streamKey: '' },
    { id: uuidv4(), name: 'Custom', rtmpUrl: 'rtmp://localhost:1935/live', streamKey: '' }
  ]);

  // Refs
  const streamCleanupRef = useRef<MediaStream[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioMixer = useAudioMixer();
  
  // --- New Platform Management Functions ---
  const addPlatform = () => {
    setPlatforms(prev => [
      ...prev,
      { id: uuidv4(), name: `Custom ${prev.length - 1}`, rtmpUrl: '', streamKey: '' }
    ]);
  };
  const updatePlatform = (id: string, data: Partial<Platform>) => {
    setPlatforms(p => p.map(cp => (cp.id === id ? { ...cp, ...data } : cp)));
  };
  const removePlatform = (id: string) => {
    setPlatforms(p => p.filter(cp => cp.id !== id));
  };


  const setAudioSource = (source: AudioSourceType) => {
    audioMixer.setAudioSource(source);
    setAudioSourceState(source);
    toast.info(`Audio source set to: ${source.toUpperCase()}`);
  };

  const stopStream = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    
    streamCleanupRef.current.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
    });
    streamCleanupRef.current = [];
    
    audioMixer.cleanup();
    mediaRecorderRef.current = null;
    setPreviewStream(null);
    setIsStreaming(false);

    if (socket.connected) socket.emit('stop-stream');
    console.log("Stream stopped.");
  }, [audioMixer]);
  
  const startStream = async (): Promise<void> => {
    const activePlatforms = platforms.filter(p => p.rtmpUrl && p.streamKey);
    
    if (!isConnected) {
      toast.error("Not connected to server.");
      return;
    }
    if (activePlatforms.length === 0) {
      toast.error("Please configure at least one destination with an RTMP URL and Stream Key.");
      return;
    }

    toast.info("Requesting media permissions...");

    try {
        const videoConstraints = { width: 1280, height: 720, frameRate: 30 };
        const audioConstraints: MediaTrackConstraints = {
            sampleRate: 44100,
            echoCancellation: true,
            noiseSuppression: true,
        };

        audioMixer.initialize();
        let videoTrack: MediaStreamTrack;
        let micStream: MediaStream;
        let systemStream: MediaStream | null = null;

        if (useScreen) {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: videoConstraints,
                audio: audioConstraints,
            });
            streamCleanupRef.current.push(screenStream);
            videoTrack = screenStream.getVideoTracks()[0];
            systemStream = screenStream;
            
            micStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
            streamCleanupRef.current.push(micStream);
        } else {
            const cameraMicStream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: audioConstraints
            });
            streamCleanupRef.current.push(cameraMicStream);
            videoTrack = cameraMicStream.getVideoTracks()[0];
            micStream = cameraMicStream;
        }

        audioMixer.addMicSource(micStream);
        if (systemStream) {
            audioMixer.addSystemSource(systemStream);
        }

        const initialAudio = useScreen ? 'system' : 'mic';
        setAudioSource(initialAudio);
        
        const mixedAudioTrack = audioMixer.getMixedAudioTrack();
        if (!mixedAudioTrack) {
            throw new Error("Audio mixer failed to produce a track.");
        }

        const finalStream = new MediaStream([videoTrack, mixedAudioTrack]);
        setPreviewStream(finalStream);
        setIsStreaming(true);

        videoTrack.onended = () => {
          toast.warn("Video source was stopped by the user.");
          stopStream();
        };

        // --- UPDATED: Send the platforms array ---
        socket.emit('start-stream', {
            platforms: activePlatforms,
            quality: quality as any,
        });

        mediaRecorderRef.current = new MediaRecorder(finalStream, { 
            mimeType: 'video/webm; codecs=vp8,opus',
            audioBitsPerSecond: 128000
        });
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.connected) {
                socket.emit('stream-data', event.data);
            }
        };
        mediaRecorderRef.current.start(1000);
        toast.success("Stream is live!");

    } catch (err: any) {
        toast.error(`Failed to start stream: ${err.message}`);
        stopStream();
    }
  };
  
  const connectToServer = useCallback(() => {
    if(!socket.connected) socket.connect();
  }, []);

   useEffect(() => {
    connectToServer();
    function onConnect() { setIsConnected(true); toast.success("Connected to server!"); }
    function onDisconnect() { setIsConnected(false); toast.warn("Disconnected from server."); stopStream(); }
    function onStreamStatus(status: StreamStatusPayload) { setFfmpegStatus(status); }
    function onServerError(error: any) { toast.error(`${error.platform ? `[${error.platform}] `: ''}${error.message}`); }
    function onLatencyPong() { setLatency(Date.now() - (window as any)._latencyStartTime); }
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('stream-status', onStreamStatus);
    socket.on('server-error', onServerError);
    socket.on('latency-pong', onLatencyPong);

    return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('stream-status', onStreamStatus);
        socket.off('server-error', onServerError);
        socket.off('latency-pong', onLatencyPong);
    };
  }, [connectToServer, stopStream]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isConnected) {
        intervalId = setInterval(() => {
            (window as any)._latencyStartTime = Date.now();
            socket.emit('latency-ping', { timestamp: Date.now() });
        }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isConnected]);

  
  const value: IStreamContext = {
    isConnected,
    isStreaming,
    ffmpegStatus,
    previewStream,
    latency,
    audioSource,
    setAudioSource,
    quality,
    setQuality,
    useScreen,
    setUseScreen,
    
    // Pass the new platform state and functions
    platforms,
    addPlatform,
    updatePlatform,
    removePlatform,
    
    startStream,
    stopStream,
    connectToServer
  };

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};