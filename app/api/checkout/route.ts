import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { PLANS } from '@/lib/plans';

export async function POST(req: Request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
            { error: 'Stripe Secret Key is missing. Please add STRIPE_SECRET_KEY to .env.local' },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { planId, userId, returnUrl } = body;

        const plan = PLANS[planId as keyof typeof PLANS];

        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: plan.name,
                            description: `${plan.items} Tokens für Privacy Shield`,
                        },
                        unit_amount: Math.round(plan.price * 100), // convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${returnUrl}/dashboard/tokens/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}/dashboard/tokens`,
            metadata: {
                userId: userId,
                tokens: plan.items.toString(),
                planId: planId,
            },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
