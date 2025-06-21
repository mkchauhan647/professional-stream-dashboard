// // client/src/hooks/useMediaStream.ts (WITH FULL LOGGING)

// import { useRef, useCallback } from 'react';
// import { socket } from '../services/socket';
// import { useAppContext } from '../contexts/AppContext';
// import { useToast } from '../contexts/ToastContext';

// export const useMediaStream = (previewRef: React.RefObject<HTMLVideoElement>) => {
//   const { isStreaming, setStreamingStatus, platformKeys, quality, useScreen, audioSource } = useAppContext();
//   const addToast = useToast();
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);

//   const stopLocalStream = useCallback(() => {
//     console.log('[Client] Stopping local stream and MediaRecorder.');
//     mediaRecorderRef.current?.stop();
//     localStreamRef.current?.getTracks().forEach(track => track.stop());
//     if (previewRef.current) previewRef.current.srcObject = null;
//     mediaRecorderRef.current = null;
//     localStreamRef.current = null;
//   }, [previewRef]);

//   const stopStreaming = useCallback(() => {
//     if (!isStreaming && !mediaRecorderRef.current) {
//       console.log('[Client] Stop called, but not currently streaming.');
//       return;
//     }
//     console.log('[Client] stopStreaming() called. Emitting "stop" to server.');
//     socket.emit('stop');
//     stopLocalStream();
//     setStreamingStatus(false);
//     addToast('Stream stopped.', 'info');
//   }, [isStreaming, stopLocalStream, setStreamingStatus, addToast]);
  
//   const startStreaming = useCallback(async () => {
//     console.log('[Client] startStreaming() called.');
//     if (isStreaming) {
//       console.warn('[Client] Already streaming, aborting start.');
//       return;
//     }
//     if (!platformKeys.youtube && !platformKeys.facebook) {
//       addToast('Provide at least one stream key', 'error');
//       console.error('[Client] No stream keys provided.');
//       return;
//     }
    
//     setStreamingStatus(true);
//     addToast('Initializing stream...', 'info');

//     try {
//       console.log(`[Client] Requesting media with quality: ${quality}, useScreen: ${useScreen}, audio: ${audioSource}`);
//       const q = quality === '1080p' ? {w:1920, h:1080} : quality === '720p' ? {w:1280, h:720} : {w:854, h:480};
//       const videoConstraints = { width: { ideal: q.w }, height: { ideal: q.h }, frameRate: { ideal: 30 } };

//       console.log('[Client] Calling getDisplayMedia/getUserMedia...');
//       const mediaStream = useScreen
//         ? await navigator.mediaDevices.getDisplayMedia({ video: videoConstraints, audio: audioSource === 'system' || audioSource === 'both' })
//         : await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
//       console.log('[Client] Media stream obtained successfully.', mediaStream);
      
//       const audioContext = new AudioContext();
//       const destination = audioContext.createMediaStreamDestination();

//       if ((audioSource === 'mic' || audioSource === 'both') && !useScreen) {
//         console.log('[Client] Requesting microphone audio.');
//         const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         micStream.getAudioTracks().forEach(t => mediaStream.addTrack(t));
//       }
//       if(mediaStream.getAudioTracks().length > 0) {
//         console.log('[Client] Piping audio tracks through AudioContext.');
//         audioContext.createMediaStreamSource(mediaStream).connect(destination);
//       }

//       mediaStream.getVideoTracks()[0].onended = () => {
//         console.warn('[Client] Video track ended (e.g., user clicked "Stop sharing").');
//         stopStreaming();
//       };

//       localStreamRef.current = new MediaStream([...mediaStream.getVideoTracks(), ...destination.stream.getAudioTracks()]);

//       if (previewRef.current) {
//         previewRef.current.srcObject = localStreamRef.current;
//         console.log('[Client] Attached stream to preview element.');
//       }
      
//       const options = { mimeType: 'video/webm;codecs=vp9,opus' };
//       console.log('[Client] Creating MediaRecorder with options:', options);
//       const recorder = new MediaRecorder(localStreamRef.current, options);
//       mediaRecorderRef.current = recorder;

//       recorder.ondataavailable = e => {
//         if (e.data.size > 0 && socket.connected) {
//           console.log(`[Client] ondataavailable: Sending media chunk of size ${e.data.size} bytes.`);
//           e.data.arrayBuffer().then((buffer) => {
//             socket.emit('media_chunk', buffer);
//           });
//         }
//       };

//       recorder.onstart = () => {
//         const startData = {
//           streamToYouTube: !!platformKeys.youtube,
//           youtubeStreamKey: platformKeys.youtube,
//           streamToFacebook: !!platformKeys.facebook,
//           facebookStreamKey: platformKeys.facebook,
//           quality,
//         };
//         console.log('[Client] MediaRecorder started. Emitting "start" event to server with data:', startData);
//         socket.emit('start', startData);
//         addToast('Stream started!', 'success');
//       };

//       recorder.onerror = e => {
//         const error = (e as any).error;
//         addToast(`Recording error: ${error.name}`, 'error');
//         console.error('[Client] MediaRecorder error:', error);
//       };
      
//       console.log('[Client] Calling recorder.start(500)');
//       recorder.start(500); // 500ms timeslice

//     } catch (err: any) {
//       addToast(`Error: ${err.message}`, 'error');
//       console.error('[Client] CRITICAL ERROR in startStreaming:', err);
//       stopStreaming(); // Cleanup on failure
//     }
//   }, [isStreaming, platformKeys, quality, useScreen, audioSource, addToast, setStreamingStatus, previewRef, stopStreaming]);

//   return { startStreaming, stopStreaming };
// };

