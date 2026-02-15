import { registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";
import { missions } from "@/data/missions";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: registrationId } = await params;

        if (!registrationsCollection || !usersCollection) {
            return NextResponse.json({ message: "Database Error." }, { status: 500 });
        }

        // Fetch registration
        const registrationDoc = await registrationsCollection.doc(registrationId).get();
        
        if (!registrationDoc.exists) {
            return NextResponse.json({ message: "Registration not found." }, { status: 404 });
        }

        const registrationData = registrationDoc.data();
        if (!registrationData) {
            return NextResponse.json({ message: "Invalid registration data." }, { status: 400 });
        }

        // Verify user is part of this registration
        if (!registrationData.members.includes(verified.uid)) {
            return NextResponse.json({ message: "Unauthorized: You are not part of this registration." }, { status: 403 });
        }

        // Fetch event details from missions
        const event = missions.find(m => m.id === registrationData.eventId);
        if (!event) {
            return NextResponse.json({ message: "Event not found." }, { status: 404 });
        }

        // Fetch all member details
        const memberDetails = await Promise.all(
            registrationData.members.map(async (memberId: string) => {
                const userDoc = await usersCollection.doc(memberId).get();
                if (!userDoc.exists) return null;
                const userData = userDoc.data();
                if (!userData) return null;
                return {
                    id: userData.id,
                    name: userData.name,
                    profileCode: userData.profileCode,
                    collegeName: userData.collegeName,
                    avatar: userData.avatar,
                    isLeader: userData.id === registrationData.teamLeader
                };
            })
        );

        const validMembers = memberDetails.filter(m => m !== null);

        const response = {
            registrationId: registrationDoc.id,
            eventId: registrationData.eventId,
            eventName: event.title,
            eventType: event.maxTeamSize > 1 ? "Group" : "Solo",
            eventCategory: event.type,
            eventVisual: event.visual,
            teamName: registrationData.teamName,
            teamType: registrationData.teamType || (validMembers.length > 1 ? "GROUP" : "SOLO"),
            teamLeader: registrationData.teamLeader,
            members: validMembers,
            memberCount: validMembers.length,
            registeredAt: registrationData.registeredAt,
            isTeamLeader: verified.uid === registrationData.teamLeader
        };

        return NextResponse.json({ registration: response }, { status: 200 });

    } catch (error: any) {
        console.error("Registration Details Error:", error);
        return NextResponse.json({
            message: "Failed to fetch registration details",
            detail: error.message
        }, { status: 500 });
    }
}
