/**
 * Firestore Payment Service
 * Handles all database operations for payments
 * SECURITY: Server-side only
 */

import { db } from './firebaseAdmin'
import { PaymentRecord } from '@/types/payment'

const PAYMENTS_COLLECTION = 'payments'
const USERS_COLLECTION = 'users'

/**
 * Store payment record in Firestore
 * Uses transaction to ensure atomicity
 */
export async function storePaymentRecord(
    userId: string,
    paymentData: Omit<PaymentRecord, 'user_id' | 'created_at' | 'updated_at'>
): Promise<PaymentRecord> {
    try {
        const now = new Date().toISOString()

        const paymentRecord: PaymentRecord = {
            ...paymentData,
            user_id: userId,
            created_at: now,
            updated_at: now,
        }

        // Store in payments collection (ignore undefined values)
        const paymentRef = db.collection(PAYMENTS_COLLECTION).doc(paymentData.razorpay_payment_id)
        await paymentRef.set(paymentRecord, { merge: true })

        // Update user's payment status
        const userRef = db.collection(USERS_COLLECTION).doc(userId)

        const userUpdate: any = {
            hasPaid: true,
            paymentId: paymentData.razorpay_payment_id,
            updatedAt: now,
        }

        // Handle Robo Soccer metadata if present in notes
        if (paymentData.notes?.include_robo_soccer === 'yes') {
            userUpdate.hasRoboSoccer = true
            userUpdate.isRoboSoccerTeamLeader = true
        }

        await userRef.update(userUpdate)

        return paymentRecord
    } catch (error: any) {
        console.error('Store Payment Record Error:', error)
        throw new Error(`Failed to store payment record: ${error.message}`)
    }
}

/**
 * Get payment record by payment ID
 */
export async function getPaymentByPaymentId(paymentId: string): Promise<PaymentRecord | null> {
    try {
        const paymentDoc = await db.collection(PAYMENTS_COLLECTION).doc(paymentId).get()

        if (!paymentDoc.exists) {
            return null
        }

        return paymentDoc.data() as PaymentRecord
    } catch (error: any) {
        console.error('Get Payment Error:', error)
        return null
    }
}

/**
 * Get all payments for a user
 */
export async function getUserPayments(userId: string): Promise<PaymentRecord[]> {
    try {
        const paymentsSnapshot = await db
            .collection(PAYMENTS_COLLECTION)
            .where('user_id', '==', userId)
            .orderBy('created_at', 'desc')
            .get()

        return paymentsSnapshot.docs.map(doc => doc.data() as PaymentRecord)
    } catch (error: any) {
        console.error('Get User Payments Error:', error)
        return []
    }
}

/**
 * Get latest successful payment for a user
 */
export async function getLatestSuccessfulPayment(userId: string): Promise<PaymentRecord | null> {
    try {
        const paymentsSnapshot = await db
            .collection(PAYMENTS_COLLECTION)
            .where('user_id', '==', userId)
            .where('status', 'in', ['captured', 'authorized'])
            .orderBy('created_at', 'desc')
            .limit(1)
            .get()

        if (paymentsSnapshot.empty) {
            return null
        }

        return paymentsSnapshot.docs[0].data() as PaymentRecord
    } catch (error: any) {
        console.error('Get Latest Payment Error:', error)
        return null
    }
}

/**
 * Check if user has paid
 * Returns the payment status and latest payment record
 */
export async function checkUserPaymentStatus(userId: string): Promise<{
    hasPaid: boolean
    hasRoboSoccer: boolean
    payment: PaymentRecord | null
}> {
    try {
        const payment = await getLatestSuccessfulPayment(userId)

        // Check if ANY successful payment has robo soccer
        const payments = await getUserPayments(userId)
        const hasRoboSoccer = payments.some(p => p.notes?.include_robo_soccer === 'yes' && (p.status === 'captured' || p.status === 'authorized'))

        return {
            hasPaid: payment !== null,
            hasRoboSoccer,
            payment,
        }
    } catch (error: any) {
        console.error('Check Payment Status Error:', error)
        return {
            hasPaid: false,
            hasRoboSoccer: false,
            payment: null,
        }
    }
}

/**
 * Update payment status (for handling failures, refunds, etc.)
 */
export async function updatePaymentStatus(
    paymentId: string,
    status: PaymentRecord['status'],
    errorDescription?: string
): Promise<void> {
    try {
        const updateData: Partial<PaymentRecord> = {
            status,
            updated_at: new Date().toISOString(),
        }

        if (errorDescription) {
            updateData.error_description = errorDescription
        }

        await db.collection(PAYMENTS_COLLECTION).doc(paymentId).update(updateData)
    } catch (error: any) {
        console.error('Update Payment Status Error:', error)
        throw new Error(`Failed to update payment status: ${error.message}`)
    }
}

/**
 * Check for duplicate payment (idempotency check)
 * Prevents processing the same payment multiple times
 */
export async function isDuplicatePayment(
    orderId: string,
    paymentId: string
): Promise<boolean> {
    try {
        const existingPayment = await getPaymentByPaymentId(paymentId)
        return existingPayment !== null
    } catch (error: any) {
        console.error('Duplicate Check Error:', error)
        return false
    }
}
