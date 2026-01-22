"use client";

import { useState, useEffect } from "react";
import { getCurrentUserEmail, getCurrentUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    User,
    Key,
    Monitor,
    Shield,
    Bell,
    CreditCard,
    Save,
    ExternalLink
} from "lucide-react";

export default function SettingsPage() {
    const [userEmail, setUserEmail] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const email = getCurrentUserEmail();
        setUserEmail(email || "gast@example.com");
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
                <p className="text-muted-foreground mt-1">
                    Verwalten Sie Ihr Konto und Ihre KI-Konfiguration.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Profil</h2>
                            <p className="text-sm text-muted-foreground">Ihre Kontoinformationen.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 max-w-md">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">E-Mail Adresse</label>
                            <Input value={userEmail} disabled className="bg-muted" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Anzeigename</label>
                            <Input placeholder="Dein Name" defaultValue={userEmail.split('@')[0]} />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <Monitor className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Anpassung</h2>
                            <p className="text-sm text-muted-foreground">Erscheinungsbild und Verhalten.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 max-w-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Dunkelmodus</p>
                                <p className="text-xs text-muted-foreground">Schont die Augen bei Nacht.</p>
                            </div>
                            <Button variant="outline" size="sm">Systemfolgend</Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">E-Mail Benachrichtigungen</p>
                                <p className="text-xs text-muted-foreground">Berichte direkt per Mail erhalten.</p>
                            </div>
                            <Button variant="outline" size="sm" disabled>Bald verfügbar</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <Button variant="outline">Abbrechen</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Speichere..." : "Änderungen speichern"}
                </Button>
            </div>
        </div>
    );
}
