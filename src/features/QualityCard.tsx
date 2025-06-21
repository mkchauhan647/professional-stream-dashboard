import React from 'react';
import { useStream } from '../context/StreamContext';
import { Card } from '../components/StreamingDashboard/Card';

const qualityOptions = [
  { value: '480p', label: '480p', desc: 'Low Bandwidth' },
  { value: '720p', label: '720p', desc: 'Balanced' },
  { value: '1080p', label: '1080p', desc: 'High Quality' },
];

export const QualityCard: React.FC = () => {
  const { quality, setQuality, isStreaming } = useStream();

  return (
    <Card title="Stream Quality" icon="fas fa-tachometer-alt">
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        {qualityOptions.map((opt) => (
          <div
            key={opt.value}
            onClick={() => !isStreaming && setQuality(opt.value)}
            className={`
              flex-1 text-center p-5 bg-black/20 rounded-lg cursor-pointer
              transition-all duration-300 border-2
              ${isStreaming ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/20'}
              ${quality === opt.value ? 'border-primary bg-primary/30' : 'border-transparent'}
            `}
          >
            <div className="text-lg font-semibold">{opt.label}</div>
            <div className="text-sm text-light/80">{opt.desc}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};