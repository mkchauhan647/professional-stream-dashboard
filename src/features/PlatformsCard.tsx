import React, { useEffect } from 'react';
import { useStream } from '../context/StreamContext';
import { Card } from '../components/StreamingDashboard/Card';
import type { Platform, PlatformStatus } from '../context/StreamContext';

interface PlatformStatusIndicatorProps {
  status: 'idle' | 'live' | 'reconnecting' | 'failed';
}
const PlatformStatusIndicator: React.FC<PlatformStatusIndicatorProps> = ({ status = 'idle' }) => {
    const statusMap = {
        idle: { text: 'Idle', color: 'bg-danger' },
        live: { text: 'Live', color: 'bg-success pulse-animation' },
        reconnecting: { text: 'Reconnecting', color: 'bg-warning pulse-animation' },
        failed: { text: 'Failed', color: 'bg-danger' }
    };
    const { text, color } = statusMap[status];

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
            <span>{text}</span>
        </div>
    );
}

interface PlatformItemProps {
    platform: Platform;
    onUpdate: (id: string, data: Partial<Platform>) => void;
    onRemove: (id: string) => void;
    status: PlatformStatus['status'];
    disabled: boolean;
    canRemove: boolean;
}

const PlatformItem: React.FC<PlatformItemProps> = ({ platform, onUpdate, onRemove, status, disabled, canRemove }) => {
  return (
    <div className="bg-black/20 p-4 rounded-lg space-y-3 transition-opacity duration-300">
      <div className="flex justify-between items-center">
        <input
            type="text"
            value={platform.name}
            onChange={(e) => onUpdate(platform.id, { name: e.target.value })}
            placeholder="Platform Name (e.g., YouTube)"
            disabled={disabled}
            className="font-semibold bg-transparent outline-none flex-grow text-light placeholder:text-light/50"
        />
        <PlatformStatusIndicator status={status} />
      </div>
      <input
        type="text"
        value={platform.rtmpUrl}
        onChange={(e) => onUpdate(platform.id, { rtmpUrl: e.target.value })}
        placeholder="RTMP URL (e.g., rtmp://a.rtmp.youtube.com/live2)"
        disabled={disabled}
        className="w-full bg-black/30 p-2 rounded-md text-sm outline-none text-light placeholder:text-light/50 disabled:opacity-70"
      />
      <div className="flex items-center bg-black/30 rounded-md">
        <input
          type="password"
          value={platform.streamKey}
          onChange={(e) => onUpdate(platform.id, { streamKey: e.target.value })}
          placeholder="Stream Key"
          disabled={disabled}
          className="w-full bg-transparent p-2 text-sm outline-none text-light placeholder:text-light/50 disabled:opacity-70"
        />
        {canRemove && !disabled && (
          <button onClick={() => onRemove(platform.id)} className="text-danger px-3 hover:text-red-400 transition-colors">
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
    </div>
  );
};


export const PlatformsCard: React.FC = () => {
    const {
        platforms, addPlatform, updatePlatform, removePlatform,
        isStreaming, ffmpegStatus
    } = useStream();


    useEffect(() => {
  if (platforms.length === 0) {
    addPlatform(); // adds YouTube
    addPlatform(); // adds Facebook
  }
}, []);


    return (
        <Card title="Stream Destinations" icon="fas fa-cloud-upload-alt">
            <div className="flex flex-col gap-4">
                {platforms.map((p) => (
                    <PlatformItem
                        key={p.id}
                        platform={p}
                        onUpdate={updatePlatform}
                        onRemove={removePlatform}
                        status={ffmpegStatus.platforms[p.id]?.status || 'idle'}
                        disabled={isStreaming}
                        canRemove={platforms.length > 1}
                    />
                ))}

                {!isStreaming && (
                    <button
                        onClick={addPlatform}
                        className="w-full mt-2 py-2 rounded-lg bg-primary/20 hover:bg-primary/40 transition-colors font-semibold"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Add Destination
                    </button>
                )}
            </div>
        </Card>
    );
}
