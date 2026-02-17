"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { storage } from "@/lib/storage";
import { UserProfile } from "@/lib/types";
import { Trash2, Download, Upload, User, Plus, Clock, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";


function getAvatarColor(name: string): string {
    const colors = [
        "from-blue-500 to-cyan-400",
        "from-purple-500 to-pink-400",
        "from-green-500 to-emerald-400",
        "from-orange-500 to-yellow-400",
        "from-red-500 to-rose-400",
        "from-indigo-500 to-violet-400",
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setIsLoading(true);
        const p = await storage.getAllProfiles();
        setProfiles(p);
        setIsLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete "${name}"? This cannot be undone.`)) {
            await storage.deleteProfile(id);
            loadProfiles();
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `voicelock_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (Array.isArray(imported)) {
                    for (const p of imported) {
                        if (p.embeddings && Array.isArray(p.embeddings)) {
                            p.embeddings = p.embeddings.map((arr: unknown) => {
                                if (arr instanceof Float32Array) return arr;
                                return Float32Array.from(Object.values(arr as object));
                            });
                        }
                        await storage.saveProfile(p);
                    }
                    loadProfiles();
                }
            } catch (err) {
                alert("Import failed. Invalid file format.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="animate-fade-in-up">
                    <h1 className="text-3xl font-bold">
                        Voice <span className="gradient-text">Profiles</span>
                    </h1>
                    <p className="text-muted-foreground">
                        {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} registered
                    </p>
                </div>

                <div className="flex gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={profiles.length === 0}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <div className="relative">
                        <Input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            accept=".json"
                            onChange={handleImport}
                        />
                        <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                    </div>
                </div>
            </div>


            <div className="space-y-4">
                {isLoading ? (

                    Array.from({ length: 3 }).map((_, i) => (
                        <GlassCard key={i} className="animate-pulse">
                            <GlassCardContent className="flex items-center gap-4 py-4">
                                <div className="w-14 h-14 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 bg-white/10 rounded" />
                                    <div className="h-3 w-24 bg-white/5 rounded" />
                                </div>
                            </GlassCardContent>
                        </GlassCard>
                    ))
                ) : profiles.length === 0 ? (

                    <GlassCard className="text-center py-12 animate-fade-in-up">
                        <GlassCardContent className="space-y-4">
                            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                                <User className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">No Profiles Yet</h3>
                                <p className="text-muted-foreground">
                                    Create your first voice profile to get started
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/enroll">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Profile
                                </Link>
                            </Button>
                        </GlassCardContent>
                    </GlassCard>
                ) : (

                    profiles.map((profile, i) => (
                        <GlassCard
                            key={profile.id}
                            interactive
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <GlassCardContent className="flex items-center gap-4 py-4">

                                <div className={cn(
                                    "w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0",
                                    getAvatarColor(profile.name)
                                )}>
                                    {getInitials(profile.name)}
                                </div>


                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate">
                                        {profile.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(profile.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Volume2 className="w-3.5 h-3.5" />
                                            {profile.embeddings.length} samples
                                        </span>
                                    </div>
                                </div>


                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(profile.id, profile.name);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </GlassCardContent>
                        </GlassCard>
                    ))
                )}
            </div>


            {profiles.length > 0 && (
                <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/enroll">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Profile
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
