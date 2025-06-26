import React from 'react';
import { useStream } from '../context/StreamContext';
import { Card } from '../components/StreamingDashboard/Card';
import { type AudioSourceType } from '../hooks/useAudioMixer';
import { toast } from 'react-toastify';

const audioOptions: { id: AudioSourceType; label: string; icon: string; description: string }[] = [
  { id: 'mic', label: 'Microphone Only', icon: 'fa-microphone-alt', description: 'Captures your voice only' },
  { id: 'system', label: 'System Audio Only', icon: 'fa-desktop', description: 'Captures internal system sounds only' },
  { id: 'both', label: 'Mic + System', icon: 'fa-plus', description: 'Captures both your voice and system sounds' },
  { id: 'none', label: 'Muted', icon: 'fa-volume-mute', description: 'Mutes all audio' },
];

export const AudioControlCard: React.FC = () => {
  const { audioSource, setAudioSource, useScreen, isStreaming } = useStream();

  return (
    <Card title="Audio Source" icon="fas fa-volume-up">
      <div className="flex flex-col gap-2">
        <div className="mb-2 text-sm text-light/70 text-center">
          Current Selection: <span className="font-semibold text-primary">{audioOptions.find(opt => opt.id === audioSource)?.label}</span>
        </div>
        {audioOptions.map(opt => {
          const isSystemAudioOption = opt.id === 'system' || opt.id === 'both';
          const isDisabled = !useScreen && isSystemAudioOption;

          return (
            <button
              key={opt.id}
              // onClick={() => setAudioSource(opt.id)}
              onClick={() => {
                  if (isStreaming) {
                    toast.warning("Audio switching may cause brief glitches");
                    // Consider adding 500ms delay before actual switch
                    setTimeout(() => setAudioSource(opt.id), 500);
                  } else {
                    setAudioSource(opt.id);
                  }
                }}
              disabled={isDisabled}
              aria-label={opt.label}
              className={`
                w-full text-left p-3 rounded-lg flex flex-col items-start gap-1 border
                transition-all duration-150
                ${isDisabled ? 'opacity-40 cursor-not-allowed border-gray-300' : 'hover:border-primary hover:bg-primary/10'}
                ${audioSource === opt.id ? 'bg-primary/20 border-primary' : 'bg-black/10 border-transparent'}
              `}
            >
              <div className="flex items-center gap-3">
                <i className={`fas ${opt.icon} w-5 text-center`}></i>
                <span className="font-medium">{opt.label}</span>
              </div>
              <p className="text-xs text-light/60 ml-8">{opt.description}</p>
            </button>
          );
        })}
        {!useScreen && (
          <p className="text-xs text-center text-light/60 mt-2 italic">
            To use System Audio, enable <span className="font-medium">“Share Screen”</span> before starting the stream.
          </p>
        )}
      </div>
    </Card>
  );
};
