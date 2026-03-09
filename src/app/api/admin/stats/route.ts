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

        let usersCountSnap = usersCollection.count().get();
        let internalUsersSnap = usersCollection.where('studentType', '==', 'internal').count().get();

        const [usersSnapRef, internalUsersSnapRef, registrationsSnap, eventsSnap, paymentsSnap] = await Promise.all([
            usersCountSnap,
            internalUsersSnap,
            regQuery.get(),
            adminDb.collection('events').get(),
            payQuery.aggregate({
                totalAmount: admin.firestore.AggregateField.sum('amount')
            }).get()
        ]);

        let totalUsers = usersSnapRef.data().count;
        let internalUsersCount = internalUsersSnapRef.data().count;
        let externalUsersCount = totalUsers - internalUsersCount;
        const totalRevenue = (paymentsSnap.data().totalAmount || 0) / 100;

        // Map events by category for category-wise stats
        const eventCategoryMap: Record<string, string> = {};
        eventsSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            eventCategoryMap[doc.id] = (data.type || 'Other').toLowerCase();
        });

        // Initialize advanced stats
        const categoryStats: Record<string, { totalTeams: number, internalTeams: number, externalTeams: number, internal: number, external: number, totalParticipants: number, uniqueInternal?: Set<string>, uniqueExternal?: Set<string> }> = {
            technical: { totalTeams: 0, internalTeams: 0, externalTeams: 0, internal: 0, external: 0, totalParticipants: 0, uniqueInternal: new Set(), uniqueExternal: new Set() },
            cultural: { totalTeams: 0, internalTeams: 0, externalTeams: 0, internal: 0, external: 0, totalParticipants: 0, uniqueInternal: new Set(), uniqueExternal: new Set() },
            other: { totalTeams: 0, internalTeams: 0, externalTeams: 0, internal: 0, external: 0, totalParticipants: 0, uniqueInternal: new Set(), uniqueExternal: new Set() }
        };

        const collegeParticipantMap: Record<string, Set<string>> = {};
        const collegeRegistrationMap: Record<string, number> = {};
        const uniqueExternalParticipants = new Set<string>();
        const uniquePaidUsers = new Set<string>();

        // Fetch users to map UID -> studentType and College for registration processing
        const allUsersSnap = await usersCollection.select('studentType', 'collegeName').get();
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
            if (low.includes('yenepoya') || low.includes('yit') || low.includes('yene')) return "Yenepoya Institute, Mangalore";
            if (low.includes('vivekananda') || low.includes('vcet')) return "VCET, Puttur";
            if (low.includes('mangalore institute') || low.includes('mite')) return "MITE, Moodabidri";
            if (low.includes('jawaharlal nehru') || low.includes('jnnce')) return "JNNCE, Shivamogga";
            if (low.includes('karavali')) return "Karavali, Mangalore";
            if (low.includes('alva')) return "Alva's, Moodubidire";

            // Clean up common suffix clutter for others
            return name.replace(/^(the|a)\s+/i, '')
                .replace(/\(.*\)/, '')
                .replace(/,/g, '')
                .replace(/\.com/i, '')
                .trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        };

        allUsersSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            userTypeMap[doc.id] = {
                type: data.studentType || 'external',
                college: normalizeCollegeName(data.collegeName || 'Unknown')
            };
        });

        // Get captured payments for unique paid users
        const captures = await payQuery.select('user_id').get();
        captures.docs.forEach((doc: any) => uniquePaidUsers.add(doc.data().user_id));

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
            if (reg.leaderType === 'internal') categoryStats[cat].internalTeams += 1;
            else categoryStats[cat].externalTeams += 1;

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
                    uniquePaidParticipants.add(reg.teamLeader);
                }

                // Track unique people per college with normalization
                const normCol = uInfo?.college || 'Unknown';
                if (!collegeParticipantMap[normCol]) collegeParticipantMap[normCol] = new Set();
                collegeParticipantMap[normCol].add(reg.teamLeader);

                // Track registration per college
                collegeRegistrationMap[normCol] = (collegeRegistrationMap[normCol] || 0) + 1;
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
            unpaidUsers: totalUsers - uniquePaidUsers.size,
            totalRegistrations: registrationsSnap.size,
            totalParticipants: uniqueTotalParticipants.size,
            paidParticipants: uniquePaidParticipants.size,
            totalRevenue,
            totalColleges: Object.keys(collegeParticipantMap).filter(c => c !== 'Unknown').length,
            eventMetricsCache: cleanEventMetrics, // Cached individual event stats for O(1) reads
            categoryBreakdown: categoryStats,
            collegeDistribution: Object.entries(collegeParticipantMap)
                .map(([name, set]) => ({
                    name,
                    participants: set.size,
                    registrations: collegeRegistrationMap[name] || 0
                }))
                .sort((a, b) => b.registrations - a.registrations)
                .slice(0, 50),
            updatedAt: new Date().toISOString()
        };

        // Also update the stats doc for background tasks/performance elsewhere
        await adminDb.collection('system').doc('stats').set(liveStats);

        // One-stop shop: If user wants events too, return them in the same payload
        let eventsResult = undefined;
        if (request.nextUrl.searchParams.get('includeEvents') === 'true') {
            eventsResult = eventsSnap.docs.map((doc: any) => {
                const data = doc.data();
                const metrics = cleanEventMetrics[doc.id] || { total: 0, internal: 0, external: 0, participants: 0 };
                return {
                    id: doc.id,
                    ...data,
                    metrics
                };
            });
        }

        return NextResponse.json({
            stats: liveStats,
            events: eventsResult
        });

    } catch (error: any) {
        console.error("Admin Stats GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
