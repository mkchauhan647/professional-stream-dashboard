import { useState, useEffect, useCallback } from 'react';
import type { 
  ToastType, 
  PlatformStatus, 
  AudioSource, 
  QualityOption, 
  Toast,
  PlatformConfig,
  PlatformName,
  StreamingState
} from '../types/streamingTypes';

const initialState: StreamingState = {
  isConnected: false,
  isStreaming: false,
  ffmpegStatus: 'FFmpeg not running',
  audioSource: 'mic',
  useScreen: false,
  quality: '720p',
  youtube: {
    key: 'xm1v-x4x3-009r-6z83-7zdh',
    showKey: false,
    status: 'idle'
  },
  facebook: {
    key: '',
    showKey: false,
    status: 'idle'
  },
  audioStat: '--',
  videoStat: '--',
  latencyStat: '--',
  toast: {
    show: false,
    message: '',
    type: 'info'
  }
};

export default function useStreaming() {
  const [state, setState] = useState<StreamingState>(initialState);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    setState(prev => ({
      ...prev,
      toast: { show: true, message, type }
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toast: { ...prev.toast, show: false }
      }));
    }, duration);
  }, []);

  const updateAudioSources = useCallback(() => {
    let toastMessage = '';
    
    switch(state.audioSource) {
      case 'mic':
        toastMessage = 'Microphone only';
        break;
      case 'system':
        toastMessage = 'System audio only';
        break;
      case 'both':
        toastMessage = 'Mic + System audio';
        break;
      case 'none':
        toastMessage = 'Audio muted';
        break;
      default:
        toastMessage = 'Audio source updated';
    }
    
    setState(prev => ({
      ...prev,
      audioStat: toastMessage
    }));
    
    showToast(`Audio source: ${toastMessage}`, "info");
  }, [state.audioSource, showToast]);

  const toggleKeyVisibility = useCallback((platform: PlatformName) => {
    setState(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        showKey: !prev[platform].showKey
      }
    }));
  }, []);

  const connectWebSocket = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      setState(prev => ({
        ...prev,
        isConnected: false
      }));
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isConnected: true
        }));
        
        showToast("Connected to server", "success");
        resolve();
        
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            ffmpegStatus: "FFmpeg running"
          }));
          showToast("FFmpeg initialized", "success");
        }, 1000);
      }, 1500);
    });
  }, [showToast]);

  const startStreaming = useCallback(async () => {
    if (state.isStreaming) return;
    
    try {
      // Validate inputs
      if (!state.youtube.key.trim() && !state.facebook.key.trim()) {
        throw new Error('Please provide at least one stream key');
      }
      
      // Connect to WebSocket
      await connectWebSocket();
      
      // Update stats
      setState(prev => ({
        ...prev,
        videoStat: prev.quality.toUpperCase(),
        youtube: {
          ...prev.youtube,
          status: state.youtube.key.trim() ? 'live' : 'idle'
        },
        facebook: {
          ...prev.facebook,
          status: state.facebook.key.trim() ? 'live' : 'idle'
        },
        isStreaming: true
      }));
      
      updateAudioSources();
      showToast("Stream started successfully!", "success");
      
    } catch (err) {
      const error = err as Error;
      showToast(`Error: ${error.message}`, "error", 5000);
    }
  }, [
    state.isStreaming, 
    state.youtube.key, 
    state.facebook.key, 
    state.quality,
    connectWebSocket,
    updateAudioSources,
    showToast
  ]);

  const stopStreaming = useCallback(() => {
    setState(prev => ({
      ...prev,
      isStreaming: false,
      ffmpegStatus: "FFmpeg not running",
      audioStat: '--',
      videoStat: '--',
      youtube: {
        ...prev.youtube,
        status: 'idle'
      },
      facebook: {
        ...prev.facebook,
        status: 'idle'
      }
    }));
    
    showToast("Stream stopped", "info");
  }, [showToast]);

  const reconnectServer = useCallback(async () => {
    if (state.isStreaming) stopStreaming();
    await connectWebSocket();
  }, [state.isStreaming, stopStreaming, connectWebSocket]);

  // Update audio sources when audioSource changes
  useEffect(() => {
    updateAudioSources();
  }, [state.audioSource, updateAudioSources]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (state.isStreaming) {
        stopStreaming();
      }
    };
  }, [state.isStreaming, stopStreaming]);

  return {
    state,
    setState,
    showToast,
    updateAudioSources,
    toggleKeyVisibility,
    connectWebSocket,
    startStreaming,
    stopStreaming,
    reconnectServer
  };
}