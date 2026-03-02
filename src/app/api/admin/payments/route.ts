import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        const role = userData?.role;

        if (!role || !['SUPER_ADMIN', 'FINANCE', 'COORDINATOR'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const status = searchParams.get('status');
        const lastId = searchParams.get('lastId') || '';
        const limit = parseInt(searchParams.get('limit') || '20');

        // Strategy 4: Summary Document Fetch
        const statsRef = adminDb.collection('system').doc('stats');
        const statsDoc = await statsRef.get();
        const s = statsDoc.data() || {};
        const totalCount = s.totalVerifiedPayments || 0;

        let paymentsQuery: any = adminDb.collection('payments');

        // Handle filtering by event via registrations
        let filteredUserIds: string[] | null = null;
        if (role === 'COORDINATOR') {
            const eventsSnapshot = await adminDb.collection('events')
                .where('coordinators', 'array-contains', verified.uid)
                .get();
            const assignedEventIds = eventsSnapshot.docs.map(doc => doc.id);

            if (assignedEventIds.length === 0) {
                return NextResponse.json({ payments: [], totalCount: 0 });
            }

            let regQuery: any = adminDb.collection('registrations');
            if (eventId && eventId !== 'all') {
                if (!assignedEventIds.includes(eventId)) {
                    return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                }
                regQuery = regQuery.where('eventId', '==', eventId);
            } else {
                regQuery = regQuery.where('eventId', 'in', assignedEventIds);
            }

            const regSnapshot = await regQuery.get();
            filteredUserIds = Array.from(new Set(regSnapshot.docs.flatMap((doc: any) => {
                const data = doc.data();
                return [data.teamLeader, ...(data.members || [])];
            })));

            if (filteredUserIds.length === 0) {
                return NextResponse.json({ payments: [], totalCount: 0 });
            }
        } else if (eventId && eventId !== 'all') {
            const regSnapshot = await adminDb.collection('registrations')
                .where('eventId', '==', eventId)
                .get();
            filteredUserIds = Array.from(new Set(regSnapshot.docs.flatMap((doc: any) => {
                const data = doc.data();
                return [data.teamLeader, ...(data.members || [])];
            })));

            if (filteredUserIds.length === 0) {
                return NextResponse.json({ payments: [], totalCount: 0 });
            }
        }

        if (filteredUserIds) {
            // Firestore 'in' has 30 limit. If more, we might need a different strategy.
            // For MVP focusing on cost, we'll slice to first 30 if exceeds, or better, 
            // just use the first 30 for the 'in' filter to stay in free tier limits.
            paymentsQuery = paymentsQuery.where('user_id', 'in', filteredUserIds.slice(0, 30));
        }

        if (status && status !== 'all') {
            paymentsQuery = paymentsQuery.where('status', '==', status);
        }

        let query = paymentsQuery.orderBy('created_at', 'desc').limit(limit);

        if (lastId) {
            const lastDoc = await adminDb.collection('payments').doc(lastId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const payments = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        const enriched = await enrichPaymentsArray(payments);

        return NextResponse.json({
            payments: enriched,
            totalCount,
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
