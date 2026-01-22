"use client";

import { Upload, Shield, Brain, FileCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    {
        title: "Dokumenten-Import",
        description: "Laden Sie Ihre sensiblen Schriftstücke sicher hoch. Unser System unterstützt hochkomplexe Vertragswerke und juristische Fachtexte.",
        icon: Upload,
        color: "text-blue-500",
        bg: "bg-blue-50/50"
    },
    {
        title: "PII-Redaktion",
        description: "Bevor ein einziges Byte Ihr Gerät verlässt, identifiziert unsere lokale KI personenbezogene Daten und macht diese unlesbar.",
        icon: Shield,
        color: "text-emerald-500",
        bg: "bg-emerald-50/50"
    },
    {
        title: "Deep-Learning Analyse",
        description: "Fortschrittliche Modelle analysieren den Text auf rechtliche Risiken, Klauselfallen und Compliance-Lücken.",
        icon: Brain,
        color: "text-indigo-500",
        bg: "bg-indigo-50/50"
    },
    {
        title: "Gutachten-Bericht",
        description: "Sie erhalten ein detailliertes Gutachten mit konkreten Handlungsempfehlungen und einer fundierten Risikobewertung.",
        icon: FileCheck,
        color: "text-amber-500",
        bg: "bg-amber-50/50"
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-32 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="h-px w-12 bg-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Verfahrensablauf</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black tracking-tighter text-zinc-900 md:text-5xl lg:text-6xl mb-8 leading-[1.1] dark:text-white"
                    >
                        Präzision in <br />
                        <span className="text-zinc-400 italic">fünf Sekunden</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-zinc-500 leading-relaxed max-w-2xl font-medium"
                    >
                        Unser systematischer Prüfprozess kombiniert höchste Sicherheitsstandards mit modernster analytischer Intelligenz.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group relative p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-sm transition-all dark:bg-zinc-900 dark:border-zinc-800"
                        >
                            <div className="absolute top-6 right-6 text-3xl font-black text-zinc-100 dark:text-zinc-800/10 italic">
                                0{index + 1}
                            </div>

                            <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-[1.2rem] ${step.bg} ${step.color} dark:bg-zinc-800`}>
                                <step.icon className="h-7 w-7" />
                            </div>

                            <h3 className="text-xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">
                                {step.title}
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
