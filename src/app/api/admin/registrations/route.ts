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

        let regQuery: any = registrationsCollection;

        // RBAC: COORDINATOR only sees assigned events
        if (role === 'COORDINATOR') {
            const eventsSnapshot = await adminDb.collection('events')
                .where('coordinators', 'array-contains', verified.uid)
                .get();
            const assignedEventIds = eventsSnapshot.docs.map(doc => doc.id);

            if (assignedEventIds.length === 0) {
                return NextResponse.json({ registrations: [] });
            }

            if (eventId) {
                if (!assignedEventIds.includes(eventId)) {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
                regQuery = regQuery.where('eventId', '==', eventId);
            } else {
                // Firestore 'in' query limit is 10, but usually coordinators aren't in > 10 events.
                // If they are, we'd need to chunk this.
                regQuery = regQuery.where('eventId', 'in', assignedEventIds);
            }
        } else {
            // SUPER_ADMIN or others with access
            if (eventId) {
                regQuery = regQuery.where('eventId', '==', eventId);
            }
        }

        const snapshot = await regQuery.orderBy('registeredAt', 'desc').get();
        const registrations = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        // Enrich with user data
        // We need names and college for participants
        // To be efficient, we'll collect all unique UIDs and fetch them in one batch if possible
        const userIds = new Set<string>();
        registrations.forEach((reg: any) => {
            if (reg.members) reg.members.forEach((id: string) => userIds.add(id));
            if (reg.teamLeader) userIds.add(reg.teamLeader);
        });

        const usersDataMap: Record<string, any> = {};
        if (userIds.size > 0) {
            const userIdArray = Array.from(userIds);
            // Chunk by 30 for Firestore 'where in' (limit is actually 30 in some SDKs, 10 in others)
            // Let's use 10 for safety or just fetch individually if count is small.
            // For a dashboard, individual get() is usually fine if we cache them.
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

        return NextResponse.json({ registrations: enrichedRegistrations });
    } catch (error: any) {
        console.error("Admin Registrations GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
