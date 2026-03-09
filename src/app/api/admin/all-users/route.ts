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
        const parsedLimit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
        const limit = Number.isFinite(parsedLimit)
            ? Math.min(Math.max(parsedLimit, 1), 100)
            : 20;
        const legacyStatusParam = request.nextUrl.searchParams.get('status') || 'all';
        const legacyStatus = ['all', 'paid', 'unpaid', 'internal', 'external'].includes(legacyStatusParam)
            ? legacyStatusParam
            : 'all';
        const paymentStatusParam = request.nextUrl.searchParams.get('paymentStatus') || '';
        const studentTypeParam = request.nextUrl.searchParams.get('studentType') || '';

        const paymentStatus = ['all', 'paid', 'unpaid'].includes(paymentStatusParam)
            ? paymentStatusParam
            : (legacyStatus === 'paid' || legacyStatus === 'unpaid' ? legacyStatus : 'all');

        const studentTypeFilter = ['all', 'internal', 'external'].includes(studentTypeParam)
            ? studentTypeParam
            : (legacyStatus === 'internal' || legacyStatus === 'external' ? legacyStatus : 'all');
        const search = (request.nextUrl.searchParams.get('search') || '').trim();
        const skipCounts = request.nextUrl.searchParams.get('skipCounts') === '1';

        const matchesFilters = (
            paymentFilter: string,
            typeFilter: string,
            user: { studentType?: string; hasPaid?: boolean }
        ) => {
            if (paymentFilter === 'paid' && user.hasPaid !== true) return false;
            if (paymentFilter === 'unpaid' && user.hasPaid !== false) return false;
            if (typeFilter === 'internal' && user.studentType !== 'internal') return false;
            if (typeFilter === 'external' && user.studentType !== 'external') return false;
            return true;
        };

        const deriveUserProfile = (u: any) => {
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
            const normalizedCollege = (isInternal && needsCollegeNameFix)
                ? 'SMVITM (Bantakal)'
                : (u.college || u.institution || 'Outside College');

            return {
                isInternal,
                correctStudentType,
                needsCollegeNameFix,
                normalizedCollege,
                hasPaid: !!u.hasPaid,
            };
        };

        let users: any[] = [];
        let hasMore = false;
        let responseLastId: string | null = null;
        let currentCount: number | null = null;

        if (search) {
            const searchFetchLimit = Math.max(limit * 10, 200);
            const lowerSearchTerm = search.toLowerCase();
            const capitalizedSearchTerm = search.charAt(0).toUpperCase() + search.slice(1);
            const upperSearchTerm = search.toUpperCase();
            const nameQuery = usersCollection
                .orderBy('name')
                .startAt(search)
                .endAt(search + '\uf8ff')
                .limit(searchFetchLimit)
                .get();
            const emailQuery = usersCollection
                .orderBy('email')
                .startAt(lowerSearchTerm)
                .endAt(lowerSearchTerm + '\uf8ff')
                .limit(searchFetchLimit)
                .get();
            const capNameQuery = usersCollection
                .orderBy('name')
                .startAt(capitalizedSearchTerm)
                .endAt(capitalizedSearchTerm + '\uf8ff')
                .limit(searchFetchLimit)
                .get();
            const usnQuery = usersCollection
                .orderBy('usn')
                .startAt(upperSearchTerm)
                .endAt(upperSearchTerm + '\uf8ff')
                .limit(searchFetchLimit)
                .get();

            const [nameSnap, emailSnap, capNameSnap, usnSnap] = await Promise.all([nameQuery, emailQuery, capNameQuery, usnQuery]);

            const userMap = new Map<string, any>();
            nameSnap.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() }));
            emailSnap.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() }));
            capNameSnap.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() }));
            usnSnap.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() }));

            const sortedUsers = Array.from(userMap.values()).sort((a: any, b: any) => {
                const nameA = (a.name || '').toString().toLowerCase();
                const nameB = (b.name || '').toString().toLowerCase();
                if (nameA !== nameB) return nameA.localeCompare(nameB);

                const emailA = (a.email || '').toString().toLowerCase();
                const emailB = (b.email || '').toString().toLowerCase();
                if (emailA !== emailB) return emailA.localeCompare(emailB);

                return a.id.localeCompare(b.id);
            });

            const scopedUsers = sortedUsers.filter((u: any) => {
                const { correctStudentType, hasPaid: normalizedHasPaid } = deriveUserProfile(u);
                return matchesFilters(paymentStatus, studentTypeFilter, {
                    studentType: correctStudentType,
                    hasPaid: normalizedHasPaid,
                });
            });

            currentCount = scopedUsers.length;

            const startIndex = lastId
                ? Math.max(0, scopedUsers.findIndex((u: any) => u.id === lastId) + 1)
                : 0;
            const endIndex = startIndex + limit;

            users = scopedUsers.slice(startIndex, endIndex);
            hasMore = endIndex < scopedUsers.length;
            responseLastId = users.length > 0 ? users[users.length - 1].id : null;
        } else {
            let query: any = usersCollection;

            const hasPaymentFilter = paymentStatus !== 'all';
            const hasStudentTypeFilter = studentTypeFilter !== 'all';
            const hasFilter = hasPaymentFilter || hasStudentTypeFilter;

            if (hasPaymentFilter) {
                query = query.where('hasPaid', '==', paymentStatus === 'paid');
            }

            if (hasStudentTypeFilter) {
                query = query.where('studentType', '==', studentTypeFilter);
            }

            if (!hasFilter) {
                query = query.orderBy('name');
            }

            query = query.limit(limit + 1);

            if (lastId) {
                const lastDoc = await usersCollection.doc(lastId).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            const snapshot = await query.get();
            const pageDocs = snapshot.docs.slice(0, limit);
            users = pageDocs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));
            hasMore = snapshot.docs.length > limit;
            responseLastId = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null;
        }

        // Enrichment & Code-Level Filtering (Source of Truth)
        const correctionBatch = adminDb.batch();
        let hasCorrectionsToPush = false;

        const filteredUsers = users.map((u: any) => {
            const { correctStudentType, needsCollegeNameFix, normalizedCollege, hasPaid: normalizedHasPaid } = deriveUserProfile(u);

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
                college: normalizedCollege,
                hasPaid: normalizedHasPaid
            };
        });

        // Commit corrections asynchronously to not block the response
        if (hasCorrectionsToPush) {
            correctionBatch.commit().catch((e: any) => console.error('[Users] Failed to correct studentType:', e));
        }

        let totalCount: number | null = null;
        let paidCount: number | null = null;
        let unpaidCount: number | null = null;
        let internalCount: number | null = null;
        let externalCount: number | null = null;

        // Counts are expensive on every paginated request. Skip when caller requests.
        if (!skipCounts) {
            const statsDoc = await adminDb.collection('system').doc('stats').get();
            const statsData = statsDoc.data() || {};

            const hasCachedSummary = typeof statsData.totalUsers === 'number'
                && typeof statsData.paidUsers === 'number'
                && typeof statsData.internalUsers === 'number';

            if (hasCachedSummary && !search && paymentStatus === 'all' && studentTypeFilter === 'all') {
                const cachedTotal = statsData.totalUsers as number;
                const cachedPaid = statsData.paidUsers as number;
                const cachedInternal = statsData.internalUsers as number;

                totalCount = cachedTotal;
                paidCount = cachedPaid;
                unpaidCount = typeof statsData.unpaidUsers === 'number'
                    ? statsData.unpaidUsers
                    : cachedTotal - cachedPaid;
                internalCount = cachedInternal;
                externalCount = typeof statsData.externalUsers === 'number'
                    ? statsData.externalUsers
                    : cachedTotal - cachedInternal;
            } else {
                const [usersSnap, internalSnap, paidSnap] = await Promise.all([
                    usersCollection.count().get(),
                    usersCollection.where('studentType', '==', 'internal').count().get(),
                    usersCollection.where('hasPaid', '==', true).count().get()
                ]);

                totalCount = usersSnap.data().count;
                paidCount = paidSnap.data().count;
                unpaidCount = totalCount - paidCount;

                // Use DB counts, adjusted by corrections discovered in this payload.
                const dbInternalCount = internalSnap.data().count;
                const correctedOnPage = filteredUsers.filter((u: any) => u.studentType === 'internal').length;
                const uncorrectedOnPage = users.filter((u: any) => u.studentType === 'internal').length;
                internalCount = dbInternalCount + (correctedOnPage - uncorrectedOnPage);
                externalCount = totalCount - Math.max(0, internalCount);
            }
        }

        if (!search && !skipCounts) {
            if (paymentStatus === 'all' && studentTypeFilter === 'all') {
                currentCount = totalCount;
            } else if (paymentStatus === 'paid' && studentTypeFilter === 'all') {
                currentCount = paidCount;
            } else if (paymentStatus === 'unpaid' && studentTypeFilter === 'all') {
                currentCount = unpaidCount;
            } else if (paymentStatus === 'all' && studentTypeFilter === 'internal') {
                currentCount = internalCount;
            } else if (paymentStatus === 'all' && studentTypeFilter === 'external') {
                currentCount = externalCount;
            } else {
                // Combined paid/unpaid + internal/external scope without requiring a composite index.
                const scopedSnap = await usersCollection
                    .where('hasPaid', '==', paymentStatus === 'paid')
                    .select('studentType', 'college', 'institution', 'collegeName', 'email')
                    .get();

                currentCount = scopedSnap.docs.reduce((count, doc) => {
                    const { correctStudentType } = deriveUserProfile(doc.data());
                    return count + (correctStudentType === studentTypeFilter ? 1 : 0);
                }, 0);
            }
        }



        return NextResponse.json({
            users: filteredUsers,
            totalCount,
            currentCount,
            paidCount,
            unpaidCount,
            internalCount,
            externalCount,
            lastId: responseLastId,
            hasMore
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
