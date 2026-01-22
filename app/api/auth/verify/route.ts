import { NextResponse } from 'next/server';
import { getAllUsers, saveUsers, statsTrackLogin } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Email und Code erforderlich" }, { status: 400 });
        }

        const users = getAllUsers();
        const userIndex = users.findIndex(u => u.email === email && u.verificationCode === code);

        if (userIndex === -1) {
            return NextResponse.json({ error: "Ungültiger Code oder Email" }, { status: 400 });
        }

        // Mark as verified
        users[userIndex].verified = true;
        users[userIndex].verificationCode = undefined;
        users[userIndex].lastLogin = new Date().toISOString();

        saveUsers(users);
        statsTrackLogin();

        return NextResponse.json({
            message: "Erfolgreich verifiziert",
            user: {
                userId: users[userIndex].userId,
                email: users[userIndex].email
            }
        });

    } catch (err: any) {
        return NextResponse.json({ error: "Interner Server-Fehler" }, { status: 500 });
    }
}
