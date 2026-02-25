import { adminDb, usersCollection, registrationsCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        const role = userData?.role;

        if (!role || !['SUPER_ADMIN', 'COORDINATOR', 'FINANCE'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // 1. Total Registrations
        const regSnapshot = await registrationsCollection.count().get();
        const totalRegistrations = regSnapshot.data().count;

        // 2. Total Users
        const usersSnapshot = await usersCollection.count().get();
        const totalUsers = usersSnapshot.data().count;

        // 3. Total Revenue & Verified Payments
        // Assuming payments collection exists based on previous work
        const paymentsSnapshot = await adminDb.collection('payments').get();
        let totalRevenue = 0;
        let verifiedPaymentsCount = 0;

        paymentsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.notes?.verification_status === 'verified' || data.status === 'success') {
                totalRevenue += (data.amount || 0);
                verifiedPaymentsCount++;
            }
        });

        // 4. Active Events
        const eventsSnapshot = await adminDb.collection('events').count().get();
        const activeEventsCount = eventsSnapshot.data().count;

        // 5. Recent Activity (Latest 5 registrations)
        const recentRegsProxy = await registrationsCollection
            .orderBy('registeredAt', 'desc')
            .limit(5)
            .get();

        const recentRegistrations = await Promise.all(recentRegsProxy.docs.map(async (doc) => {
            const data = doc.data();
            const userSub = await usersCollection.doc(data.teamLeader).get();
            const uData = userSub.data();

            // Get event title
            const eventSub = await adminDb.collection('events').doc(data.eventId).get();
            const eData = eventSub.data();

            return {
                id: doc.id,
                userName: uData?.name || 'Unknown',
                userUsn: uData?.usn || 'N/A',
                eventName: eData?.title || data.eventId,
                status: data.status || 'pending',
                amount: eData?.fee || 0 // Assuming fee comes from event data
            };
        }));

        return NextResponse.json({
            stats: {
                totalRegistrations,
                totalUsers,
                totalRevenue,
                verifiedPayments: verifiedPaymentsCount,
                activeEvents: activeEventsCount
            },
            recentRegistrations
        });

    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
