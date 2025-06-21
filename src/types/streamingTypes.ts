export type ToastType = 'info' | 'success' | 'error' | 'warning';
export type PlatformStatus = 'idle' | 'live' | 'reconnecting';
export type AudioSource = 'mic' | 'system' | 'both' | 'none';
export type QualityOption = '480p' | '720p' | '1080p';

export interface Toast {
  show: boolean;
  message: string;
  type: ToastType;
}

export interface PlatformConfig {
  key: string;
  showKey: boolean;
  status: PlatformStatus;
}

export interface StreamingState {
  isConnected: boolean;
  isStreaming: boolean;
  ffmpegStatus: string;
  audioSource: AudioSource;
  useScreen: boolean;
  quality: QualityOption;
  youtube: PlatformConfig;
  facebook: PlatformConfig;
  audioStat: string;
  videoStat: string;
  latencyStat: string;
  toast: Toast;
}

export type PlatformName = 'youtube' | 'facebook';