import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';

export async function GET(req: Request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: 'Stripe Secret Key is missing' },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const tokens = parseInt(session.metadata?.tokens || '0', 10);
            return NextResponse.json({
                verified: true,
                tokens: tokens,
                planId: session.metadata?.planId,
                status: session.status
            });
        } else {
            return NextResponse.json({ verified: false, status: session.payment_status });
        }
    } catch (error: any) {
        console.error('Error verifying session:', error);
        return NextResponse.json(
            { error: 'Failed to verify session' },
            { status: 500 }
        );
    }
}
