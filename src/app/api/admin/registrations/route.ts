import { adminDb, registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        // Fetch user data for role check
        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        const { role: userRole, eventId: userEventId } = getAdminRole(userData?.email);


        if (!userRole) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const search = (searchParams.get('search') || '').toLowerCase();
        const studentType = searchParams.get('studentType'); // 'internal' or 'external'
        const lastId = searchParams.get('lastId') || '';
        const limit = parseInt(searchParams.get('limit') || '20');

        console.log(`[RegAPI] Fetching. Role: ${userRole}, EventId: ${eventId}, Search: ${search}, Type: ${studentType}`);

        let queryBase: any = registrationsCollection;

        // Apply studentType filter if provided
        if (studentType === 'internal' || studentType === 'external') {
            queryBase = queryBase.where('leaderType', '==', studentType);
        }

        // Apply Search (Global Search)
        if (search) {
            // Find user IDs matching the name/email prefix first
            const userSearchSnapshot = await usersCollection
                .orderBy('name')
                .startAt(search)
                .endAt(search + '\uf8ff')
                .limit(50)
                .get();

            const uids = userSearchSnapshot.docs.map(d => d.id);

            // We'll search for: 
            // 1. Team Name starting with search
            // 2. Team Leader is one of the matched UIDs
            // Note: Multiple OR queries are tricky in Firestore, 
            // but we can prioritize. 
            if (uids.length > 0) {
                // If it's a person search, filter by teamLeader or members
                // Since Firestore doesn't support array-contains for 'in', 
                // we'll focus on teamLeader for now as the primary global search target.
                queryBase = queryBase.where('teamLeader', 'in', uids.slice(0, 30));
            } else {
                // Case-insensitive prefix search for Team Name (assuming stored as such or best effort)
                queryBase = queryBase.orderBy('teamName').startAt(search).endAt(search + '\uf8ff');
            }
        }

        // Apply coordinator filters
        if (userRole === 'COORDINATOR' && userEventId) {
            const coordinatorEventIds = userEventId.split(',').map((id: string) => id.trim());

            if (eventId && eventId !== 'all') {
                // Specific event requested
                if (coordinatorEventIds.includes('all') || coordinatorEventIds.includes(eventId)) {
                    queryBase = queryBase.where('eventId', '==', eventId);
                } else {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
            } else {
                // No specific event requested, filter by assigned events
                if (!coordinatorEventIds.includes('all')) {
                    if (coordinatorEventIds.length > 1) {
                        queryBase = queryBase.where('eventId', 'in', coordinatorEventIds);
                    } else {
                        queryBase = queryBase.where('eventId', '==', coordinatorEventIds[0]);
                    }
                }
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
        if (userRole === 'SUPER_ADMIN') {
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

        let registrations: any[] = [];
        let snapshot: any = null;

        try {
            console.log(`[RegAPI] Executing primary query...`);
            let query = queryBase.orderBy('registeredAt', 'desc');

            if (!search) {
                query = query.limit(limit);
                if (lastId) {
                    const lastDoc = await registrationsCollection.doc(lastId).get();
                    if (lastDoc.exists) {
                        query = query.startAfter(lastDoc);
                    }
                }
            }

            snapshot = await query.get();
            registrations = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error: any) {
            if (error.message?.includes('index') || error.code === 9) {
                console.warn("[RegAPI] Missing index fallback triggered:", error.message);
                // Fallback: Fetch without orderBy and handle in-memory
                // For safety, we'll fetch more than current limit to allow sorting
                const fallbackSnapshot = await queryBase.limit(500).get();
                let results = fallbackSnapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // In-memory sort by registeredAt desc
                results.sort((a: any, b: any) => {
                    const dateA = a.registeredAt || '';
                    const dateB = b.registeredAt || '';
                    return dateB.localeCompare(dateA);
                });

                // Manual pagination for fallback
                let startIndex = 0;
                if (lastId) {
                    const prevIndex = results.findIndex((r: any) => r.id === lastId);
                    if (prevIndex !== -1) startIndex = prevIndex + 1;
                }

                registrations = results.slice(startIndex, startIndex + limit);
                // Mock snapshot-like behavior for hasMore
                snapshot = { docs: registrations };
            } else {
                throw error;
            }
        }

        console.log(`[RegAPI] Result: ${registrations.length} records. Fallback: ${!snapshot.get}`);

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

        // Fetch all events for name mapping
        const eventsSnapshot = await adminDb.collection('events').get();
        const eventMap: Record<string, string> = {};
        eventsSnapshot.docs.forEach(doc => {
            eventMap[doc.id] = doc.data().title || doc.id;
        });

        const enrichedRegistrations = registrations.map((reg: any) => {
            const leader = usersDataMap[reg.teamLeader] || {};
            const membersData = (reg.members || []).map((id: string) => usersDataMap[id]).filter(Boolean);
            const college = (leader.collegeName || leader.college || leader.institution || '').toUpperCase();
            const email = (leader.email || '').toLowerCase();
            const isInternal = leader.studentType === 'internal' ||
                college.includes('SMVITM') ||
                college.includes('SODE') ||
                email.endsWith('@sode-edu.in');

            return {
                ...reg,
                leaderName: leader.name || 'Unknown',
                phone: leader.phone || 'N/A',
                college: leader.collegeName || leader.college || leader.institution || 'Unknown',
                paymentStatus: leader.hasPaid ? 'Paid' : 'Unpaid',
                studentType: isInternal ? 'internal' : 'external',
                eventTitle: eventMap[reg.eventId] || reg.eventId,
                membersDetails: (membersData || []).map((m: any) => ({ name: m.name, usn: m.usn, phone: m.phone || 'N/A' }))
            };
        });

        return NextResponse.json({
            registrations: enrichedRegistrations,
            totalCount,
            internalCount: s.internalRegs || 0,
            externalCount: s.externalRegs || 0,
            lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
            hasMore: snapshot.docs.length === limit
        });
    } catch (error: any) {
        console.error("Admin Registrations GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
