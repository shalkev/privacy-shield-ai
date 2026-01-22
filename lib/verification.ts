// Email Verification Management
export interface VerificationState {
    email: string;
    code: string;
    verified: boolean;
    expiresAt: string;
}

const VERIFICATION_STORAGE_KEY = 'privacy_shield_verification';
const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 10;

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createVerification(email: string): VerificationState {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const verification: VerificationState = {
        email,
        code,
        verified: false,
        expiresAt,
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verification));
    }

    return verification;
}

export function getVerification(): VerificationState | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
    if (!stored) {
        return null;
    }

    const verification: VerificationState = JSON.parse(stored);

    // Check if expired
    if (new Date(verification.expiresAt) < new Date()) {
        localStorage.removeItem(VERIFICATION_STORAGE_KEY);
        return null;
    }

    return verification;
}

export function verifyCode(inputCode: string): boolean {
    const verification = getVerification();

    if (!verification) {
        return false;
    }

    if (verification.code === inputCode) {
        verification.verified = true;
        localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verification));
        return true;
    }

    return false;
}

export function isEmailVerified(): boolean {
    const verification = getVerification();
    return verification?.verified ?? false;
}

export function clearVerification(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(VERIFICATION_STORAGE_KEY);
    }
}

export function resendVerificationCode(email: string): VerificationState {
    return createVerification(email);
}
