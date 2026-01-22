"use client";

import { useState, useEffect } from "react";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { PrivacyShieldStatus, ProcessingStep } from "@/components/dashboard/PrivacyShieldStatus";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToken, addAnalysisRecord, getTokens } from "@/lib/storage";
import { getCurrentUserId } from "@/lib/auth";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
    const [analyzedFileId, setAnalyzedFileId] = useState<string | null>(null);
    const [currentFileName, setCurrentFileName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const id = getCurrentUserId();
        setUserId(id);
    }, []);

    const handleFileSelect = async (file: File) => {
        if (!userId) {
            setError("Bitte melden Sie sich an, um fortzufahren.");
            return;
        }

        setError(null);
        setCurrentFileName(file.name);

        // Check if user has enough tokens
        const tokens = getTokens(userId);
        if (tokens.current < 4) {
            setError(`Nicht genügend Tokens. Sie benötigen 4 Tokens (1 für OCR + 3 für Analyse). Aktuell: ${tokens.current}`);
            return;
        }

        // Deduct 1 token for OCR
        if (!useToken(userId, 1)) {
            setError("Fehler beim Verwenden von Tokens.");
            return;
        }

        // Notify sidebar of token change
        window.dispatchEvent(new Event('tokensUpdated'));

        // Notify sidebar of token change
        window.dispatchEvent(new Event('tokensUpdated'));

        // Start Real Sequence
        setProcessingStep("scanning");

        let extractedText = "";
        let analysisResult = null;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server-Fehler bei der Analyse');
            }

            const data = await response.json();
            extractedText = data.text;
            analysisResult = data.analysis;
        } catch (e: any) {
            console.error("Analysis Failed", e);
            setError(e.message || "Fehler bei der Texterkennung.");
            setProcessingStep("idle");
            return;
        }

        setProcessingStep("anonymizing");

        // Simulate PII Redaction (fast)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Deduct 3 tokens for deep legal analysis
        if (!useToken(userId, 3)) {
            setError("Nicht genügend Tokens für die Analyse.");
            setProcessingStep("idle");
            return;
        }

        // Notify sidebar of token change
        window.dispatchEvent(new Event('tokensUpdated'));

        setProcessingStep("analyzing");

        // Wait a bit to show the step (UX)
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProcessingStep("complete");

        // Generate unique ID
        const docId = `doc-${Date.now()}`;
        setAnalyzedFileId(docId);

        // Save to history with REAL data
        addAnalysisRecord(userId, {
            id: docId,
            fileName: file.name,
            status: 'complete',
            tokensUsed: 4,
            extractedText: extractedText,
            analysisResult: analysisResult,
        });
    };

    return (
        <div className="flex flex-1 flex-col items-center justify-start p-6 pt-16 min-h-[calc(100vh-64px)]">
            <div className="w-full max-w-4xl mx-auto space-y-10 flex flex-col items-center">
                {/* Headline Section */}
                <div className="text-center space-y-3 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-1.5 text-[10px] font-bold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
                    >
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        Secure Workspace: Aktiv
                    </motion.div>

                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-4xl lg:text-5xl dark:text-white leading-[1.2] [text-wrap:balance]">
                        Rechtliche Analyse <br />
                        <span className="text-zinc-400">Ohne Datenleck.</span>
                    </h1>

                    <p className="mx-auto max-w-lg text-base font-medium text-zinc-500 leading-relaxed [text-wrap:balance]">
                        Starten Sie eine neue autonome Compliance-Prüfung für Ihre vertraulichen Dokumente.
                    </p>
                </div>

                {/* Error Section */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto w-full max-w-xl rounded-3xl border border-red-200 bg-red-50/50 p-6 backdrop-blur-xl dark:border-red-900/30 dark:bg-red-900/20"
                    >
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-red-900 dark:text-red-300">System Hinweis</h3>
                                <p className="mt-2 text-sm font-medium text-red-700/80 dark:text-red-400/80">{error}</p>
                                {error && error.includes("Tokens") && (
                                    <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl border-red-200 bg-white dark:bg-zinc-900 dark:border-red-900/30">
                                        <Link href="/dashboard/tokens">
                                            Tokens aufladen
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Action Area (Upload / Processing / Result) */}
                <div className="mx-auto w-full max-w-3xl flex justify-center">
                    {processingStep === "idle" && (
                        <UploadZone onFileSelect={handleFileSelect} isProcessing={false} />
                    )}

                    {processingStep !== "idle" && processingStep !== "complete" && (
                        <div className="flex flex-col items-center gap-8 py-12">
                            <PrivacyShieldStatus step={processingStep} />
                        </div>
                    )}

                    {processingStep === "complete" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-10 rounded-[40px] border border-zinc-100 bg-white p-16 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800"
                        >
                            <PrivacyShieldStatus step="complete" />
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button variant="ghost" className="h-14 rounded-2xl px-8 font-bold text-muted-foreground" onClick={() => {
                                    setProcessingStep("idle");
                                    setAnalyzedFileId(null);
                                }}>
                                    Neues Dokument prüfen
                                </Button>
                                <Button asChild className="h-14 rounded-2xl bg-zinc-900 px-10 text-lg font-black text-white dark:bg-white dark:text-black">
                                    <Link href={`/dashboard/analysis/${analyzedFileId}`} className="flex items-center gap-2">
                                        Bericht öffnen <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
