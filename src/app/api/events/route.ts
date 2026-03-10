import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { missions } from "@/data/missions";

export async function GET() {
    try {
        // Fetch admin-controlled registration status from Firestore
        const eventsSnapshot = await adminDb.collection('events').get();
        const adminEventsData: Record<string, any> = {};

        eventsSnapshot.docs.forEach(doc => {
            adminEventsData[doc.id] = doc.data();
        });

        // Merge static mission data with admin-controlled registration status
        const eventsWithStatus = missions.map(mission => ({
            ...mission,
            registrationStatus: adminEventsData[mission.id]?.registrationStatus || 'open'
        }));

        return NextResponse.json({
            events: eventsWithStatus
        });
    } catch (error: any) {
        console.error("Error fetching events:", error);
        // Fallback to static data if Firestore fails
        return NextResponse.json({
            events: missions
        });
    }
}
