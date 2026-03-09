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

                const cachedPaidUsers = typeof cached.totalVerifiedPayments === 'number'
                    ? cached.totalVerifiedPayments
                    : (typeof cached.paidUsers === 'number' ? cached.paidUsers : null);

                const cachedPaidParticipants = typeof cached.totalParticipantsPaid === 'number'
                    ? cached.totalParticipantsPaid
                    : (typeof cached.paidParticipants === 'number' ? cached.paidParticipants : null);

                const cachedPaymentLogs = typeof cached.totalPaymentsCount === 'number'
                    ? cached.totalPaymentsCount
                    : null;

                const hasSummary = typeof cached.totalRevenue === 'number'
                    && typeof cachedPaidUsers === 'number'
                    && typeof cachedPaidParticipants === 'number'
                    && typeof cachedPaymentLogs === 'number';

                if (hasSummary && Number.isFinite(updatedAtMs) && (Date.now() - updatedAtMs) < cacheTtlMs) {
                    return NextResponse.json({
                        totalAmount: cached.totalRevenue,
                        totalPayments: cachedPaidUsers,
                        totalParticipantsPaid: cachedPaidParticipants,
                        transactionCount: cachedPaymentLogs,
                        cached: true,
                    });
                }
            }
        }

        // Scope queries based on role
        let payQuery: any = adminDb.collection('payments').where('status', '==', 'captured');
        let regQuery: any = adminDb.collection('registrations');
        let coordinatorLeaderIds: string[] | null = null;

        if (adminRole === 'COORDINATOR' && userEventId && userEventId !== 'all') {
            const coordinatorEventIds = userEventId.split(',').map((id: string) => id.trim());
            if (coordinatorEventIds.length > 1) {
                regQuery = regQuery.where('eventId', 'in', coordinatorEventIds);
            } else {
                regQuery = regQuery.where('eventId', '==', coordinatorEventIds[0]);
            }

            // Payments do not reliably store eventId, so coordinator scoping is derived from event leaders.
            const scopedRegsSnap = await regQuery.select('teamLeader').get();
            coordinatorLeaderIds = Array.from(new Set(
                scopedRegsSnap.docs
                    .map((doc: any) => doc.data()?.teamLeader)
                    .filter(Boolean)
            ));

            if (coordinatorLeaderIds.length === 0) {
                return NextResponse.json({
                    totalAmount: 0,
                    totalPayments: 0,
                    totalParticipantsPaid: 0,
                    transactionCount: 0
                });
            }
        }

        let totalAmountRaw = 0;
        let totalTransactions = 0;
        const uniquePaidUserIds = new Set<string>();

        if (adminRole === 'COORDINATOR' && coordinatorLeaderIds) {
            const leaderIdChunks: string[][] = [];
            for (let i = 0; i < coordinatorLeaderIds.length; i += 30) {
                leaderIdChunks.push(coordinatorLeaderIds.slice(i, i + 30));
            }

            const scopedPaymentSnaps = await Promise.all(
                leaderIdChunks.map((chunk) =>
                    payQuery.where('user_id', 'in', chunk).select('user_id', 'amount').get()
                )
            );

            const dedupedPayments = new Map<string, any>();
            scopedPaymentSnaps.forEach((snap: any) => {
                snap.docs.forEach((doc: any) => {
                    dedupedPayments.set(doc.id, doc.data());
                });
            });

            totalTransactions = dedupedPayments.size;
            dedupedPayments.forEach((payment: any) => {
                totalAmountRaw += (payment.amount || 0);
                if (payment.user_id) uniquePaidUserIds.add(payment.user_id);
            });
        } else {
            // Strategy 3: Aggregation for actual Sum and Transaction Count
            const paymentsSnap = await payQuery.aggregate({
                totalAmount: admin.firestore.AggregateField.sum('amount'),
                count: admin.firestore.AggregateField.count()
            }).get();

            totalAmountRaw = paymentsSnap.data().totalAmount || 0;
            totalTransactions = paymentsSnap.data().count || 0;

            // Also get count of unique paid users from the scoped payments for consistency
            const allCapturedPayments = await payQuery.select('user_id').get();
            allCapturedPayments.docs.forEach((doc: any) => uniquePaidUserIds.add(doc.data().user_id));
        }

        const totalAmountInRupees = totalAmountRaw / 100;

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
