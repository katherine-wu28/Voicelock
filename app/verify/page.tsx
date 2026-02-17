"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { VoiceVisualizer } from "@/components/ui/voice-visualizer";
import { StatusDisplay } from "@/components/ui/status-badge";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { biometrics } from "@/lib/biometrics";
import { storage } from "@/lib/storage";
import { setAuthenticated } from "@/lib/auth-state";
import { UserProfile, VerificationResult } from "@/lib/types";
import { RefreshCw, Users } from "lucide-react";
import Link from "next/link";


const VERIFICATION_PHRASE = "My voice is my unique password and I authorize access to this secure system";

export default function VerifyPage() {
    const router = useRouter();
    const recorder = useAudioRecorder();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const recordingStartTimeRef = useRef<number | null>(null);

    useEffect(() => {
        biometrics.loadModel();
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        const p = await storage.getAllProfiles();
        setProfiles(p);
    };


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
        if (profiles.length === 0) return;
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
        if (!recorder.isRecording && !recorder.isProcessing && recorder.audioData && recorder.quality) {
            if (recorder.quality.isValid) {
                verify(recorder.audioData);
            }
        }
    }, [recorder.isRecording, recorder.isProcessing, recorder.audioData, recorder.quality]);

    const verify = async (data: Float32Array) => {
        if (profiles.length === 0) {
            setResult({
                score: 0,
                risk: "HIGH",
                details: "No profiles enrolled."
            });
            return;
        }

        setIsVerifying(true);
        try {
            const inputEmbedding = await biometrics.getEmbedding(data);

            let bestScore = -1;
            let bestProfileId = "";

            for (const profile of profiles) {
                let profileMaxScore = -1;
                for (const enrolledEmb of profile.embeddings) {
                    const score = biometrics.computeCosineSimilarity(inputEmbedding, enrolledEmb);
                    if (score > profileMaxScore) profileMaxScore = score;
                }

                if (profileMaxScore > bestScore) {
                    bestScore = profileMaxScore;
                    bestProfileId = profile.id;
                }
            }

            let risk: "LOW" | "MEDIUM" | "HIGH" = "HIGH";
            let details = "";


            if (bestScore > 0.65) {
                risk = "LOW";
                details = "High confidence match.";
            } else if (bestScore > 0.45) {
                risk = "MEDIUM";
                details = "Moderate confidence. Consider additional verification.";
            } else {
                risk = "HIGH";
                details = "Low similarity score. Access denied.";
            }

            const matchedProfile = profiles.find(p => p.id === bestProfileId);

            const verificationResult: VerificationResult = {
                score: bestScore,
                risk,
                profileId: bestProfileId,
                details: `${details}${matchedProfile ? ` (Matched: ${matchedProfile.name})` : ''}`
            };

            setResult(verificationResult);


            if (risk === "LOW" || risk === "MEDIUM") {
                if (matchedProfile) {
                    setAuthenticated(matchedProfile.name, bestScore, risk);


                    setTimeout(() => {
                        router.push("/dashboard");
                    }, 1500);
                }
            }

        } catch {
            setResult({
                score: 0,
                risk: "HIGH",
                details: "Verification failed. Please try again."
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const reset = () => {
        setResult(null);
    };

    const getVisualizerStatus = (): "idle" | "recording" | "success" | "error" => {
        if (result) {
            return result.risk === "LOW" ? "success" : result.risk === "HIGH" ? "error" : "idle";
        }
        if (recorder.isRecording) return "recording";
        return "idle";
    };

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[80vh] overflow-x-hidden">

            <div className="text-center mb-8 animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Verify <span className="gradient-text">Identity</span>
                </h1>
                <p className="text-muted-foreground">
                    Speak the phrase below to authenticate
                </p>
            </div>

            {!result ? (
                <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-fade-in-up">

                    <GlassCard className="w-full text-center">
                        <GlassCardContent className="py-6">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                Say this phrase
                            </p>
                            <p className="text-xl md:text-2xl font-medium text-foreground">
                                "{VERIFICATION_PHRASE}"
                            </p>
                        </GlassCardContent>
                    </GlassCard>


                    <GlassCard variant="elevated" className="w-full border-primary/20">
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


                    <div className="py-8">
                        <VoiceVisualizer
                            isRecording={recorder.isRecording}
                            isProcessing={recorder.isProcessing || isVerifying}
                            status={getVisualizerStatus()}
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
                                    Recording... Release to verify
                                </p>
                                <p className={`text-2xl font-bold tabular-nums transition-colors ${recordingTime >= 4 ? 'text-success' : 'text-muted-foreground'
                                    }`}>
                                    {recordingTime.toFixed(1)}s
                                </p>
                                {recordingTime >= 4 && (
                                    <p className="text-xs text-success">✓ Minimum duration reached</p>
                                )}
                            </div>
                        ) : recorder.isProcessing || isVerifying ? (
                            <p className="text-muted-foreground">
                                Processing your voice...
                            </p>
                        ) : (
                            <p className="text-muted-foreground">
                                Hold the button and speak the phrase
                            </p>
                        )}

                        {recorder.quality && !recorder.quality.isValid && (
                            <p className="text-destructive text-sm">
                                {recorder.quality.errors.join(". ")}
                            </p>
                        )}
                    </div>


                    {profiles.length === 0 && (
                        <GlassCard className="w-full border-warning/30">
                            <GlassCardContent className="flex items-center gap-4 py-4">
                                <Users className="w-8 h-8 text-warning" />
                                <div className="flex-1">
                                    <p className="font-medium">No Profiles Found</p>
                                    <p className="text-sm text-muted-foreground">
                                        Create a voice profile first to verify
                                    </p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href="/enroll">Enroll</Link>
                                </Button>
                            </GlassCardContent>
                        </GlassCard>
                    )}
                </div>
            ) : (

                <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-scale-in">
                    <GlassCard
                        variant="elevated"
                        className={`w-full ${result.risk === "LOW" ? "border-success/30 glow-success" :
                            result.risk === "MEDIUM" ? "border-warning/30 glow-warning" :
                                "border-destructive/30 glow-danger"
                            }`}
                    >
                        <GlassCardContent className="py-8">
                            <StatusDisplay
                                status={result.risk}
                                score={result.score}
                                message={result.details}
                            />
                        </GlassCardContent>
                    </GlassCard>

                    <Button onClick={reset} size="lg" variant="outline" className="w-full max-w-xs">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
}
