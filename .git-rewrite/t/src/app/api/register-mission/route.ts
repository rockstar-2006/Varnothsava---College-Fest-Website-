import { usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request);
        const rateLimitResult = await checkApiRateLimit(clientId);
        if (!rateLimitResult.success) {
            return NextResponse.json({ message: "Too many requests" }, { status: 429 });
        }

        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized: Missing token." }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized: Invalid token." }, { status: 401 });
        }

        const { eventId, teamName, members } = await request.json();

        if (!eventId || !teamName) {
            return NextResponse.json({ message: "Missing registration details." }, { status: 400 });
        }

        if (!usersCollection) {
            return NextResponse.json({ message: "Database Error." }, { status: 500 });
        }

        const userRef = usersCollection.doc(verified.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ message: "User profile not found." }, { status: 404 });
        }

        const userData = userDoc.data();
        const existingEvents = userData?.registeredEvents || [];

        // Check if already registered
        if (existingEvents.some((e: any) => e.id === eventId)) {
            return NextResponse.json({ message: "Already registered for this mission." }, { status: 400 });
        }

        // Add to array
        const updatedEvents = [...existingEvents, { id: eventId, teamName, members: members || [userData?.profileCode] }];

        await userRef.update({
            registeredEvents: updatedEvents,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            message: "Mission registration successful.",
            registeredEvents: updatedEvents
        }, { status: 200 });

    } catch (error: any) {
        console.error("Mission Registration Error:", error);
        return NextResponse.json({
            message: "Registration failed",
            detail: error.message
        }, { status: 500 });
    }
}
