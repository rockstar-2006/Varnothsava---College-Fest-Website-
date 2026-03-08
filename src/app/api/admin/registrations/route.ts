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
        const skipCounts = searchParams.get('skipCounts') === '1';

        // Apply Search Filter implicitly via queryBase if simple (like event scope)
        // Global coordinator filters
        let queryBase: any = registrationsCollection;
        let countQuery: any = registrationsCollection;
        if (userRole === 'COORDINATOR' && userEventId) {
            const coordinatorEventIds = userEventId.split(',').map((id: string) => id.trim());

            if (eventId && eventId !== 'all') {
                if (coordinatorEventIds.includes('all') || coordinatorEventIds.includes(eventId)) {
                    queryBase = queryBase.where('eventId', '==', eventId);
                    countQuery = countQuery.where('eventId', '==', eventId);
                } else {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
            } else {
                if (!coordinatorEventIds.includes('all')) {
                    if (coordinatorEventIds.length > 1) {
                        queryBase = queryBase.where('eventId', 'in', coordinatorEventIds);
                        countQuery = countQuery.where('eventId', 'in', coordinatorEventIds);
                    } else {
                        queryBase = queryBase.where('eventId', '==', coordinatorEventIds[0]);
                        countQuery = countQuery.where('eventId', '==', coordinatorEventIds[0]);
                    }
                }
            }
        } else if (eventId && eventId !== 'all') {
            queryBase = queryBase.where('eventId', '==', eventId);
            countQuery = countQuery.where('eventId', '==', eventId);
        }

        // Apply studentType filter to queryBase for listing, but exclude from primary counts
        if (studentType === 'internal' || studentType === 'external') {
            queryBase = queryBase.where('leaderType', '==', studentType);
        }

        const dateFilter = searchParams.get('dateFilter');
        if (dateFilter === 'new') {
            queryBase = queryBase.where('registeredAt', '>=', '2026-03-11T00:00:00.000Z');
            countQuery = countQuery.where('registeredAt', '>=', '2026-03-11T00:00:00.000Z');
        }

        let totalCount = 0;
        let internalCount = 0;
        let externalCount = 0;
        let totalParticipants = 0;

        // Zero-Cost Cache Strategy for Dashboard Header Metrics
        let fallbackToDatabaseCount = !skipCounts;
        let cachedEventTitleMap: Record<string, string> = {};

        // Only safely use cache if it's a standard event page load or global view
        if (userRole === 'SUPER_ADMIN' && !search && (!userEventId || userEventId === 'all' || eventId)) {
            try {
                const statsRef = await adminDb.collection('system').doc('stats').get();
                const globalStats = statsRef.data() || {};
                cachedEventTitleMap = globalStats.eventTitleMap || {};

                if (!eventId || eventId === 'all') {
                    // Global Scope
                    totalCount = globalStats.totalRegistrations || 0;
                    totalParticipants = globalStats.totalParticipants || 0;
                    fallbackToDatabaseCount = false;

                    // For first-page loads, return accurate team internal/external split.
                    if (!skipCounts) {
                        const [totalSnap, internalSnap] = await Promise.all([
                            countQuery.count().get(),
                            countQuery.where('leaderType', '==', 'internal').count().get()
                        ]);
                        totalCount = totalSnap.data().count;
                        internalCount = internalSnap.data().count;
                        externalCount = totalCount - internalCount;
                    }
                } else if (globalStats.eventMetricsCache && globalStats.eventMetricsCache[eventId]) {
                    // Specific Event Scope found in Cache
                    const eventCache = globalStats.eventMetricsCache[eventId];
                    totalCount = eventCache.total;
                    internalCount = eventCache.internal;
                    externalCount = eventCache.external;
                    totalParticipants = eventCache.participants;
                    fallbackToDatabaseCount = false;
                }
            } catch (e) {
                console.warn("[RegAPI] Failed to parse stats cache, falling back to DB counts");
            }
        }

        // Only explicitly read EVERY registration doc if cache is unavailable or we're doing complex searching
        if (fallbackToDatabaseCount) {
            const [totalSnap, internalSnap, participantSnap] = await Promise.all([
                countQuery.count().get(),
                countQuery.where('leaderType', '==', 'internal').count().get(),
                countQuery.select('teamLeader', 'members').get()
            ]);

            totalCount = totalSnap.data().count;
            internalCount = internalSnap.data().count;
            externalCount = totalCount - internalCount;

            const uniqueParticipants = new Set<string>();
            participantSnap.docs.forEach((doc: any) => {
                const data = doc.data();
                if (data.teamLeader) uniqueParticipants.add(data.teamLeader);
                if (data.members && Array.isArray(data.members)) {
                    data.members.forEach((m: string) => uniqueParticipants.add(m));
                }
            });
            totalParticipants = uniqueParticipants.size;
        }

        let registrations: any[] = [];
        let snapshot: any = null;

        try {
            if (search) {
                const fallbackSnapshot = await queryBase.limit(1000).get();
                let results = fallbackSnapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const uidsForSearch = new Set<string>();
                results.forEach((reg: any) => uidsForSearch.add(reg.teamLeader));

                const usersDataMapForSearch: Record<string, any> = {};
                const uidArray = Array.from(uidsForSearch);
                for (let i = 0; i < uidArray.length; i += 10) {
                    const chunk = uidArray.slice(i, i + 10);
                    const userSnapshot = await usersCollection.where('__name__', 'in', chunk).get();
                    userSnapshot.docs.forEach(doc => { usersDataMapForSearch[doc.id] = doc.data(); });
                }

                results = results.filter((reg: any) => {
                    const teamNameMatch = reg.teamName?.toLowerCase().includes(search);
                    const leader = usersDataMapForSearch[reg.teamLeader] || {};
                    const leaderNameMatch = leader.name?.toLowerCase().includes(search);
                    const leaderEmailMatch = leader.email?.toLowerCase().includes(search);
                    const leaderPhoneMatch = leader.phone?.includes(search);
                    return teamNameMatch || leaderNameMatch || leaderEmailMatch || leaderPhoneMatch;
                });

                results.sort((a: any, b: any) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));

                totalCount = results.length;
                internalCount = results.filter((r: any) => r.leaderType === 'internal').length;
                externalCount = totalCount - internalCount;

                const uniqueP = new Set<string>();
                results.forEach((doc: any) => {
                    if (doc.teamLeader) uniqueP.add(doc.teamLeader);
                    if (doc.members) doc.members.forEach((m: string) => uniqueP.add(m));
                });
                totalParticipants = uniqueP.size;

                let startIndex = 0;
                if (lastId) {
                    const prevIndex = results.findIndex((r: any) => r.id === lastId);
                    if (prevIndex !== -1) startIndex = prevIndex + 1;
                }

                registrations = results.slice(startIndex, startIndex + limit);
                snapshot = { docs: registrations };
            } else {
                let query = queryBase.orderBy('registeredAt', 'desc').limit(limit);
                if (lastId) {
                    const lastDoc = await registrationsCollection.doc(lastId).get();
                    if (lastDoc.exists) query = query.startAfter(lastDoc);
                }
                snapshot = await query.get();
                registrations = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            }
        } catch (error: any) {
            console.warn("[RegAPI] Query error, falling back to in-memory:", error.message);
            const fallbackSnapshot = await queryBase.limit(1000).get();
            let results = fallbackSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            results.sort((a: any, b: any) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));

            let startIndex = 0;
            if (lastId) {
                const prevIndex = results.findIndex((r: any) => r.id === lastId);
                if (prevIndex !== -1) startIndex = prevIndex + 1;
            }
            registrations = results.slice(startIndex, startIndex + limit);
            snapshot = { docs: registrations };
        }

        // Enrichment
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
                    usersDataMap[doc.id] = { id: doc.id, ...doc.data() };
                });
            }
        }

        const eventMap: Record<string, string> = { ...cachedEventTitleMap };
        if (Object.keys(eventMap).length === 0) {
            const eventsSnapshot = await adminDb.collection('events').get();
            eventsSnapshot.docs.forEach(doc => { eventMap[doc.id] = doc.data().title || doc.id; });
        }

        const regCorrectionBatch = adminDb.batch();
        let hasRegCorrections = false;

        const enrichedRegistrations = registrations.map((reg: any) => {
            const leader = usersDataMap[reg.teamLeader] || {};
            const membersData = (reg.members || [])
                .filter((id: any) => String(id) !== String(reg.teamLeader))
                .map((id: any) => usersDataMap[String(id)])
                .filter(Boolean);

            const rawCollege = (leader.collegeName || leader.college || leader.institution || '').toUpperCase();
            const email = (leader.email || '').toLowerCase();
            const isInternal = leader.studentType === 'internal' ||
                rawCollege.includes('SMVITM') ||
                rawCollege.includes('SODE') ||
                rawCollege.includes('SHRI MADHWA VADIRAJA') ||
                rawCollege.includes('SHRI MADHWA') ||
                rawCollege.includes('VADIRAJA') ||
                email.endsWith('@sode-edu.in');

            const correctType = isInternal ? 'internal' : 'external';

            // Database Self-Healing: Correct leaderType in registration if it's wrong
            if (reg.leaderType !== correctType) {
                regCorrectionBatch.update(registrationsCollection.doc(reg.id), { leaderType: correctType });
                hasRegCorrections = true;
            }

            return {
                ...reg,
                leaderName: leader.name || 'Unknown',
                phone: leader.phone || 'N/A',
                college: (isInternal && (rawCollege === '' || rawCollege.includes('OUTSIDE'))) ? 'SMVITM (Bantakal)' : (leader.collegeName || leader.college || leader.institution || 'Unknown'),
                paymentStatus: leader.hasPaid ? 'Paid' : 'Unpaid',
                studentType: correctType,
                eventTitle: eventMap[reg.eventId] || reg.eventId,
                membersDetails: (membersData || []).map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    usn: m.usn,
                    phone: m.phone || 'N/A'
                }))
            };
        });

        if (hasRegCorrections) {
            regCorrectionBatch.commit().catch(e => console.error('[RegAPI] Batch correction failed:', e));
        }

        // IMPORTANT: Recalculate internal/external counts from enriched data for accuracy
        // This ensures displayed counts match what's actually shown (enriched studentType > raw leaderType)
        if (search || (!search && enrichedRegistrations.length < limit)) {
            // Calculate exact unique participants for search/filtering
            const uniqueSearchParticipants = new Set<string>();
            enrichedRegistrations.forEach((r: any) => {
                if (r.teamLeader) uniqueSearchParticipants.add(r.teamLeader);
                if (r.members && Array.isArray(r.members)) {
                    r.members.forEach((m: string) => uniqueSearchParticipants.add(m));
                }
            });
            const searchHeadcount = uniqueSearchParticipants.size;

            if (search) {
                // Determine accurate Internal/External based on team assignments (registrations)
                const liveInternal = enrichedRegistrations.filter((r: any) => r.studentType === 'internal').length;
                const liveExternal = enrichedRegistrations.filter((r: any) => r.studentType === 'external').length;

                // For search, enriched data IS the full result set
                internalCount = liveInternal;
                externalCount = liveExternal;
                totalCount = enrichedRegistrations.length;
                totalParticipants = searchHeadcount;
            }
        }

        // Calculate the correct lastId for pagination
        const lastDocId = snapshot?.docs?.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;

        return NextResponse.json({
            registrations: enrichedRegistrations,
            totalCount,
            internalCount,
            externalCount,
            totalParticipants,
            lastId: lastDocId,
            hasMore: snapshot?.docs?.length === limit
        });
    } catch (error: any) {
        console.error("Admin Registrations GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
