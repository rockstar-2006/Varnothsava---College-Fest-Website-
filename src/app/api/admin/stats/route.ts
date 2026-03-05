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

        // Scope queries based on role
        let regQuery: any = adminDb.collection('registrations');
        let payQuery: any = adminDb.collection('payments').where('status', '==', 'captured');

        if (adminRole === 'COORDINATOR' && userEventId && userEventId !== 'all') {
            const coordinatorEventIds = userEventId.split(',').map((id: string) => id.trim());
            if (coordinatorEventIds.length > 1) {
                regQuery = regQuery.where('eventId', 'in', coordinatorEventIds);
                payQuery = payQuery.where('eventId', 'in', coordinatorEventIds);
            } else {
                regQuery = regQuery.where('eventId', '==', coordinatorEventIds[0]);
                payQuery = payQuery.where('eventId', '==', coordinatorEventIds[0]);
            }
        }

        // Strategy: Always calculate live stats for absolute accuracy as requested by user
        const [usersSnap, internalSnap, paidSnap, regSnap, paymentsSnap] = await Promise.all([
            usersCollection.count().get(),
            usersCollection.where('studentType', '==', 'internal').count().get(),
            usersCollection.where('hasPaid', '==', true).count().get(),
            regQuery.count().get(),
            payQuery.aggregate({
                totalAmount: admin.firestore.AggregateField.sum('amount')
            }).get()
        ]);

        const totalRevenue = (paymentsSnap.data().totalAmount || 0) / 100;

        // Calculate Total Headcount (Leader + Members) across scoped registrations
        const allRegs = await regQuery.select('teamLeader', 'members').get();
        let participantHeadcount = 0;
        allRegs.docs.forEach((doc: any) => {
            const data = doc.data();
            if (data.teamLeader) participantHeadcount += 1; // Count leader
            if (data.members && Array.isArray(data.members)) {
                participantHeadcount += data.members.length; // Count all members
            }
        });

        // Calculate Unique Paid Users from payments collection for consistency
        const capturedPayments = await payQuery.select('user_id').get();
        const uniquePaidUsers = new Set<string>();
        capturedPayments.docs.forEach((doc: any) => uniquePaidUsers.add(doc.data().user_id));

        // Calculate Paid Participants Headcount (People covered by successful payments)
        let paidParticipantsHeadcount = 0;
        allRegs.docs.forEach((doc: any) => {
            const data = doc.data();
            if (data.teamLeader && uniquePaidUsers.has(data.teamLeader)) {
                paidParticipantsHeadcount += 1; // Count leader
                if (data.members && Array.isArray(data.members)) {
                    paidParticipantsHeadcount += data.members.length; // Count all members
                }
            }
        });

        const liveStats = {
            totalUsers: usersSnap.data().count,
            internalUsers: internalSnap.data().count,
            externalUsers: usersSnap.data().count - internalSnap.data().count,
            paidUsers: uniquePaidUsers.size,
            unpaidUsers: usersSnap.data().count - uniquePaidUsers.size,
            totalRegistrations: regSnap.data().count,
            totalParticipants: participantHeadcount,
            paidParticipants: paidParticipantsHeadcount, // New field for paid headcount
            totalRevenue: totalRevenue,
            updatedAt: new Date().toISOString()
        };

        // Also update the stats doc for background tasks/performance elsewhere
        await adminDb.collection('system').doc('stats').set(liveStats);

        return NextResponse.json({ stats: liveStats });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
