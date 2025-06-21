import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents, RestreamState, RestreamDestination } from '../types/restream.types';
import VideoPlayer from './VideoPlayer';
import { v4 as uuidv4 } from 'uuid';
import { Clipboard, Play, Power, Plus, Trash2, Video, VideoOff } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
const RTMP_URL = import.meta.env.VITE_RTMP_URL || "rtmp://localhost:1935/live";


const RestreamDashboard: React.FC = () => {
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
    const [rtmpKey, setRtmpKey] = useState<string>('');
    const [rtmpUrl, setRtmpUrl] = useState<string>(RTMP_URL);
    const [isObsLive, setIsObsLive] = useState<boolean>(true);
    const [isPreviewLive, setIsPreviewLive] = useState<boolean>(false);
    const [hlsUrl, setHlsUrl] = useState<string>('');
    const [destinations, setDestinations] = useState<RestreamState[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => console.log('Connected to server'));
        socket.on('rtmpKey', (key) => setRtmpKey(key));
        
        socket.on('obsStreamStatus', ({ live }) => {
            console.log(`OBS Source Status: ${live ? 'Online' : 'Offline'}`);
            setIsObsLive(live);
            if (!live) {
                // If OBS disconnects, the preview and destinations are no longer valid
                // setIsPreviewLive(false);
                setHlsUrl('');
            }
        });
        
        socket.on('previewStatus', ({ live, hlsUrl }) => {
            console.log(`Preview Status: ${live ? 'Live' : 'Stopped'}`);
            console.log(`HLS URL: ${hlsUrl}`);
            setIsPreviewLive(live);
            setHlsUrl(live && hlsUrl ? hlsUrl : '');
        });

        socket.on('restreamUpdate', (updatedDestination) => {
            setDestinations(prev => prev.map(d => d.id === updatedDestination.id ? { ...d, ...updatedDestination } : d));
        });

        return () => { socket.disconnect(); };
    }, []);

    const handlePreviewToggle = () => {
        if (isPreviewLive) {
            socketRef.current?.emit('stopPreview');
        } else {
            socketRef.current?.emit('startPreview');
        }
    };
    
    const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!')); };
    const addDestination = () => { const newDest: RestreamState = { id: uuidv4(), name: `Destination ${destinations.length + 1}`, platform: 'Custom', rtmpUrl: '', streamKey: '', status: 'idle' }; setDestinations(prev => [...prev, newDest]); };
    const updateDestination = (id: string, field: keyof RestreamDestination, value: string) => { setDestinations(prev => prev.map(d => d.id === id ? { ...d, [field]: value } as RestreamState : d)); };
    const removeDestination = (id: string) => { const dest = destinations.find(d => d.id === id); if (dest && (dest.status === 'streaming' || dest.status === 'error')) { socketRef.current?.emit('stopRestream', id); } setDestinations(prev => prev.filter(d => d.id !== id)); };
    const handleStreamAction = (dest: RestreamState) => { if (dest.status === 'streaming') { socketRef.current?.emit('stopRestream', dest.id); } else { if (!dest.rtmpUrl || !dest.streamKey) { alert('Please fill in both RTMP URL and Stream Key.'); return; } socketRef.current?.emit('startRestream', dest); } };
    const getStatusIndicator = (status: RestreamState['status']) => { switch (status) { case 'streaming': return <span className="text-green-500 font-bold">Streaming</span>; case 'error': return <span className="text-red-500 font-bold">Error</span>; case 'stopped': return <span className="text-yellow-500 font-bold">Stopped</span>; case 'idle': default: return <span className="text-gray-500 font-bold">Idle</span>; } };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-indigo-400">Manual Restream Dashboard</h1>
                <p className="text-gray-400 mb-8">Stream from OBS to multiple platforms with full manual control.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-200">1. Configure OBS</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">RTMP Server URL</label>
                                    <div className="flex items-center bg-gray-700 rounded-md">
                                        <input type="text" readOnly value={rtmpUrl} className="w-full bg-transparent p-2 focus:outline-none"/>
                                        <button onClick={() => copyToClipboard(rtmpUrl)} className="p-2 text-gray-400 hover:text-white"><Clipboard size={18} /></button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Stream Key</label>
                                    <div className="flex items-center bg-gray-700 rounded-md">
                                        <input type="text" readOnly value={rtmpKey || 'Connecting...'} className="w-full bg-transparent p-2 focus:outline-none"/>
                                        <button onClick={() => rtmpKey && copyToClipboard(rtmpKey)} className="p-2 text-gray-400 hover:text-white" disabled={!rtmpKey}><Clipboard size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-200">2. Stream Preview</h2>
                                <button 
                                    onClick={handlePreviewToggle} 
                                    disabled={!isObsLive}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors text-sm ${
                                        isPreviewLive 
                                        ? 'bg-red-600 hover:bg-red-500' 
                                        : 'bg-blue-600 hover:bg-blue-500'
                                    } disabled:bg-gray-500 disabled:cursor-not-allowed`}
                                >
                                    {isPreviewLive ? <VideoOff size={16}/> : <Video size={16}/>}
                                    {isPreviewLive ? 'Stop Preview' : 'Start Preview'}
                                </button>
                            </div>
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                                {isObsLive ? (
                                    isPreviewLive && hlsUrl ? <VideoPlayer src={hlsUrl} /> :
                                    <div className="text-center text-gray-400">
                                        <p className="font-semibold">Preview is Stopped</p>
                                        <p className="text-sm">Click "Start Preview" to begin transcoding.</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <p className="font-semibold">OBS Source is Offline</p>
                                        <p className="text-sm">Start streaming from OBS to enable controls.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-200">3. Restream Destinations</h2>
                            <button onClick={addDestination} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md font-semibold transition-colors"><Plus size={18}/> Add</button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {destinations.length === 0 && <p className="text-gray-500 text-center py-8">Add a destination to start restreaming.</p>}
                            {destinations.map((dest) => (
                                <div key={dest.id} className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <input type="text" value={dest.name} onChange={(e) => updateDestination(dest.id, 'name', e.target.value)} className="bg-transparent text-lg font-bold focus:outline-none focus:border-b border-indigo-500"/>
                                        <button onClick={() => removeDestination(dest.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        <input type="text" placeholder="RTMP URL" value={dest.rtmpUrl} onChange={(e) => updateDestination(dest.id, 'rtmpUrl', e.target.value)} className="w-full bg-gray-600 p-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                                        <input type="password" placeholder="Stream Key" value={dest.streamKey} onChange={(e) => updateDestination(dest.id, 'streamKey', e.target.value)} className="w-full bg-gray-600 p-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <div>Status: {getStatusIndicator(dest.status)} {dest.status === 'error' && <p className="text-xs text-red-400">{dest.message}</p>}</div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleStreamAction(dest)} disabled={!isObsLive || dest.status === 'error'} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-sm transition-colors ${dest.status === 'streaming' ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'} disabled:bg-gray-500 disabled:cursor-not-allowed`}>
                                                {dest.status === 'streaming' ? <Power size={16}/> : <Play size={16}/>} {dest.status === 'streaming' ? 'Stop' : 'Start'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestreamDashboard;