"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

export function Navbar() {
    const { scrollY } = useScroll();
    const [isOpen, setIsOpen] = useState(false);

    const height = useTransform(scrollY, [0, 50], [80, 64]);
    const backgroundColor = useTransform(
        scrollY,
        [0, 50],
        ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
    );
    const darkBackgroundColor = useTransform(
        scrollY,
        [0, 50],
        ["rgba(0, 0, 0, 0)", "rgba(10, 10, 12, 0.8)"]
    );

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-center border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80"
        >
            <div className="container mx-auto flex items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <ShieldCheck className="h-6 w-6 text-zinc-900 dark:text-white" />
                    <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Privacy Shield</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-10 md:flex">
                    <Link href="#features" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        Process
                    </Link>
                    <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white hover:opacity-70 transition-opacity">
                        Anmelden
                    </Link>
                    <Button asChild size="sm" className="h-10 rounded-full px-6 bg-zinc-900 font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black">
                        <Link href="/register">Kostenlos Starten</Link>
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-zinc-900 dark:text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav Dropdown */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-16 left-0 right-0 border-b border-zinc-100 bg-white p-6 shadow-xl md:hidden dark:border-zinc-800 dark:bg-zinc-950"
                >
                    <div className="flex flex-col gap-6 font-bold text-zinc-600 dark:text-zinc-400">
                        <Link href="#features" onClick={() => setIsOpen(false)}>Features</Link>
                        <Link href="#how-it-works" onClick={() => setIsOpen(false)}>Process</Link>
                        <Link href="/login" onClick={() => setIsOpen(false)}>Anmelden</Link>
                        <Button asChild className="rounded-full h-12 bg-zinc-900 dark:bg-white">
                            <Link href="/register">Kostenlos Starten</Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
