import { usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
    try {
        // Rate limiting check
        const clientId = getClientIdentifier(request);
        const rateLimitResult = await checkApiRateLimit(clientId);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: "Too many requests. Please slow down." },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                        'X-RateLimit-Remaining': '0'
                    }
                }
            );
        }

        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            console.error("API /me: Token verification returned null");
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }
        console.log("API /me: Verified user UID:", verified.uid);

        if (!usersCollection) {
            return NextResponse.json({ message: "System error: Database not initialized. Check server logs for service-account.json errors." }, { status: 500 });
        }
        // Get user by UID only (complete isolation)
        const userRef = usersCollection.doc(verified.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        return NextResponse.json({ user: userDoc.data() }, {
            status: 200,
            headers: {
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
            }
        });
    } catch (error: any) {
        console.error("Me API Error:", error);
        return NextResponse.json({
            message: "Authentication Error",
            detail: error.message
        }, { status: 401 });
    }
}