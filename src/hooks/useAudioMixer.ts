// src/hooks/useAudioMixer.ts
import { useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

export type AudioSourceType = 'mic' | 'system' | 'both' | 'none';

export const useAudioMixer = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const micGainNodeRef = useRef<GainNode | null>(null);
    const systemGainNodeRef = useRef<GainNode | null>(null);
    const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    
    // Refs to hold the audio sources
    const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const systemSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    // Track current source type
    const currentSourceTypeRef = useRef<AudioSourceType>('none');

    const initialize = useCallback(() => {
        cleanup();
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            destinationNodeRef.current = context.createMediaStreamDestination();
        } catch (e) {
            toast.error("Web Audio API is not supported by this browser.");
            console.error("Failed to initialize AudioContext", e);
        }
    }, []);

    const addMicSource = useCallback((micStream: MediaStream) => {
        const context = audioContextRef.current;
        if (!context || !destinationNodeRef.current) return;

        // Clean up previous mic source if exists
        if (micSourceNodeRef.current) {
            micSourceNodeRef.current.disconnect();
            micGainNodeRef.current?.disconnect();
        }

        try {
            const micSource = context.createMediaStreamSource(micStream);
            const micGain = context.createGain();
            
            // Set initial gain based on current source type
            micGain.gain.value = (currentSourceTypeRef.current === 'mic' || currentSourceTypeRef.current === 'both') ? 1 : 0;
            
            micSource.connect(micGain);
            micGain.connect(destinationNodeRef.current);
            
            micSourceNodeRef.current = micSource;
            micGainNodeRef.current = micGain;
        } catch (e) {
            toast.error("Failed to add microphone source");
            console.error("Microphone source error", e);
        }
    }, []);

    const addSystemSource = useCallback((systemStream: MediaStream) => {
        const context = audioContextRef.current;
        if (!context || !destinationNodeRef.current || systemStream.getAudioTracks().length === 0) return;

        // Clean up previous system source if exists
        if (systemSourceNodeRef.current) {
            systemSourceNodeRef.current.disconnect();
            systemGainNodeRef.current?.disconnect();
        }

        try {
            const systemSource = context.createMediaStreamSource(systemStream);
            const systemGain = context.createGain();
            
            // Set initial gain based on current source type
            systemGain.gain.value = (currentSourceTypeRef.current === 'system' || currentSourceTypeRef.current === 'both') ? 1 : 0;
            
            systemSource.connect(systemGain);
            systemGain.connect(destinationNodeRef.current);
            
            systemSourceNodeRef.current = systemSource;
            systemGainNodeRef.current = systemGain;
        } catch (e) {
            toast.error("Failed to add system audio");
            console.error("System audio error", e);
        }
    }, []);

    const setAudioSource = useCallback((sourceType: AudioSourceType) => {
        const context = audioContextRef.current;
        if (!context) return;
        
        // Resume context if suspended (required by some browsers)
        if (context.state === 'suspended') {
            context.resume().catch(console.error);
        }

        const now = context.currentTime;
        currentSourceTypeRef.current = sourceType;

        // Update gains based on new source type
        switch (sourceType) {
            case 'mic':
                micGainNodeRef.current?.gain.setValueAtTime(1, now);
                systemGainNodeRef.current?.gain.setValueAtTime(0, now);
                break;
            case 'system':
                micGainNodeRef.current?.gain.setValueAtTime(0, now);
                if (systemGainNodeRef.current) {
                    systemGainNodeRef.current.gain.setValueAtTime(1, now);
                } else {
                    toast.warn("System audio source is not available");
                }
                break;
            case 'both':
                micGainNodeRef.current?.gain.setValueAtTime(1, now);
                systemGainNodeRef.current?.gain.setValueAtTime(1, now);
                break;
            case 'none':
                micGainNodeRef.current?.gain.setValueAtTime(0, now);
                systemGainNodeRef.current?.gain.setValueAtTime(0, now);
                break;
        }
    }, []);

    const cleanup = useCallback(() => {
        micSourceNodeRef.current?.disconnect();
        systemSourceNodeRef.current?.disconnect();
        micGainNodeRef.current?.disconnect();
        systemGainNodeRef.current?.disconnect();

        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close().catch(console.error);
        }
        
        audioContextRef.current = null;
        destinationNodeRef.current = null;
        micGainNodeRef.current = null;
        systemGainNodeRef.current = null;
        micSourceNodeRef.current = null;
        systemSourceNodeRef.current = null;
        currentSourceTypeRef.current = 'none';
    }, []);

    const getMixedAudioTrack = useCallback(() => {
        return destinationNodeRef.current?.stream.getAudioTracks()[0] || null;
    }, []);

    return { 
        initialize, 
        addMicSource, 
        addSystemSource, 
        setAudioSource, 
        getMixedAudioTrack, 
        cleanup 
    };
};