import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;
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
