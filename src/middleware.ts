import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Proxy
 * Implements CORS, security headers, and basic request validation
 */
export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin');
    const pathname = request.nextUrl.pathname;

    // Define allowed origins based on environment
    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        // Production domains
        'https://varnothsava.sode-edu.in',
        'http://varnothsava.sode-edu.in',
    ].filter(Boolean) as string[];

    // Production origins (add your production domains)
    if (process.env.NODE_ENV === 'production') {
        allowedOrigins.push(
            'https://varnothsava.sode-edu.in',
            'http://varnothsava.sode-edu.in'
        );
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    // CORS validation for API routes
    if (pathname.startsWith('/api/')) {
        // Exempt Razorpay callbacks and webhooks from strict origin check
        const isExempt = pathname.includes('/api/payment/callback') || pathname.includes('/api/payment/webhook');

        if (!isExempt && origin && !allowedOrigins.includes(origin)) {
            console.warn(`[Security] Blocked request from unauthorized origin: ${origin}`);
            return new NextResponse(
                JSON.stringify({ message: 'Forbidden: Invalid origin' }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    // Create response
    const response = NextResponse.next();

    // Add CORS headers
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Security Headers (OWASP recommended)
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Cross-Origin-Opener-Policy: Allow OAuth popups (Google Sign-In)
    // Using 'same-origin-allow-popups' instead of 'same-origin' for OAuth compatibility
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    // Cross-Origin-Embedder-Policy: Not set to avoid breaking OAuth flows
    // In production, you may want to set this to 'require-corp' after testing

    // Strict-Transport-Security (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload'
        );
    }

    // Content Security Policy is now handled in next.config.ts for better reliability
    // response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

// Configure which routes to apply middleware to
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
