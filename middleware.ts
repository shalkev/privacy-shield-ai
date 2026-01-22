import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // We can't access localStorage in middleware/edge runtime.
    // We rely on client-side AuthGuard for the main check, 
    // but we can add basic cookie-based checks if we had cookies.
    // For this prototype using localStorage, middleware is limited.
    // However, we can use it to block obvious paths or redirect root.

    // Since we rely on localStorage (client-side only), true route protection
    // happens in the AuthGuard component. This middleware is a placeholder
    // for future server-side session cookies.

    return NextResponse.next();
}

export const config = {
    matcher: '/dashboard/:path*',
};
