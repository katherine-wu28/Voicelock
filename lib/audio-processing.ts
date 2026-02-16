export async function resampleAudio(audioBuffer: AudioBuffer, targetSampleRate: number = 16000): Promise<Float32Array> {
    const sourceSampleRate = audioBuffer.sampleRate;
    const sourceData = audioBuffer.getChannelData(0);

    if (sourceSampleRate === targetSampleRate) {
        return sourceData;
    }

    const offlineCtx = new OfflineAudioContext(1, (audioBuffer.length * targetSampleRate) / sourceSampleRate, targetSampleRate);
    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start();
    const renderedBuffer = await offlineCtx.startRendering();
    return renderedBuffer.getChannelData(0);
}

export function trimSilence(data: Float32Array, threshold: number = 0.01): Float32Array {
    let start = 0;
    let end = data.length;

    while (start < end && Math.abs(data[start]) < threshold) {
        start++;
    }

    while (end > start && Math.abs(data[end - 1]) < threshold) {
        end--;
    }

    return data.slice(start, end);
}

export interface AudioQualityResult {
    isValid: boolean;
    duration: number;
    hasClipping: boolean;
    errors: string[];
}

export function checkAudioQuality(data: Float32Array, sampleRate: number = 16000): AudioQualityResult {
    const duration = data.length / sampleRate;
    const errors: string[] = [];
    let hasClipping = false;

    if (duration < 1.0) {
        errors.push("Recording is too short (< 1s).");
    }

    if (duration < 4.0) {
        errors.push("Duration must be at least 4 seconds.");
    }

    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) >= 0.99) {
            hasClipping = true;
            break;
        }
    }

    if (hasClipping) {
        errors.push("Audio is clipping (too loud). Move further from microphone.");
    }

    return {
        isValid: errors.length === 0,
        duration,
        hasClipping,
        errors
    };
}
