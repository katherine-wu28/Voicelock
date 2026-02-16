import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
            <h1 className="text-3xl font-bold">Demo Instructions</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">How to test VoiceLock</h2>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Go to <strong><Link href="/enroll" className="text-primary underline">Enroll</Link></strong>.</li>
                        <li>Grant microphone permission and record 3 samples of your voice.</li>
                        <li>Save your profile (e.g. "My Voice").</li>
                        <li>Go to <strong><Link href="/verify" className="text-primary underline">Verify</Link></strong>.</li>
                        <li>Speak the challenge phrase. You should see a <strong>Low Risk</strong> (Green) result.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Testing "Imposter" Scenario</h2>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Find a friend or change your voice significantly.</li>
                        <li>Go to <strong><Link href="/verify" className="text-primary underline">Verify</Link></strong>.</li>
                        <li>Speak the phrase. You should see a <strong>High Risk</strong> (Red) or Medium Risk result.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Ensure you are in a quiet environment. Background noise affects the embedding accuracy.</li>
                        <li>Speak clearly and naturally.</li>
                        <li>If the model fails to load, the system will operate in Demo Simulation mode (using random vectors), which may produce random results. Check the console for "ONNX Model loaded" confirmation.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
