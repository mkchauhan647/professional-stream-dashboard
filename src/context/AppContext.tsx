import React, { createContext, useState, useContext, type ReactNode } from 'react';
import type { Quality, AudioSource, ServerStatus } from '../types';

interface AppState {
  isConnected: boolean;
  setConnectionStatus: (s: boolean) => void;
  isStreaming: boolean;
  setStreamingStatus: (s: boolean) => void;
  ffmpegStatus: ServerStatus;
  setFfmpegStatus: (s: ServerStatus) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
  audioSource: AudioSource;
  setAudioSource: (s: AudioSource) => void;
  useScreen: boolean;
  setUseScreen: (u: boolean) => void;
  platformKeys: { youtube: string; facebook: string };
  setPlatformKeys: React.Dispatch<React.SetStateAction<{ youtube: string; facebook: string }>>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setConnectionStatus] = useState(false);
  const [isStreaming, setStreamingStatus] = useState(false);
  const [ffmpegStatus, setFfmpegStatus] = useState<ServerStatus>({ message: 'Not Connected', active: false, platforms: {} });
  const [quality, setQuality] = useState<Quality>('720p');
  const [audioSource, setAudioSource] = useState<AudioSource>('mic');
  const [useScreen, setUseScreen] = useState(false);
  const [platformKeys, setPlatformKeys] = useState({ youtube: 'YOUR_DEFAULT_YT_KEY', facebook: 'FB-4151680848423766-0-Ab1V2i8dpKBoBj9T6NdDANot' });

  const value = {
    isConnected, setConnectionStatus,
    isStreaming, setStreamingStatus,
    ffmpegStatus, setFfmpegStatus,
    quality, setQuality,
    audioSource, setAudioSource,
    useScreen, setUseScreen,
    platformKeys, setPlatformKeys,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};