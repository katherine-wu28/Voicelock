import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Mic, ShieldCheck, Lock, Waves, Fingerprint, Eye } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">

      <section className="text-center space-y-6 py-12 md:py-20 animate-fade-in-up">

        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl rounded-full" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <Waves className="w-12 h-12 text-accent" />
              <Lock className="w-6 h-6 text-primary absolute -bottom-1 -right-1" />
            </div>
            <span className="text-4xl font-bold tracking-tight">
              Voice<span className="gradient-text">Lock</span>
            </span>
          </div>
        </div>


        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
          Your Voice is{" "}
          <span className="gradient-text-accent">Your Key</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
          Secure, private, and instant identity verification using your unique voiceprint.
        </p>


        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-accent" />
            <span>100% Private</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>No Cloud Storage</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-success" />
            <span>Biometric Grade</span>
          </div>
        </div>
      </section>


      <div className="grid gap-6 md:grid-cols-2 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>

        <GlassCard variant="gradient" interactive className="group overflow-hidden">
          <GlassCardHeader>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Mic className="w-7 h-7 text-primary" />
            </div>
            <GlassCardTitle className="text-xl">Create Voice Profile</GlassCardTitle>
            <GlassCardDescription>
              Securely enroll your voice for future authentication. Takes less than a minute.
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <Button asChild className="w-full" size="lg">
              <Link href="/enroll">
                Start Enrollment
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </GlassCardContent>
        </GlassCard>


        <GlassCard variant="gradient" interactive className="group overflow-hidden">
          <GlassCardHeader>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-7 h-7 text-accent" />
            </div>
            <GlassCardTitle className="text-xl">Verify Identity</GlassCardTitle>
            <GlassCardDescription>
              Authenticate using your voice to unlock your secure dashboard.
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <Button asChild variant="secondary" className="w-full" size="lg">
              <Link href="/verify">
                Tap to Verify
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </GlassCardContent>
        </GlassCard>
      </div>


      <section className="mt-16 text-center space-y-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-2xl font-semibold">How It Works</h2>

        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <p className="text-sm text-muted-foreground">Record your voice</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              2
            </div>
            <p className="text-sm text-muted-foreground">AI creates voiceprint</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center text-success font-bold">
              3
            </div>
            <p className="text-sm text-muted-foreground">Verify instantly</p>
          </div>
        </div>
      </section>


      <div className="mt-12 flex gap-4 text-sm">
        <Button variant="ghost" asChild size="sm">
          <Link href="/about">Learn More</Link>
        </Button>
        <Button variant="ghost" asChild size="sm">
          <Link href="/profiles">Manage Profiles</Link>
        </Button>
      </div>
    </div>
  );
}
