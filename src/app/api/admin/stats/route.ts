import { adminDb, verifyAuthToken, usersCollection } from "@/lib/firebaseAdmin";
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
        const role = userDoc.data()?.role;

        if (!role || !['SUPER_ADMIN', 'FINANCE', 'COORDINATOR'].includes(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Strategy 4: Summary Document Fetch
        const statsRef = adminDb.collection('system').doc('stats');
        const statsDoc = await statsRef.get();

        if (!statsDoc.exists) {
            // INITIALIZATION: If stats doc doesn't exist, calculate it once (expensive, but only happens once)
            // Strategy 3: count() for initialization
            const [usersSnap, internalSnap, paidSnap, regSnap] = await Promise.all([
                usersCollection.count().get(),
                usersCollection.where('studentType', '==', 'internal').count().get(),
                usersCollection.where('hasPaid', '==', true).count().get(),
                adminDb.collection('registrations').count().get()
            ]);

            const initialStats = {
                totalUsers: usersSnap.data().count,
                internalUsers: internalSnap.data().count,
                externalUsers: usersSnap.data().count - internalSnap.data().count,
                paidUsers: paidSnap.data().count,
                unpaidUsers: usersSnap.data().count - paidSnap.data().count,
                totalRegistrations: regSnap.data().count,
                initializedAt: new Date().toISOString()
            };

            await statsRef.set(initialStats);
            return NextResponse.json({ stats: initialStats });
        }

        return NextResponse.json({ stats: statsDoc.data() });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
