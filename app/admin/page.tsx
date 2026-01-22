"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Users,
    Zap,
    BarChart3,
    ShieldCheck,
    Mail,
    Calendar,
    RefreshCcw,
    LayoutDashboard,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface UserStats {
    totalLogins: number;
    totalUsers: number;
    verifiedUsers: number;
    users: Array<{
        email: string;
        createdAt: string;
        lastLogin?: string;
        verified: boolean;
        ip?: string;
        location?: string;
    }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [authEmail, setAuthEmail] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);

    const fetchStats = async (email: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/stats?auth_email=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStats(authEmail);
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-xl">
                    <div className="text-center">
                        <LayoutDashboard className="mx-auto h-12 w-12 text-primary" />
                        <h2 className="mt-6 text-3xl font-bold tracking-tight">Admin-Bereich</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Bitte identifizieren Sie sich als Administrator.
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Admin E-Mail</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full rounded-lg border bg-background px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="admin@privacy-shield.de"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            Einloggen
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Zurück zum Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight">Anmeldestatistik</h1>
                        </div>
                        <p className="text-muted-foreground">Echtzeit-Überblick über Benutzeraktivitäten.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => fetchStats(authEmail)} className="gap-2">
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Aktualisieren
                        </Button>
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Zurück zur App
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Gesamtbenutzer</p>
                                <h3 className="text-2xl font-bold">{stats?.totalUsers}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Verifiziert</p>
                                <h3 className="text-2xl font-bold">{stats?.verifiedUsers}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-orange-500/10 p-3 text-orange-500">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Gesamte Logins</p>
                                <h3 className="text-2xl font-bold">{stats?.totalLogins}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-muted/20 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold text-lg">Letzte Registrierungen</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Benutzer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">IP & Standort</th>
                                    <th className="px-6 py-4 text-center">Registriert am</th>
                                    <th className="px-6 py-4 text-right">Letzter Login</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stats?.users.map((user, i) => (
                                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px]">
                                                {user.email.substring(0, 2).toUpperCase()}
                                            </div>
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.verified ? (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Verifiziert
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                                    Wartend
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-mono">{user.ip || '---'}</span>
                                                <span className="text-[10px] text-muted-foreground">{user.location || 'Unbekannt'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-muted-foreground">
                                            <div className="flex items-center justify-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(user.createdAt).toLocaleDateString('de-DE')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '---'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
