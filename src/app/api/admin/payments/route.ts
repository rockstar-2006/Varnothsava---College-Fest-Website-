import { adminDb, usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";

type StatusKey = 'captured' | 'failed' | 'authorized' | 'other';
type TypeKey = 'all' | 'internal' | 'external';

interface StatusCounts {
    all: number;
    captured: number;
    failed: number;
    authorized: number;
    other: number;
}

interface TypeCounts {
    all: number;
    internal: number;
    external: number;
}

interface PaymentFilterCounts {
    status: StatusCounts;
    type: TypeCounts;
}

interface PaymentCountMatrix {
    statusByType: Record<TypeKey, StatusCounts>;
    typeByStatus: {
        all: TypeCounts;
        captured: TypeCounts;
        failed: TypeCounts;
        authorized: TypeCounts;
        other: TypeCounts;
    };
}

interface PaymentFilterMatrixCacheEntry {
    expiresAt: number;
    matrix: PaymentCountMatrix;
}

interface PaymentsListResponse {
    payments: any[];
    totalCount: number | null;
    lastId: string | null;
    hasMore: boolean;
    filterCounts: PaymentFilterCounts | null;
}

interface PaymentResponseCacheEntry {
    expiresAt: number;
    payload: PaymentsListResponse;
}

const PAYMENT_FILTER_MATRIX_TTL_MS = Number(process.env.ADMIN_PAYMENTS_FILTER_MATRIX_TTL_MS || '60000');
const PAYMENT_RESPONSE_CACHE_TTL_MS = Number(process.env.ADMIN_PAYMENTS_RESPONSE_CACHE_TTL_MS || '10000');
const paymentFilterMatrixCache = new Map<string, PaymentFilterMatrixCacheEntry>();
const paymentResponseCache = new Map<string, PaymentResponseCacheEntry>();

const createEmptyStatusCounts = (): StatusCounts => ({
    all: 0,
    captured: 0,
    failed: 0,
    authorized: 0,
    other: 0,
});

const createEmptyTypeCounts = (): TypeCounts => ({
    all: 0,
    internal: 0,
    external: 0,
});

const normalizeUserId = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const createEmptyFilterCounts = (): PaymentFilterCounts => ({
    status: createEmptyStatusCounts(),
    type: createEmptyTypeCounts(),
});

const createEmptyCountMatrix = (): PaymentCountMatrix => ({
    statusByType: {
        all: createEmptyStatusCounts(),
        internal: createEmptyStatusCounts(),
        external: createEmptyStatusCounts(),
    },
    typeByStatus: {
        all: createEmptyTypeCounts(),
        captured: createEmptyTypeCounts(),
        failed: createEmptyTypeCounts(),
        authorized: createEmptyTypeCounts(),
        other: createEmptyTypeCounts(),
    },
});

const incrementCountMatrix = (
    matrix: PaymentCountMatrix,
    type: 'internal' | 'external',
    statusKey: StatusKey,
) => {
    matrix.statusByType.all.all += 1;
    matrix.statusByType.all[statusKey] += 1;
    matrix.statusByType[type].all += 1;
    matrix.statusByType[type][statusKey] += 1;

    matrix.typeByStatus.all.all += 1;
    matrix.typeByStatus.all[type] += 1;
    matrix.typeByStatus[statusKey].all += 1;
    matrix.typeByStatus[statusKey][type] += 1;
};

const getStatusKey = (status: unknown): StatusKey => {
    const normalized = typeof status === 'string' ? status.toLowerCase() : '';
    if (normalized === 'captured') return 'captured';
    if (normalized === 'failed') return 'failed';
    if (normalized === 'authorized') return 'authorized';
    return 'other';
};

const resolveStudentType = (user: Record<string, any> | null | undefined): 'internal' | 'external' => {
    if (!user) return 'external';

    const college = (user.collegeName || user.college || user.institution || '').toUpperCase();
    const email = (user.email || '').toLowerCase();

    const isInternal = user.studentType === 'internal' ||
        college.includes('SMVITM') ||
        college.includes('SODE') ||
        college.includes('SHRI MADHWA VADIRAJA') ||
        college.includes('SHRI MADHWA') ||
        college.includes('VADIRAJA') ||
        email.endsWith('@sode-edu.in');

    return isInternal ? 'internal' : 'external';
};

const hashString = (value: string): string => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
};

