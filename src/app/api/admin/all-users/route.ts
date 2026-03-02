import { adminDb, fieldValue, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        if (!role || !['SUPER_ADMIN', 'FINANCE'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const lastId = request.nextUrl.searchParams.get('lastId') || '';
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
        const status = request.nextUrl.searchParams.get('status') || 'all';

        // Strategy 4: Summary Document Fetch for fast metadata
        const statsRef = adminDb.collection('system').doc('stats');
        const statsDoc = await statsRef.get();
        const s = statsDoc.data() || {};
        const totalCount = s.totalUsers || 0;
        const paidCount = s.paidUsers || 0;
        const unpaidCount = s.unpaidUsers || 0;

        // Base query for users
        let query: any = usersCollection.orderBy('name');

        if (status === 'paid') {
            query = query.where('hasPaid', '==', true);
        } else if (status === 'unpaid') {
            query = query.where('hasPaid', '==', false);
        }

        query = query.limit(limit);

        if (lastId) {
            const lastDoc = await usersCollection.doc(lastId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        // Strategy 2: True Server-Side Pagination
        const snapshot = await query.get();
        const users = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        // Enrich current patch for display (same logic as before)
        const currentBatchIds = users.map((u: any) => u.id);
        const paidUserIds = new Set<string>();

        if (currentBatchIds.length > 0) {
            const capturedSnap = await adminDb.collection('payments')
                .where('status', '==', 'captured')
                .where('user_id', 'in', currentBatchIds).get();

            const verifiedSnap = await adminDb.collection('payments')
                .where('notes.verification_status', '==', 'verified')
                .where('user_id', 'in', currentBatchIds).get();

            capturedSnap.docs.forEach(d => paidUserIds.add(d.data().user_id));
            verifiedSnap.docs.forEach(d => paidUserIds.add(d.data().user_id));
        }

        const enrichedUsers = users.map((u: any) => {
            const college = (u.collegeName || u.college || u.institution || '').toUpperCase();
            const email = (u.email || '').toLowerCase();
            const isInternal = u.studentType === 'internal' ||
                college.includes('SMVITM') ||
                email.endsWith('@sode-edu.in');

            return {
                ...u,
                studentType: isInternal ? 'internal' : 'external',
                hasPaid: paidUserIds.has(u.id) || u.hasPaid
            };
        });

        return NextResponse.json({
            users: enrichedUsers,
            totalCount,
            paidCount,
            unpaidCount,
            lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
            hasMore: snapshot.docs.length === limit
        });

    } catch (error: any) {
        console.error("User Management API Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
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

        const adminDoc = await usersCollection.doc(verified.uid).get();
        const adminData = adminDoc.data();
        const adminRole = adminData?.role;

        if (!adminRole || !['SUPER_ADMIN', 'FINANCE'].includes(adminRole)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { userId, updates } = await request.json();

        // Security: Prevent modifying status of other admins
        const targetUserDoc = await usersCollection.doc(userId).get();
        if (targetUserDoc.exists) {
            const targetData = targetUserDoc.data();
            if (targetData?.role && targetData.role !== 'USER') {
                return NextResponse.json({ message: "Cannot modify admin user status" }, { status: 403 });
            }
        }

        // Sanitize updates to only allow specific fields
        const allowedUpdates: any = {};
        // Strategy 4: Summary Document Updates
        if (updates.hasPaid !== undefined) {
            allowedUpdates.hasPaid = updates.hasPaid;
            const statsRef = adminDb.collection('system').doc('stats');
            const targetData = targetUserDoc.data();

            // Only increment/decrement if the status actually changed
            if (targetData && targetData.hasPaid !== updates.hasPaid) {
                const batch = adminDb.batch();
                batch.update(usersCollection.doc(userId), allowedUpdates);
                batch.set(statsRef, {
                    paidUsers: fieldValue.increment(updates.hasPaid ? 1 : -1),
                    unpaidUsers: fieldValue.increment(updates.hasPaid ? -1 : 1)
                }, { merge: true });
                await batch.commit();
                return NextResponse.json({ message: "User status and summary stats updated" });
            }
        }

        if (updates.isBlocked !== undefined) allowedUpdates.isBlocked = updates.isBlocked;
        if (updates.role !== undefined) allowedUpdates.role = updates.role;

        await usersCollection.doc(userId).update(allowedUpdates);

        return NextResponse.json({ message: "User updated successfully" });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);

        if (!verified) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const adminDoc = await usersCollection.doc(verified.uid).get();
        if (adminDoc.data()?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { userId, userIds } = await request.json();
        const targets = userIds || [userId];

        if (!targets || targets.length === 0) {
            return NextResponse.json({ message: "No user IDs provided" }, { status: 400 });
        }

        // Use batch for better performance
        const batch = adminDb.batch();
        const statsRef = adminDb.collection('system').doc('stats');

        for (const targetId of targets) {
            // Get user data for stats update
            const userDoc = await usersCollection.doc(targetId).get();
            if (userDoc.exists) {
                const u = userDoc.data();
                const isInternal = u?.studentType === 'internal';
                const hasPaid = u?.hasPaid;

                batch.set(statsRef, {
                    totalUsers: fieldValue.increment(-1),
                    [isInternal ? 'internalUsers' : 'externalUsers']: fieldValue.increment(-1),
                    [hasPaid ? 'paidUsers' : 'unpaidUsers']: fieldValue.increment(-1)
                }, { merge: true });
            }

            // 1. Delete user registrations
            const regSnap = await adminDb.collection('registrations')
                .where('teamLeader', '==', targetId).get();
            regSnap.docs.forEach(doc => batch.delete(doc.ref));

            // 2. Delete user payments
            const paySnap = await adminDb.collection('payments')
                .where('user_id', '==', targetId).get();
            paySnap.docs.forEach(doc => batch.delete(doc.ref));

            // 3. Delete user document
            batch.delete(usersCollection.doc(targetId));
        }

        await batch.commit();

        return NextResponse.json({ message: `${targets.length} user(s) and associated data deleted successfully` });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
