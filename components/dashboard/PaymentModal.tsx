"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldCheck, Check, Zap, CreditCard } from "lucide-react";
import { addTokens } from "@/lib/storage";
import { getCurrentUserId } from "@/lib/auth";

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

interface PaymentModalProps {
    children?: React.ReactNode;
}

export function PaymentModal({ children }: PaymentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handlePurchase = async (planId: string, tokens: number) => {
        setIsLoading(true);
        setSelectedPlan(planId);

        try {
            const userId = getCurrentUserId();
            if (!userId) {
                // Should redirect to login ideally
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
                    userId,
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
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || <Button>Tokens aufladen</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Tokens aufladen
                    </DialogTitle>
                    <DialogDescription>
                        Wählen Sie ein Paket, um weitere Dokumente zu analysieren.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${plan.popular ? 'border-primary bg-primary/5' : 'border-border'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                                    Beliebt
                                </div>
                            )}

                            <div className="mb-2 font-semibold">{plan.name}</div>
                            <div className="mb-4 text-2xl font-bold">{plan.price}</div>

                            <ul className="mb-6 flex-1 space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    <span className="font-bold text-foreground">{plan.tokens}</span> Tokens
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Sofortige Gutschrift
                                </li>
                            </ul>

                            <Button
                                onClick={() => handlePurchase(plan.id, plan.tokens)}
                                disabled={isLoading}
                                variant={plan.popular ? "default" : "outline"}
                                className="w-full"
                            >
                                {isLoading && selectedPlan === plan.id ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    "Kaufen"
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Sichere Zahlungsabwicklung (Simuliert für Demo)</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
