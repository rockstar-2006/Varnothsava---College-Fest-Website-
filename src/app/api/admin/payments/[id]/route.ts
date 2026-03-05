import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        if (!role || !['SUPER_ADMIN', 'FINANCE'].includes(role)) {
            return NextResponse.json({ message: "Forbidden: Only Finance or Super Admin can verify payments" }, { status: 403 });
        }

        const body = await request.json();
        const { verificationStatus } = body;

        const paymentRef = adminDb.collection('payments').doc(id);
        const paymentDoc = await paymentRef.get();

        if (!paymentDoc.exists) {
            return NextResponse.json({ message: "Payment record not found" }, { status: 404 });
        }

        const paymentData = paymentDoc.data();

        await paymentRef.update({
            'notes.verification_status': verificationStatus,
            updated_at: new Date().toISOString()
        });

        if (verificationStatus === 'rejected') {
            await adminDb.collection('users').doc(paymentData?.user_id).update({
                hasPaid: false
            });
        } else if (verificationStatus === 'verified') {
            await adminDb.collection('users').doc(paymentData?.user_id).update({
                hasPaid: true
            });
        }

        return NextResponse.json({ message: `Payment marked as ${verificationStatus}` });
    } catch (error: any) {
        console.error("Admin Payment PATCH Error:", error);
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
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);

        if (!verified) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userDoc = await usersCollection.doc(verified.uid).get();
        const isAdmin = userDoc.data()?.role === 'SUPER_ADMIN';

        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden: Only Super Admin can delete records" }, { status: 403 });
        }

        const paymentRef = adminDb.collection('payments').doc(id);
        const paymentDoc = await paymentRef.get();

        if (paymentDoc.exists) {
            const userId = paymentDoc.data()?.user_id;
            if (userId) {
                // When deleting a payment, we should reset the user's paid status
                await usersCollection.doc(userId).update({ hasPaid: false });
            }
            await paymentRef.delete();
        }

        return NextResponse.json({ message: "Payment record deleted" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
