import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { ChevronLeft } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/"
                className="absolute left-4 top-4 z-20 flex items-center text-sm font-medium md:left-8 md:top-8"
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Zurück
            </Link>
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                    Privacy Shield
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Finally, a legal tool that respects my client's confidentiality. The PII redaction feature is a game changer.&rdquo;
                        </p>
                        <footer className="text-sm">Marcus Chen, Real Estate Agent</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <AuthForm type="register" />
            </div>
        </div>
    );
}
