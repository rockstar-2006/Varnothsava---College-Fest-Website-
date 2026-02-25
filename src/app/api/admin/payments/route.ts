import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        if (!role || !['SUPER_ADMIN', 'FINANCE', 'COORDINATOR'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const status = searchParams.get('status');

        let paymentsQuery: any = adminDb.collection('payments');

        // Handle filtering by event via registrations
        let filteredUserIds: string[] | null = null;
        if (role === 'COORDINATOR') {
            // Coordinator can only see users in their events
            const eventsSnapshot = await adminDb.collection('events')
                .where('coordinators', 'array-contains', verified.uid)
                .get();
            const assignedEventIds = eventsSnapshot.docs.map(doc => doc.id);

            if (assignedEventIds.length === 0) {
                return NextResponse.json({ payments: [] });
            }

            let regQuery: any = adminDb.collection('registrations');
            if (eventId) {
                if (!assignedEventIds.includes(eventId)) {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
                regQuery = regQuery.where('eventId', '==', eventId);
            } else {
                regQuery = regQuery.where('eventId', 'in', assignedEventIds);
            }

            const regSnapshot = await regQuery.get();
            filteredUserIds = Array.from(new Set(regSnapshot.docs.flatMap((doc: any) => {
                const data = doc.data();
                return [data.teamLeader, ...(data.members || [])];
            })));

            if (filteredUserIds.length === 0) {
                return NextResponse.json({ payments: [] });
            }
        } else if (eventId && eventId !== 'all') {
            // SUPER_ADMIN or FINANCE filtering by event
            const regSnapshot = await adminDb.collection('registrations')
                .where('eventId', '==', eventId)
                .get();
            filteredUserIds = Array.from(new Set(regSnapshot.docs.flatMap((doc: any) => {
                const data = doc.data();
                return [data.teamLeader, ...(data.members || [])];
            })));

            if (filteredUserIds.length === 0) {
                return NextResponse.json({ payments: [] });
            }
        }

        if (filteredUserIds) {
            if (filteredUserIds.length <= 30) {
                paymentsQuery = paymentsQuery.where('user_id', 'in', filteredUserIds);
            } else {
                const chunks = [];
                for (let i = 0; i < filteredUserIds.length; i += 30) {
                    chunks.push(filteredUserIds.slice(i, i + 30));
                }

                let allDocs: any[] = [];
                for (const chunk of chunks) {
                    const snap = await adminDb.collection('payments').where('user_id', 'in', chunk).get();
                    snap.docs.forEach(d => allDocs.push({ id: d.id, ...d.data() }));
                }

                return await enrichPayments(allDocs);
            }
        }

        if (status && status !== 'all') {
            paymentsQuery = paymentsQuery.where('status', '==', status);
        }

        const snapshot = await paymentsQuery.orderBy('created_at', 'desc').get();
        const payments = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return await enrichPayments(payments);

    } catch (error: any) {
        console.error("Admin Payments GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

async function enrichPayments(payments: any[]) {
    if (payments.length === 0) return NextResponse.json({ payments: [] });

    const userIds = Array.from(new Set(payments.map(p => p.user_id)));
    const usersDataMap: Record<string, any> = {};

    for (let i = 0; i < userIds.length; i += 10) {
        const chunk = userIds.slice(i, i + 10);
        const userSnapshot = await adminDb.collection('users').where('__name__', 'in', chunk).get();
        userSnapshot.docs.forEach(doc => {
            usersDataMap[doc.id] = doc.data();
        });
    }

    const enriched = payments.map(p => {
        const user = usersDataMap[p.user_id] || {};
        return {
            ...p,
            userName: user.name || 'Unknown',
            userEmail: user.email || p.user_email || 'Unknown',
            userPhone: user.phone || 'N/A',
            userCollege: user.collegeName || 'N/A'
        };
    });

    return NextResponse.json({ payments: enriched });
}