const buildMatrixCacheKey = (params: {
    role: string;
    uid: string;
    eventId: string | null;
    search: string;
    dateFilter: string | null;
    filterUserIds: string[] | null;
}) => {
    const sortedIds = params.filterUserIds ? [...params.filterUserIds].sort() : [];
    const idSegment = sortedIds.length > 0
        ? `${sortedIds.length}:${hashString(sortedIds.join(','))}`
        : 'none';

    return [
        params.role,
        params.uid,
        params.eventId || 'all',
        params.search.trim().toLowerCase() || '-',
        params.dateFilter || 'all',
        idSegment,
    ].join('|');
};

const getCachedCountMatrix = (key: string): PaymentCountMatrix | null => {
    const cached = paymentFilterMatrixCache.get(key);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
        paymentFilterMatrixCache.delete(key);
        return null;
    }
    return cached.matrix;
};

const setCachedCountMatrix = (key: string, matrix: PaymentCountMatrix) => {
    if (paymentFilterMatrixCache.size > 120) {
        const now = Date.now();
        for (const [cacheKey, entry] of paymentFilterMatrixCache.entries()) {
            if (entry.expiresAt < now) paymentFilterMatrixCache.delete(cacheKey);
        }
        if (paymentFilterMatrixCache.size > 120) {
            paymentFilterMatrixCache.clear();
        }
    }

    paymentFilterMatrixCache.set(key, {
        expiresAt: Date.now() + PAYMENT_FILTER_MATRIX_TTL_MS,
        matrix,
    });
};

const buildResponseCacheKey = (params: {
    role: string;
    uid: string;
    eventId: string | null;
    status: string | null;
    search: string;
    studentType: string | null;
    dateFilter: string | null;
    lastId: string;
    limit: number;
    skipCounts: boolean;
}) => {
    return [
        params.role,
        params.uid,
        params.eventId || 'all',
        params.status || 'all',
        params.search.trim().toLowerCase() || '-',
        params.studentType || 'all',
        params.dateFilter || 'all',
        params.lastId || '-',
        String(params.limit),
        params.skipCounts ? 'skip' : 'full',
    ].join('|');
};

const getCachedPaymentsResponse = (key: string): PaymentsListResponse | null => {
    const cached = paymentResponseCache.get(key);
    if (!cached) return null;

    if (cached.expiresAt < Date.now()) {
        paymentResponseCache.delete(key);
        return null;
    }

    return cached.payload;
};

const setCachedPaymentsResponse = (key: string, payload: PaymentsListResponse) => {
    if (paymentResponseCache.size > 200) {
        const now = Date.now();
        for (const [cacheKey, entry] of paymentResponseCache.entries()) {
            if (entry.expiresAt < now) paymentResponseCache.delete(cacheKey);
        }

        if (paymentResponseCache.size > 200) {
            paymentResponseCache.clear();
        }
    }

    paymentResponseCache.set(key, {
        expiresAt: Date.now() + PAYMENT_RESPONSE_CACHE_TTL_MS,
        payload,
    });
};

const respondWithOptionalCache = (cacheKey: string | null, payload: PaymentsListResponse) => {
    if (cacheKey) {
        setCachedPaymentsResponse(cacheKey, payload);
    }
    return NextResponse.json(payload);
};

