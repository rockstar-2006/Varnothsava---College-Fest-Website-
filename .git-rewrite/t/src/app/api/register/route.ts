import { usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { registerUserSchema } from "@/lib/validation";
import { handleApiError, ApiError } from "@/lib/errorHandler";
import { checkRegistrationRateLimit, getClientIdentifier } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
    try {
        // 0. Rate limiting check
        const clientId = getClientIdentifier(request);
        const rateLimitResult = await checkRegistrationRateLimit(clientId);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    message: "Too many registration attempts. Please try again later.",
                    retryAfter: "1 hour"
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '3600',
                        'X-RateLimit-Remaining': '0'
                    }
                }
            );
        }

        // 1. Verify authentication token
        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, "Unauthorized: Missing authentication token", "AUTH_MISSING");
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new ApiError(401, "Unauthorized: Invalid token format", "AUTH_INVALID");
        }

        const verified = await verifyAuthToken(token);
        if (!verified || !verified.uid) {
            throw new ApiError(401, "Unauthorized: Invalid token", "AUTH_INVALID");
        }

        // 2. Validate request body
        const body = await request.json();

        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('Registration request:', {
                uid: verified.uid,
                email: verified.email,
                body: body
            });
        }

        const validatedData = registerUserSchema.parse(body);
        const { name, usn, collegeName, phone } = validatedData.user;

        // 3. Security: Use email from verified token (cannot be spoofed by client)
        const email = verified.email;
        if (!email) {
            throw new ApiError(401, "Unauthorized: Email not found in token", "EMAIL_MISSING");
        }

        // 4. Check database initialization
        if (!usersCollection) {
            console.error("[CRITICAL] Database collection not initialized");
            throw new ApiError(500, "Database service unavailable", "DB_UNAVAILABLE");
        }

        // 5. Determine student type based on email domain
        const studentType = email.endsWith('@sode-edu.in') ? 'internal' : 'external';

        // 6. Create user profile (isolated by UID only)
        const userProfile: any = {
            id: verified.uid,
            name,
            email,
            usn,
            collegeName,
            phone,
            studentType,
            profileCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            hasPaid: false,
            registeredEvents: [],
            avatar: ['/avatars/solo_male.png', '/avatars/solo_female.png', '/avatars/ds_male.png', '/avatars/ds_female.png', '/avatars/jjk_male.png', '/avatars/jjk_female.png', '/avatars/mha_male.png', '/avatars/mha_female.png'][Math.floor(Math.random() * 8)],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailVerified: verified.email_verified || false,
        };

        // 7. Save to database (isolated by UID - no email lookup)
        await usersCollection.doc(verified.uid).set(userProfile, { merge: true });

        console.log('User registered successfully:', verified.uid);

        // 8. Return success response
        return NextResponse.json({
            message: "User registered successfully",
            user: userProfile
        }, {
            status: 200,
            headers: {
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
            }
        });

    } catch (error: any) {
        // Log validation errors in development
        if (process.env.NODE_ENV === 'development' && error.name === 'ZodError') {
            console.error('Validation failed:', error.errors);
        }

        // Handle validation errors and other errors
        return handleApiError(error);
    }
}