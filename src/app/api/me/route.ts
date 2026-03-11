import { registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";
import { getAdminRole } from "@/lib/admin";
import { checkUserPaymentStatus } from "@/lib/paymentService";

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

        let userData = userDoc.exists ? userDoc.data() : null;

        const { role, eventId } = getAdminRole(verified.email || '');

        if (!userData) {
            if (role) {
                // Auto-create profile for Coordinators/Admins
                userData = {
                    id: verified.uid,
                    name: verified.name || 'Staff Member',
                    email: verified.email,
                    usn: 'ADMIN',
                    collegeName: 'Staff',
                    phone: '',
                    profileCode: 'ADMIN-' + verified.uid.substring(0, 4).toUpperCase(),
                    hasPaid: true,
                    studentType: 'internal',
                    registeredEvents: [],
                    avatar: '/avatars/solo_male.png'
                };
                await userRef.set({
                    ...userData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else {
                return NextResponse.json({ message: "User not found." }, { status: 404 });
            }
        }

        // --- PAYMENT STATUS SYNC ---
        // Fetch source of truth for payments
        const paymentStatus = await checkUserPaymentStatus(verified.uid);

        // --- ADMIN ROLE HELPERS ---
        if (role) {
            userData.role = role;
            userData.eventId = eventId;
        }

        // ----------------------------------------------

        const registrations = await registrationsCollection.where('members', 'array-contains', verified.uid).get();
        const registeredEvents = registrations.docs.map(doc => ({ id: doc.id, data: doc.data() })).map(reg => ({ id: reg.id, eventId: reg.data.eventId, teamName: reg.data.teamName }));
        userData = {
            ...userData,
            hasPaid: (userData?.hasPaid === true) || paymentStatus.hasPaid,
            hasRoboSoccer: (userData?.hasRoboSoccer === true) || paymentStatus.hasRoboSoccer,
            registeredEvents: registeredEvents
        };

        return NextResponse.json({ user: userData }, {
            status: 200,
            headers: {
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
            }
        });
    } catch (error: any) {
        console.error("Me API Error:", error);

        // Handle Firebase Quota Exceeded specifically
        if (error.code === 8 || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('Quota exceeded')) {
            return NextResponse.json({
                message: "System Overloaded (Quota Exceeded)",
                detail: "The free database limit for today has been reached. Please try again after reset (1:30 PM IST)."
            }, { status: 503 });
        }

        return NextResponse.json({
            message: "Authentication Error",
            detail: error.message
        }, { status: 401 });
    }
}