const deriveFilterCounts = (
    matrix: PaymentCountMatrix,
    selectedType: string | null,
    selectedStatus: string | null,
): PaymentFilterCounts => {
    const typeKey: TypeKey = selectedType === 'internal' || selectedType === 'external'
        ? selectedType
        : 'all';

    const statusKey = selectedStatus && selectedStatus !== 'all'
        ? getStatusKey(selectedStatus)
        : 'all';

    return {
        status: { ...matrix.statusByType[typeKey] },
        type: { ...matrix.typeByStatus[statusKey] },
    };
};

async function buildPaymentCountMatrix(payments: any[]): Promise<PaymentCountMatrix> {
    const matrix = createEmptyCountMatrix();
    if (payments.length === 0) return matrix;

    const userIds = Array.from(
        new Set(
            payments
                .map((p) => normalizeUserId(p.user_id))
                .filter((id): id is string => id !== null)
        )
    );

    const userMap: Record<string, any> = {};

    for (let i = 0; i < userIds.length; i += 10) {
        const chunk = userIds.slice(i, i + 10);
        if (chunk.length === 0) continue;

        const snap = await adminDb.collection('users').where('__name__', 'in', chunk).get();
        snap.docs.forEach((doc) => {
            userMap[doc.id] = doc.data();
        });
    }

    payments.forEach((payment) => {
        const normalizedId = normalizeUserId(payment.user_id);
        const type = resolveStudentType(normalizedId ? userMap[normalizedId] : null);
        const statusKey = getStatusKey(payment.status);

        incrementCountMatrix(matrix, type, statusKey);
    });

    return matrix;
}

