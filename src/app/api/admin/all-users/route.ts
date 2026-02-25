import { usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
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

        const search = request.nextUrl.searchParams.get('search') || '';

        // Simple search logic: if search exists, we might need a different approach 
        // as Firestore doesn't support partial string match easily.
        // For now, we fetch a limited set and filter or use direct USN match if possible.

        let query: any = usersCollection.orderBy('name').limit(100);

        const snapshot = await query.get();
        let users = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        if (search) {
            const s = search.toLowerCase();
            users = users.filter((u: any) =>
                u.name?.toLowerCase().includes(s) ||
                u.email?.toLowerCase().includes(s) ||
                u.usn?.toLowerCase().includes(s)
            );
        }

        return NextResponse.json({ users });

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
        if (updates.hasPaid !== undefined) allowedUpdates.hasPaid = updates.hasPaid;
        if (updates.isBlocked !== undefined) allowedUpdates.isBlocked = updates.isBlocked;
        if (updates.role !== undefined) allowedUpdates.role = updates.role;

        await usersCollection.doc(userId).update(allowedUpdates);

        return NextResponse.json({ message: "User updated successfully" });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
