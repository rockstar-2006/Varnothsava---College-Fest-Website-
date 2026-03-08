import { adminDb, verifyAuthToken, usersCollection } from "@/lib/firebaseAdmin";
import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";

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

        const userDoc = await usersCollection.doc(verified.uid).get();
        const userEmail = userDoc.data()?.email;
        const { role: adminRole, eventId: userEventId } = getAdminRole(userEmail);

        if (!adminRole || !['SUPER_ADMIN', 'FINANCE', 'COORDINATOR'].includes(adminRole)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const forceRefresh = request.nextUrl.searchParams.get('force') === '1';
        const cacheTtlMs = Number(process.env.ADMIN_STATS_CACHE_TTL_MS || '120000');
        const statsRef = adminDb.collection('system').doc('stats');

        // Reuse global cached totals for non-scoped roles to avoid repeated heavy scans.
        if (adminRole !== 'COORDINATOR' && !forceRefresh) {
            const statsDoc = await statsRef.get();
            if (statsDoc.exists) {
                const cached = statsDoc.data() || {};
                const updatedAtMs = typeof cached.updatedAt === 'string'
                    ? Date.parse(cached.updatedAt)
                    : NaN;
                const hasSummary = typeof cached.totalRevenue === 'number'
                    && typeof cached.totalVerifiedPayments === 'number'
                    && typeof cached.totalParticipantsPaid === 'number'
                    && typeof cached.totalPaymentsCount === 'number';

                if (hasSummary && Number.isFinite(updatedAtMs) && (Date.now() - updatedAtMs) < cacheTtlMs) {
                    return NextResponse.json({
                        totalAmount: cached.totalRevenue,
                        totalPayments: cached.totalVerifiedPayments,
                        totalParticipantsPaid: cached.totalParticipantsPaid,
                        transactionCount: cached.totalPaymentsCount,
                        cached: true,
                    });
                }
            }
        }

        // Scope queries based on role
        let payQuery: any = adminDb.collection('payments').where('status', '==', 'captured');
        let regQuery: any = adminDb.collection('registrations');

        if (adminRole === 'COORDINATOR' && userEventId && userEventId !== 'all') {
            const coordinatorEventIds = userEventId.split(',').map((id: string) => id.trim());
            if (coordinatorEventIds.length > 1) {
                payQuery = payQuery.where('eventId', 'in', coordinatorEventIds);
                regQuery = regQuery.where('eventId', 'in', coordinatorEventIds);
            } else {
                payQuery = payQuery.where('eventId', '==', coordinatorEventIds[0]);
                regQuery = regQuery.where('eventId', '==', coordinatorEventIds[0]);
            }
        }

        // Strategy 3: Aggregation for actual Sum and Transaction Count
        const paymentsSnap = await payQuery.aggregate({
            totalAmount: admin.firestore.AggregateField.sum('amount'),
            count: admin.firestore.AggregateField.count()
        })
            .get();

        const totalAmountRaw = paymentsSnap.data().totalAmount || 0;
        const totalTransactions = paymentsSnap.data().count || 0;
        const totalAmountInRupees = totalAmountRaw / 100;

        // Also get count of unique paid users from the scoped payments for consistency
        const allCapturedPayments = await payQuery.select('user_id').get();

        const uniquePaidUserIds = new Set<string>();
        allCapturedPayments.docs.forEach((doc: any) => uniquePaidUserIds.add(doc.data().user_id));
        const totalPaidPeople = uniquePaidUserIds.size;

        // Calculate unique Headcount for Paid People (Unique leaders and members in paid teams) in scoped regs
        const allRegs = await regQuery.select('teamLeader', 'members').get();
        const uniquePaidParticipants = new Set<string>();
        allRegs.docs.forEach((doc: any) => {
            const data = doc.data();
            if (data.teamLeader && uniquePaidUserIds.has(data.teamLeader)) {
                uniquePaidParticipants.add(data.teamLeader);
                if (data.members && Array.isArray(data.members)) {
                    data.members.forEach((m: string) => uniquePaidParticipants.add(m));
                }
            }
        });
        const participantPaidHeadcount = uniquePaidParticipants.size;

        // Only sync to global stats doc if it's a full summary (SUPER_ADMIN or FINANCE)
        if (adminRole === 'SUPER_ADMIN' || adminRole === 'FINANCE') {
            await statsRef.set({
                totalRevenue: totalAmountInRupees,
                paidUsers: totalPaidPeople,
                totalVerifiedPayments: totalPaidPeople,
                totalParticipantsPaid: participantPaidHeadcount,
                totalPaymentsCount: totalTransactions,
                updatedAt: new Date().toISOString(),
                lastTotalSync: new Date().toISOString()
            }, { merge: true });
        }

        return NextResponse.json({
            totalAmount: totalAmountInRupees,
            totalPayments: totalPaidPeople, // Unique buyers (for matching logs)
            totalParticipantsPaid: participantPaidHeadcount, // Absolute people count
            transactionCount: totalTransactions // Total records (for subtitle)
        });

    } catch (error: any) {
        console.error("Admin Payments Total GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
