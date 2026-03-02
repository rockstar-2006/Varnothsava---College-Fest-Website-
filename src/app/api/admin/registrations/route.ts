import { adminDb, registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        // Fetch user data for role check
        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        const role = userData?.role;

        if (!role) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const lastId = searchParams.get('lastId') || '';
        const limit = parseInt(searchParams.get('limit') || '20');

        console.log(`[RegAPI] Fetching. Role: ${role}, EventId: ${eventId}, UID: ${verified.uid}`);

        let queryBase: any = registrationsCollection;

        // Apply Coordinator filtering
        if (role === 'COORDINATOR') {
            const eventsSnapshot = await adminDb.collection('events')
                .where('coordinators', 'array-contains', verified.uid)
                .get();
            const assignedEventIds = eventsSnapshot.docs.map(doc => doc.id);

            if (assignedEventIds.length === 0) {
                return NextResponse.json({ registrations: [], totalCount: 0 });
            }

            if (eventId && eventId !== 'all') {
                if (!assignedEventIds.includes(eventId)) {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
                queryBase = queryBase.where('eventId', '==', eventId);
            } else {
                queryBase = queryBase.where('eventId', 'in', assignedEventIds);
            }
        } else if (eventId && eventId !== 'all') {
            // SUPER_ADMIN filtering by event
            queryBase = queryBase.where('eventId', '==', eventId);
        }

        // Strategy 4: Summary Document Fetch for Metadata
        const statsRef = adminDb.collection('system').doc('stats');
        const statsDoc = await statsRef.get();
        const s = statsDoc.data() || {};

        let totalCount = 0;
        if (role === 'SUPER_ADMIN') {
            if (eventId && eventId !== 'all') {
                totalCount = s[`reg_${eventId}_total`] || 0;
            } else {
                totalCount = s.totalRegistrations || 0;
            }
        } else {
            // Coordinator needs accurate real-time count for assigned scope
            const totalCountSnap = await queryBase.count().get();
            totalCount = totalCountSnap.data().count;
        }

        let query = queryBase.orderBy('registeredAt', 'desc').limit(limit);

        if (lastId) {
            const lastDoc = await registrationsCollection.doc(lastId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const registrations = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`[RegAPI] After filtering, found ${registrations.length} records for ${eventId || 'all'}`);

        // Enrich with user data for ONLY the current batch of 20
        const userIds = new Set<string>();
        registrations.forEach((reg: any) => {
            if (reg.members) reg.members.forEach((id: string) => userIds.add(id));
            if (reg.teamLeader) userIds.add(reg.teamLeader);
        });

        const usersDataMap: Record<string, any> = {};
        if (userIds.size > 0) {
            const userIdArray = Array.from(userIds);
            for (let i = 0; i < userIdArray.length; i += 10) {
                const chunk = userIdArray.slice(i, i + 10);
                const userSnapshot = await usersCollection.where('__name__', 'in', chunk).get();
                userSnapshot.docs.forEach(doc => {
                    usersDataMap[doc.id] = doc.data();
                });
            }
        }

        const enrichedRegistrations = registrations.map((reg: any) => {
            const leader = usersDataMap[reg.teamLeader] || {};
            const membersData = (reg.members || []).map((id: string) => usersDataMap[id]).filter(Boolean);

            return {
                ...reg,
                leaderName: leader.name || 'Unknown',
                college: leader.collegeName || 'Unknown',
                paymentStatus: leader.hasPaid ? 'Paid' : 'Unpaid',
                membersDetails: membersData.map((m: any) => ({ name: m.name, usn: m.usn }))
            };
        });

        return NextResponse.json({
            registrations: enrichedRegistrations,
            totalCount,
            internalCount: role === 'SUPER_ADMIN' ? (s.internalRegs || 0) : null,
            externalCount: role === 'SUPER_ADMIN' ? (s.externalRegs || 0) : null,
            lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
            hasMore: snapshot.docs.length === limit
        });
    } catch (error: any) {
        console.error("Admin Registrations GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