// client/src/hooks/useMediaStream.ts

// client/src/hooks/useMediaStream.ts

import { useRef, useCallback, useEffect } from 'react';
import { socket } from '../services/socket';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export const useMediaStream = (previewRef: React.RefObject<HTMLVideoElement>) => {
  const { isStreaming, setStreamingStatus, platformKeys, quality, useScreen, audioSource } = useAppContext();
  const addToast = useToast();

  // Refs to hold onto media components that shouldn't trigger re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  // Refs for our "volume knobs"
  const micGainNodeRef = useRef<GainNode | null>(null);
  const systemGainNodeRef = useRef<GainNode | null>(null);

  // This useEffect is the heart of the real-time switching.
  // It runs whenever the `audioSource` selection changes.
  useEffect(() => {
    // Only try to change gains if we are actually streaming
    if (!isStreaming || !audioContextRef.current) return;

    console.log(`[Client] Real-time audio switch to: ${audioSource}`);

    const micGain = micGainNodeRef.current;
    const systemGain = systemGainNodeRef.current;

    // Set gain values based on the selection. 1 is full volume, 0 is muted.
    if (micGain) {
      micGain.gain.setValueAtTime(audioSource === 'mic' || audioSource === 'both' ? 1 : 0, audioContextRef.current.currentTime);
    }
    if (systemGain) {
      systemGain.gain.setValueAtTime(audioSource === 'system' || audioSource === 'both' ? 1 : 0, audioContextRef.current.currentTime);
    }

  }, [audioSource, isStreaming]);


  const stopLocalStream = useCallback(() => {
    mediaRecorderRef.current?.stop();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close().catch(e => console.error("Error closing AudioContext:", e));
    if (previewRef.current) previewRef.current.srcObject = null;
    // Clear all refs
    mediaRecorderRef.current = null;
    localStreamRef.current = null;
    audioContextRef.current = null;
    micGainNodeRef.current = null;
    systemGainNodeRef.current = null;
  }, [previewRef]);

  const stopStreaming = useCallback(() => {
    if (!isStreaming && !mediaRecorderRef.current) return;
    socket.emit('stop');
    stopLocalStream();
    setStreamingStatus(false);
    addToast('Stream stopped.', 'info');
  }, [isStreaming, stopLocalStream, setStreamingStatus, addToast]);
  
  const startStreaming = useCallback(async () => {
    if (isStreaming) return;
    if (!platformKeys.youtube && !platformKeys.facebook) {
      addToast('Provide at least one stream key', 'error');
      return;
    }
    
    setStreamingStatus(true);
    addToast('Initializing stream...', 'info');

    try {
      const q = quality === '1080p' ? {w:1920, h:1080} : quality === '720p' ? {w:1280, h:720} : {w:854, h:480};
      const videoConstraints = { width: { ideal: q.w }, height: { ideal: q.h }, frameRate: { ideal: 30 } };

      // --- NEW MIXER SETUP ---
      // 1. Initialize the master AudioContext and destination
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const destination = audioContext.createMediaStreamDestination();

      // 2. Get video stream
      const videoStream = useScreen 
        ? await navigator.mediaDevices.getDisplayMedia({ video: videoConstraints, audio: true }) // Request audio here to capture system sound
        : await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });

      // 3. Get all potential audio sources and pipe them to the mixer
      // Microphone Source
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const micSource = audioContext.createMediaStreamSource(micStream);
      const micGain = audioContext.createGain();
      micGainNodeRef.current = micGain;
      micSource.connect(micGain).connect(destination);

      // System Audio Source (if available from screen share)
      if (useScreen && videoStream.getAudioTracks().length > 0) {
        const systemSource = audioContext.createMediaStreamSource(videoStream);
        const systemGain = audioContext.createGain();
        systemGainNodeRef.current = systemGain;
        systemSource.connect(systemGain).connect(destination);
      }
      
      // 4. Set the initial volumes based on the dropdown selection
      micGain.gain.value = (audioSource === 'mic' || audioSource === 'both') ? 1 : 0;
      if (systemGainNodeRef.current) {
        systemGainNodeRef.current.gain.value = (audioSource === 'system' || audioSource === 'both') ? 1 : 0;
      }
      // --- END OF MIXER SETUP ---

      const videoTrack = videoStream.getVideoTracks()[0];
      videoTrack.onended = () => stopStreaming();
      
      // The final stream is the video track + the single mixed audio track from our mixer
      localStreamRef.current = new MediaStream([videoTrack, ...destination.stream.getAudioTracks()]);

      if (previewRef.current) previewRef.current.srcObject = localStreamRef.current;
      
      const options = { 
        mimeType: 'video/webm;codecs=h264,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        addToast("Using VP8 codec as fallback", "warning");
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }

      const recorder = new MediaRecorder(localStreamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data.size > 0 && socket.connected) {
          e.data.arrayBuffer().then((buffer) => {
            socket.emit('media_chunk', buffer);
          });
        }
      };
      recorder.onstart = () => {
        const startData = {
          streamToYouTube: !!platformKeys.youtube, youtubeStreamKey: platformKeys.youtube,
          streamToFacebook: !!platformKeys.facebook, facebookStreamKey: platformKeys.facebook,
          quality,
        };
        socket.emit('start', startData);
      };
      recorder.onerror = e => addToast(`Recording error: ${(e as any).error.name}`, 'error');
      
      recorder.start(500);

    } catch (err: any) {
      addToast(`Error: ${err.message}`, 'error');
      stopStreaming();
    }
  }, [isStreaming, platformKeys, quality, useScreen, audioSource, addToast, setStreamingStatus, previewRef, stopStreaming]);

  return { startStreaming, stopStreaming };
};