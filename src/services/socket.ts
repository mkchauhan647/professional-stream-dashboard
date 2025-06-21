import { io } from 'socket.io-client';
const apiUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
// console.log('API URL:', apiUrl);


export const socket = io(apiUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
});