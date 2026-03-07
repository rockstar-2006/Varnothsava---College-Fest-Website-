import { adminDb, fieldValue, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        if (!role || !['SUPER_ADMIN', 'FINANCE'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const lastId = request.nextUrl.searchParams.get('lastId') || '';
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
        const status = request.nextUrl.searchParams.get('status') || 'all';
        const search = request.nextUrl.searchParams.get('search') || '';

        // Strategy 4: Summary Document Fetch for fast metadata
        const statsRef = adminDb.collection('system').doc('stats');
        const statsDoc = await statsRef.get();
        const s = statsDoc.data() || {};

        let users: any[] = [];
        let snapshot: any;

        if (search) {
            const capitalizedSearchTerm = search.charAt(0).toUpperCase() + search.slice(1);
            const nameQuery = usersCollection.orderBy('name').startAt(search).endAt(search + '\uf8ff').limit(limit).get();
            const emailQuery = usersCollection.orderBy('email').startAt(search.toLowerCase()).endAt(search.toLowerCase() + '\uf8ff').limit(limit).get();
            const capNameQuery = usersCollection.orderBy('name').startAt(capitalizedSearchTerm).endAt(capitalizedSearchTerm + '\uf8ff').limit(limit).get();

            const [nameSnap, emailSnap, capNameSnap] = await Promise.all([nameQuery, emailQuery, capNameQuery]);

            // Merge and deduplicate
            const userMap = new Map();
            nameSnap.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() }));
            emailSnap.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() }));
            capNameSnap.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() }));

            users = Array.from(userMap.values());
            snapshot = { docs: nameSnap.docs }; // Dummy for pagination tracking if needed, though search results are usually small
        } else {
            // Base query for users
            let query: any = usersCollection;

            // Apply filters (Database Level)
            const hasFilter = status && status !== 'all';
            if (status === 'paid') query = query.where('hasPaid', '==', true);
            else if (status === 'unpaid') query = query.where('hasPaid', '==', false);
            else if (status === 'internal') query = query.where('studentType', '==', 'internal');
            else if (status === 'external') query = query.where('studentType', '==', 'external');

            if (!hasFilter) {
                query = query.orderBy('name');
            }

            query = query.limit(limit);

            if (lastId) {
                const lastDoc = await usersCollection.doc(lastId).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            snapshot = await query.get();
            users = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        // Enrichment & Code-Level Filtering (Source of Truth)
        const correctionBatch = adminDb.batch();
        let hasCorrectionsToPush = false;

        let filteredUsers = users.map((u: any) => {
            const rawCollege = (u.collegeName || u.college || u.institution || '').toUpperCase();
            const email = (u.email || '').toLowerCase();
            const isInternal =
                rawCollege.includes('SMVITM') ||
                rawCollege.includes('SODE') ||
                rawCollege.includes('SHRI MADHWA VADIRAJA') ||
                rawCollege.includes('SHRI MADHWA') ||
                rawCollege.includes('VADIRAJA') ||
                email.endsWith('@sode-edu.in');

            const correctStudentType = isInternal ? 'internal' : (u.studentType || 'external');
            const needsCollegeNameFix = isInternal && (rawCollege === '' || rawCollege.includes('OUTSIDE') || rawCollege === 'N/A');

            // If the DB value doesn't match, queue a correction
            if ((u.studentType !== correctStudentType || needsCollegeNameFix) && u.id) {
                const updates: any = { studentType: correctStudentType };
                if (needsCollegeNameFix) {
                    updates.college = 'SMVITM (Bantakal)';
                    updates.institution = 'SMVITM (Bantakal)'; // Keep both in sync if both exist
                }
                correctionBatch.update(usersCollection.doc(u.id), updates);
                hasCorrectionsToPush = true;
            }

            return {
                ...u,
                studentType: correctStudentType,
                college: (isInternal && needsCollegeNameFix) ? 'SMVITM (Bantakal)' : (u.college || u.institution || 'Outside College'),
                hasPaid: !!u.hasPaid
            };
        });

        // Commit corrections asynchronously to not block the response
        if (hasCorrectionsToPush) {
            correctionBatch.commit().catch((e: any) => console.error('[Users] Failed to correct studentType:', e));
        }

        // Apply filters in code if it was a search result (since search bypasses DB filter for indexes)
        if (search && status && status !== 'all') {
            filteredUsers = filteredUsers.filter((u: any) => {
                if (status === 'internal') return u.studentType === 'internal';
                if (status === 'external') return u.studentType === 'external';
                if (status === 'paid') return u.hasPaid === true;
                if (status === 'unpaid') return u.hasPaid === false;
                return true;
            });
        }

        // LIVE ACCURATE COUNTS (Fast for <10k users)
        const [usersSnap, internalSnap, paidSnap] = await Promise.all([
            usersCollection.count().get(),
            usersCollection.where('studentType', '==', 'internal').count().get(),
            usersCollection.where('hasPaid', '==', true).count().get()
        ]);

        const totalCount = usersSnap.data().count;
        const paidCount = paidSnap.data().count;
        const unpaidCount = totalCount - paidCount;

        // Use the DB count for internal (corrections above will fix future queries)
        // but add any corrections found on this page
        const dbInternalCount = internalSnap.data().count;
        const correctedOnPage = filteredUsers.filter((u: any) => u.studentType === 'internal').length;
        const uncorrectedOnPage = users.filter((u: any) => u.studentType === 'internal').length;
        const internalCount = dbInternalCount + (correctedOnPage - uncorrectedOnPage);
        const externalCount = totalCount - Math.max(0, internalCount);



        return NextResponse.json({
            users: filteredUsers,
            totalCount,
            paidCount,
            unpaidCount,
            internalCount,
            externalCount,
            lastId: snapshot?.docs && snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
            hasMore: snapshot?.docs ? snapshot.docs.length === limit : false
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

        const statsRef = adminDb.collection('system').doc('stats');

        for (const targetId of targets) {
            const batch = adminDb.batch();

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

            // 1. Delete user registrations (where তারা Leader)
            const regLeaderSnap = await adminDb.collection('registrations')
                .where('teamLeader', '==', targetId).get();
            regLeaderSnap.docs.forEach(doc => batch.delete(doc.ref));

            // 2. Remove from 'members' array in other registrations
            const regMemberSnap = await adminDb.collection('registrations')
                .where('members', 'array-contains', targetId).get();
            regMemberSnap.docs.forEach(doc => {
                const data = doc.data();
                const newMembers = (data.members || []).filter((m: string) => m !== targetId);
                batch.update(doc.ref, { members: newMembers });
            });

            // 3. Delete user payments
            const paySnap = await adminDb.collection('payments')
                .where('user_id', '==', targetId).get();
            paySnap.docs.forEach(doc => batch.delete(doc.ref));

            // 4. Delete user document
            batch.delete(usersCollection.doc(targetId));

            await batch.commit();
        }

        return NextResponse.json({ message: `${targets.length} user(s) and all associated data cleared.` });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
