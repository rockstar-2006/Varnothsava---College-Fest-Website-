import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";

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

        // Fetch user data from Firestore to get email for role check
        const userDoc = await usersCollection.doc(verified.uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ message: "User profile not found" }, { status: 404 });
        }
        const userData = userDoc.data();

        // Use getAdminRole which includes the strict Blacklist
        const { role, eventId } = getAdminRole(verified.email || userData?.email);

        if (!role) {
            return NextResponse.json({ message: "Forbidden: No administrative access" }, { status: 403 });
        }

        const forceLive = request.nextUrl.searchParams.get('fresh') === '1';
        const cacheTtlMs = Number(
            process.env.ADMIN_EVENT_METRICS_CACHE_TTL_MS
            || process.env.ADMIN_STATS_CACHE_TTL_MS
            || '120000'
        );

        let eventsQuery: any = adminDb.collection('events');

        // RBAC: COORDINATOR only sees assigned events
        if (role === 'COORDINATOR') {
            if (eventId && eventId !== 'all') {
                const assignedEventIds = eventId.split(',').map((id: string) => id.trim());
                if (assignedEventIds.length > 1) {
                    eventsQuery = eventsQuery.where('__name__', 'in', assignedEventIds);
                } else if (assignedEventIds.length === 1) {
                    eventsQuery = eventsQuery.where('__name__', '==', assignedEventIds[0]);
                }
            } else if (eventId !== 'all') { // if they are all, they see all
                eventsQuery = eventsQuery.where('coordinators', 'array-contains', verified.uid);
            }
        } else if (role === 'VOLUNTEER') {
            eventsQuery = eventsQuery.where('volunteers', 'array-contains', verified.uid);
        }

        const snapshot = await eventsQuery.get();

        const eventDocs = snapshot.docs;

        // Huge Read Optimization: Fetch cached metrics from system/stats (cost = 1 read)
        const statsDoc = await adminDb.collection('system').doc('stats').get();
        const globalStats = statsDoc.data() || {};
        const eventMetricsCache = globalStats.eventMetricsCache || {};
        const metricsUpdatedAtSource = typeof globalStats.eventMetricsUpdatedAt === 'string'
            ? globalStats.eventMetricsUpdatedAt
            : globalStats.updatedAt;
        const metricsUpdatedAtMs = typeof metricsUpdatedAtSource === 'string'
            ? Date.parse(metricsUpdatedAtSource)
            : NaN;
        const isCacheFresh = Number.isFinite(metricsUpdatedAtMs)
            && (Date.now() - metricsUpdatedAtMs) < cacheTtlMs;
        const canUseCachedMetrics = !forceLive && isCacheFresh;

        const refreshedMetrics: Record<string, {
            total: number;
            internal: number;
            external: number;
            participants: number;
        }> = {};

        const eventsWithMetrics = await Promise.all(eventDocs.map(async (doc: any) => {
            const data = doc.data();

            const cachedMetrics = canUseCachedMetrics ? eventMetricsCache[doc.id] : null;
            if (cachedMetrics) {
                return {
                    id: doc.id,
                    ...data,
                    metrics: {
                        total: cachedMetrics.total || 0,
                        internal: cachedMetrics.internal || 0,
                        external: cachedMetrics.external || 0,
                        participants: cachedMetrics.participants || 0
                    }
                };
            }

            // Live fallback when cache is stale/missing or explicitly requested.
            const [totalSnap, internalSnap, partSnap] = await Promise.all([
                adminDb.collection('registrations').where('eventId', '==', doc.id).count().get(),
                adminDb.collection('registrations').where('eventId', '==', doc.id).where('leaderType', '==', 'internal').count().get(),
                adminDb.collection('registrations').where('eventId', '==', doc.id).select('teamLeader', 'members').get()
            ]);

            const total = totalSnap.data().count;
            const internal = internalSnap.data().count;
            const external = total - internal;

            const uniqueP = new Set<string>();
            partSnap.docs.forEach((rDoc: any) => {
                const rData = rDoc.data();
                if (rData.teamLeader) uniqueP.add(rData.teamLeader);
                if (rData.members && Array.isArray(rData.members)) {
                    rData.members.forEach((m: string) => uniqueP.add(m));
                }
            });

            const liveMetrics = {
                total,
                internal,
                external,
                participants: uniqueP.size
            };
            refreshedMetrics[doc.id] = liveMetrics;

            return {
                id: doc.id,
                ...data,
                metrics: liveMetrics
            };
        }));

        // Persist refreshed metrics only for global roles to avoid partial coordinator cache overwrites.
        if (Object.keys(refreshedMetrics).length > 0 && role !== 'COORDINATOR' && role !== 'VOLUNTEER') {
            await adminDb.collection('system').doc('stats').set({
                eventMetricsCache: {
                    ...(globalStats.eventMetricsCache || {}),
                    ...refreshedMetrics
                },
                eventMetricsUpdatedAt: new Date().toISOString()
            }, { merge: true });
        }

        return NextResponse.json({ events: eventsWithMetrics });
    } catch (error: any) {
        console.error("Admin Events GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        // Check for SUPER_ADMIN
        const userDoc = await usersCollection.doc(verified.uid).get();
        const userData = userDoc.data();
        if (userData?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden: Only Super Admins can create events" }, { status: 403 });
        }

        const body = await request.json();
        const { event } = body;

        if (!event || !event.title) {
            return NextResponse.json({ message: "Invalid event data" }, { status: 400 });
        }

        const docRef = await adminDb.collection('events').add({
            ...event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({ id: docRef.id, message: "Event created successfully" });
    } catch (error: any) {
        console.error("Admin Events POST Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
