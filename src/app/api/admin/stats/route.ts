import { adminDb, verifyAuthToken, usersCollection } from "@/lib/firebaseAdmin";
import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";

export async function GET(request: NextRequest) {
    try {
        const STATS_SCHEMA_VERSION = 2;
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

        const forceRefresh = request.nextUrl.searchParams.get('force') === '1'
            || request.nextUrl.searchParams.get('refresh') === '1';
        const cacheTtlMs = Number(process.env.ADMIN_STATS_CACHE_TTL_MS || '120000');
        const statsRef = adminDb.collection('system').doc('stats');

        // Serve cached global stats when possible to avoid expensive full-scan recalculation.
        if (adminRole !== 'COORDINATOR' && !forceRefresh) {
            const cachedDoc = await statsRef.get();
            if (cachedDoc.exists) {
                const cachedStats = cachedDoc.data() || {};
                const updatedAtMs = typeof cachedStats.updatedAt === 'string'
                    ? Date.parse(cachedStats.updatedAt)
                    : NaN;
                const cachedSchemaVersion = typeof cachedStats.schemaVersion === 'number'
                    ? cachedStats.schemaVersion
                    : 1;

                if (
                    cachedSchemaVersion === STATS_SCHEMA_VERSION
                    && Number.isFinite(updatedAtMs)
                    && (Date.now() - updatedAtMs) < cacheTtlMs
                ) {
                    return NextResponse.json({ stats: cachedStats, cached: true });
                }
            }
        }

        // Scope queries based on role
        let regQuery: any = adminDb.collection('registrations');
        let payQuery: any = adminDb.collection('payments').where('status', '==', 'captured');

        if (adminRole === 'COORDINATOR' && userEventId && userEventId !== 'all') {
            const coordinatorEventIds = userEventId.split(',').map((id: string) => id.trim());
            if (coordinatorEventIds.length > 1) {
                regQuery = regQuery.where('eventId', 'in', coordinatorEventIds);
            } else {
                regQuery = regQuery.where('eventId', '==', coordinatorEventIds[0]);
            }
        }

        let usersCountSnap = usersCollection.count().get();
        let internalUsersSnap = usersCollection.where('studentType', '==', 'internal').count().get();

        const [usersSnapRef, internalUsersSnapRef, registrationsSnap, eventsSnap, paymentsSnap] = await Promise.all([
            usersCountSnap,
            internalUsersSnap,
            regQuery.get(),
            adminDb.collection('events').get(),
            payQuery.aggregate({
                totalAmount: admin.firestore.AggregateField.sum('amount'),
                count: admin.firestore.AggregateField.count()
            }).get()
        ]);

        let totalUsers = usersSnapRef.data().count;
        let internalUsersCount = internalUsersSnapRef.data().count;
        let externalUsersCount = totalUsers - internalUsersCount;
        let totalRevenue = (paymentsSnap.data().totalAmount || 0) / 100;
        let totalPaymentsCount = paymentsSnap.data().count || 0;

        // Map events by category for category-wise stats
        const eventCategoryMap: Record<string, string> = {};
        const eventTitleMap: Record<string, string> = {};
        eventsSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            eventCategoryMap[doc.id] = (data.type || 'Other').toLowerCase();
            eventTitleMap[doc.id] = data.title || doc.id;
        });

        // Initialize advanced stats
        const categoryStats: Record<string, { totalTeams: number, internal: number, external: number, totalParticipants: number, uniqueInternal?: Set<string>, uniqueExternal?: Set<string> }> = {
            technical: { totalTeams: 0, internal: 0, external: 0, totalParticipants: 0, uniqueInternal: new Set(), uniqueExternal: new Set() },
            cultural: { totalTeams: 0, internal: 0, external: 0, totalParticipants: 0, uniqueInternal: new Set(), uniqueExternal: new Set() },
            other: { totalTeams: 0, internal: 0, external: 0, totalParticipants: 0, uniqueInternal: new Set(), uniqueExternal: new Set() }
        };

        const collegeParticipantMap: Record<string, Set<string>> = {};
        const uniqueExternalParticipants = new Set<string>();
        const uniquePaidUsers = new Set<string>();

        // Fetch users to map UID -> studentType and college for registration processing.
        // Include all known college field variants to avoid over-grouping into Unknown.
        const allUsersSnap = await usersCollection
            .select('studentType', 'collegeName', 'college', 'institution', 'email')
            .get();
        const userTypeMap: Record<string, { type: string, college: string }> = {};

        const normalizeCollegeName = (name: string): string => {
            const low = name.toLowerCase().trim();
            if (low.includes('madhwa vadiraja') || low.includes('smvitm') || low.includes('bantakal'))
                return "SMVITM, Bantakal";
            if (low.includes('dharmasthala') || low.includes('sdm')) {
                if (low.includes('ujire')) return "SDM, Ujire";
                if (low.includes('dharwad')) return "SDM, Dharwad";
                if (low.includes('mangalore')) return "SDM, Mangalore";
                return "SDM Group of Institutions";
            }
            if (low.includes('nitte') || low.includes('nmamit')) return "NMAMIT, Nitte";
            if (low.includes('moodlakatte') || low.includes('mitk')) return "MIT, Moodlakatte";
            if (low.includes('manipal tech') || (low.includes('mit') && low.includes('manipal'))) return "MIT, Manipal";
            if (low.includes('st joseph') || low.includes('sjec')) return "SJEC, Mangalore";
            if (low.includes('srinivas') || low.includes('sit')) return "Srinivas Group, Mangalore";
            if (low.includes('canara')) return "Canara Engineering College";
            if (low.includes('sahyadri')) return "Sahyadri, Mangalore";
            if (low.includes('bearys') || low.includes('bit')) return "BIT, Mangalore";
            if (low.includes('yenepoya') || low.includes('yit')) return "YIT, Moodabidri";
            if (low.includes('vivekananda') || low.includes('vcet')) return "VCET, Puttur";

            // Clean up common suffix clutter for others
            return name.replace(/^(the|a)\s+/i, '')
                .replace(/\(.*\)/, '')
                .replace(/,/g, '')
                .trim();
        };

        const resolveStudentType = (data: any): 'internal' | 'external' => {
            const explicitType = typeof data.studentType === 'string' ? data.studentType.toLowerCase() : '';
            if (explicitType === 'internal' || explicitType === 'external') {
                return explicitType;
            }

            const college = `${data.collegeName || data.college || data.institution || ''}`.toUpperCase();
            const email = `${data.email || ''}`.toLowerCase();

            const isInternal =
                college.includes('SMVITM') ||
                college.includes('SODE') ||
                college.includes('SHRI MADHWA VADIRAJA') ||
                college.includes('SHRI MADHWA') ||
                college.includes('VADIRAJA') ||
                email.endsWith('@sode-edu.in');

            return isInternal ? 'internal' : 'external';
        };

        allUsersSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            userTypeMap[doc.id] = {
                type: resolveStudentType(data),
                college: normalizeCollegeName(data.collegeName || data.college || data.institution || 'Unknown')
            };
        });

        // Get captured payments for unique paid users. Coordinator scope is derived via team leaders.
        let captureRows: Array<{ user_id?: string; amount?: number }> = [];

        if (adminRole === 'COORDINATOR') {
            const scopedLeaderIdSet = new Set<string>();
            registrationsSnap.docs.forEach((doc: any) => {
                const leaderId = doc.data()?.teamLeader;
                if (typeof leaderId === 'string' && leaderId.length > 0) {
                    scopedLeaderIdSet.add(leaderId);
                }
            });

            const scopedLeaderIds = Array.from(scopedLeaderIdSet);

            if (scopedLeaderIds.length === 0) {
                totalRevenue = 0;
                totalPaymentsCount = 0;
            } else {
                const leaderIdChunks: string[][] = [];
                for (let i = 0; i < scopedLeaderIds.length; i += 30) {
                    leaderIdChunks.push(scopedLeaderIds.slice(i, i + 30));
                }

                const scopedPaymentSnaps = await Promise.all(
                    leaderIdChunks.map((chunk) =>
                        payQuery.where('user_id', 'in', chunk).select('user_id', 'amount').get()
                    )
                );

                const dedupedPayments = new Map<string, { user_id?: string; amount?: number }>();
                scopedPaymentSnaps.forEach((snap: any) => {
                    snap.docs.forEach((doc: any) => {
                        dedupedPayments.set(doc.id, doc.data());
                    });
                });

                captureRows = Array.from(dedupedPayments.values());
                totalPaymentsCount = dedupedPayments.size;
                totalRevenue = captureRows.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
            }
        } else {
            const captures = await payQuery.select('user_id').get();
            captureRows = captures.docs.map((doc: any) => doc.data());
        }

        captureRows.forEach((row) => {
            if (row.user_id) uniquePaidUsers.add(row.user_id);
        });

        let totalHeadcount = 0;
        let paidParticipantsHeadcount = 0;
        const uniquePaidParticipants = new Set<string>();

        // Caching for Event Dashboard
        const eventSpecificMetrics: Record<string, { total: number, internal: number, external: number, uniqueP: Set<string> }> = {};

        registrationsSnap.docs.forEach((doc: any) => {
            const reg = doc.data();
            const eId = reg.eventId;
            const category = (eventCategoryMap[reg.eventId] || 'other').toLowerCase();
            const cat = categoryStats[category] ? category : 'other';

            categoryStats[cat].totalTeams += 1;

            // Ensure event cache exists
            if (eId && !eventSpecificMetrics[eId]) {
                eventSpecificMetrics[eId] = { total: 0, internal: 0, external: 0, uniqueP: new Set() };
            }
            if (eId) {
                eventSpecificMetrics[eId].total += 1;
                if (reg.leaderType === 'internal') eventSpecificMetrics[eId].internal += 1;
                else eventSpecificMetrics[eId].external += 1;
            }

            // Process Leader
            if (reg.teamLeader) {
                if (eId) eventSpecificMetrics[eId].uniqueP.add(reg.teamLeader);

                totalHeadcount += 1;
                const uInfo = userTypeMap[reg.teamLeader];
                const isInternal = uInfo?.type === 'internal';
                const isPaid = uniquePaidUsers.has(reg.teamLeader);

                if (isInternal) categoryStats[cat].uniqueInternal?.add(reg.teamLeader);
                else {
                    categoryStats[cat].uniqueExternal?.add(reg.teamLeader);
                    uniqueExternalParticipants.add(reg.teamLeader);
                }

                if (isPaid) {
                    paidParticipantsHeadcount += 1;
                    uniquePaidParticipants.add(reg.teamLeader);
                }

                // Track unique people per college with normalization
                const normCol = uInfo?.college || 'Unknown';
                if (!collegeParticipantMap[normCol]) collegeParticipantMap[normCol] = new Set();
                collegeParticipantMap[normCol].add(reg.teamLeader);
            }

            // Process Members
            if (reg.members && Array.isArray(reg.members)) {
                reg.members.forEach((mId: string) => {
                    if (eId) eventSpecificMetrics[eId].uniqueP.add(mId);

                    totalHeadcount += 1;
                    const mInfo = userTypeMap[mId];
                    const isInternal = mInfo?.type === 'internal';
                    const isPaid = uniquePaidUsers.has(reg.teamLeader); // If leader paid, whole team is paid

                    if (isInternal) categoryStats[cat].uniqueInternal?.add(mId);
                    else {
                        categoryStats[cat].uniqueExternal?.add(mId);
                        uniqueExternalParticipants.add(mId);
                    }

                    if (isPaid) {
                        paidParticipantsHeadcount += 1;
                        uniquePaidParticipants.add(mId);
                    }

                    // Track unique people per col with normalization
                    const normCol = mInfo?.college || 'Unknown';
                    if (!collegeParticipantMap[normCol]) collegeParticipantMap[normCol] = new Set();
                    collegeParticipantMap[normCol].add(mId);
                });
            }

        });

        // Compute exactly how many unique participants are in each category
        Object.keys(categoryStats).forEach(cat => {
            const stats = categoryStats[cat];
            stats.internal = stats.uniqueInternal?.size || 0;
            stats.external = stats.uniqueExternal?.size || 0;
            stats.totalParticipants = stats.internal + stats.external;

            // Clean up before JSON response
            delete stats.uniqueInternal;
            delete stats.uniqueExternal;
        });

        // Unique Total Participants (Deduplicated across all events)
        const uniqueTotalParticipants = new Set<string>();
        registrationsSnap.docs.forEach((doc: any) => {
            const reg = doc.data();
            if (reg.teamLeader) uniqueTotalParticipants.add(reg.teamLeader);
            reg.members?.forEach((m: string) => uniqueTotalParticipants.add(m));
        });

        // Recalculate accurately scoped User counts if Coordinator
        if (adminRole === 'COORDINATOR') {
            totalUsers = uniqueTotalParticipants.size;
            let internalRecalculated = 0;
            uniqueTotalParticipants.forEach(uid => {
                if (userTypeMap[uid]?.type === 'internal') internalRecalculated++;
            });
            internalUsersCount = internalRecalculated;
            externalUsersCount = totalUsers - internalUsersCount;
        }

        const cleanEventMetrics: Record<string, any> = {};
        Object.keys(eventSpecificMetrics).forEach(id => {
            cleanEventMetrics[id] = {
                total: eventSpecificMetrics[id].total,
                internal: eventSpecificMetrics[id].internal,
                external: eventSpecificMetrics[id].external,
                participants: eventSpecificMetrics[id].uniqueP.size
            };
        });

        const liveStats = {
            totalUsers,
            internalUsers: internalUsersCount,
            externalUsers: externalUsersCount,
            uniqueExternalParticipantsAcrossEvents: uniqueExternalParticipants.size,
            uniqueTotalParticipantsAcrossEvents: uniqueTotalParticipants.size,
            paidUsers: uniquePaidUsers.size,
            totalVerifiedPayments: uniquePaidUsers.size,
            unpaidUsers: totalUsers - uniquePaidUsers.size,
            totalRegistrations: registrationsSnap.size,
            totalParticipants: uniqueTotalParticipants.size, // Changed to unique individuals across all events
            paidParticipants: uniquePaidParticipants.size, // Unique paid headcount
            totalParticipantsPaid: uniquePaidParticipants.size,
            totalRevenue,
            totalPaymentsCount,
            eventMetricsCache: cleanEventMetrics, // Cached individual event stats for O(1) reads
            eventTitleMap,
            categoryBreakdown: categoryStats,
            collegeDistribution: Object.entries(collegeParticipantMap)
                .map(([name, set]) => ({ name, count: set.size }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
            schemaVersion: STATS_SCHEMA_VERSION,
            updatedAt: new Date().toISOString()
        };

        // Persist only global stats. Coordinator-scoped stats must never overwrite shared cache.
        if (adminRole !== 'COORDINATOR') {
            await statsRef.set(liveStats, { merge: true });
        }

        return NextResponse.json({ stats: liveStats });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
