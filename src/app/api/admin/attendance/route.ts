import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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
        const userData = userDoc.data();
        const { role: userRole, eventId: userEventId } = getAdminRole(userData?.email);


        if (!userRole || !['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER'].includes(userRole)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json({ message: "Event ID required" }, { status: 400 });
        }

        // RBAC Check
        if (userRole !== 'SUPER_ADMIN') {
            const coordinatorEventIds = (userEventId || '').split(',').map((id: string) => id.trim());
            const isAssigned = coordinatorEventIds.includes('all') || coordinatorEventIds.includes(eventId);
            if (!isAssigned) {
                return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
            }
        }

        // Fetch attendees for this event
        const regSnapshot = await adminDb.collection('registrations')
            .where('eventId', '==', eventId)
            .get();

        const attendees: any[] = [];
        const userIds = new Set<string>();

        regSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'approved') {
                attendees.push({
                    id: doc.id,
                    teamName: data.teamName,
                    teamLeader: data.teamLeader,
                    members: data.members || [],
                    attendance: data.attendance || {} // { userId: boolean }
                });
                userIds.add(data.teamLeader);
                (data.members || []).forEach((mId: string) => userIds.add(mId));
            }
        });

        // Enrich with user names
        const usersDataMap: Record<string, any> = {};
        if (userIds.size > 0) {
            const userIdArray = Array.from(userIds);
            for (let i = 0; i < userIdArray.length; i += 10) {
                const chunk = userIdArray.slice(i, i + 10);
                const userSnapshot = await usersCollection.where('__name__', 'in', chunk).get();
                userSnapshot.docs.forEach(d => usersDataMap[d.id] = d.data());
            }
        }

        const enrichedAttendees = attendees.map(a => ({
            ...a,
            leaderName: usersDataMap[a.teamLeader]?.name || 'Unknown',
            membersDetails: a.members.map((mId: string) => ({
                id: mId,
                name: usersDataMap[mId]?.name || 'Unknown',
                usn: usersDataMap[mId]?.usn || 'N/A'
            }))
        }));

        return NextResponse.json({ attendees: enrichedAttendees });

    } catch (error: any) {
        console.error("Attendance GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        const { role: userRole, eventId: userEventId } = getAdminRole(userData?.email);


        if (!userRole || !['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER'].includes(userRole)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { regId, userId, present } = await request.json();

        const regRef = adminDb.collection('registrations').doc(regId);
        const regDoc = await regRef.get();
        if (!regDoc.exists) return NextResponse.json({ message: "Registration not found" }, { status: 404 });

        const regData = regDoc.data();

        // RBAC Check for the event
        if (userRole !== 'SUPER_ADMIN') {
            const coordinatorEventIds = (userEventId || '').split(',').map((id: string) => id.trim());
            const isAssigned = coordinatorEventIds.includes('all') || coordinatorEventIds.includes(regData?.eventId);
            if (!isAssigned) {
                return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
            }
        }

        await regRef.update({
            [`attendance.${userId}`]: present,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ message: "Attendance updated" });

    } catch (error: any) {
        console.error("Attendance PATCH Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
