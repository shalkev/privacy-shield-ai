"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getTokens, type TokenState } from "@/lib/storage";
import { getCurrentUserId, getCurrentUserEmail, clearSession } from "@/lib/auth";
import {
    LayoutDashboard,
    History,
    Settings,
    CreditCard,
    LogOut,
    ShieldCheck,
    User,
    Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: History, label: "Verlauf", href: "/dashboard/history" },
    { icon: Coins, label: "Tokens", href: "/dashboard/tokens" },
    { icon: Settings, label: "Einstellungen", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [tokens, setTokens] = useState<TokenState>({ current: 5, max: 5 });
    const [userEmail, setUserEmail] = useState<string>("");
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get current user info
        const currentUserId = getCurrentUserId();
        const email = getCurrentUserEmail();
        if (currentUserId !== userId) setUserId(currentUserId);
        if (email !== userEmail) setUserEmail(email || "Benutzer");

        // Load tokens on mount
        if (currentUserId) {
            setTokens(getTokens(currentUserId));
        }

        // Listen for token updates
        const handleStorageChange = () => {
            const id = getCurrentUserId();
            if (id) {
                setTokens(getTokens(id));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('tokensUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tokensUpdated', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        clearSession();
        router.push("/");
    };

    // Extract display name from email
    const displayName = userEmail.split("@")[0] || "Benutzer";

    return (
        <div className="flex h-full flex-col border-r bg-white dark:bg-zinc-950">
            <div className="flex h-16 items-center border-b px-8">
                <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-zinc-900 dark:text-white">
                    <ShieldCheck className="h-6 w-6 text-zinc-900 dark:text-white" />
                    <span className="text-lg">Privacy Shield</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-6">
                <nav className="grid items-start px-4 text-sm font-semibold gap-1">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-200",
                                pathname === item.href
                                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-5 space-y-6">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Budget</h3>
                        {tokens.current <= 2 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white">{tokens.current}</span>
                        <span className="text-[10px] font-bold text-zinc-400">/ {tokens.max}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(tokens.current / Math.max(tokens.max, 1)) * 100}%` }}
                            className={cn(
                                "h-full transition-all duration-1000",
                                tokens.current <= 2 ? "bg-orange-500" : "bg-zinc-900 dark:bg-zinc-400"
                            )}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-2 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                            <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="text-xs">
                            <p className="font-bold text-zinc-900 dark:text-white truncate max-w-[80px]">{displayName}</p>
                            <p className="text-zinc-400 font-medium opacity-70">Standard</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

    );
}
