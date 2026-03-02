import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userDoc = await usersCollection.doc(verified.uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ message: "User profile not found" }, { status: 404 });
        }
        const userData = userDoc.data();
        const role = userData?.role;

        if (!role || !['SUPER_ADMIN', 'COORDINATOR'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const eventRef = adminDb.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        const eventData = eventDoc.data() || {};

        // RBAC Check for Coordinator
        if (role === 'COORDINATOR' && !eventData.coordinators?.includes(verified.uid)) {
            return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
        }

        // Strategy 4: Summary Document Fetch
        const statsRef = adminDb.collection('system').doc('stats');
        const statsDoc = await statsRef.get();
        const s = statsDoc.data() || {};

        let total = s[`reg_${id}_total`];
        let internal = s[`reg_${id}_internal`];
        let external = s[`reg_${id}_external`];

        // Strategy 3: count() for fallback if summary document is out of sync or missing fields
        if (total === undefined) {
            console.log(`[StatsFallback] No metrics found for ${id}, using count()`);
            const totalSnap = await adminDb.collection('registrations')
                .where('eventId', '==', id)
                .count().get();
            total = totalSnap.data().count;

            const internalSnap = await adminDb.collection('registrations')
                .where('eventId', '==', id)
                .where('leaderType', '==', 'internal')
                .count().get();
            internal = internalSnap.data().count;
            external = total - internal;
        }

        return NextResponse.json({
            event: {
                id,
                ...eventData,
                metrics: {
                    total: total || 0,
                    internal: internal || 0,
                    external: external || 0
                }
            }
        });

    } catch (error: any) {
        console.error("Admin Event GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        const role = userData?.role;

        // Only SUPER_ADMIN and COORDINATOR (if assigned) can edit
        if (role !== 'SUPER_ADMIN' && role !== 'COORDINATOR') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const eventRef = adminDb.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        if (role === 'COORDINATOR') {
            const eventData = eventDoc.data();
            if (!eventData?.coordinators?.includes(verified.uid)) {
                return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
            }
        }

        const body = await request.json();
        const { event } = body;

        await eventRef.update({
            ...event,
            updatedAt: new Date()
        });

        return NextResponse.json({ message: "Event updated successfully" });
    } catch (error: any) {
        console.error("Admin Event PATCH Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        if (userData?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden: Only Super Admins can delete events" }, { status: 403 });
        }

        await adminDb.collection('events').doc(id).delete();

        return NextResponse.json({ message: "Event deleted successfully" });
    } catch (error: any) {
        console.error("Admin Event DELETE Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
