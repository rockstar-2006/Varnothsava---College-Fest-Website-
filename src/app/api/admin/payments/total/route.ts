import { adminDb, verifyAuthToken } from "@/lib/firebaseAdmin";
import * as admin from 'firebase-admin';
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

        const userDoc = await adminDb.collection('users').doc(verified.uid).get();
        const role = userDoc.data()?.role;

        if (!role || !['SUPER_ADMIN', 'FINANCE'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Strategy 3: Aggregation for actual Sum and Transaction Count
        const paymentsSnap = await adminDb.collection('payments')
            .where('status', '==', 'captured')
            .aggregate({
                totalAmount: admin.firestore.AggregateField.sum('amount'),
                count: admin.firestore.AggregateField.count()
            })
            .get();

        const totalAmountRaw = paymentsSnap.data().totalAmount || 0;
        const totalTransactions = paymentsSnap.data().count || 0;
        const totalAmountInRupees = totalAmountRaw / 100;

        // Also get count of unique paid users for the "People Paid" metric
        const paidUsersSnap = await adminDb.collection('users')
            .where('hasPaid', '==', true)
            .count().get();
        const totalPaidPeople = paidUsersSnap.data().count;

        // Strategy 4: Atomic Sync with Stats Document
        const statsRef = adminDb.collection('system').doc('stats');
        await statsRef.set({
            totalRevenue: totalAmountInRupees,
            paidUsers: totalPaidPeople,
            totalVerifiedPayments: totalPaidPeople, // Unique participants
            totalPaymentsCount: totalTransactions,   // Transaction records
            lastTotalSync: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({
            totalAmount: totalAmountInRupees,
            totalPayments: totalPaidPeople, // Unique participants (for metric box)
            transactionCount: totalTransactions // Total records (for subtitle)
        });

    } catch (error: any) {
        console.error("Admin Payments Total GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
