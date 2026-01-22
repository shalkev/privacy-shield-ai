"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, AlertCircle, CheckCircle2, Sparkles, Copy, Check } from "lucide-react";
import { initializeUserTokens } from "@/lib/storage";
import Link from "next/link";

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get("email");
    const debugCodeFromParams = searchParams.get("debugCode");

    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [codeCopied, setCodeCopied] = useState(false);
    const [newDebugCode, setNewDebugCode] = useState<string | null>(debugCodeFromParams);

    useEffect(() => {
        // If no email in URL, we can't do much
        if (!emailFromParams) {
            router.push("/register");
            return;
        }

        // Mock timer for 10 minutes from registration
        setTimeRemaining(600);
        const interval = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [emailFromParams, router]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailFromParams, code })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Verifizierung fehlgeschlagen");

            setSuccess(true);

            // Create local session for backward compatibility
            const { createSession } = await import("@/lib/auth");
            createSession(emailFromParams!);

            // Initialize tokens if needed
            initializeUserTokens(`user_${Date.now()}`);

            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!emailFromParams) return;
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailFromParams })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setError(null);
            setCode("");
            setTimeRemaining(600);

            // Update debug code if available
            if (data.debugCode) {
                setNewDebugCode(data.debugCode);
            }

            // Show success toast
            const successMsg = document.createElement("div");
            successMsg.className = "fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2";
            successMsg.textContent = "Neuer Code wurde generiert!";
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyCode = () => {
        if (newDebugCode) {
            navigator.clipboard.writeText(newDebugCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    const useDebugCode = () => {
        if (newDebugCode) {
            setCode(newDebugCode);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    return (
        <div className="container relative flex h-screen flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50">
            <Link
                href="/register"
                className="absolute left-4 top-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
                ← Zurück zur Registrierung
            </Link>

            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex flex-col space-y-2 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
                        <Shield className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        E-Mail verifizieren
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ein 6-stelliger Code wurde an <span className="font-semibold text-foreground">{emailFromParams}</span> gesendet.
                    </p>
                </div>

                {/* DEV MODE: Show debug code prominently */}
                {newDebugCode && (
                    <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <h3 className="font-bold text-amber-900">Dev-Modus: Ihr Code</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white rounded-xl border-2 border-amber-200 p-3 text-center">
                                <span className="text-3xl font-mono font-bold tracking-[0.3em] text-amber-900">
                                    {newDebugCode}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={copyCode}
                                    className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors"
                                    title="Code kopieren"
                                >
                                    {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={useDebugCode}
                            className="w-full mt-3 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
                        >
                            Code einfügen →
                        </button>
                    </div>
                )}

                {success ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center animate-in zoom-in-95 duration-300">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-green-900 mb-1">Verifizierung erfolgreich!</h2>
                        <p className="text-sm text-green-700">Sie werden sofort zum Dashboard weitergeleitet...</p>
                    </div>
                ) : (
                    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                        <form onSubmit={handleVerify}>
                            <div className="grid gap-4">
                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-700 text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Input
                                        id="code"
                                        placeholder="000000"
                                        type="text"
                                        disabled={isLoading}
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        className="h-14 text-center text-2xl font-bold tracking-[0.5em] focus:ring-primary"
                                        autoFocus
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                            Code läuft ab in: <span className="text-primary">{formatTime(timeRemaining)}</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={isLoading || timeRemaining > 540}
                                            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                                        >
                                            Code neu senden
                                        </button>
                                    </div>
                                </div>
                                <Button disabled={isLoading || code.length < 6} className="h-11 text-base font-semibold">
                                    {isLoading && (
                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    )}
                                    Konto bestätigen
                                </Button>
                            </div>
                        </form>

                        {!newDebugCode && (
                            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/20 dark:bg-blue-900/5">
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="flex-1 text-sm">
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                                            Nichts erhalten?
                                        </h3>
                                        <p className="mt-1 text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                                            Prüfen Sie Ihren Spam-Ordner. Falls Sie immer noch nichts erhalten haben,
                                            klicken Sie auf "Code neu senden".
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
