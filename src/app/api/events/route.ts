import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { missions } from "@/data/missions";

export async function GET() {
    try {
        // Fetch admin-controlled data from Firestore
        const eventsSnapshot = await adminDb.collection('events').get();
        const adminEventsData: Record<string, any> = {};

        eventsSnapshot.docs.forEach(doc => {
            adminEventsData[doc.id] = doc.data();
        });

        // Merge static mission data with admin-controlled data (status, etc.)
        const eventsWithStatus = missions.map(mission => ({
            ...mission,
            registrationStatus: adminEventsData[mission.id]?.registrationStatus || 'open',
            // Include all other Firestore fields if they exist
            ...Object.keys(adminEventsData[mission.id] || {})
                .reduce((acc, key) => {
                    if (key !== 'registrationStatus' && key !== 'date') {
                        acc[key] = adminEventsData[mission.id][key];
                    }
                    return acc;
                }, {} as Record<string, any>)
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
