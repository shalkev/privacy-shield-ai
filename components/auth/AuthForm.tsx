"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Sparkles, AlertCircle, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthFormProps {
    type: "login" | "register";
}

// Demo-Email für kostenlosen Zugang
const DEMO_EMAIL = "demo@privacy-shield.de";

export function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showDemoHint, setShowDemoHint] = useState(false);

    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { createSession } = await import("@/lib/auth");
            const { initializeUserTokens } = await import("@/lib/storage");

            createSession(DEMO_EMAIL);
            initializeUserTokens(`demo_${Date.now()}`);

            await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: DEMO_EMAIL, isDemo: true })
            });

            router.push("/dashboard");
        } catch (err) {
            setError("Demo-Login momentan nicht verfügbar.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (type === "register") {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Registrierung fehlgeschlagen");

                const debugParam = data.debugCode ? `&debugCode=${data.debugCode}` : '';
                router.push(`/verify?email=${encodeURIComponent(email)}${debugParam}`);
            } else {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.needsVerification) {
                        router.push(`/verify?email=${encodeURIComponent(email)}`);
                        return;
                    }
                    throw new Error(data.error || "Konto nicht gefunden. Bitte registrieren Sie sich.");
                }

                const { createSession } = await import("@/lib/auth");
                createSession(email);
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px] glass p-8 rounded-[2rem] shadow-2xl dark:shadow-black/40"
        >
            {/* Header Section */}
            <div className="flex flex-col space-y-2 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto mb-6"
                >
                    <div className="bg-zinc-900 dark:bg-white text-white dark:text-black p-4 rounded-2xl">
                        <Shield className="h-6 w-6" />
                    </div>
                </motion.div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                    {type === "login" ? "Identifizierung" : "Konto erstellen"}
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    {type === "login"
                        ? "Secure Identity Portal"
                        : "Professional Compliance Access"}
                </p>
            </div>

            {/* Form Content */}
            <div className="grid gap-6">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleDemoLogin}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 p-5 cursor-pointer dark:bg-zinc-900/50 dark:border-zinc-800"
                >
                    <div className="relative flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm group-hover:scale-105 transition-transform">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                                Sandbox Modus
                            </h3>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                Sofortiger Zugriff (Demo)
                            </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-all" />
                    </div>
                </motion.div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-zinc-100 dark:border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-bold">
                        <span className="bg-white dark:bg-zinc-950 px-4 text-zinc-300">
                            Authentication Required
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="rounded-xl border border-red-100 bg-red-50 p-3 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Input
                                id="email"
                                placeholder="E-Mail Adresse"
                                type="email"
                                disabled={isLoading}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setShowDemoHint(true)}
                                onBlur={() => setTimeout(() => setShowDemoHint(false), 200)}
                                className="h-14 px-6 rounded-2xl border-zinc-100 bg-zinc-50 focus:bg-white transition-all font-bold text-base dark:bg-zinc-900 dark:border-zinc-800"
                            />

                            <AnimatePresence>
                                {showDemoHint && !email && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9, x: 5 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: 5 }}
                                        type="button"
                                        onClick={() => setEmail(DEMO_EMAIL)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                    >
                                        Auto-Fill
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <Button
                            disabled={isLoading}
                            className="h-14 w-full rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black text-lg font-bold tracking-tight hover:scale-[1.01] active:scale-98 transition-all shadow-md"
                        >
                            <span className="flex items-center gap-3">
                                {isLoading ? (
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <>
                                        {type === "login" ? "Identifizieren" : "Registrieren"}
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </div>
                </form>

                {type === "register" && (
                    <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-center">
                        Sicherheitscode wird per Mail versandt.
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
                <Link
                    href={type === "login" ? "/register" : "/login"}
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                    {type === "login" ? "Konto erstellen" : "Anmeldung"}
                </Link>
            </div>


        </motion.div>
    );
}
