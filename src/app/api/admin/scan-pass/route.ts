import { registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";
import { missions } from "@/data/missions";

export async function GET(request: NextRequest) {
    try {
        const clientId = getClientIdentifier(request);
        const rateLimitResult = await checkApiRateLimit(clientId);
        if (!rateLimitResult.success) {
            return NextResponse.json({ message: "Too many requests" }, { status: 429 });
        }

        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized: Missing token." }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized: Invalid token." }, { status: 401 });
        }

        // Must be an admin
        const adminDoc = await usersCollection?.doc(verified.uid).get();
        const adminRole = adminDoc?.data()?.role;
        if (!adminRole || !['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER'].includes(adminRole)) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ message: "Code parameter is required." }, { status: 400 });
        }

        if (!usersCollection || !registrationsCollection) {
            return NextResponse.json({ message: "Database Error." }, { status: 500 });
        }

        // Query by profileCode
        const snapshot = await usersCollection.where('profileCode', '==', code.toUpperCase()).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ message: "Pass not found." }, { status: 404 });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Selective data return
        const publicUser = {
            id: userId,
            name: userData.name,
            email: userData.email,
            collegeName: userData.collegeName,
            phone: userData.phone,
            usn: userData.usn,
            hasPaid: userData.hasPaid,
            avatar: userData.avatar,
            profileCode: userData.profileCode,
            studentType: userData.studentType,
            registeredEventsCount: userData.registeredEvents?.length || 0
        };

        // Fetch Registrations where this user is a member
        const registrationsQuery = await registrationsCollection.where('members', 'array-contains', userId).get();

        const registrationsList = await Promise.all(registrationsQuery.docs.map(async (regDoc) => {
            const regData = regDoc.data();
            const event = missions.find(m => m.id === regData.eventId);

            // Reconstruct full team members
            const memberDetails = await Promise.all(
                (regData.members || []).map(async (memberId: string) => {
                    const mDoc = await usersCollection.doc(memberId).get();
                    if (!mDoc.exists) return null;
                    const mData = mDoc.data()!;
                    return {
                        id: mDoc.id,
                        name: mData.name,
                        profileCode: mData.profileCode,
                        usn: mData.usn,
                        hasPaid: mData.hasPaid,
                        collegeName: mData.collegeName,
                        isLeader: mDoc.id === regData.teamLeader
                    };
                })
            );

            return {
                registrationId: regDoc.id,
                eventId: regData.eventId,
                eventName: event?.title || "Unknown Event",
                eventCategory: event?.type || "General",
                teamName: regData.teamName,
                registeredAt: regData.registeredAt,
                members: memberDetails.filter(m => m !== null)
            };
        }));

        return NextResponse.json({
            user: publicUser,
            registrations: registrationsList
        }, { status: 200 });

    } catch (error: any) {
        console.error("Scan API Error:", error);
        return NextResponse.json({ message: "Server Error", detail: error.message }, { status: 500 });
    }
}
