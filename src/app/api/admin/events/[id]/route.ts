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

        // Live calculation for individual event, ignoring stale global cache
        const [totalSnap, internalSnap, partSnap] = await Promise.all([
            adminDb.collection('registrations').where('eventId', '==', id).count().get(),
            adminDb.collection('registrations').where('eventId', '==', id).where('leaderType', '==', 'internal').count().get(),
            adminDb.collection('registrations').where('eventId', '==', id).select('teamLeader', 'members').get()
        ]);

        const total = totalSnap.data().count;
        const internal = internalSnap.data().count;
        const external = total - internal;

        const uniqueP = new Set<string>();
        partSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            if (data.teamLeader) uniqueP.add(data.teamLeader);
            if (data.members && Array.isArray(data.members)) {
                data.members.forEach((m: string) => uniqueP.add(m));
            }
        });

        const participants = uniqueP.size;

        return NextResponse.json({
            event: {
                id,
                ...eventData,
                metrics: {
                    total,
                    internal,
                    external,
                    participants
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
