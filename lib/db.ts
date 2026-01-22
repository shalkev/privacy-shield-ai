import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure files exist
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(STATS_FILE)) {
    fs.writeFileSync(STATS_FILE, JSON.stringify({ totalLogins: 0, registrations: {} }, null, 2));
}

export interface User {
    email: string;
    userId: string;
    verified: boolean;
    verificationCode?: string;
    createdAt: string;
    lastLogin?: string;
    ip?: string;
    location?: string;
}

export function getAllUsers(): User[] {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export function saveUsers(users: User[]) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function statsTrackLogin() {
    const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    data.totalLogins = (data.totalLogins || 0) + 1;
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
}

export function getStats() {
    const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    const users = getAllUsers();
    return {
        totalLogins: data.totalLogins,
        totalUsers: users.length,
        verifiedUsers: users.filter(u => u.verified).length,
        users: users.map(u => ({
            email: u.email,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin,
            verified: u.verified,
            ip: u.ip,
            location: u.location
        }))
    };
}
