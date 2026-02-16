import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
            <h1 className="text-3xl font-bold">About & Privacy</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Privacy Stance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                        VoiceLock is a "Privacy-First" biometric demonstration.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Local Processing:</strong> All audio processing happens directly in your browser using WebAssembly. No audio recordings are ever uploaded to a server.</li>
                        <li><strong>No Cloud Storage:</strong> Your voice embeddings (mathematical representations) are stored in your browser's IndexedDB. If you clear your browser data, your profiles are lost.</li>
                        <li><strong>Transparency:</strong> The code is open source and can be inspected to verify these claims.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>About the Tech</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                        This application uses <strong>ONNX Runtime Web</strong> to run a speaker recognition model in the browser.
                        It captures audio via the <strong>Web Audio API</strong>, resamples it to 16kHz, and generates a fixed-dimensional vector (embedding) for each speaker.
                        Verification compares the cosine similarity between your live voice and the stored profile.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
