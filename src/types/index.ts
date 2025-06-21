export type Quality = '480p' | '720p' | '1080p';

export type AudioSource = 'mic' | 'system' | 'both' | 'none';

export type Platform = 'youtube' | 'facebook';

export type PlatformStatus = 'idle' | 'live' | 'reconnecting';

export interface PlatformState {
  status: PlatformStatus;
  key: string;
}

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

// Type for messages sent to the WebSocket server
export interface StartStreamMessage {
  type: 'start';
  streamToYouTube: boolean;
  streamToFacebook: boolean;
  youtubeStreamKey: string;
  facebookStreamKey: string;
  quality: Quality;
}

// Type for status messages received from the server
export interface ServerStatusMessage {
  type: 'status';
  message: string;
  active: boolean;
  platforms?: {
    [key in Platform]?: {
      running: boolean;
      retries: number;
    };
  };
}


export interface ServerStatus {
  message: string;
  active: boolean;
  platforms: {
    [key: string]: PlatformStatus;
  };
}



// import type { LucideIcon } from 'lucide-react';
// // Re-exporting server types for client use. Assumes server is a sibling directory.
// export type { Quality, PlatformStatus, ServerStatus, ServerToClientEvents, ClientToServerEvents } from '../../server/types';


// export type PlatformName = "youtube" | "facebook";
// export type AudioSource = 'mic' | 'system' | 'both' | 'none';

// export interface PlatformUIType {
//   name: PlatformName;
//   label: string;
//   Icon: LucideIcon;
//   color: string;
// }

