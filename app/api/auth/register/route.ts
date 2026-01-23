import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAllUsers, saveUsers, User } from '@/lib/db';
import { headers } from 'next/headers';
import { getLocationFromIP } from '@/lib/location';


export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const location = await getLocationFromIP(ip);

        if (!email) {
            return NextResponse.json({ error: "Email ist erforderlich" }, { status: 400 });
        }

        const users = getAllUsers();

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser && existingUser.verified) {
            return NextResponse.json({ error: "Diese E-Mail ist bereits registriert" }, { status: 400 });
        }

        // Generate 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser: User = {
            email,
            userId: `user_${Date.now()}`,
            verified: false,
            verificationCode,
            createdAt: new Date().toISOString(),
            ip,
            location
        };

        // Update or add user
        const updatedUsers = existingUser
            ? users.map(u => u.email === email ? newUser : u)
            : [...users, newUser];

        saveUsers(updatedUsers);

        // Send email with Resend
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            try {
                await resend.emails.send({
                    from: 'Privacy Shield <onboarding@resend.dev>', // Change to your verified domain in production
                    to: email,
                    subject: 'Ihr Verifikationscode für Privacy Shield',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                            <h2 style="color: #000;">Willkommen bei Privacy Shield</h2>
                            <p>Vielen Dank für Ihre Anmeldung. Bitte nutzen Sie den folgenden Code, um Ihre E-Mail zu verifizieren:</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                                ${verificationCode}
                            </div>
                            <p style="color: #666; font-size: 12px;">Falls Sie dieses Konto nicht erstellt haben, können Sie diese E-Mail ignorieren.</p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error("Email sending failed:", emailErr);
                // Continue anyway for the prototype, showing the code in development
            }
        }

        // ALWAYS return debugCode in development/prototype mode for easier testing
        // In production, you would remove this or add proper environment checks
        console.log(`[DEV] Verification code for ${email}: ${verificationCode}`);

        return NextResponse.json({
            message: "Verifikationscode gesendet",
            debugCode: verificationCode  // Always include for dev testing
        });

    } catch (err: any) {
        console.error("Registration error:", err);
        return NextResponse.json({ error: "Interner Server-Fehler" }, { status: 500 });
    }
}
