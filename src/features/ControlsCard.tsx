import React from 'react';
import { useStream } from '../context/StreamContext';
import { Card } from '../components/StreamingDashboard/Card';

export const ControlsCard: React.FC = () => {
  const { isStreaming, startStream, stopStream, connectToServer, useScreen, setUseScreen } = useStream();

  return (
    <Card title="Stream Controls" icon="fas fa-sliders-h">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startStream}
            disabled={isStreaming}
            className="px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
          >
            <i className="fas fa-broadcast-tower mr-2"></i>
            Start Stream
          </button>
          <button
            onClick={stopStream}
            disabled={!isStreaming}
            className="px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-danger to-[#ff4b2b] shadow-lg shadow-danger/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-danger/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
          >
            <i className="fas fa-stop mr-2"></i>
            Stop
          </button>
        </div>

        <div className="bg-black/20 p-4 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useScreen}
              onChange={(e) => setUseScreen(e.target.checked)}
              disabled={isStreaming}
              className="w-5 h-5 accent-primary disabled:opacity-50"
            />
            <i className="fas fa-desktop"></i>
            <span>Share Screen/Tab</span>
          </label>
        </div>
        
        <button onClick={connectToServer} className="px-4 py-3 rounded-lg font-semibold text-white bg-gray-600 hover:bg-gray-500 transition-colors">
            <i className="fas fa-sync-alt mr-2"></i>
            Reconnect to Server
        </button>
      </div>
    </Card>
  );
};