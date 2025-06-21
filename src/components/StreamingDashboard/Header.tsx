// src/components/Header.tsx
import React from 'react';
import { useStream } from '../../context/StreamContext';

const StatusIndicator: React.FC<{ connected: boolean, streaming?: boolean, text: string }> = ({ connected, streaming, text }) => {
  const baseClasses = 'w-3 h-3 rounded-full';
  let colorClass = 'bg-danger';
  if (connected) colorClass = 'bg-success shadow-lg shadow-success/50';
  if (streaming) colorClass = 'bg-primary shadow-lg shadow-primary/50 pulse-animation';

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/30 rounded-full font-medium">
      <div className={`${baseClasses} ${colorClass}`}></div>
      <span>{text}</span>
    </div>
  );
};

export const Header: React.FC = () => {
  const { isConnected, ffmpegStatus } = useStream();

  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-5 bg-darker/70 border border-border rounded-2xl backdrop-blur-md mb-5">
      <div className="flex items-center gap-4">
        <i className="fas fa-satellite-dish text-3xl text-primary"></i>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          ProStream
        </h1>
      </div>
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <StatusIndicator connected={isConnected} text={isConnected ? 'Connected' : 'Disconnected'} />
        <StatusIndicator connected={isConnected} streaming={ffmpegStatus.active} text={ffmpegStatus.message} />
      </div>
    </header>
  );
};