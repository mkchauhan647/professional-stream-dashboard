import React, { useEffect, useRef } from 'react';
import { useStream } from '../context/StreamContext';
import { Card } from '../components/StreamingDashboard/Card';
import { StatBox } from '../components/StreamingDashboard/StatBox';

export const PreviewCard: React.FC = () => {
  const { previewStream, quality, latency, isStreaming } = useStream();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  return (
    <Card title="Live Preview" icon="fas fa-video">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full bg-black rounded-lg aspect-video mb-5 shadow-lg shadow-black/50"
      ></video>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatBox label="Audio Status" value={isStreaming ? "Active" : "--"} />
        <StatBox label="Video Quality" value={isStreaming ? quality.toUpperCase() : "--"} />
        <StatBox label="Network Latency" value={latency > 0 ? `${latency}ms` : "--"} />
      </div>
    </Card>
  );
};