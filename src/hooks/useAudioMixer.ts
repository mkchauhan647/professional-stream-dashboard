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

    // // / --- Add these new refs for audio buffering ---
    // const audioBuffer = useRef<AudioBuffer | null>(null);
    // const audioQueue = useRef<AudioBuffer[]>([]);
    // const isProcessing = useRef(false);
    // const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    // Track current source type
    const currentSourceTypeRef = useRef<AudioSourceType>('none');

    const initialize = useCallback(() => {
        cleanup();
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            destinationNodeRef.current = context.createMediaStreamDestination();

            // // --- Initialize audio processor ---
            // scriptProcessorRef.current = context.createScriptProcessor(4096, 2, 2);
            // scriptProcessorRef.current.onaudioprocess = (event) => {
            //     if (!isProcessing.current && audioQueue.current.length > 0) {
            //         processAudio();
            //     }
            // };
            // scriptProcessorRef.current.connect(destinationNodeRef.current);

        } catch (e) {
            toast.error("Web Audio API is not supported by this browser.");
            console.error("Failed to initialize AudioContext", e);
        }
    }, []);


    // // --- Add this new function for audio processing ---
    // const processAudio = useCallback(() => {
    //     const context = audioContextRef.current;
    //     if (!context || !destinationNodeRef.current) return;
        
    //     isProcessing.current = true;
        
    //     const processNext = () => {
    //         if (audioQueue.current.length === 0) {
    //             isProcessing.current = false;
    //             return;
    //         }
            
    //         const buffer = audioQueue.current.shift()!;
    //         const source = context.createBufferSource();
    //         source.buffer = buffer;
    //         source.connect(destinationNodeRef.current!);
    //         source.start();
    //         source.onended = processNext;
    //     };
        
    //     processNext();
    // }, []);

    // will be impplemented Later....
    //  // --- Modify your source connection to use the buffer ---
    // const connectSourceToBuffer = (source: MediaStreamAudioSourceNode) => {
    //     if (!audioContextRef.current || !scriptProcessorRef.current) return;
        
    //     source.connect(scriptProcessorRef.current);
        
    //     // Setup processor to fill the buffer
    //     const processor = audioContextRef.current.createScriptProcessor(2048, 2, 2);
    //     processor.onaudioprocess = (event) => {
    //         const inputBuffer = event.inputBuffer;
    //         const outputBuffer = event.outputBuffer;
            
    //         // Create AudioBuffer for our queue
    //         const newBuffer = audioContextRef.current!.createBuffer(
    //             outputBuffer.numberOfChannels,
    //             outputBuffer.length,
    //             outputBuffer.sampleRate
    //         );
            
    //         for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    //             newBuffer.copyToChannel(inputBuffer.getChannelData(channel), channel);
    //         }
            
    //         audioQueue.current.push(newBuffer);
    //     };
        
    //     source.connect(processor);
    //     processor.connect(audioContextRef.current.destination);
    // };


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
            // connectSourceToBuffer(micSource);
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
            // connectSourceToBuffer(systemSource);
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

         // Add fade-in/out to prevent clicks
        const FADE_DURATION = 0.02; // 20ms fade
        const now = context.currentTime;
        currentSourceTypeRef.current = sourceType;

        //  // Add buffer flush on source change
        // audioQueue.current = [];
        // isProcessing.current = false;



        // Update gains based on new source type
        switch (sourceType) {
            case 'mic':
                systemGainNodeRef.current?.gain.setValueAtTime(0, now + FADE_DURATION);
                micGainNodeRef.current?.gain.setValueAtTime(1, now + FADE_DURATION);
                break;
            case 'system':
                micGainNodeRef.current?.gain.setValueAtTime(0, now + FADE_DURATION);
                if (systemGainNodeRef.current) {
                    systemGainNodeRef.current.gain.setValueAtTime(1, now + FADE_DURATION);
                } else {
                    toast.warn("System audio source is not available");
                }
                break;
            case 'both':
                micGainNodeRef.current?.gain.setValueAtTime(1, now + FADE_DURATION);
                systemGainNodeRef.current?.gain.setValueAtTime(1, now + FADE_DURATION);
                break;
            case 'none':
                micGainNodeRef.current?.gain.setValueAtTime(0, now + FADE_DURATION);
                systemGainNodeRef.current?.gain.setValueAtTime(0, now + FADE_DURATION);
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