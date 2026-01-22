"use client";

import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface ChatWidgetProps {
    extractedText?: string;
    analysisResult?: any;
}

export function ChatWidget({ extractedText = "", analysisResult }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{ useOllama: boolean; model: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error("Failed to fetch AI config", err));
    }, []);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat',
        body: {
            documentText: extractedText,
            analysisResult: analysisResult
        },
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: "Hallo! Ich habe das Dokument gelesen. Fragen Sie mich gerne nach spezifischen Klauseln, Fristen oder Risiken, die ich gefunden habe."
            }
        ]
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 print:hidden">
            {isOpen && (
                <div className="flex h-[550px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-black/5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b bg-zinc-900 px-4 py-4 text-white">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Bot className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Privacy Shield AI</p>
                                <p className="text-[10px] text-zinc-400">
                                    {config?.useOllama ? `Privat • Lokal (${config.model})` : "Online • Kontext-aktiv"}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:bg-white/10 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex flex-col gap-1 rounded-2xl px-4 py-2.5 text-sm shadow-sm max-w-[85%]",
                                    msg.role === "user"
                                        ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                                        : "mr-auto bg-white dark:bg-zinc-900 border text-foreground rounded-tl-none"
                                )}
                            >
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                            </div>
                        ))}

                        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                            <div className="mr-auto bg-white dark:bg-zinc-900 border px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {error && (
                            <div className="mx-auto rounded-lg bg-red-50 p-2 text-center text-xs text-red-600 border border-red-100">
                                Verbindung zur KI unterbrochen. Bitte prüfen Sie Ihren API-Key.
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t p-4 bg-white dark:bg-zinc-950">
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2"
                        >
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Frage zum Dokument stellen..."
                                className="flex-1 bg-muted/40 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary shadow-none h-11"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                        <p className="mt-2 text-[9px] text-center text-muted-foreground uppercase tracking-widest font-medium">
                            Basierend auf realer Dokumenten-Analyse
                        </p>
                    </div>
                </div>
            )}

            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="h-16 w-16 rounded-2xl shadow-2xl transition-all hover:scale-105 bg-zinc-900 hover:bg-zinc-800 ring-4 ring-white dark:ring-zinc-900"
                >
                    <Bot className="h-9 w-9 text-white" />
                    {extractedText && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] text-white ring-2 ring-white animate-pulse">
                            Context
                        </span>
                    )}
                </Button>
            )}
        </div>
    );
}
