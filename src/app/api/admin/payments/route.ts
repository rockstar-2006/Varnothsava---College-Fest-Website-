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
        if (!userDoc.exists) {
            return NextResponse.json({ message: "User profile not found" }, { status: 404 });
        }
        const userData = userDoc.data();

        // Use getAdminRole for strict blacklist enforcement
        const { role } = getAdminRole(verified.email || userData?.email);

        // Fallback to database role only if not blacklisted (getAdminRole handles this)
        if (!role) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const status = searchParams.get('status');
        const search = searchParams.get('search') || '';
        const lastId = searchParams.get('lastId') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        const skipCounts = searchParams.get('skipCounts') === '1';
        const studentType = searchParams.get('studentType');
        const dateFilter = searchParams.get('dateFilter');

        let paymentsQuery: any = adminDb.collection('payments');

        // Apply Search (Global Database Search)
        let searchUids: string[] | null = null;
        if (search) {
            // MULTI-FIELD SEARCH (Name, Email) - Following pattern from all-users
            const nameSearchTerm = search;
            const capitalizedSearchTerm = search.charAt(0).toUpperCase() + search.slice(1);

            const nameQuery = usersCollection.orderBy('name').startAt(nameSearchTerm).endAt(nameSearchTerm + '\uf8ff').limit(30).get();
            const capitalizedNameQuery = usersCollection.orderBy('name').startAt(capitalizedSearchTerm).endAt(capitalizedSearchTerm + '\uf8ff').limit(30).get();
            const emailQuery = usersCollection.orderBy('email').startAt(search.toLowerCase()).endAt(search.toLowerCase() + '\uf8ff').limit(30).get();

            const [nameSnap, capNameSnap, emailSnap] = await Promise.all([nameQuery, capitalizedNameQuery, emailQuery]);

            const userMap = new Set<string>();
            nameSnap.docs.forEach(d => userMap.add(d.id));
            capNameSnap.docs.forEach(d => userMap.add(d.id));
            emailSnap.docs.forEach(d => userMap.add(d.id));

            searchUids = Array.from(userMap);

            if (searchUids.length === 0) {
                if (search.startsWith('pay_')) {
                    const singlePay = await adminDb.collection('payments').doc(search).get();
                    if (singlePay.exists) {
                        return NextResponse.json({
                            payments: await enrichPaymentsArray([{ id: singlePay.id, ...singlePay.data() }]),
                            totalCount: 1,
                            lastId: null,
                            hasMore: false
                        });
                    }
                }
                return NextResponse.json({ payments: [], totalCount: 0, hasMore: false });
            }
        }

        // Scope by event directly so payment counts stay aligned with payments/total and stats.
        let scopedEventIds: string[] | null = null;
        if (role === 'COORDINATOR') {
            const eventsSnapshot = await adminDb.collection('events')
                .where('coordinators', 'array-contains', verified.uid)
                .get();
            const assignedEventIds = eventsSnapshot.docs.map(doc => doc.id);

            if (assignedEventIds.length === 0) {
                return NextResponse.json({ payments: [], totalCount: 0, hasMore: false });
            }

            if (eventId && eventId !== 'all') {
                if (!assignedEventIds.includes(eventId)) {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
                scopedEventIds = [eventId];
            } else {
                scopedEventIds = assignedEventIds;
            }
        } else if (eventId && eventId !== 'all') {
            scopedEventIds = [eventId];
        }

        if (scopedEventIds && scopedEventIds.length > 0 && scopedEventIds.length <= 30) {
            if (scopedEventIds.length === 1) {
                paymentsQuery = paymentsQuery.where('eventId', '==', scopedEventIds[0]);
            } else {
                paymentsQuery = paymentsQuery.where('eventId', 'in', scopedEventIds);
            }
        }

        if (status && status !== 'all') {
            paymentsQuery = paymentsQuery.where('status', '==', status);
        }

        if (dateFilter === 'new') {
            // Fetch payments from March 11th 2026 onwards
            paymentsQuery = paymentsQuery.where('created_at', '>=', '2026-03-11T00:00:00.000Z');
        }

        const hasStudentTypeFilter = studentType === 'internal' || studentType === 'external';
        const requiresManualFiltering = hasStudentTypeFilter
            || (searchUids !== null && searchUids.length > 30)
            || (scopedEventIds !== null && scopedEventIds.length > 30);

        // Fast path for simple search filters within Firestore 'in' limits.
        if (!requiresManualFiltering && searchUids && searchUids.length > 0) {
            paymentsQuery = paymentsQuery.where('user_id', 'in', searchUids);
        }

        // Complex filter fallback (large coordinator event scopes or studentType filter).
        if (requiresManualFiltering) {
            const broadSnapshot = await paymentsQuery.get();
            let allPayments = broadSnapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));

            if (scopedEventIds && scopedEventIds.length > 30) {
                const allowedEvents = new Set(scopedEventIds);
                allPayments = allPayments.filter((p: any) => allowedEvents.has(p.eventId));
            }

            if (searchUids) {
                const allowedUids = new Set(searchUids);
                allPayments = allPayments.filter((p: any) => allowedUids.has(p.user_id));
            }

            let enrichedAll = await enrichPaymentsArray(allPayments);

            if (hasStudentTypeFilter) {
                enrichedAll = enrichedAll.filter((p: any) => p.studentType === studentType);
            }

            enrichedAll.sort((a: any, b: any) => {
                const dateA = a.created_at || a.paid_at || '';
                const dateB = b.created_at || b.paid_at || '';
                return dateB.localeCompare(dateA);
            });

            let startIndex = 0;
            if (lastId) {
                const prevIndex = enrichedAll.findIndex((p: any) => p.id === lastId);
                if (prevIndex !== -1) startIndex = prevIndex + 1;
            }

            const paged = enrichedAll.slice(startIndex, startIndex + limit);

            return NextResponse.json({
                payments: paged,
                totalCount: skipCounts ? null : enrichedAll.length,
                lastId: paged.length > 0 ? paged[paged.length - 1].id : null,
                hasMore: (startIndex + limit) < enrichedAll.length
            });
        }

        let query = paymentsQuery.orderBy('created_at', 'desc').limit(limit);

        if (lastId) {
            const lastDoc = await adminDb.collection('payments').doc(lastId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        let snapshot: any = null;
        try {
            snapshot = await query.get();
        } catch (error: any) {
            if (error.message?.includes('index') || error.code === 9) {
                console.warn("[PaymentsAPI] Missing index fallback triggered:", error.message);
                // Fallback: Fetch without orderBy 'created_at' to avoid index requirement
                let fallbackQuery = paymentsQuery.limit(500);
                const fallbackSnapshot = await fallbackQuery.get();
                let results = fallbackSnapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Manual in-memory sort
                results.sort((a: any, b: any) => {
                    const dateA = a.created_at || a.paid_at || '';
                    const dateB = b.created_at || b.paid_at || '';
                    return dateB.localeCompare(dateA);
                });

                // Mock snapshot for pagination compatibility
                snapshot = { docs: results.slice(0, limit) };
            } else {
                throw error;
            }
        }

        const payments = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        // Optional count: skip on paginated load-more requests to cut read volume.
        let totalCount: number | null = null;
        if (!skipCounts) {
            const countSnap = await paymentsQuery.count().get();
            totalCount = countSnap.data().count;
        }

        const enriched = await enrichPaymentsArray(payments);

        return NextResponse.json({
            payments: enriched,
            totalCount: totalCount,
            lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
            hasMore: snapshot.docs.length === limit
        });

    } catch (error: any) {
        console.error("Admin Payments GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

async function enrichPaymentsArray(payments: any[]) {
    if (payments.length === 0) return [];

    const userIds = Array.from(new Set(payments.map(p => p.user_id)));
    const usersDataMap: Record<string, any> = {};

    for (let i = 0; i < userIds.length; i += 10) {
        const chunk = userIds.slice(i, i + 10);
        const userSnapshot = await adminDb.collection('users').where('__name__', 'in', chunk).get();
        userSnapshot.docs.forEach(doc => {
            usersDataMap[doc.id] = doc.data();
        });
    }

    return payments.map(p => {
        const user = usersDataMap[p.user_id] || {};
        // Check all possible field names used across registrations
        const college = (user.collegeName || user.college || user.institution || '').toUpperCase();
        const email = (user.email || '').toLowerCase();
        const isInternal = user.studentType === 'internal' ||
            college.includes('SMVITM') ||
            college.includes('SODE') ||
            college.includes('SHRI MADHWA VADIRAJA') ||
            college.includes('SHRI MADHWA') ||
            college.includes('VADIRAJA') ||
            email.endsWith('@sode-edu.in');

        return {
            ...p,
            userName: user.name || 'Unknown',
            userEmail: user.email || p.user_email || 'Unknown',
            userPhone: user.phone || 'N/A',
            userCollege: user.collegeName || user.college || user.institution || 'N/A',
            studentType: isInternal ? 'internal' : 'external'
        };
    });
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);

        if (!verified) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userDoc = await usersCollection.doc(verified.uid).get();
        if (userDoc.data()?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { paymentIds } = await request.json();
        if (!paymentIds || !Array.isArray(paymentIds)) {
            return NextResponse.json({ message: "Invalid payment IDs" }, { status: 400 });
        }

        const batch = adminDb.batch();
        for (const pid of paymentIds) {
            const pref = adminDb.collection('payments').doc(pid);
            const pdoc = await pref.get();
            if (pdoc.exists) {
                const userId = pdoc.data()?.user_id;
                if (userId) {
                    batch.update(usersCollection.doc(userId), { hasPaid: false });
                }
                batch.delete(pref);
            }
        }

        await batch.commit();
        return NextResponse.json({ message: `${paymentIds.length} payments deleted` });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
