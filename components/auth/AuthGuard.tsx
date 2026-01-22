"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const authenticated = isAuthenticated();
        const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
        const isAuthRoute = AUTH_ROUTES.includes(pathname);

        if (isProtectedRoute && !authenticated) {
            router.replace("/login");
        } else if (isAuthRoute && authenticated) {
            router.replace("/dashboard");
        } else {
            setIsAllowed(true);
            setIsLoading(false);
        }
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAllowed) {
        return null;
    }

    return <>{children}</>;
}
