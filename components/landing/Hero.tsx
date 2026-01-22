"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 py-24 text-center bg-white dark:bg-zinc-950">
            {/* Minimalist Background Grid */}
            <div className="absolute inset-0 -z-10 bg-white dark:bg-zinc-950">
                <div className="bg-grid absolute inset-0 opacity-[0.05] dark:opacity-[0.02]" />
            </div>

            {/* Empty top spacer to help with vertical distribution */}
            <div className="hidden md:block" />

            <div className="flex flex-col items-center gap-12 w-full">
                {/* 100% Lokale & Private Verarbeitung Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-1.5 text-[10px] font-bold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
                >
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    100% Lokale & Private Verarbeitung
                </motion.div>

                {/* Main Headline Group */}
                <div className="space-y-8 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full"
                    >
                        <h1 className="mx-auto max-w-5xl px-4 text-6xl font-black tracking-tighter text-zinc-900 sm:text-7xl md:text-8xl lg:text-[100px] dark:text-white leading-[1.25] [text-wrap:balance]">
                            Rechtliche Analyse <br />
                            <span className="text-zinc-400">Ohne Datenleck.</span>
                        </h1>
                    </motion.div>

                    {/* Sub-Header Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mx-auto max-w-2xl px-4"
                    >
                        <p className="text-lg font-medium text-zinc-500 sm:text-xl leading-relaxed [text-wrap:balance]">
                            Überprüfen Sie Verträge, NDAs und Mietverträge direkt im Browser.
                            Automatische PII-Redaktion stellt sicher, dass Ihre sensiblen Daten das Gerät nie ungeschützt verlassen.
                        </p>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                    <Button asChild size="lg" className="h-14 min-w-[280px] rounded-full bg-zinc-900 text-lg font-bold text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-black">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            Jetzt Dokument Analysieren
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg" className="h-14 min-w-[200px] rounded-full text-lg font-bold text-zinc-500 hover:text-zinc-900 transition-colors border border-zinc-100 dark:border-zinc-800">
                        <Link href="#how-it-works">So funktioniert's</Link>
                    </Button>
                </motion.div>
            </div>

            {/* Trust Features Feature Row (Bottom) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-4 w-full"
            >
                {[
                    { label: "Privacy Shield™", icon: Shield, desc: "Sensible Namen, Adressen und Beträge werden lokal geschwärzt, bevor die KI-Analyse beginnt.", color: "bg-blue-50 text-blue-500" },
                    { label: "Sofortiges OCR", icon: FileText, desc: "Drag & Drop für PDFs oder Bilder. Wir wandeln sie sekundenschnell in durchsuchbaren Text um.", color: "bg-emerald-50 text-emerald-500" },
                    { label: "Risiko-Erkennung", icon: Lock, desc: "KI erkennt automatisch gefährliche Klauseln und fehlende Schutzmechanismen.", color: "bg-orange-50 text-orange-500" }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-start gap-4 text-left p-2">
                        <div className={`h-12 w-12 flex items-center justify-center rounded-xl shadow-sm ${item.color} dark:bg-zinc-900`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{item.label}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Elegant Background Glow */}
            <div className="absolute top-[40%] left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
        </section>
    );
}
