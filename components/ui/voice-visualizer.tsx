"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Mic, Check, X } from "lucide-react"

export interface VoiceVisualizerProps {
    isRecording?: boolean
    isProcessing?: boolean
    status?: "idle" | "recording" | "success" | "error"
    audioLevel?: number
    size?: "sm" | "md" | "lg"
    className?: string
    onPress?: () => void
    onRelease?: () => void
}

export function VoiceVisualizer({
    isRecording = false,
    isProcessing = false,
    status = "idle",
    audioLevel = 0,
    size = "lg",
    className,
    onPress,
    onRelease,
}: VoiceVisualizerProps) {
    const sizeClasses = {
        sm: { container: "w-32 h-32", button: "w-20 h-20", icon: "w-8 h-8" },
        md: { container: "w-48 h-48", button: "w-28 h-28", icon: "w-10 h-10" },
        lg: { container: "w-64 h-64", button: "w-36 h-36", icon: "w-14 h-14" },
    }

    const sizes = sizeClasses[size]


    const ringScale = 1 + audioLevel * 0.3

    return (
        <div className={cn("relative flex items-center justify-center", sizes.container, className)}>

            <div
                className={cn(
                    "absolute inset-0 rounded-full transition-all duration-300",
                    isRecording && "bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse"
                )}
            />


            {isRecording && (
                <>
                    <div
                        className="absolute inset-4 rounded-full border-2 border-primary/40 animate-pulse-ring"
                        style={{ transform: `scale(${ringScale})` }}
                    />
                    <div
                        className="absolute inset-8 rounded-full border-2 border-accent/30 animate-pulse-ring"
                        style={{ animationDelay: "0.3s", transform: `scale(${ringScale * 0.9})` }}
                    />
                    <div
                        className="absolute inset-12 rounded-full border border-primary/20 animate-pulse-ring-slow"
                        style={{ animationDelay: "0.6s" }}
                    />
                </>
            )}


            {!isRecording && status === "idle" && (
                <>
                    <div className="absolute inset-4 rounded-full border border-white/10" />
                    <div className="absolute inset-10 rounded-full border border-white/5" />
                </>
            )}


            {status === "success" && (
                <>
                    <div className="absolute inset-4 rounded-full border-2 border-success/40 animate-pulse" />
                    <div className="absolute inset-8 rounded-full border border-success/20" />
                </>
            )}


            {status === "error" && (
                <>
                    <div className="absolute inset-4 rounded-full border-2 border-destructive/40 animate-pulse" />
                    <div className="absolute inset-8 rounded-full border border-destructive/20" />
                </>
            )}


            <button
                type="button"
                onMouseDown={onPress}
                onMouseUp={onRelease}
                onTouchStart={onPress}
                onTouchEnd={onRelease}
                disabled={isProcessing}
                className={cn(
                    "relative z-10 flex items-center justify-center rounded-full",
                    "transition-all duration-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    sizes.button,

                    status === "idle" && !isRecording && [
                        "bg-gradient-to-br from-primary to-accent",
                        "hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]",
                        "active:scale-95",
                    ],

                    isRecording && [
                        "bg-gradient-to-br from-red-500 to-red-600",
                        "animate-glow-pulse",
                        "scale-105",
                    ],

                    isProcessing && [
                        "bg-gradient-to-br from-primary/50 to-accent/50",
                        "cursor-wait",
                    ],

                    status === "success" && [
                        "bg-gradient-to-br from-success to-emerald-400",
                        "animate-check scale-110",
                        "shadow-[0_0_40px_rgba(16,185,129,0.4)]",
                    ],

                    status === "error" && [
                        "bg-gradient-to-br from-destructive to-red-400",
                        "shadow-[0_0_40px_rgba(239,68,68,0.4)]",
                    ]
                )}
            >

                <div
                    className={cn(
                        "absolute inset-0 rounded-full blur-xl transition-opacity duration-300",
                        isRecording ? "bg-red-500/30 opacity-100" : "bg-primary/20 opacity-0 group-hover:opacity-100"
                    )}
                />


                <span className="relative z-10 text-white">
                    {status === "success" ? (
                        <Check className={cn(sizes.icon, "animate-scale-in")} strokeWidth={3} />
                    ) : status === "error" ? (
                        <X className={cn(sizes.icon)} strokeWidth={3} />
                    ) : isProcessing ? (
                        <div className={cn(sizes.icon, "animate-spin rounded-full border-4 border-white/30 border-t-white")} />
                    ) : (
                        <Mic className={cn(sizes.icon, isRecording && "animate-pulse")} />
                    )}
                </span>
            </button>


            {isRecording && (
                <svg
                    className="absolute inset-0 -rotate-90 w-full h-full"
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="url(#audioGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={`${audioLevel * 289} 289`}
                        className="transition-all duration-100"
                    />
                    <defs>
                        <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
            )}
        </div>
    )
}
