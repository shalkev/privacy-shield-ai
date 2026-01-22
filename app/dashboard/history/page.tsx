"use client";

import { useEffect, useState } from "react";
import { getAnalysisHistory, type AnalysisRecord } from "@/lib/storage";
import { getCurrentUserId } from "@/lib/auth";
import { FileText, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    const [history, setHistory] = useState<AnalysisRecord[]>([]);

    useEffect(() => {
        const userId = getCurrentUserId();
        if (userId) {
            setHistory(getAnalysisHistory(userId));
        }
    }, []);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Analyse-Verlauf</h1>

            {history.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    Noch keine Analysen durchgeführt. Laden Sie ein Dokument hoch, um zu beginnen.
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((record) => (
                        <Link
                            key={record.id}
                            href={`/dashboard/analysis/${record.id}`}
                            className="block rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{record.fileName}</h3>
                                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(record.uploadDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                {record.status === 'complete' ? 'Abgeschlossen' : 'In Bearbeitung'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{record.tokensUsed} Tokens</div>
                                    <div className="text-xs text-muted-foreground">verwendet</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
