import { NextResponse } from 'next/server';
import { getAllUsers, saveUsers, statsTrackLogin } from '@/lib/db';
import { headers } from 'next/headers';
import { getLocationFromIP } from '@/lib/location';

// Demo-Emails die ohne Registrierung/Verifizierung funktionieren
const DEMO_EMAILS = ['demo@privacy-shield.de', 'gast@privacy-shield.de'];

export async function POST(req: Request) {
    try {
        const { email, isDemo } = await req.json();
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const location = await getLocationFromIP(ip);

        if (!email) {
            return NextResponse.json({ error: "Email ist erforderlich" }, { status: 400 });
        }

        // Demo-Login: Sofort zulassen ohne Verifizierung
        if (DEMO_EMAILS.includes(email) || isDemo) {
            return NextResponse.json({
                message: "Demo-Login erfolgreich",
                isDemo: true,
                tokens: 5,
                user: {
                    userId: `demo_${Date.now()}`,
                    email: email,
                    isDemo: true,
                    ip,
                    location
                }
            });
        }

        const users = getAllUsers();
        let user = users.find(u => u.email === email);

        if (!user) {
            return NextResponse.json({
                error: "Konto nicht gefunden. Bitte registrieren Sie sich zuerst."
            }, { status: 404 });
        }

        if (!user.verified) {
            return NextResponse.json({
                error: "Bitte verifizieren Sie zuerst Ihre E-Mail-Adresse.",
                needsVerification: true
            }, { status: 403 });
        }

        // Update login time for verified users
        user.lastLogin = new Date().toISOString();
        user.ip = ip;
        user.location = location;

        saveUsers(users);
        statsTrackLogin();

        return NextResponse.json({
            message: "Login erfolgreich",
            user: {
                userId: user.userId,
                email: user.email
            }
        });

    } catch (err: any) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Interner Server-Fehler" }, { status: 500 });
    }
}
