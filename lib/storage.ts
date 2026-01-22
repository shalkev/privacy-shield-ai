// Token Management
export interface TokenState {
    current: number;
    max: number;
}

const TOKEN_STORAGE_KEY_PREFIX = 'privacy_shield_tokens_';
const INITIAL_TOKENS = 5;

function getTokenStorageKey(userId: string): string {
    return `${TOKEN_STORAGE_KEY_PREFIX}${userId}`;
}

export function initializeUserTokens(userId: string): TokenState {
    if (typeof window === 'undefined') {
        return { current: INITIAL_TOKENS, max: INITIAL_TOKENS };
    }

    const key = getTokenStorageKey(userId);
    const initial = { current: INITIAL_TOKENS, max: INITIAL_TOKENS };
    localStorage.setItem(key, JSON.stringify(initial));

    // Dispatch event to notify UI
    window.dispatchEvent(new Event('tokensUpdated'));

    return initial;
}

export function getTokens(userId: string): TokenState {
    if (typeof window === 'undefined') {
        return { current: INITIAL_TOKENS, max: INITIAL_TOKENS };
    }

    const key = getTokenStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
        return JSON.parse(stored);
    }

    // Initialize for new users
    return initializeUserTokens(userId);
}

export function useToken(userId: string, amount: number = 1): boolean {
    const tokens = getTokens(userId);

    if (tokens.current < amount) {
        return false;
    }

    tokens.current -= amount;
    const key = getTokenStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(tokens));

    // Dispatch event to notify UI
    window.dispatchEvent(new Event('tokensUpdated'));

    return true;
}

export function addTokens(userId: string, amount: number): void {
    const tokens = getTokens(userId);
    tokens.current = Math.min(tokens.current + amount, tokens.max + amount);
    tokens.max = Math.max(tokens.max, tokens.current);

    const key = getTokenStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(tokens));

    // Dispatch event to notify UI
    window.dispatchEvent(new Event('tokensUpdated'));
}

// Analysis History Management
export interface AnalysisRecord {
    id: string;
    fileName: string;
    uploadDate: string;
    status: 'complete' | 'processing' | 'failed';
    tokensUsed: number;
    extractedText?: string;
    analysisResult?: any;
}

const HISTORY_STORAGE_KEY_PREFIX = 'privacy_shield_history_';

function getHistoryStorageKey(userId: string): string {
    return `${HISTORY_STORAGE_KEY_PREFIX}${userId}`;
}

export function getAnalysisHistory(userId: string): AnalysisRecord[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const key = getHistoryStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
        return JSON.parse(stored);
    }

    return [];
}

export function addAnalysisRecord(userId: string, record: Omit<AnalysisRecord, 'uploadDate'>): void {
    const history = getAnalysisHistory(userId);
    const newRecord: AnalysisRecord = {
        ...record,
        uploadDate: new Date().toISOString(),
    };

    history.unshift(newRecord); // Add to beginning

    // Keep only last 50 records
    const trimmed = history.slice(0, 50);

    const key = getHistoryStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(trimmed));
}

export function clearHistory(userId: string): void {
    const key = getHistoryStorageKey(userId);
    localStorage.removeItem(key);
}
