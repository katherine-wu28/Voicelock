"use client";

import { useState, useRef, useCallback } from "react";
import { resampleAudio, trimSilence, checkAudioQuality, AudioQualityResult } from "@/lib/audio-processing";

export interface RecorderState {
    isRecording: boolean;
    isProcessing: boolean;
    audioData: Float32Array | null;
    duration: number;
    blob: Blob | null;
    quality: AudioQualityResult | null;
    error: string | null;
}

export function useAudioRecorder() {
    const [state, setState] = useState<RecorderState>({
        isRecording: false,
        isProcessing: false,
        audioData: null,
        duration: 0,
        blob: null,
        quality: null,
        error: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const startTimeRef = useRef<number>(0);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            startTimeRef.current = Date.now();
            setState((prev) => ({ ...prev, isRecording: true, error: null, audioData: null, quality: null }));
        } catch (err) {
            console.error("Error starting recording:", err);
            setState((prev) => ({ ...prev, error: "Could not access microphone." }));
        }
    }, []);

    const stopRecording = useCallback(async () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;

        return new Promise<void>((resolve) => {
            if (!mediaRecorderRef.current) return resolve();

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" });
                const duration = (Date.now() - startTimeRef.current) / 1000;


                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

                await processAudio(blob);
                resolve();
            };

            mediaRecorderRef.current.stop();
            setState((prev) => ({ ...prev, isRecording: false, isProcessing: true }));
        });
    }, []);

    const processAudio = async (blob: Blob) => {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);


            const resampledData = await resampleAudio(audioBuffer, 16000);


            const trimmedData = trimSilence(resampledData, 0.02);


            const quality = checkAudioQuality(trimmedData, 16000);

            setState({
                isRecording: false,
                isProcessing: false,
                audioData: trimmedData,
                duration: trimmedData.length / 16000,
                blob: blob,
                quality,
                error: null,
            });

        } catch (err) {
            console.error("Error process audio:", err);
            setState((prev) => ({ ...prev, isRecording: false, isProcessing: false, error: "Failed to process audio." }));
        }
    };

    return {
        ...state,
        startRecording,
        stopRecording,
    };
}
