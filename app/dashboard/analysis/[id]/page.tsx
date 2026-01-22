"use client";

import { useEffect, useState } from "react";
import { ChatWidget } from "@/components/dashboard/ChatWidget";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, FileText, Lock, Loader2 } from "lucide-react";
import { redactPII } from "@/lib/pii-filter";
import { getAnalysisHistory, type AnalysisRecord } from "@/lib/storage";
import { getCurrentUserId } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";

export default function AnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [record, setRecord] = useState<AnalysisRecord | null>(null);
    const [redactedText, setRedactedText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userId = getCurrentUserId();
        if (!userId) {
            router.push("/login");
            return;
        }

        const history = getAnalysisHistory(userId);
        const currentRecord = history.find(r => r.id === id);

        if (currentRecord) {
            setRecord(currentRecord);
            // Apply PII Redaction to extracted text
            const textToProcess = currentRecord.extractedText || "Kein Text gefunden.";
            setRedactedText(redactPII(textToProcess));
        }

        setIsLoading(false);
    }, [id, router]);

    const handleDownload = async () => {
        if (!record) return;

        // Dynamic import to avoid SSR issues with jsPDF
        const { generateAnalysisReport } = await import("@/lib/pdf-generator");

        generateAnalysisReport({
            id: record.id,
            fileName: record.fileName,
            uploadDate: record.uploadDate,
            risks: record.analysisResult?.risks || [],
            summary: record.analysisResult?.summary || "Analyse Bericht"
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!record) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold">Analyse nicht gefunden</h2>
                <Button onClick={() => router.push("/dashboard/history")}>
                    Zum Verlauf
                </Button>
            </div>
        );
    }

    const { analysisResult } = record;
    const risks = analysisResult?.risks || [];

    return (
        <div className="relative flex h-[calc(100vh-4rem)] flex-col gap-4 lg:flex-row lg:gap-8 pb-4 overflow-hidden">
            {/* Left: Document View (Redacted) */}
            <div className="flex-1 overflow-auto rounded-xl border bg-card p-6 shadow-sm min-h-0">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h2 className="font-semibold">{record.fileName}</h2>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Lock className="h-3 w-3" />
                        PII Geschützt
                    </div>
                </div>
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-muted-foreground">
                    {redactedText.split('\n').map((line, i) => {
                        const parts = line.split(/(\[.*?_GESCHWÄRZT\])/g);
                        return (
                            <div key={i}>
                                {parts.map((part, j) =>
                                    part.endsWith("GESCHWÄRZT]") ? (
                                        <span key={j} className="bg-zinc-800 text-zinc-400 px-1 rounded mx-0.5 select-none" title="Redacted by Privacy Shield">{part}</span>
                                    ) : (
                                        <span key={j}>{part}</span>
                                    )
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Right: Analysis Report */}
            <div className="flex w-full flex-col gap-6 lg:w-[400px] overflow-auto pr-1">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Risiko-Check</h3>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${(analysisResult?.score || 0) > 80 ? 'bg-green-100 text-green-700' :
                            (analysisResult?.score || 0) > 50 ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            Score: {analysisResult?.score || 0}%
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed italic">
                        "{analysisResult?.summary}"
                    </p>

                    <div className="space-y-4">
                        {risks.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                Keine kritischen Risiken automatisch erkannt.
                            </div>
                        ) : (
                            risks.map((risk: any) => (
                                <div
                                    key={risk.id}
                                    className={`rounded-lg border p-3 ${risk.category === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' :
                                        risk.category === 'warning' ? 'border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20' :
                                            'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {risk.category === 'critical' ? (
                                            <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600 dark:text-red-400" />
                                        ) : risk.category === 'warning' ? (
                                            <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        ) : (
                                            <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                        <div>
                                            <p className={`font-bold text-sm ${risk.category === 'critical' ? 'text-red-900 dark:text-red-300' :
                                                risk.category === 'warning' ? 'text-orange-900 dark:text-orange-300' :
                                                    'text-blue-900 dark:text-blue-300'
                                                }`}>
                                                {risk.text}
                                            </p>
                                            <p className="text-xs mt-1 leading-normal opacity-80">
                                                {risk.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-lg">Handlungsempfehlungen</h3>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                        {risks.some((r: any) => r.category === 'critical') ? (
                            <>
                                <li>Lassen Sie die markierten Klauseln von einem Anwalt prüfen.</li>
                                <li>Versuchen Sie Haftungsobergrenzen zu verhandeln.</li>
                            </>
                        ) : (
                            <li>Das Dokument scheint weitgehend unbedenklich zu sein.</li>
                        )}
                        <li>Prüfen Sie, ob alle mündlichen Nebenabreden enthalten sind.</li>
                    </ul>
                    <Button className="mt-6 w-full" onClick={handleDownload}>
                        PDF-Bericht herunterladen
                    </Button>
                </div>
            </div>

            <ChatWidget
                extractedText={record.extractedText}
                analysisResult={record.analysisResult}
            />
        </div>
    );
}
