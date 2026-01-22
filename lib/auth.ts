// Authentication and Session Management
export interface Session {
    userId: string;
    email: string;
    createdAt: string;
    expiresAt: string;
}

const SESSION_STORAGE_KEY = 'privacy_shield_session';
const SESSION_EXPIRY_HOURS = 24;

export function generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createSession(email: string): Session {
    const userId = generateUserId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    const session: Session = {
        userId,
        email,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
}

export function getSession(): Session | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
        return null;
    }

    const session: Session = JSON.parse(stored);

    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
        clearSession();
        return null;
    }

    return session;
}

export function isAuthenticated(): boolean {
    return getSession() !== null;
}

export function clearSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }
}

export function getCurrentUserId(): string | null {
    const session = getSession();
    return session?.userId ?? null;
}

export function getCurrentUserEmail(): string | null {
    const session = getSession();
    return session?.email ?? null;
}
