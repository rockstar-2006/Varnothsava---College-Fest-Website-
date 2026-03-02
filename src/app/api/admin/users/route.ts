import { adminDb, usersCollection, verifyAuthToken, setAdminRole } from "@/lib/firebaseAdmin";
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

        // 1. Fetch all events to find assignments
        const eventsSnapshot = await adminDb.collection('events').get();
        const eventMap: Record<string, any[]> = {}; // uid -> [{title, type, date}]

        eventsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const coordinators = data.coordinators || [];
            coordinators.forEach((identifier: string) => {
                // Store by raw identifier (UID or Name)
                if (!eventMap[identifier]) eventMap[identifier] = [];
                eventMap[identifier].push({
                    id: doc.id,
                    title: data.title || 'Untitled Event',
                    type: data.type || 'Other',
                    date: data.date || 'TBD'
                });

                // Also store a case-insensitive name key
                const lowerName = identifier.toLowerCase();
                if (!eventMap[lowerName]) eventMap[lowerName] = [];
                // Avoid duplicating if the identifier was already lowercase
                if (lowerName !== identifier) {
                    eventMap[lowerName].push({
                        id: doc.id,
                        title: data.title || 'Untitled Event',
                        type: data.type || 'Other',
                        date: data.date || 'TBD'
                    });
                }
            });
        });

        const usersSnapshot = await usersCollection.get();
        const users = usersSnapshot.docs.map((doc: any) => {
            const data = doc.data();
            const role = data.role || 'USER';

            // Only return the coordinator details the user wants
            if (!['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER', 'FINANCE'].includes(role) && userData?.role !== 'SUPER_ADMIN') {
                return null;
            }

            // Match by UID and by Name (case-insensitive)
            const eventsByUid = eventMap[doc.id] || [];
            const eventsByName = eventMap[data.name?.toLowerCase()] || [];

            // Deduplicate events by ID
            const combinedEventsMap = new Map();
            [...eventsByUid, ...eventsByName].forEach(evt => {
                combinedEventsMap.set(evt.id, evt);
            });

            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                role: role,
                usn: data.usn,
                phone: data.phone,
                collegeName: data.collegeName,
                assignedEvents: Array.from(combinedEventsMap.values())
            };
        }).filter(Boolean);

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
