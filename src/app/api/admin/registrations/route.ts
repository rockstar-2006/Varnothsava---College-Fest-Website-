import { adminDb, registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";

interface RegistrationsListResponse {
    registrations: any[];
    totalCount: number | null;
    internalCount: number | null;
    externalCount: number | null;
    totalParticipants: number | null;
    internalParticipants: number | null;
    externalParticipants: number | null;
    lastId: string | null;
    hasMore: boolean;
}

interface RegistrationsResponseCacheEntry {
    expiresAt: number;
    payload: RegistrationsListResponse;
}

const REGISTRATIONS_RESPONSE_CACHE_TTL_MS = Number(process.env.ADMIN_REGISTRATIONS_RESPONSE_CACHE_TTL_MS || '10000');
const registrationsResponseCache = new Map<string, RegistrationsResponseCacheEntry>();

const buildRegistrationsCacheKey = (params: {
    role: string;
    uid: string;
    userEventId: string | null | undefined;
    eventId: string | null;
    search: string;
    studentType: string | null;
    dateFilter: string | null;
    lastId: string;
    limit: number;
    skipCounts: boolean;
}) => {
    return [
        params.role,
        params.uid,
        params.userEventId || 'all',
        params.eventId || 'all',
        params.search.trim().toLowerCase() || '-',
        params.studentType || 'all',
        params.dateFilter || 'all',
        params.lastId || '-',
        String(params.limit),
        params.skipCounts ? 'skip' : 'full',
    ].join('|');
};

const getCachedRegistrationsResponse = (key: string): RegistrationsListResponse | null => {
    const cached = registrationsResponseCache.get(key);
    if (!cached) return null;

    if (cached.expiresAt < Date.now()) {
        registrationsResponseCache.delete(key);
        return null;
    }

    return cached.payload;
};

const setCachedRegistrationsResponse = (key: string, payload: RegistrationsListResponse) => {
    if (registrationsResponseCache.size > 200) {
        const now = Date.now();
        for (const [cacheKey, entry] of registrationsResponseCache.entries()) {
            if (entry.expiresAt < now) registrationsResponseCache.delete(cacheKey);
        }

        if (registrationsResponseCache.size > 200) {
            registrationsResponseCache.clear();
        }
    }

    registrationsResponseCache.set(key, {
        expiresAt: Date.now() + REGISTRATIONS_RESPONSE_CACHE_TTL_MS,
        payload,
    });
};

const resolveParticipantType = (user: Record<string, any> | null | undefined): 'internal' | 'external' => {
    if (!user) return 'external';

    const college = (user.collegeName || user.college || user.institution || '').toUpperCase();
    const email = (user.email || '').toLowerCase();

    const isInternal = user.studentType === 'internal' ||
        college.includes('SMVITM') ||
        college.includes('SODE') ||
        college.includes('SHRI MADHWA VADIRAJA') ||
        college.includes('SHRI MADHWA') ||
        college.includes('VADIRAJA') ||
        email.endsWith('@sode-edu.in');

    return isInternal ? 'internal' : 'external';
};

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
        const hasStudentTypeFilter = studentType === 'internal' || studentType === 'external';
        const dateFilter = searchParams.get('dateFilter');

        const responseCacheKey = (!skipCounts && !lastId)
            ? buildRegistrationsCacheKey({
                role: userRole,
                uid: verified.uid,
                userEventId,
                eventId,
                search,
                studentType,
                dateFilter,
                lastId,
                limit,
                skipCounts,
            })
            : null;

        if (responseCacheKey) {
            const cachedResponse = getCachedRegistrationsResponse(responseCacheKey);
            if (cachedResponse) {
                return NextResponse.json(cachedResponse);
            }
        }

        // Apply Search Filter implicitly via queryBase if simple (like event scope)
        // Global coordinator filters
        let queryBase: any = registrationsCollection;
        let countQuery: any = registrationsCollection;
        let filteredCountQuery: any = registrationsCollection;
        if (userRole === 'COORDINATOR' && userEventId) {
            const coordinatorEventIds = userEventId.split(',').map((id: string) => id.trim());

            if (eventId && eventId !== 'all') {
                if (coordinatorEventIds.includes('all') || coordinatorEventIds.includes(eventId)) {
                    queryBase = queryBase.where('eventId', '==', eventId);
                    countQuery = countQuery.where('eventId', '==', eventId);
                    filteredCountQuery = filteredCountQuery.where('eventId', '==', eventId);
                } else {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
            } else {
                if (!coordinatorEventIds.includes('all')) {
                    if (coordinatorEventIds.length > 1) {
                        queryBase = queryBase.where('eventId', 'in', coordinatorEventIds);
                        countQuery = countQuery.where('eventId', 'in', coordinatorEventIds);
                        filteredCountQuery = filteredCountQuery.where('eventId', 'in', coordinatorEventIds);
                    } else {
                        queryBase = queryBase.where('eventId', '==', coordinatorEventIds[0]);
                        countQuery = countQuery.where('eventId', '==', coordinatorEventIds[0]);
                        filteredCountQuery = filteredCountQuery.where('eventId', '==', coordinatorEventIds[0]);
                    }
                }
            }
        } else if (eventId && eventId !== 'all') {
            queryBase = queryBase.where('eventId', '==', eventId);
            countQuery = countQuery.where('eventId', '==', eventId);
            filteredCountQuery = filteredCountQuery.where('eventId', '==', eventId);
        }

        // Student type filter must be reflected in listing and scoped totals.
        if (hasStudentTypeFilter) {
            queryBase = queryBase.where('leaderType', '==', studentType);
            filteredCountQuery = filteredCountQuery.where('leaderType', '==', studentType);
        }

        if (dateFilter === 'new') {
            queryBase = queryBase.where('registeredAt', '>=', '2026-03-11T00:00:00.000Z');
            countQuery = countQuery.where('registeredAt', '>=', '2026-03-11T00:00:00.000Z');
            filteredCountQuery = filteredCountQuery.where('registeredAt', '>=', '2026-03-11T00:00:00.000Z');
        }

        let totalCount = 0;
        let internalCount = 0;
        let externalCount = 0;
        let totalParticipants = 0;
        let internalParticipants = 0;
        let externalParticipants = 0;

        const addParticipantId = (target: Set<string>, value: unknown) => {
            if (typeof value !== 'string') return;
            const normalized = value.trim();
            if (normalized.length > 0) {
                target.add(normalized);
            }
        };

        const getParticipantTypeCounts = async (participantIds: Set<string>) => {
            if (participantIds.size === 0) {
                return { internal: 0, external: 0 };
            }

            const userMap: Record<string, any> = {};
            const ids = Array.from(participantIds);

            for (let i = 0; i < ids.length; i += 10) {
                const chunk = ids.slice(i, i + 10);
                if (chunk.length === 0) continue;

                const userSnapshot = await usersCollection.where('__name__', 'in', chunk).get();
                userSnapshot.docs.forEach((doc) => {
                    userMap[doc.id] = doc.data();
                });
            }

            let internal = 0;
            let external = 0;

            ids.forEach((id) => {
                const type = resolveParticipantType(userMap[id]);
                if (type === 'internal') internal += 1;
                else external += 1;
            });

            return { internal, external };
        };

        // Zero-Cost Cache Strategy for Dashboard Header Metrics
        let fallbackToDatabaseCount = !skipCounts;
        let cachedEventTitleMap: Record<string, string> = {};

        // Only safely use cache if it's a standard event page load or global view
        if (userRole === 'SUPER_ADMIN' && !search && !hasStudentTypeFilter && (!userEventId || userEventId === 'all' || eventId)) {
            try {
                const statsRef = await adminDb.collection('system').doc('stats').get();
                const globalStats = statsRef.data() || {};
                cachedEventTitleMap = globalStats.eventTitleMap || {};

                if (!eventId || eventId === 'all') {
                    // Global Scope
                    totalCount = globalStats.totalRegistrations || 0;
                    totalParticipants = globalStats.totalParticipants || 0;
                    const cachedInternalParticipants = globalStats.totalInternalParticipants;
                    const cachedExternalParticipants = globalStats.totalExternalParticipants;

                    if (typeof cachedInternalParticipants === 'number' && typeof cachedExternalParticipants === 'number') {
                        internalParticipants = cachedInternalParticipants;
                        externalParticipants = cachedExternalParticipants;
                        fallbackToDatabaseCount = false;
                    }

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
                    if (typeof eventCache.internalParticipants === 'number' && typeof eventCache.externalParticipants === 'number') {
                        internalParticipants = eventCache.internalParticipants;
                        externalParticipants = eventCache.externalParticipants;
                        fallbackToDatabaseCount = false;
                    }
                }
            } catch (e) {
                console.warn("[RegAPI] Failed to parse stats cache, falling back to DB counts");
            }
        }

        // Only explicitly read EVERY registration doc if cache is unavailable or we're doing complex searching
        if (fallbackToDatabaseCount) {
            if (hasStudentTypeFilter) {
                const [totalSnap, participantSnap] = await Promise.all([
                    filteredCountQuery.count().get(),
                    filteredCountQuery.select('teamLeader', 'members').get()
                ]);

                totalCount = totalSnap.data().count;
                internalCount = studentType === 'internal' ? totalCount : 0;
                externalCount = studentType === 'external' ? totalCount : 0;

                const uniqueParticipants = new Set<string>();
                participantSnap.docs.forEach((doc: any) => {
                    const data = doc.data();
                    addParticipantId(uniqueParticipants, data.teamLeader);
                    if (data.members && Array.isArray(data.members)) {
                        data.members.forEach((m: string) => addParticipantId(uniqueParticipants, m));
                    }
                });
                totalParticipants = uniqueParticipants.size;
                const participantTypeCounts = await getParticipantTypeCounts(uniqueParticipants);
                internalParticipants = participantTypeCounts.internal;
                externalParticipants = participantTypeCounts.external;
            } else {
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
                    addParticipantId(uniqueParticipants, data.teamLeader);

                    if (data.members && Array.isArray(data.members)) {
                        data.members.forEach((m: string) => addParticipantId(uniqueParticipants, m));
                    }
                });
                totalParticipants = uniqueParticipants.size;
                const participantTypeCounts = await getParticipantTypeCounts(uniqueParticipants);
                internalParticipants = participantTypeCounts.internal;
                externalParticipants = participantTypeCounts.external;
            }
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
                results.forEach((reg: any) => {
                    addParticipantId(uidsForSearch, reg.teamLeader);
                    if (Array.isArray(reg.members)) {
                        reg.members.forEach((memberId: string) => addParticipantId(uidsForSearch, memberId));
                    }
                });

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
                    const leaderUsnMatch = leader.usn?.toLowerCase().includes(search);
                    const leaderPhoneMatch = leader.phone?.includes(search);

                    const memberMatch = (reg.members || []).some((memberId: string) => {
                        const member = usersDataMapForSearch[memberId] || {};
                        const memberNameMatch = member.name?.toLowerCase().includes(search);
                        const memberEmailMatch = member.email?.toLowerCase().includes(search);
                        const memberUsnMatch = member.usn?.toLowerCase().includes(search);
                        const memberPhoneMatch = member.phone?.includes(search);

                        return memberNameMatch || memberEmailMatch || memberUsnMatch || memberPhoneMatch;
                    });

                    return teamNameMatch || leaderNameMatch || leaderEmailMatch || leaderUsnMatch || leaderPhoneMatch || memberMatch;
                });

                results.sort((a: any, b: any) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));

                totalCount = results.length;
                if (hasStudentTypeFilter) {
                    internalCount = studentType === 'internal' ? totalCount : 0;
                    externalCount = studentType === 'external' ? totalCount : 0;
                } else {
                    internalCount = results.filter((r: any) => r.leaderType === 'internal').length;
                    externalCount = totalCount - internalCount;
                }

                const uniqueP = new Set<string>();
                results.forEach((doc: any) => {
                    addParticipantId(uniqueP, doc.teamLeader);

                    if (doc.members) {
                        doc.members.forEach((m: string) => addParticipantId(uniqueP, m));
                    }
                });
                totalParticipants = uniqueP.size;
                const participantTypeCounts = await getParticipantTypeCounts(uniqueP);
                internalParticipants = participantTypeCounts.internal;
                externalParticipants = participantTypeCounts.external;

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

        // Calculate the correct lastId for pagination
        const lastDocId = snapshot?.docs?.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
        const responseTotalCount = skipCounts ? null : totalCount;
        const responseInternalCount = skipCounts ? null : internalCount;
        const responseExternalCount = skipCounts ? null : externalCount;
        const responseTotalParticipants = skipCounts ? null : totalParticipants;
        const responseInternalParticipants = skipCounts ? null : internalParticipants;
        const responseExternalParticipants = skipCounts ? null : externalParticipants;

        const responsePayload: RegistrationsListResponse = {
            registrations: enrichedRegistrations,
            totalCount: responseTotalCount,
            internalCount: responseInternalCount,
            externalCount: responseExternalCount,
            totalParticipants: responseTotalParticipants,
            internalParticipants: responseInternalParticipants,
            externalParticipants: responseExternalParticipants,
            lastId: lastDocId,
            hasMore: snapshot?.docs?.length === limit
        };

        if (responseCacheKey) {
            setCachedRegistrationsResponse(responseCacheKey, responsePayload);
        }

        return NextResponse.json(responsePayload);
    } catch (error: any) {
        console.error("Admin Registrations GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
