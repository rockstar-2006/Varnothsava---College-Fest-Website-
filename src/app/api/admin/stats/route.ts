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

        // Strategy: Always calculate live stats for absolute accuracy as requested by user
        const [usersSnap, internalUsersSnap, registrationsSnap, eventsSnap, paymentsSnap] = await Promise.all([
            usersCollection.count().get(),
            usersCollection.where('studentType', '==', 'internal').count().get(),
            regQuery.get(),
            adminDb.collection('events').get(),
            payQuery.aggregate({
                totalAmount: admin.firestore.AggregateField.sum('amount')
            }).get()
        ]);

        const totalUsers = usersSnap.data().count;
        const internalUsersCount = internalUsersSnap.data().count;
        const externalUsersCount = totalUsers - internalUsersCount;
        const totalRevenue = (paymentsSnap.data().totalAmount || 0) / 100;

        // Map events by category for category-wise stats
        const eventCategoryMap: Record<string, string> = {};
        eventsSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            eventCategoryMap[doc.id] = (data.type || 'Other').toLowerCase();
        });

        // Initialize advanced stats
        const categoryStats: Record<string, { totalTeams: number, internal: number, external: number, totalParticipants: number }> = {
            technical: { totalTeams: 0, internal: 0, external: 0, totalParticipants: 0 },
            cultural: { totalTeams: 0, internal: 0, external: 0, totalParticipants: 0 },
            other: { totalTeams: 0, internal: 0, external: 0, totalParticipants: 0 }
        };

        const collegeParticipantMap: Record<string, Set<string>> = {};
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
            if (low.includes('yenepoya') || low.includes('yit')) return "YIT, Moodabidri";
            if (low.includes('vivekananda') || low.includes('vcet')) return "VCET, Puttur";

            // Clean up common suffix clutter for others
            return name.replace(/^(the|a)\s+/i, '')
                .replace(/\(.*\)/, '')
                .replace(/,/g, '')
                .trim();
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

        registrationsSnap.docs.forEach((doc: any) => {
            const reg = doc.data();
            const category = (eventCategoryMap[reg.eventId] || 'other').toLowerCase();
            const cat = categoryStats[category] ? category : 'other';

            categoryStats[cat].totalTeams += 1;

            // Process Leader
            if (reg.teamLeader) {
                totalHeadcount += 1;
                const uInfo = userTypeMap[reg.teamLeader];
                const isInternal = uInfo?.type === 'internal';
                const isPaid = uniquePaidUsers.has(reg.teamLeader);

                if (isInternal) categoryStats[cat].internal += 1;
                else {
                    categoryStats[cat].external += 1;
                    uniqueExternalParticipants.add(reg.teamLeader);
                }

                if (isPaid) paidParticipantsHeadcount += 1;

                // Track unique people per college with normalization
                const rawCol = uInfo?.college || 'Unknown';
                const normCol = normalizeCollegeName(rawCol);
                if (!collegeParticipantMap[normCol]) collegeParticipantMap[normCol] = new Set();
                collegeParticipantMap[normCol].add(reg.teamLeader);
            }

            // Process Members
            if (reg.members && Array.isArray(reg.members)) {
                reg.members.forEach((mId: string) => {
                    totalHeadcount += 1;
                    const mInfo = userTypeMap[mId];
                    const isInternal = mInfo?.type === 'internal';
                    const isPaid = uniquePaidUsers.has(reg.teamLeader); // If leader paid, whole team is paid

                    if (isInternal) categoryStats[cat].internal += 1;
                    else {
                        categoryStats[cat].external += 1;
                        uniqueExternalParticipants.add(mId);
                    }

                    if (isPaid) paidParticipantsHeadcount += 1;

                    // Track unique people per col with normalization
                    const rawCol = mInfo?.college || 'Unknown';
                    const normCol = normalizeCollegeName(rawCol);
                    if (!collegeParticipantMap[normCol]) collegeParticipantMap[normCol] = new Set();
                    collegeParticipantMap[normCol].add(mId);
                });
            }

            categoryStats[cat].totalParticipants = categoryStats[cat].internal + categoryStats[cat].external;
        });

        // Unique Total Participants (Deduplicated across all events)
        const uniqueTotalParticipants = new Set<string>();
        registrationsSnap.docs.forEach((doc: any) => {
            const reg = doc.data();
            if (reg.teamLeader) uniqueTotalParticipants.add(reg.teamLeader);
            reg.members?.forEach((m: string) => uniqueTotalParticipants.add(m));
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
            totalParticipants: totalHeadcount, // Cumulative headcount
            paidParticipants: paidParticipantsHeadcount, // Cumulative paid headcount
            totalRevenue,
            categoryBreakdown: categoryStats,
            collegeDistribution: Object.entries(collegeParticipantMap)
                .map(([name, set]) => ({ name, count: set.size }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
            updatedAt: new Date().toISOString()
        };

        // Also update the stats doc for background tasks/performance elsewhere
        await adminDb.collection('system').doc('stats').set(liveStats);

        return NextResponse.json({ stats: liveStats });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
