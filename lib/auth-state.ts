export interface AuthSession {
    profileName: string;
    timestamp: number;
    similarityScore: number;
    riskLevel: string;
    expiresAt: number;
}

const AUTH_KEY = "voicelock_auth_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function setAuthenticated(
    profileName: string,
    similarityScore: number,
    riskLevel: string
): void {
    const session: AuthSession = {
        profileName,
        timestamp: Date.now(),
        similarityScore,
        riskLevel,
        expiresAt: Date.now() + SESSION_DURATION,
    };

    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    }
}

export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    const sessionData = localStorage.getItem(AUTH_KEY);
    if (!sessionData) return false;

    try {
        const session: AuthSession = JSON.parse(sessionData);

        if (Date.now() > session.expiresAt) {
            clearAuthentication();
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export function getAuthSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const sessionData = localStorage.getItem(AUTH_KEY);
    if (!sessionData) return null;

    try {
        const session: AuthSession = JSON.parse(sessionData);

        if (Date.now() > session.expiresAt) {
            clearAuthentication();
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

export function clearAuthentication(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_KEY);
    }
}
