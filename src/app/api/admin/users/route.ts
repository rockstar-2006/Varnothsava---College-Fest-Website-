import { usersCollection, verifyAuthToken, setAdminRole } from "@/lib/firebaseAdmin";
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
        if (userData?.role !== 'SUPER_ADMIN') {
            // If not super admin, only return "staff" roles
            const snapshot = await usersCollection.get();
            const staff = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    role: data.role
                };
            }).filter(u => ['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER', 'FINANCE'].includes(u.role || ''));
            return NextResponse.json({ users: staff });
        }

        // Full user list for SUPER_ADMIN
        const snapshot = await usersCollection.get();
        const users = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                role: data.role || 'USER',
                usn: data.usn,
                collegeName: data.collegeName
            };
        });

        return NextResponse.json({ users });
    } catch (error: any) {
        console.error("Admin Users GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Only SUPER_ADMIN can change roles
        const adminDoc = await usersCollection.doc(verified.uid).get();
        if (adminDoc.data()?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { userId, role } = await request.json();

        // Security check: Prevent modifying existing SUPER_ADMIN
        const targetUserDoc = await usersCollection.doc(userId).get();
        if (targetUserDoc.exists && targetUserDoc.data()?.role === 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Cannot modify Super Admin accounts" }, { status: 403 });
        }

        // Security check: Prevent assigning SUPER_ADMIN role
        if (role === 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Cannot assign Super Admin role via this interface" }, { status: 403 });
        }

        if (!['COORDINATOR', 'FINANCE', 'VOLUNTEER', 'USER', 'ADMIN'].includes(role)) {
            return NextResponse.json({ message: "Invalid role" }, { status: 400 });
        }

        // 1. Update Custom Claims in Firebase Auth
        const claimsSet = await setAdminRole(userId, role);
        if (!claimsSet) {
            return NextResponse.json({ message: "Failed to set custom claims" }, { status: 500 });
        }

        // 2. Update Firestore document
        await usersCollection.doc(userId).update({
            role: role,
            isAdmin: ['SUPER_ADMIN', 'COORDINATOR', 'FINANCE', 'VOLUNTEER', 'ADMIN'].includes(role)
        });

        return NextResponse.json({ message: "User role updated successfully" });
    } catch (error: any) {
        console.error("Admin Users PATCH Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
