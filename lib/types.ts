export interface UserProfile {
    id: string;
    name: string;
    createdAt: number;
    embeddings: Float32Array[];
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface VerificationResult {
    score: number;
    risk: RiskLevel;
    profileId?: string;
    details: string;
}
