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

        if (role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden: Super Admin access required for exports" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // users, registrations, payments
        const eventId = searchParams.get('eventId');

        let data: any[] = [];

        if (type === 'users') {
            const status = searchParams.get('status'); // all, paid, unpaid, internal, external
            let query: any = usersCollection;

            if (status === 'paid') {
                query = query.where('hasPaid', '==', true);
            } else if (status === 'unpaid') {
                query = query.where('hasPaid', '==', false);
            } else if (status === 'internal') {
                query = query.where('studentType', '==', 'internal');
            } else if (status === 'external') {
                query = query.where('studentType', '==', 'external');
            }

            const snapshot = await query.get();
            data = snapshot.docs.map((doc: any) => {
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
        } else if (type === 'registrations') {
            if (!eventId || eventId === 'all') {
                return NextResponse.json({ message: "Event ID is required for registration roster" }, { status: 400 });
            }

            const query = registrationsCollection.where('eventId', '==', eventId);
            const snapshot = await query.get();
            const regs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

            if (regs.length === 0) {
                return NextResponse.json({ data: [] });
            }

            // Enrich registrations with user names and event titles
            const userIds = new Set<string>();
            regs.forEach((r: any) => {
                if (r.teamLeader) userIds.add(r.teamLeader);
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

            const eventDoc = await adminDb.collection('events').doc(eventId).get();
            const eventTitle = eventDoc.data()?.title || "Unknown Event";

            data = regs.map((r: any) => {
                const leaderId = r.teamLeader;
                const leader = userMap[leaderId] || {};

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
                        phone: leader.phone || 'N/A',
                        college: leader.collegeName || leader.college || leader.institution || 'N/A'
                    });
                }

                // Add other unique members
                uniqueMemberIds.forEach((mId: any) => {
                    const m = userMap[mId];
                    if (m) {
                        membersDetails.push({
                            name: m.name || 'Unknown',
                            usn: m.usn || 'N/A',
                            phone: m.phone || 'N/A',
                            college: m.collegeName || m.college || m.institution || leader.collegeName || leader.college || 'N/A'
                        });
                    }
                });

                return {
                    id: r.id,
                    teamName: r.teamName || leader.name || "Solo",
                    leaderName: leader.name || 'Unknown',
                    leaderUSN: leader.usn || 'N/A',
                    email: leader.email || 'N/A',
                    phone: leader.phone || 'N/A',
                    college: leader.collegeName || leader.college || leader.institution || 'N/A',
                    event: eventTitle,
                    members: membersDetails.map((m: any) => `${m.name} (${m.usn})`).join(', '),
                    membersDetails: membersDetails,
                    paymentStatus: leader.hasPaid ? 'Paid' : 'Unpaid',
                    registeredAt: r.registeredAt
                };
            });
        } else if (type === 'payments') {
            const eventId = searchParams.get('eventId');
            const status = searchParams.get('status');

            let paymentsQuery: any = adminDb.collection('payments');

            // Handle Event filtering for payments (Complex because payments don't have eventId directly)
            if (eventId && eventId !== 'all') {
                const regSnapshot = await adminDb.collection('registrations').where('eventId', '==', eventId).get();
                const uids = Array.from(new Set(regSnapshot.docs.flatMap((doc: any) => {
                    const d = doc.data();
                    return [d.teamLeader, ...(d.members || [])];
                })));

                if (uids.length === 0) {
                    return NextResponse.json({ data: [] });
                }

                // Chunked 'in' filtering because of Firestore 30-item limit
                // For exports, we might need a better way if there are many UIDs
                // but for now, let's at least handle the first 30 for consistency with the UI
                paymentsQuery = paymentsQuery.where('user_id', 'in', uids.slice(0, 30));
            }

            if (status && status !== 'all') {
                paymentsQuery = paymentsQuery.where('status', '==', status);
            }

            const snapshot = await paymentsQuery.get();
            data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

            // Enrich payments with user names
            const userIds = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)));
            const userMap: Record<string, any> = {};

            for (let i = 0; i < userIds.length; i += 10) {
                const chunk = userIds.slice(i, i + 10);
                const uSnap = await usersCollection.where('__name__', 'in', chunk).get();
                uSnap.docs.forEach(d => { userMap[d.id] = d.data(); });
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
                    amount: p.amount / 100,
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
