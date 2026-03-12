import { adminDb, registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        // Fetch user data for role check
        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        const role = userData?.role;

        if (role !== 'SUPER_ADMIN' && role !== 'COORDINATOR') {
            return NextResponse.json({ message: "Forbidden: Admin access required for exports" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // users, registrations, payments
        const eventId = searchParams.get('eventId');

        let data: any[] = [];

        if (type === 'users') {
            const isExcludedFromTracking = (roleValue: unknown) => {
                if (typeof roleValue !== 'string') return false;
                const normalizedRole = roleValue.trim().toUpperCase();
                return normalizedRole.length > 0 && normalizedRole !== 'USER';
            };

            const legacyStatus = searchParams.get('status') || 'all'; // all, paid, unpaid, internal, external
            const paymentStatusParam = searchParams.get('paymentStatus') || '';
            const studentTypeParam = searchParams.get('studentType') || '';
            const search = (searchParams.get('search') || '').toLowerCase();

            const paymentStatus = ['all', 'paid', 'unpaid'].includes(paymentStatusParam)
                ? paymentStatusParam
                : (legacyStatus === 'paid' || legacyStatus === 'unpaid' ? legacyStatus : 'all');

            const studentType = ['all', 'internal', 'external'].includes(studentTypeParam)
                ? studentTypeParam
                : (legacyStatus === 'internal' || legacyStatus === 'external' ? legacyStatus : 'all');

            let query: any = usersCollection;

            // Keep Firestore query index-safe by applying at most one DB-level filter.
            if (paymentStatus === 'paid') {
                query = query.where('hasPaid', '==', true);
            } else if (paymentStatus === 'unpaid') {
                query = query.where('hasPaid', '==', false);
            } else if (studentType === 'internal') {
                query = query.where('studentType', '==', 'internal');
            } else if (studentType === 'external') {
                query = query.where('studentType', '==', 'external');
            }

            const snapshot = await query.get();
            let users = snapshot.docs.map((doc: any) => {
                const u = doc.data();
                return {
                    id: doc.id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone || 'N/A',
                    usn: u.usn || 'N/A',
                    college: u.collegeName || u.college || 'N/A',
                    studentType: u.studentType || 'N/A',
                    paymentStatus: u.hasPaid ? 'Paid' : 'Unpaid',
                    role: u.role
                };
            });

            users = users.filter((u: any) => !isExcludedFromTracking(u.role));

            if (paymentStatus !== 'all') {
                users = users.filter((u: any) => u.paymentStatus.toLowerCase() === paymentStatus);
            }

            if (studentType !== 'all') {
                users = users.filter((u: any) => u.studentType === studentType);
            }

            if (search) {
                users = users.filter((u: any) => 
                    (u.name && u.name.toLowerCase().includes(search)) ||
                    (u.email && u.email.toLowerCase().includes(search)) ||
                    (u.usn && u.usn.toLowerCase().includes(search))
                );
            }

            data = users;
        } else if (type === 'registrations') {
            const eventId = searchParams.get('eventId');
            const search = (searchParams.get('search') || '').toLowerCase();

            let query: any = registrationsCollection;
            if (eventId && eventId !== 'all') {
                query = query.where('eventId', '==', eventId);
            }
            
            const snapshot = await query.get();
            const regs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

            if (regs.length === 0) {
                return NextResponse.json({ data: [] });
            }

            // Enrich registrations with user names and event titles
            const userIds = new Set<string>();
            const uniqueEventIds = new Set<string>();
            
            regs.forEach((r: any) => {
                if (r.teamLeader) userIds.add(r.teamLeader);
                if (r.eventId) uniqueEventIds.add(r.eventId);
                if (r.members) r.members.forEach((mId: string) => {
                    if (mId) userIds.add(mId);
                });
            });

            const userIdArray = Array.from(userIds);
            const userMap: Record<string, any> = {};

            // Chunked user fetch
            for (let i = 0; i < userIdArray.length; i += 10) {
                const chunk = userIdArray.slice(i, i + 10);
                const uSnap = await usersCollection.where('__name__', 'in', chunk).get();
                uSnap.docs.forEach(d => { userMap[d.id] = d.data(); });
            }

            // Fetch event details for all involved events
            const eventMap: Record<string, any> = {};
            const eventIdArray = Array.from(uniqueEventIds);
            for (let i = 0; i < eventIdArray.length; i += 5) {
                const chunk = eventIdArray.slice(i, i + 5);
                const eSnap = await adminDb.collection('events').where('__name__', 'in', chunk).get();
                eSnap.docs.forEach(d => { eventMap[d.id] = d.data(); });
            }

            const mapped = regs.map((r: any) => {
                const leaderId = r.teamLeader;
                const leader = userMap[leaderId] || {};
                const eventInfo = eventMap[r.eventId] || {};

                // 1. Get unique member IDs (excluding the leader to avoid duplicates)
                const uniqueMemberIds = Array.from(new Set(r.members || []))
                    .filter(mId => mId && mId !== leaderId);

                // 2. Build detailed member list starting with the leader
                const membersDetails = [];

                // Add leader first
                if (leaderId) {
                    membersDetails.push({
                        name: leader.name || 'Unknown',
                        usn: leader.usn || 'N/A',
                        email: leader.email || 'N/A',
                        phone: leader.phone || r.phone || 'N/A',
                        college: leader.collegeName || leader.college || leader.institution || r.college || 'N/A'
                    });
                }

                // Add other members
                uniqueMemberIds.forEach(mId => {
                    const m = userMap[mId] || {};
                    membersDetails.push({
                        name: m.name || 'Unknown',
                        usn: m.usn || 'N/A',
                        email: m.email || 'N/A',
                        phone: m.phone || 'N/A',
                        college: m.collegeName || m.college || m.institution || 'N/A'
                    });
                });

                return {
                    id: r.id,
                    teamName: r.teamName || 'Solo',
                    teamLeader: r.teamLeader,
                    eventId: r.eventId,
                    event: eventInfo.title || r.eventId,
                    college: r.college || leader.collegeName || leader.college || leader.institution || 'N/A',
                    phone: r.phone || leader.phone || 'N/A',
                    members: membersDetails.map((m: any) => `${m.name} (${m.usn})`).join(', '),
                    membersDetails: membersDetails,
                    paymentStatus: leader.hasPaid ? 'Paid' : 'Unpaid',
                    registeredAt: r.registeredAt
                };
            });

            if (search) {
                data = mapped.filter((r: any) => 
                    r.teamName.toLowerCase().includes(search) ||
                    r.event.toLowerCase().includes(search) ||
                    r.college.toLowerCase().includes(search) ||
                    r.membersDetails.some((m: any) => 
                        m.name.toLowerCase().includes(search) || 
                        m.email.toLowerCase().includes(search) || 
                        m.usn.toLowerCase().includes(search)
                    )
                );
            } else {
                data = mapped;
            }
        } else if (type === 'payments') {
            const eventId = searchParams.get('eventId');
            const status = searchParams.get('status');
            const search = searchParams.get('search') || '';
            const dateFilter = searchParams.get('dateFilter');

            let paymentsQuery: any = adminDb.collection('payments');

            if (status && status !== 'all') {
                paymentsQuery = paymentsQuery.where('status', '==', status);
            }

            if (dateFilter === 'new') {
                paymentsQuery = paymentsQuery.where('created_at', '>=', '2026-03-11T00:00:00.000Z');
            }

            let snapshot = await paymentsQuery.get();
            let payments = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

            // Handle Event scoping (manual if many UIDs)
            if (eventId && eventId !== 'all') {
                const regSnapshot = await adminDb.collection('registrations').where('eventId', '==', eventId).get();
                const uids = new Set(regSnapshot.docs.flatMap((doc: any) => {
                    const d = doc.data();
                    return [d.teamLeader, ...(d.members || [])];
                }));

                if (uids.size === 0) {
                    return NextResponse.json({ data: [] });
                }

                payments = payments.filter((p: any) => p.user_id && uids.has(p.user_id));
            }

            // Handle Search scoping (manual)
            if (search) {
                const s = search.toLowerCase();
                // We'll need user details to search by name/email in-memory if we want full consistency
                // But for now, let's at least handle transaction ID search
                payments = payments.filter((p: any) => 
                    p.id.toLowerCase().includes(s) || 
                    (p.transactionId && p.transactionId.toLowerCase().includes(s)) ||
                    (p.notes?.upi_transaction_id && p.notes.upi_transaction_id.toLowerCase().includes(s)) ||
                    (p.payment_method_details?.upi_transaction_id && p.payment_method_details.upi_transaction_id.toLowerCase().includes(s))
                );
            }

            data = payments;

            // Enrich payments with user names
            const userIds = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)));
            const userMap: Record<string, any> = {};

            for (let i = 0; i < userIds.length; i += 10) {
                const chunk = userIds.slice(i, i + 10);
                const uSnap = await usersCollection.where('__name__', 'in', chunk).get();
                uSnap.docs.forEach(d => { userMap[d.id] = d.data(); });
            }

            // Apply Name/Email search if search was provided but not caught by transaction IDs
            if (search && data.length > 0) {
                const s = search.toLowerCase();
                data = data.filter((p: any) => {
                    const user = userMap[p.user_id] || {};
                    return (user.name && user.name.toLowerCase().includes(s)) || 
                           (user.email && user.email.toLowerCase().includes(s));
                });
            }

            data = data.map((p: any) => {
                const user = userMap[p.user_id] || {};
                return {
                    transactionId: p.transactionId || p.id,
                    userName: user.name || 'Unknown',
                    email: user.email || 'N/A',
                    phone: user.phone || 'N/A',
                    college: user.collegeName || user.college || user.institution || 'N/A',
                    studentType: user.studentType || 'N/A',
                    amount: (p.amount || 0) / 100,
                    status: p.status,
                    date: p.captured_at || p.created_at || 'N/A'
                };
            });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("Export API Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
