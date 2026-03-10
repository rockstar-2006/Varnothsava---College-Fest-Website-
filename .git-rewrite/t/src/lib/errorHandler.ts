import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Centralized Error Handler for API Routes
 * Prevents information disclosure and provides consistent error responses
 */

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Generate unique error ID for tracking
 */
function generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handle API errors with appropriate logging and response
 */
export function handleApiError(error: unknown): NextResponse {
    const errorId = generateErrorId();
    const isDev = process.env.NODE_ENV === 'development';

    // Log error internally (always log full details)
    console.error(`[API Error ${errorId}]`, {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
    });

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            {
                message: 'Validation failed',
                errors: error.issues.map((err: z.ZodIssue) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
                ...(isDev && { errorId }),
            },
            { status: 422 }
        );
    }

    // Handle custom API errors
    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                message: error.message,
                code: error.code,
                ...(isDev && { errorId }),
            },
            { status: error.statusCode }
        );
    }

    // Handle Firebase Auth errors
    if (error instanceof Error && 'code' in error) {
        const firebaseError = error as any;

        // Map common Firebase errors to user-friendly messages
        const errorMessages: Record<string, { message: string; status: number }> = {
            'auth/invalid-token': { message: 'Invalid authentication token', status: 401 },
            'auth/token-expired': { message: 'Authentication token expired', status: 401 },
            'auth/user-not-found': { message: 'User not found', status: 404 },
            'auth/email-already-exists': { message: 'Email already registered', status: 409 },
            'permission-denied': { message: 'Permission denied', status: 403 },
        };

        const mapped = errorMessages[firebaseError.code];
        if (mapped) {
            return NextResponse.json(
                {
                    message: mapped.message,
                    ...(isDev && { code: firebaseError.code, errorId }),
                },
                { status: mapped.status }
            );
        }
    }

    // Generic error response (hide details in production)
    if (isDev) {
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'An error occurred',
                errorId,
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }

    // Production: Generic message only
    return NextResponse.json(
        {
            message: 'An internal error occurred. Please try again later.',
            errorId, // Include error ID for support
        },
        { status: 500 }
    );
}

/**
 * Async error wrapper for API route handlers
 * Usage: export const POST = withErrorHandler(async (request) => { ... });
 */
export function withErrorHandler(
    handler: (request: Request) => Promise<NextResponse>
) {
    return async (request: Request): Promise<NextResponse> => {
        try {
            return await handler(request);
        } catch (error) {
            return handleApiError(error);
        }
    };
}
