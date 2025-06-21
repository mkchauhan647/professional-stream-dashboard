import { useEffect } from 'react';
import { socket } from '../services/socket';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import type { ServerStatus } from '../types';

export const useSocket = (stopStreaming?: () => void) => {
  const { setConnectionStatus, setFfmpegStatus } = useAppContext();
  const addToast = useToast();

  useEffect(() => {
    const onConnect = () => {
      setConnectionStatus(true);
      addToast('Connected to server', 'success');
      // Start latency test or other on-connect logic here if needed
    };
    const onDisconnect = () => {
      setConnectionStatus(false);
      addToast('Disconnected from server', 'warning');
      setFfmpegStatus({ message: 'Disconnected', active: false, platforms: {} });
    };
    const onStatus = (status: ServerStatus) => setFfmpegStatus(status);
    const onError = (data: { message: string; fatal: boolean }) => {
      addToast(data.message, 'error');
      if (data.fatal && stopStreaming) stopStreaming();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('status', onStatus);
    socket.on('error', onError);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('status', onStatus);
      socket.off('error', onError);
      socket.disconnect();
    };
  }, [addToast, setConnectionStatus, setFfmpegStatus, stopStreaming]);

   // Return the socket instance
  return socket;

};