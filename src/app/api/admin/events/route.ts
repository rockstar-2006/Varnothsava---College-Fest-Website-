import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch user data from Firestore to check role
        const userDoc = await usersCollection.doc(verified.uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ message: "User profile not found" }, { status: 404 });
        }
        const userData = userDoc.data();
        const role = userData?.role;

        if (!role) {
            return NextResponse.json({ message: "Forbidden: No administrative access" }, { status: 403 });
        }

        let eventsQuery: any = adminDb.collection('events');

        // RBAC: COORDINATOR only sees assigned events
        if (role === 'COORDINATOR') {
            eventsQuery = eventsQuery.where('coordinators', 'array-contains', verified.uid);
        } else if (role === 'VOLUNTEER') {
            // Volunteers might see assigned events or all? Requirement says "only assigned events" for Coordinator. 
            // Usually, Volunteers also work on specific events.
            eventsQuery = eventsQuery.where('volunteers', 'array-contains', verified.uid);
        }

        const snapshot = await eventsQuery.get();
        console.log(`Fetched ${snapshot.docs.length} events from database`);

        // Strategy 4: Summary Document Fetch
        const statsRef = adminDb.collection('system').doc('stats');
        const statsDoc = await statsRef.get();
        const s = statsDoc.data() || {};

        const events = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            const eventId = doc.id;

            // Get metrics from stats map
            const total = s[`reg_${eventId}_total`] || 0;
            const internal = s[`reg_${eventId}_internal`] || 0;
            const external = s[`reg_${eventId}_external`] || 0;

            return {
                id: eventId,
                ...data,
                metrics: {
                    total,
                    internal,
                    external
                }
            };
        });

        return NextResponse.json({ events });
    } catch (error: any) {
        console.error("Admin Events GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Check for SUPER_ADMIN
        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        if (userData?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden: Only Super Admins can create events" }, { status: 403 });
        }

        const body = await request.json();
        const { event } = body;

        if (!event || !event.title) {
            return NextResponse.json({ message: "Invalid event data" }, { status: 400 });
        }

        const docRef = await adminDb.collection('events').add({
            ...event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({ id: docRef.id, message: "Event created successfully" });
    } catch (error: any) {
        console.error("Admin Events POST Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
