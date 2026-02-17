"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { VoiceVisualizer } from "@/components/ui/voice-visualizer";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { biometrics } from "@/lib/biometrics";
import { storage } from "@/lib/storage";
import { ArrowRight, Check, Lock, Shield, User, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLES_REQUIRED = 3;
const ENROLLMENT_PHRASE = "My voice is my unique password and I authorize access to this secure system";

type Step = "consent" | "record" | "save";

export default function EnrollPage() {
    const router = useRouter();
    const recorder = useAudioRecorder();

    const [step, setStep] = useState<Step>("consent");
    const [userName, setUserName] = useState("");
    const [samples, setSamples] = useState<Float32Array[]>([]);
    const [embeddings, setEmbeddings] = useState<Float32Array[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const recordingStartTimeRef = useRef<number | null>(null);

    useEffect(() => {
        biometrics.loadModel();
    }, []);


    const startAudioLevelMonitoring = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            const updateLevel = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setAudioLevel(Math.min(average / 128, 1));
                    animationRef.current = requestAnimationFrame(updateLevel);
                }
            };
            updateLevel();
        } catch (e) {
            // ignore
        }
    }, []);

    const stopAudioLevelMonitoring = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setAudioLevel(0);
    }, []);

    const handlePress = async () => {
        if (samples.length >= SAMPLES_REQUIRED) return;
        setRecordingTime(0);
        recordingStartTimeRef.current = Date.now();
        timerIntervalRef.current = window.setInterval(() => {
            if (recordingStartTimeRef.current) {
                const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
                setRecordingTime(elapsed);
            }
        }, 100);
        await recorder.startRecording();
        startAudioLevelMonitoring();
    };

    const handleRelease = async () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        stopAudioLevelMonitoring();
        await recorder.stopRecording();
    };

    useEffect(() => {
        if (!recorder.isRecording && !recorder.isProcessing && recorder.audioData && recorder.quality?.isValid) {
            addSample(recorder.audioData);
        }
    }, [recorder.isRecording, recorder.isProcessing, recorder.audioData, recorder.quality]);

    const addSample = async (data: Float32Array) => {
        if (samples.includes(data)) return;

        try {
            const emb = await biometrics.getEmbedding(data);
            setSamples(prev => [...prev, data]);
            setEmbeddings(prev => [...prev, emb]);
        } catch {
            // ignore
        }
    };

    const handleSave = async () => {
        if (!userName.trim()) return;
        setIsSaving(true);
        try {
            const id = crypto.randomUUID();
            await storage.saveProfile({
                id,
                name: userName,
                createdAt: Date.now(),
                embeddings: embeddings
            });
            router.push("/profiles");
        } catch {
            // ignore
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center overflow-x-hidden">

            <div className="flex items-center gap-4 mb-8">
                {["consent", "record", "save"].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                            step === s
                                ? "bg-gradient-to-br from-primary to-accent text-white scale-110"
                                : (["consent", "record", "save"].indexOf(step) > i)
                                    ? "bg-success text-white"
                                    : "bg-white/10 text-muted-foreground"
                        )}>
                            {["consent", "record", "save"].indexOf(step) > i ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                i + 1
                            )}
                        </div>
                        {i < 2 && (
                            <div className={cn(
                                "w-12 h-0.5 rounded-full transition-colors",
                                ["consent", "record", "save"].indexOf(step) > i ? "bg-success" : "bg-white/10"
                            )} />
                        )}
                    </div>
                ))}
            </div>


            <div className="text-center mb-8 animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Create <span className="gradient-text">Voice Profile</span>
                </h1>
                <p className="text-muted-foreground">
                    {step === "consent" && "Review privacy information"}
                    {step === "record" && `Record ${SAMPLES_REQUIRED} voice samples`}
                    {step === "save" && "Name and save your profile"}
                </p>
            </div>

            <div className="w-full max-w-md">

                {step === "consent" && (
                    <GlassCard className="animate-fade-in-up">
                        <GlassCardHeader>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                                <Shield className="w-7 h-7 text-primary" />
                            </div>
                            <GlassCardTitle>Privacy First</GlassCardTitle>
                            <GlassCardDescription>
                                Your voice data stays on your device
                            </GlassCardDescription>
                        </GlassCardHeader>
                        <GlassCardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <Lock className="w-5 h-5 text-success mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">Local Processing</p>
                                        <p className="text-muted-foreground">All voice analysis happens in your browser</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <Lock className="w-5 h-5 text-success mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">No Cloud Upload</p>
                                        <p className="text-muted-foreground">Raw audio is never sent to any server</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <Lock className="w-5 h-5 text-success mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">You Control Your Data</p>
                                        <p className="text-muted-foreground">Delete your profile anytime from settings</p>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={() => setStep("record")} className="w-full" size="lg">
                                I Understand, Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </GlassCardContent>
                    </GlassCard>
                )}


                {step === "record" && (
                    <div className="space-y-6 animate-fade-in-up">

                        <GlassCard className="text-center">
                            <GlassCardContent className="py-4">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                    Say this phrase
                                </p>
                                <p className="text-lg font-medium">"{ENROLLMENT_PHRASE}"</p>
                            </GlassCardContent>
                        </GlassCard>


                        <GlassCard variant="elevated" className="border-primary/20">
                            <GlassCardContent className="py-3">
                                <p className="text-xs font-semibold text-primary mb-2">Recording Requirements:</p>
                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        <span>Speak for at least 4 seconds</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        <span>Avoid audio clipping (don't speak too loudly)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        <span>Speak clearly in a quiet environment</span>
                                    </div>
                                </div>
                            </GlassCardContent>
                        </GlassCard>


                        <div className="flex justify-center gap-3">
                            {Array.from({ length: SAMPLES_REQUIRED }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-4 h-4 rounded-full transition-all duration-300",
                                        i < samples.length
                                            ? "bg-success scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            : i === samples.length
                                                ? "bg-primary animate-pulse"
                                                : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>


                        <div className="flex justify-center py-6">
                            <VoiceVisualizer
                                isRecording={recorder.isRecording}
                                isProcessing={recorder.isProcessing}
                                status={samples.length >= SAMPLES_REQUIRED ? "success" : "idle"}
                                audioLevel={audioLevel}
                                size="lg"
                                onPress={handlePress}
                                onRelease={handleRelease}
                            />
                        </div>


                        <div className="text-center space-y-2">
                            {recorder.isRecording ? (
                                <div className="space-y-1">
                                    <p className="text-primary font-medium animate-pulse">
                                        Recording... Release when done
                                    </p>
                                    <p className={`text-2xl font-bold tabular-nums transition-colors ${recordingTime >= 4 ? 'text-success' : 'text-muted-foreground'
                                        }`}>
                                        {recordingTime.toFixed(1)}s
                                    </p>
                                    {recordingTime >= 4 && (
                                        <p className="text-xs text-success">✓ Minimum duration reached</p>
                                    )}
                                </div>
                            ) : recorder.isProcessing ? (
                                <p className="text-muted-foreground">Processing...</p>
                            ) : samples.length >= SAMPLES_REQUIRED ? (
                                <p className="text-success font-medium">
                                    All samples recorded!
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    Sample {samples.length + 1} of {SAMPLES_REQUIRED} — Hold and speak
                                </p>
                            )}

                            {recorder.quality && !recorder.quality.isValid && (
                                <p className="text-destructive text-sm">
                                    {recorder.quality.errors.join(". ")}
                                </p>
                            )}
                        </div>


                        {samples.length >= SAMPLES_REQUIRED && (
                            <Button
                                onClick={() => setStep("save")}
                                className="w-full animate-fade-in-up"
                                size="lg"
                            >
                                Continue to Save
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}


                {step === "save" && (
                    <GlassCard className="animate-fade-in-up">
                        <GlassCardHeader>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mb-4">
                                <User className="w-7 h-7 text-success" />
                            </div>
                            <GlassCardTitle>Name Your Profile</GlassCardTitle>
                            <GlassCardDescription>
                                This will help identify you during verification
                            </GlassCardDescription>
                        </GlassCardHeader>
                        <GlassCardContent className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="h-12 bg-white/5 border-white/10 text-lg"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-white/5">
                                <Volume2 className="w-4 h-4 text-success" />
                                <span>{samples.length} voice samples recorded</span>
                            </div>

                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !userName.trim()}
                                className="w-full"
                                size="lg"
                                variant="success"
                            >
                                {isSaving ? "Saving..." : "Save Profile"}
                                <Check className="w-4 h-4 ml-2" />
                            </Button>
                        </GlassCardContent>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