function buildPaymentCountMatrixFromEnriched(enrichedPayments: any[]): PaymentCountMatrix {
    const matrix = createEmptyCountMatrix();
    if (enrichedPayments.length === 0) return matrix;

    enrichedPayments.forEach((payment) => {
        const type = payment.studentType === 'internal' ? 'internal' : 'external';
        const statusKey = getStatusKey(payment.status);
        incrementCountMatrix(matrix, type, statusKey);
    });

    return matrix;
}

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
        if (!userDoc.exists) {
            return NextResponse.json({ message: "User profile not found" }, { status: 404 });
        }
        const userData = userDoc.data();

        // Use getAdminRole for strict blacklist enforcement
        const { role } = getAdminRole(verified.email || userData?.email);

        // Fallback to database role only if not blacklisted (getAdminRole handles this)
        if (!role) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const status = searchParams.get('status');
        const search = searchParams.get('search') || '';
        const lastId = searchParams.get('lastId') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        const skipCounts = searchParams.get('skipCounts') === '1';
        const studentType = searchParams.get('studentType');
        const dateFilter = searchParams.get('dateFilter');

        const responseCacheKey = (!skipCounts && !lastId)
            ? buildResponseCacheKey({
                role,
                uid: verified.uid,
                eventId: eventId && eventId !== 'all' ? eventId : null,
                status,
                search,
                studentType,
                dateFilter,
                lastId,
                limit,
                skipCounts,
            })
            : null;

        if (responseCacheKey) {
            const cachedResponse = getCachedPaymentsResponse(responseCacheKey);
            if (cachedResponse) {
                return NextResponse.json(cachedResponse);
            }
        }

        let paymentsBaseQuery: any = adminDb.collection('payments');

        // Apply Search (Global Database Search)
        let searchUids: string[] | null = null;
        if (search) {
            // MULTI-FIELD SEARCH (Name, Email) - Following pattern from all-users
            const nameSearchTerm = search;
            const capitalizedSearchTerm = search.charAt(0).toUpperCase() + search.slice(1);
            const upperSearchTerm = search.toUpperCase();

            const nameQuery = usersCollection.orderBy('name').startAt(nameSearchTerm).endAt(nameSearchTerm + '\uf8ff').limit(30).get();
            const capitalizedNameQuery = usersCollection.orderBy('name').startAt(capitalizedSearchTerm).endAt(capitalizedSearchTerm + '\uf8ff').limit(30).get();
            const emailQuery = usersCollection.orderBy('email').startAt(search.toLowerCase()).endAt(search.toLowerCase() + '\uf8ff').limit(30).get();

            const [nameSnap, capNameSnap, emailSnap] = await Promise.all([nameQuery, capitalizedNameQuery, emailQuery]);

            const userMap = new Set<string>();
            nameSnap.docs.forEach(d => userMap.add(d.id));
            capNameSnap.docs.forEach(d => userMap.add(d.id));
            emailSnap.docs.forEach(d => userMap.add(d.id));

            // Search by UTR/transaction IDs and map matching payments back to user IDs.
            const paymentSearchSnapshots = await Promise.allSettled([
                adminDb.collection('payments')
                    .orderBy('notes.upi_transaction_id')
                    .startAt(upperSearchTerm)
                    .endAt(upperSearchTerm + '\uf8ff')
                    .limit(30)
                    .get(),
                adminDb.collection('payments')
                    .orderBy('payment_method_details.upi_transaction_id')
                    .startAt(upperSearchTerm)
                    .endAt(upperSearchTerm + '\uf8ff')
                    .limit(30)
                    .get(),
                adminDb.collection('payments')
                    .orderBy('transactionId')
                    .startAt(search)
                    .endAt(search + '\uf8ff')
                    .limit(30)
                    .get(),
            ]);

            paymentSearchSnapshots.forEach((result) => {
                if (result.status !== 'fulfilled') {
                    return;
                }

                result.value.docs.forEach((doc: any) => {
                    const normalizedUserId = normalizeUserId(doc.data()?.user_id);
                    if (normalizedUserId) {
                        userMap.add(normalizedUserId);
                    }
                });
            });

            searchUids = Array.from(userMap);

            if (searchUids.length === 0) {
                if (search.startsWith('pay_')) {
                    const singlePay = await adminDb.collection('payments').doc(search).get();
                    if (singlePay.exists) {
                        return respondWithOptionalCache(responseCacheKey, {
                            payments: await enrichPaymentsArray([{ id: singlePay.id, ...singlePay.data() }]),
                            totalCount: 1,
                            lastId: null,
                            hasMore: false,
                            filterCounts: skipCounts ? null : createEmptyFilterCounts(),
                        });
                    }
                }
                return respondWithOptionalCache(responseCacheKey, {
                    payments: [],
                    totalCount: 0,
                    hasMore: false,
                    filterCounts: skipCounts ? null : createEmptyFilterCounts(),
                    lastId: null,
                });
            }
        }

        // Build participant scope from registrations because payment docs may not include eventId.
        let scopedParticipantIds: string[] | null = null;
        if (role === 'COORDINATOR' || (eventId && eventId !== 'all')) {
            let filterEventIds: string[] = [];

            if (role === 'COORDINATOR') {
                const eventsSnapshot = await adminDb.collection('events')
                    .where('coordinators', 'array-contains', verified.uid)
                    .get();
                const assignedEventIds = eventsSnapshot.docs.map(doc => doc.id);

                if (assignedEventIds.length === 0) {
                    return respondWithOptionalCache(responseCacheKey, {
                        payments: [],
                        totalCount: 0,
                        hasMore: false,
                        filterCounts: skipCounts ? null : createEmptyFilterCounts(),
                        lastId: null,
                    });
                }

                if (eventId && eventId !== 'all') {
                    if (!assignedEventIds.includes(eventId)) {
                        return NextResponse.json({ message: "Forbidden: Not assigned to this event" }, { status: 403 });
                    }
                    filterEventIds = [eventId];
                } else {
                    filterEventIds = assignedEventIds;
                }
            } else if (eventId && eventId !== 'all') {
                filterEventIds = [eventId];
            }

            const participantSet = new Set<string>();

            if (filterEventIds.length === 1) {
                const regSnap = await adminDb.collection('registrations')
                    .where('eventId', '==', filterEventIds[0])
                    .select('teamLeader', 'members')
                    .get();

                regSnap.docs.forEach((doc: any) => {
                    const data = doc.data();
                    if (data.teamLeader) participantSet.add(data.teamLeader);
                    (data.members || []).forEach((m: string) => {
                        if (typeof m === 'string' && m.trim().length > 0) {
                            participantSet.add(m);
                        }
                    });
                });
            } else if (filterEventIds.length > 1 && filterEventIds.length <= 30) {
                const regSnap = await adminDb.collection('registrations')
                    .where('eventId', 'in', filterEventIds)
                    .select('teamLeader', 'members')
                    .get();

                regSnap.docs.forEach((doc: any) => {
                    const data = doc.data();
                    if (data.teamLeader) participantSet.add(data.teamLeader);
                    (data.members || []).forEach((m: string) => {
                        if (typeof m === 'string' && m.trim().length > 0) {
                            participantSet.add(m);
                        }
                    });
                });
            } else if (filterEventIds.length > 30) {
                const allRegs = await adminDb.collection('registrations')
                    .select('eventId', 'teamLeader', 'members')
                    .get();
                const allowedEvents = new Set(filterEventIds);

                allRegs.docs.forEach((doc: any) => {
                    const data = doc.data();
                    if (!allowedEvents.has(data.eventId)) return;
                    if (data.teamLeader) participantSet.add(data.teamLeader);
                    (data.members || []).forEach((m: string) => {
                        if (typeof m === 'string' && m.trim().length > 0) {
                            participantSet.add(m);
                        }
                    });
                });
            }

            scopedParticipantIds = Array.from(participantSet);
            if (scopedParticipantIds.length === 0) {
                return respondWithOptionalCache(responseCacheKey, {
                    payments: [],
                    totalCount: 0,
                    hasMore: false,
                    filterCounts: skipCounts ? null : createEmptyFilterCounts(),
                    lastId: null,
                });
            }
        }

        let filterUserIds: string[] | null = null;
        if (searchUids && scopedParticipantIds) {
            const scopedSet = new Set(scopedParticipantIds);
            filterUserIds = searchUids.filter((uid) => scopedSet.has(uid));
        } else if (searchUids) {
            filterUserIds = searchUids;
        } else if (scopedParticipantIds) {
            filterUserIds = scopedParticipantIds;
        }

        if (filterUserIds) {
            filterUserIds = Array.from(
                new Set(
                    filterUserIds
                        .map((uid) => normalizeUserId(uid))
                        .filter((uid): uid is string => uid !== null)
                )
            );
        }

        if (filterUserIds && filterUserIds.length === 0) {
            return respondWithOptionalCache(responseCacheKey, {
                payments: [],
                totalCount: 0,
                hasMore: false,
                filterCounts: skipCounts ? null : createEmptyFilterCounts(),
                lastId: null,
            });
        }

        if (dateFilter === 'new') {
            // Fetch payments from March 11th 2026 onwards
            paymentsBaseQuery = paymentsBaseQuery.where('created_at', '>=', '2026-03-11T00:00:00.000Z');
        }

        let paymentsQuery: any = paymentsBaseQuery;

        if (status && status !== 'all') {
            paymentsQuery = paymentsQuery.where('status', '==', status);
        }

        const hasStudentTypeFilter = studentType === 'internal' || studentType === 'external';
        const requiresManualFiltering = hasStudentTypeFilter
            || (filterUserIds !== null && filterUserIds.length > 30);

        const matrixCacheKey = buildMatrixCacheKey({
            role,
            uid: verified.uid,
            eventId: eventId && eventId !== 'all' ? eventId : null,
            search,
            dateFilter,
            filterUserIds,
        });

        let countMatrix: PaymentCountMatrix | null = skipCounts ? null : getCachedCountMatrix(matrixCacheKey);
        let filterCounts: PaymentFilterCounts | null = (countMatrix && !skipCounts)
            ? deriveFilterCounts(countMatrix, studentType, status)
            : null;

        // Fast path for simple search filters within Firestore 'in' limits.
        if (!requiresManualFiltering && filterUserIds && filterUserIds.length > 0) {
            paymentsQuery = paymentsQuery.where('user_id', 'in', filterUserIds);
        }

        // Complex filter fallback (large coordinator event scopes or studentType filter).
        if (requiresManualFiltering) {
            const broadSnapshot = await paymentsQuery.get();
            let allPayments = broadSnapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));

            if (filterUserIds) {
                const allowedUids = new Set(filterUserIds);
                allPayments = allPayments.filter((p: any) => {
                    const normalized = normalizeUserId(p.user_id);
                    return normalized ? allowedUids.has(normalized) : false;
                });
            }

            let enrichedAll = await enrichPaymentsArray(allPayments);

            if (!skipCounts && !countMatrix) {
                // If status is selected, manual list query is already status-scoped;
                // matrix must come from base scope (all statuses) for accurate dropdown counts.
                if (status && status !== 'all') {
                    const baseSnapshot = await paymentsBaseQuery.get();
                    let paymentsForMatrix = baseSnapshot.docs.map((doc: any) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    if (filterUserIds) {
                        const allowedUids = new Set(filterUserIds);
                        paymentsForMatrix = paymentsForMatrix.filter((p: any) => {
                            const normalized = normalizeUserId(p.user_id);
                            return normalized ? allowedUids.has(normalized) : false;
                        });
                    }

                    const enrichedMatrixScope = await enrichPaymentsArray(paymentsForMatrix);
                    countMatrix = buildPaymentCountMatrixFromEnriched(enrichedMatrixScope);
                } else {
                    countMatrix = buildPaymentCountMatrixFromEnriched(enrichedAll);
                }

                setCachedCountMatrix(matrixCacheKey, countMatrix);
                filterCounts = deriveFilterCounts(countMatrix, studentType, status);
            }

            if (hasStudentTypeFilter) {
                enrichedAll = enrichedAll.filter((p: any) => p.studentType === studentType);
            }

            enrichedAll.sort((a: any, b: any) => {
                const dateA = a.created_at || a.paid_at || '';
                const dateB = b.created_at || b.paid_at || '';
                return dateB.localeCompare(dateA);
            });

            let startIndex = 0;
            if (lastId) {
                const prevIndex = enrichedAll.findIndex((p: any) => p.id === lastId);
                if (prevIndex !== -1) startIndex = prevIndex + 1;
            }

            const paged = enrichedAll.slice(startIndex, startIndex + limit);

            return respondWithOptionalCache(responseCacheKey, {
                payments: paged,
                totalCount: skipCounts ? null : enrichedAll.length,
                lastId: paged.length > 0 ? paged[paged.length - 1].id : null,
                hasMore: (startIndex + limit) < enrichedAll.length,
                filterCounts,
            });
        }

        if (!skipCounts && !countMatrix) {
            let matrixQuery: any = paymentsBaseQuery;
            if (filterUserIds && filterUserIds.length > 0) {
                matrixQuery = matrixQuery.where('user_id', 'in', filterUserIds);
            }

            const matrixSnapshot = await matrixQuery.select('status', 'user_id').get();
            const matrixPayments = matrixSnapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            }));

            countMatrix = await buildPaymentCountMatrix(matrixPayments);
            setCachedCountMatrix(matrixCacheKey, countMatrix);
            filterCounts = deriveFilterCounts(countMatrix, studentType, status);
        }

        let query = paymentsQuery.orderBy('created_at', 'desc').limit(limit);

        if (lastId) {
            const lastDoc = await adminDb.collection('payments').doc(lastId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        let snapshot: any = null;
        try {
            snapshot = await query.get();
        } catch (error: any) {
            if (error.message?.includes('index') || error.code === 9) {
                console.warn("[PaymentsAPI] Missing index fallback triggered:", error.message);
                // Fallback: Fetch without orderBy 'created_at' to avoid index requirement
                let fallbackQuery = paymentsQuery.limit(500);
                const fallbackSnapshot = await fallbackQuery.get();
                let results = fallbackSnapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Manual in-memory sort
                results.sort((a: any, b: any) => {
                    const dateA = a.created_at || a.paid_at || '';
                    const dateB = b.created_at || b.paid_at || '';
                    return dateB.localeCompare(dateA);
                });

                // Mock snapshot for pagination compatibility
                snapshot = { docs: results.slice(0, limit) };
            } else {
                throw error;
            }
        }

        const payments = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        // Optional count: skip on paginated load-more requests to cut read volume.
        let totalCount: number | null = null;
        if (!skipCounts) {
            const canUseMatrixTotal = !status
                || status === 'all'
                || status === 'captured'
                || status === 'failed'
                || status === 'authorized';

            if (countMatrix && canUseMatrixTotal) {
                totalCount = countMatrix.statusByType.all[getStatusKey(status)];
            } else {
                const countSnap = await paymentsQuery.count().get();
                totalCount = countSnap.data().count;
            }
        }

        const enriched = await enrichPaymentsArray(payments);

        return respondWithOptionalCache(responseCacheKey, {
            payments: enriched,
            totalCount: totalCount,
            lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
            hasMore: snapshot.docs.length === limit,
            filterCounts,
        });

    } catch (error: any) {
        console.error("Admin Payments GET Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

async function enrichPaymentsArray(payments: any[]) {
    if (payments.length === 0) return [];

    const userIds = Array.from(
        new Set(
            payments
                .map((p) => normalizeUserId(p.user_id))
                .filter((id): id is string => id !== null)
        )
    );
    const usersDataMap: Record<string, any> = {};

    for (let i = 0; i < userIds.length; i += 10) {
        const chunk = userIds.slice(i, i + 10);
        if (chunk.length === 0) continue;

        const userSnapshot = await adminDb.collection('users').where('__name__', 'in', chunk).get();
        userSnapshot.docs.forEach(doc => {
            usersDataMap[doc.id] = doc.data();
        });
    }

    return payments.map(p => {
        const normalizedUserId = typeof p.user_id === 'string' ? p.user_id.trim() : '';
        const user = normalizedUserId ? (usersDataMap[normalizedUserId] || {}) : {};

        // Check all possible field names used across registrations
        const college = (user.collegeName || user.college || user.institution || '').toUpperCase();
        const email = (user.email || '').toLowerCase();
        const isInternal = user.studentType === 'internal' ||
            college.includes('SMVITM') ||
            college.includes('SODE') ||
            college.includes('SHRI MADHWA VADIRAJA') ||
            college.includes('SHRI MADHWA') ||
            college.includes('VADIRAJA') ||
            email.endsWith('@sode-edu.in');

        return {
            ...p,
            userName: user.name || 'Unknown',
            userEmail: user.email || p.user_email || 'Unknown',
            userPhone: user.phone || 'N/A',
            userCollege: user.collegeName || user.college || user.institution || 'N/A',
            studentType: isInternal ? 'internal' : 'external'
        };
    });
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);

        if (!verified) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userDoc = await usersCollection.doc(verified.uid).get();
        if (userDoc.data()?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { paymentIds } = await request.json();
        if (!paymentIds || !Array.isArray(paymentIds)) {
            return NextResponse.json({ message: "Invalid payment IDs" }, { status: 400 });
        }

        const batch = adminDb.batch();
        for (const pid of paymentIds) {
            const pref = adminDb.collection('payments').doc(pid);
            const pdoc = await pref.get();
            if (pdoc.exists) {
                const userId = pdoc.data()?.user_id;
                if (userId) {
                    batch.update(usersCollection.doc(userId), { hasPaid: false });
                }
                batch.delete(pref);
            }
        }

        await batch.commit();
        paymentFilterMatrixCache.clear();
        paymentResponseCache.clear();
        return NextResponse.json({ message: `${paymentIds.length} payments deleted` });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
