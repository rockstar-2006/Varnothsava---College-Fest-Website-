import { adminDb, registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

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

        if (!role || !['SUPER_ADMIN', 'COORDINATOR'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const regRef = registrationsCollection.doc(id);
        const regDoc = await regRef.get();

        if (!regDoc.exists) {
            return NextResponse.json({ message: "Registration not found" }, { status: 404 });
        }

        if (role === 'COORDINATOR') {
            const regData = regDoc.data();
            const eventSnapshot = await adminDb.collection('events').doc(regData?.eventId).get();
            const eventData = eventSnapshot.data();
            if (!eventData?.coordinators?.includes(verified.uid)) {
                return NextResponse.json({ message: "Forbidden: Not authorized for this event" }, { status: 403 });
            }
        }

        const body = await request.json();
        const { status } = body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        await regRef.update({
            status,
            updatedAt: new Date().toISOString()
        });

        // Optional: Send notification/email to user about status change
        // ... (implementation if needed)

        return NextResponse.json({ message: `Registration ${status} successfully` });
    } catch (error: any) {
        console.error("Admin Registration PATCH Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
