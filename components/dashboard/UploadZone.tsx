"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            setError(null);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type === "application/pdf" || file.type.startsWith("image/")) {
                    onFileSelect(file);
                } else {
                    setError("Nur PDF- und Bilddateien werden unterstützt.");
                }
            }
        },
        [onFileSelect]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
            }
        },
        [onFileSelect]
    );

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-zinc-200 bg-zinc-50/50 p-24 transition-all hover:bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40",
                    dragActive && "border-zinc-900 bg-white ring-4 ring-zinc-100",
                    isProcessing && "pointer-events-none opacity-50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    accept=".pdf,image/*"
                    onChange={handleChange}
                    disabled={isProcessing}
                />

                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-sm border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700">
                    <UploadCloud className="h-10 w-10 text-zinc-400" />
                </div>

                <div className="mt-10 text-center space-y-3">
                    <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Klicken zum Hochladen oder per Drag & Drop
                    </p>
                    <p className="text-base font-medium text-zinc-400">
                        PDF, PNG, JPG (max. 10MB)
                    </p>
                </div>

                {error && (
                    <div className="mt-8 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-500 uppercase tracking-wider">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="mt-10 text-center px-10">
                <p className="text-[11px] font-medium leading-relaxed text-zinc-400">
                    <span className="font-bold text-zinc-500">Hinweis zum Datenschutz:</span> Dateien werden zuerst lokal mit unserer "Privacy Shield"-Technologie verarbeitet, um PII zu schwärzen.
                </p>
            </div>
        </div>
    );
}
