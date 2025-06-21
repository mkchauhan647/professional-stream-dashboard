import { socket } from './socket';

let isInitialized = false;

export const initializeSocket = (
    setConnectionStatus: (s: boolean) => void,
    addToast: (msg: string, type?: any) => void
) => {
    if (isInitialized || !socket) return;

    const onConnect = () => {
        console.log("Socket connected!");
        setConnectionStatus(true);
        addToast('Connected to server', 'success');
    };

    const onDisconnect = () => {
        console.log("Socket disconnected!");
        setConnectionStatus(false);
        addToast('Disconnected from server', 'warning');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.disconnected) {
        socket.connect();
    }
    
    isInitialized = true;
    
    return () => {
        console.log("Cleaning up main socket listeners");
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        isInitialized = false;
    };
};