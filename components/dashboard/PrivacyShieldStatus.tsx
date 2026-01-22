"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProcessingStep = "idle" | "scanning" | "anonymizing" | "analyzing" | "complete";

interface PrivacyShieldStatusProps {
    step: ProcessingStep;
}

export function PrivacyShieldStatus({ step }: PrivacyShieldStatusProps) {
    const steps = [
        {
            id: "scanning",
            label: "OCR Scan",
            icon: Loader2,
            activeColor: "text-blue-500",
        },
        {
            id: "anonymizing",
            label: "PII Schwärzung",
            icon: ShieldAlert, // Using ShieldAlert to signify looking for sensitive info
            activeColor: "text-orange-500",
        },
        {
            id: "analyzing",
            label: "Rechtliche Analyse",
            icon: ShieldCheck,
            activeColor: "text-green-500",
        },
    ];

    const getCurrentStepIndex = () => {
        switch (step) {
            case "idle": return -1;
            case "scanning": return 0;
            case "anonymizing": return 1;
            case "analyzing": return 2;
            case "complete": return 3;
            default: return -1;
        }
    };

    const currentIndex = getCurrentStepIndex();

    if (step === "idle") return null;

    return (
        <div className="w-full max-w-xl rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-6 text-center text-lg font-medium">Privacy Shield Protocol</h3>
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-muted" />

                {steps.map((s, index) => {
                    const isActive = currentIndex === index;
                    const isCompleted = currentIndex > index;

                    return (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-card px-2">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500",
                                    isActive
                                        ? `border-primary bg-primary text-primary-foreground scale-110 shadow-lg`
                                        : isCompleted
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-muted bg-muted text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <s.icon className={cn("h-5 w-5", isActive && "animate-spin-slow")} />
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-medium transition-colors duration-300",
                                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Dynamic Status Text */}
            <div className="mt-8 text-center">
                {step === "scanning" && <p className="text-sm text-muted-foreground animate-pulse">Extrahiere Text aus Dokument...</p>}
                {step === "anonymizing" && <p className="text-sm text-muted-foreground animate-pulse">Schwärze sensible Daten lokal...</p>}
                {step === "analyzing" && <p className="text-sm text-muted-foreground animate-pulse">Führe rechtliche Risikoanalyse durch...</p>}
                {step === "complete" && <p className="text-sm font-medium text-green-600">Analyse abgeschlossen!</p>}
            </div>
        </div>
    );
}
