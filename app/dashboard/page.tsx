"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAuthSession, clearAuthentication, AuthSession } from "@/lib/auth-state";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Shield, Lock, Clock, User, Activity, LogOut } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!isAuthenticated()) {
            router.push("/verify");
            return;
        }

        const authSession = getAuthSession();
        setSession(authSession);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        clearAuthentication();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const timeAgo = formatTimeAgo(session.timestamp);
    const expiresIn = formatTimeRemaining(session.expiresAt);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl overflow-x-hidden">

            <div className="text-center mb-8 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 mb-4">
                    <Shield className="w-10 h-10 text-success" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    Welcome Back, <span className="text-gradient">{session.profileName}</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    You have been successfully authenticated via voice biometrics
                </p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                <GlassCard variant="elevated" className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <GlassCardContent className="py-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Status</h3>
                        </div>
                        <StatusBadge risk={session.riskLevel as any} className="mt-2" />
                    </GlassCardContent>
                </GlassCard>


                <GlassCard variant="elevated" className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <GlassCardContent className="py-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Match Score</h3>
                        </div>
                        <p className="text-3xl font-bold text-gradient">
                            {(session.similarityScore * 100).toFixed(1)}%
                        </p>
                    </GlassCardContent>
                </GlassCard>


                <GlassCard variant="elevated" className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                    <GlassCardContent className="py-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Authenticated</h3>
                        </div>
                        <p className="text-lg text-muted-foreground">{timeAgo}</p>
                    </GlassCardContent>
                </GlassCard>
            </div>


            <GlassCard className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <GlassCardContent className="py-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <User className="w-6 h-6" />
                        Session Details
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-muted-foreground">Profile Name</span>
                            <span className="font-medium">{session.profileName}</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-muted-foreground">Risk Level</span>
                            <span className="font-medium capitalize">{session.riskLevel}</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-muted-foreground">Similarity Score</span>
                            <span className="font-medium">{(session.similarityScore * 100).toFixed(2)}%</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <span className="text-muted-foreground">Login Time</span>
                            <span className="font-medium">{new Date(session.timestamp).toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Session Expires In</span>
                            <span className="font-medium">{expiresIn}</span>
                        </div>
                    </div>
                </GlassCardContent>
            </GlassCard>


            <GlassCard variant="elevated" className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                <GlassCardContent className="py-8 text-center">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-bold mb-2">🎉 This is Protected Content</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        This dashboard is only accessible after successful voice authentication.
                        In a real application, this could contain sensitive data, personal settings,
                        financial information, or any other content you want to protect with biometric security.
                    </p>
                </GlassCardContent>
            </GlassCard>


            <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                <Button
                    onClick={handleLogout}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Lock & Sign Out
                </Button>
            </div>
        </div>
    );
}

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

function formatTimeRemaining(expiresAt: number): string {
    const remaining = expiresAt - Date.now();

    if (remaining < 0) return "Expired";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes} minutes`;
    return `${hours} hours ${minutes} minutes`;
}
