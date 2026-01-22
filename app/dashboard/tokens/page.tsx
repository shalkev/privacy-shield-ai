"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTokens, type TokenState } from "@/lib/storage";
import { getCurrentUserId } from "@/lib/auth";
import { Coins, Zap, Shield, Check, CreditCard, Loader2 } from "lucide-react";

// Plans definition
const PLANS = [
    {
        id: "starter",
        name: "Starter Pack",
        tokens: 5,
        price: "0,99 €",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro Pack",
        tokens: 25,
        price: "3,99 €",
        popular: true,
        save: "20%"
    },
    {
        id: "business",
        name: "Business Pack",
        tokens: 100,
        price: "12,99 €",
        popular: false,
        save: "35%"
    }
];

export default function TokensPage() {
    const [tokens, setTokens] = useState<TokenState>({ current: 0, max: 0 });
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    useEffect(() => {
        const id = getCurrentUserId();
        setUserId(id);
        if (id) {
            setTokens(getTokens(id));
        }

        const handleUpdate = () => {
            if (id) setTokens(getTokens(id));
        };

        window.addEventListener('tokensUpdated', handleUpdate);
        return () => window.removeEventListener('tokensUpdated', handleUpdate);
    }, []);

    const handlePurchase = async (planId: string) => {
        setIsLoading(true);
        setSelectedPlan(planId);

        try {
            const currentId = getCurrentUserId();
            if (!currentId) {
                alert("Bitte melden Sie sich an.");
                return;
            }

            // Create Checkout Session
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId,
                    userId: currentId,
                    returnUrl: window.location.origin,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error && data.error.includes("Stripe Secret Key")) {
                    alert("Demo Modus Fehler: STRIPE_SECRET_KEY fehlt in .env.local Umgebungsvariablen.");
                } else {
                    alert("Fehler beim Starten des Bezahlvorgangs: " + (data.error || "Unbekannt"));
                }
                throw new Error(data.error);
            }

            // Redirect to Stripe Checkout
            const { getStripe } = await import('@/lib/stripe');
            const stripe = await getStripe();

            if (!stripe) throw new Error("Stripe konnte nicht geladen werden.");

            const { error } = await (stripe as any).redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (error) {
                console.error("Stripe Redirect Error:", error);
                alert(error.message);
            }

        } catch (error) {
            console.error("Purchase Error:", error);
        } finally {
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Token Verwaltung</h1>
                <p className="text-muted-foreground">
                    Verwalten Sie Ihr Guthaben für Vertragsanalysen.
                </p>
            </div>

            {/* Current Balance Card */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Coins className="h-5 w-5 text-yellow-500" />
                                Aktuelles Guthaben
                            </h2>
                        </div>

                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-5xl font-bold">{tokens.current}</span>
                            <span className="text-muted-foreground">Tokens</span>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${(tokens.current / Math.max(tokens.max, 5)) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                reichen für ca. {Math.floor(tokens.current / 4)} komplette Analysen
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="md:col-span-2 rounded-xl border bg-muted/50 p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Warum Privacy Shield Tokens?
                    </h3>
                    <ul className="grid sm:grid-cols-2 gap-4 text-sm">
                        <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">1</div>
                            <div>
                                <span className="font-medium block">Pay-as-you-go</span>
                                Keine monatlichen Abos.
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">2</div>
                            <div>
                                <span className="font-medium block">Kostenkontrolle</span>
                                Sie zahlen nur für echte Nutzung.
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">3</div>
                            <div>
                                <span className="font-medium block">Keine versteckten Gebühren</span>
                                Einmalige Zahlung, lebenslang gültig.
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">4</div>
                            <div>
                                <span className="font-medium block">Sichere Zahlung</span>
                                Abwicklung über Stripe.
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    Tokens aufladen
                </h2>

                <div className="grid gap-6 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-xl border-2 p-6 transition-all hover:bg-muted/50 shadow-sm ${plan.popular ? 'border-primary bg-primary/5 shadow-md' : 'border-border'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
                                    Beliebt
                                </div>
                            )}

                            <div className="mb-2 font-semibold text-lg">{plan.name}</div>
                            <div className="mb-4 text-3xl font-bold">{plan.price}</div>

                            <ul className="mb-8 flex-1 space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                    <span className="font-bold text-foreground text-base">{plan.tokens}</span> Tokens
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Sofortige Gutschrift
                                </li>
                                <li className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-blue-500" />
                                    Sichere Zahlung
                                </li>
                            </ul>

                            <Button
                                onClick={() => handlePurchase(plan.id)}
                                disabled={isLoading}
                                variant={plan.popular ? "default" : "outline"}
                                className="w-full"
                                size="lg"
                            >
                                {isLoading && selectedPlan === plan.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Wird verarbeitet...
                                    </>
                                ) : (
                                    "Jetzt Kaufen"
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
