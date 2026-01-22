"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addTokens } from "@/lib/storage";
import { getCurrentUserId } from "@/lib/auth";

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState("Zahlung wird verifiziert...");

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setMessage("Ungültige Sitzung.");
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
                const data = await response.json();

                if (data.verified) {
                    const userId = getCurrentUserId();
                    if (userId) {
                        // Add tokens locally
                        // In a real app, this would happen via webhook on the server
                        addTokens(userId, data.tokens);
                        setStatus('success');
                        setMessage("Tokens wurden erfolgreich gutgeschrieben!");
                    } else {
                        setStatus('error');
                        setMessage("Benutzer nicht gefunden. Tokens konnten nicht gespeichert werden.");
                    }
                } else {
                    setStatus('error');
                    setMessage("Zahlung konnte nicht verifiziert werden.");
                }
            } catch (error) {
                console.error("Verification failed", error);
                setStatus('error');
                setMessage("Ein Fehler ist aufgetreten.");
            }
        };

        verifyPayment();
    }, [sessionId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            {status === 'loading' && (
                <>
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <h1 className="text-2xl font-bold"> Einen Moment bitte...</h1>
                    <p className="text-muted-foreground">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/30">
                        <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold">Zahlung erfolgreich!</h1>
                    <p className="text-muted-foreground">{message}</p>
                    <Button onClick={() => router.push('/dashboard/tokens')} className="mt-4">
                        Zurück zur Übersicht
                    </Button>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/30">
                        <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold">Etwas ist schiefgelaufen</h1>
                    <p className="text-muted-foreground">{message}</p>
                    <Button variant="outline" onClick={() => router.push('/dashboard/tokens')} className="mt-4">
                        Zurück
                    </Button>
                </>
            )}
        </div>
    );
}
