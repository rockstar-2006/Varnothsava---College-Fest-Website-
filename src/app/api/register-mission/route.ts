import { registrationsCollection, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";
import { missions } from "@/data/missions";

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
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

        const { eventId, teamName, members } = await request.json();

        if (!eventId || !teamName) {
            return NextResponse.json({ message: "Missing registration details." }, { status: 400 });
        }

        if(!teamName.trim() || teamName.trim().length < 2 || teamName.trim().length > 50) {
            return NextResponse.json({message: "Team name must be 2-50 characters"}, {status: 400});
        }

        if (!usersCollection) {
            return NextResponse.json({ message: "Database Error." }, { status: 500 });
        }

        const mission = missions.find(m => m.id === eventId);
        if (!mission) {
            return NextResponse.json({ message: "Invalid mission ID." }, { status: 400 });
        }

        const isTeamEvent = mission.maxTeamSize > 1;

        if(!members || !Array.isArray(members) || members.length < mission.minTeamSize || members.length > mission.maxTeamSize) {
            return NextResponse.json({ message: `Invalid number of members for this event. Required: ${mission.minTeamSize} - ${mission.maxTeamSize}.` }, { status: 400 });
        }

        let memberIds: string[] = [];
        for (const memberCode of members) {
            const memberDoc = await usersCollection.where('profileCode', '==', memberCode).get();
            if (memberDoc.empty) {
                return NextResponse.json({ message: `Member with profile code ${memberCode} not found.` }, { status: 400 });
            }
            const memberData = memberDoc.docs[0].data();
            if(memberData.hasPaid !== true) {
                return NextResponse.json({ message: `Member with profile code ${memberCode} has not completed payment.` }, { status: 400 });
            }
            if(memberData.id === verified.uid) {
                if(eventId === "TECH-008" && memberData.hasRoboSoccer !== true) {
                    return NextResponse.json({ message: `Team leader with profile code ${memberCode} has not paid for Robo Soccer registration.` }, { status: 400 });
                }
            }
            let existingRegistration = await registrationsCollection.where('eventId', '==', eventId).where('members', 'array-contains', memberData.id).get();
            if (!existingRegistration.empty) {
                return NextResponse.json({ message: `Member with profile code ${memberCode} is already registered for this event.` }, { status: 400 });
            }
            memberIds.push(memberData.id);
        }

        // Verify team leader is in the members list
        if (!memberIds.includes(verified.uid)) {
            return NextResponse.json({ message: "Team leader must be included in the members list." }, { status: 400 });
        }

        const registrationData = {
            eventId,
            teamName,
            teamLeader: verified.uid,
            members: memberIds,
            eventType: isTeamEvent ? "GROUP" : "SOLO",
            registeredAt: new Date().toISOString()
        };

        const registrationDoc = await registrationsCollection.add(registrationData);

        return NextResponse.json({
            message: "Mission registration successful.",
            registrationId: registrationDoc.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Mission Registration Error:", error);
        return NextResponse.json({
            message: "Registration failed",
            detail: error.message
        }, { status: 500 });
    }
}
