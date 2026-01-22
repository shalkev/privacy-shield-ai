import { NextResponse } from 'next/server';
import { getStats, getAllUsers } from '@/lib/db';

// Admin Email - NUR diese Email hat Zugriff auf Statistiken
const ADMIN_EMAIL = 'admin@privacy-shield.de';

// Demo-Emails die nicht in Statistiken erscheinen sollen
const DEMO_EMAILS = ['demo@privacy-shield.de', 'gast@privacy-shield.de'];

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('auth_email');

    // Nur Admin hat Zugriff
    if (email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    try {
        const stats = getStats();

        // Demo-User aus der Liste filtern
        const filteredUsers = stats.users.filter(
            (u: any) => !DEMO_EMAILS.includes(u.email) && !u.email.startsWith('demo')
        );

        return NextResponse.json({
            ...stats,
            totalUsers: filteredUsers.length,
            verifiedUsers: filteredUsers.filter((u: any) => u.verified).length,
            users: filteredUsers
        });
    } catch (err) {
        return NextResponse.json({ error: "Fehler beim Laden der Statistik" }, { status: 500 });
    }
}
