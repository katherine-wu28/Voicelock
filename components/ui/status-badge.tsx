import * as React from "react"
import { cn } from "@/lib/utils"
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react"

export interface StatusBadgeProps {
    status: "LOW" | "MEDIUM" | "HIGH"
    score?: number
    showIcon?: boolean
    size?: "sm" | "md" | "lg"
    className?: string
}

const statusConfig = {
    LOW: {
        label: "Low Risk",
        icon: ShieldCheck,
        colors: "bg-success/20 text-success border-success/30",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        dotColor: "bg-success",
    },
    MEDIUM: {
        label: "Medium Risk",
        icon: ShieldAlert,
        colors: "bg-warning/20 text-warning border-warning/30",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        dotColor: "bg-warning",
    },
    HIGH: {
        label: "High Risk",
        icon: ShieldX,
        colors: "bg-destructive/20 text-destructive border-destructive/30",
        glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
        dotColor: "bg-destructive",
    },
}

const sizeClasses = {
    sm: { container: "px-2 py-1 text-xs gap-1.5", icon: "w-3.5 h-3.5", dot: "w-1.5 h-1.5" },
    md: { container: "px-3 py-1.5 text-sm gap-2", icon: "w-4 h-4", dot: "w-2 h-2" },
    lg: { container: "px-4 py-2 text-base gap-2.5", icon: "w-5 h-5", dot: "w-2.5 h-2.5" },
}

export function StatusBadge({
    status,
    score,
    showIcon = true,
    size = "md",
    className,
}: StatusBadgeProps) {
    const config = statusConfig[status]
    const sizes = sizeClasses[size]
    const Icon = config.icon

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border font-medium",
                config.colors,
                config.glow,
                sizes.container,
                className
            )}
        >

            <span className={cn("rounded-full animate-pulse", config.dotColor, sizes.dot)} />

            {showIcon && <Icon className={sizes.icon} />}

            <span>{config.label}</span>

            {score !== undefined && (
                <span className="opacity-70">({Math.round(score * 100)}%)</span>
            )}
        </div>
    )
}


export function StatusDisplay({
    status,
    score,
    message,
    className,
}: {
    status: "LOW" | "MEDIUM" | "HIGH"
    score?: number
    message?: string
    className?: string
}) {
    const config = statusConfig[status]
    const Icon = config.icon

    return (
        <div className={cn("text-center space-y-4", className)}>

            <div className={cn(
                "inline-flex items-center justify-center w-24 h-24 rounded-full",
                config.colors,
                config.glow,
                "animate-scale-in"
            )}>
                <Icon className="w-12 h-12" />
            </div>


            <div className="space-y-1">
                <h3 className={cn(
                    "text-2xl font-bold",
                    status === "LOW" && "text-success",
                    status === "MEDIUM" && "text-warning",
                    status === "HIGH" && "text-destructive"
                )}>
                    {status === "LOW" && "Verification Successful"}
                    {status === "MEDIUM" && "Partial Match"}
                    {status === "HIGH" && "Verification Failed"}
                </h3>

                {score !== undefined && (
                    <p className="text-4xl font-bold text-foreground">
                        {Math.round(score * 100)}%
                        <span className="text-lg text-muted-foreground ml-2">Match</span>
                    </p>
                )}

                {message && (
                    <p className="text-muted-foreground">{message}</p>
                )}
            </div>
        </div>
    )
}
