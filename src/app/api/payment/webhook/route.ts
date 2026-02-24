/**
 * API Route: Razorpay Webhook Handler
 * POST /api/payment/webhook
 * 
 * Handles real-time payment notifications from Razorpay
 * As per HDFC Collect Now Integration Requirements
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db, fieldValue as FieldValue } from '@/lib/firebaseAdmin'
import { fetchOrderDetails, fetchPaymentDetails } from '@/lib/razorpay'
import { PaymentRecord } from '@/types/payment'

/**
 * Verify webhook signature
 * As per Razorpay documentation: https://razorpay.com/docs/webhooks/validate-test/
 */
function verifyWebhookSignature(
    webhookBody: string,
    webhookSignature: string,
    webhookSecret: string
): boolean {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(webhookBody)
            .digest('hex')

        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(webhookSignature)
        )
    } catch (error) {
        console.error('Webhook signature verification error:', error)
        return false
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Get webhook signature from headers
        const webhookSignature = request.headers.get('x-razorpay-signature')

        if (!webhookSignature) {
            console.error('Missing webhook signature')
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            )
        }

        // 2. Get raw body for signature verification
        const webhookBody = await request.text()
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

        if (!webhookSecret || webhookSecret === 'your_webhook_secret_here') {
            console.error('Webhook secret not configured')
            return NextResponse.json(
                { error: 'Webhook not configured' },
                { status: 500 }
            )
        }

        // 3. Verify signature
        const isValid = verifyWebhookSignature(
            webhookBody,
            webhookSignature,
            webhookSecret
        )

        if (!isValid) {
            console.error('Invalid webhook signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        // 4. Parse webhook payload
        const payload = JSON.parse(webhookBody)
        const event = payload.event
        const paymentEntity = payload.payload?.payment?.entity
        const orderEntity = payload.payload?.order?.entity

        console.log(`📥 Webhook received: ${event}`)
        console.log('Payment Entity:', paymentEntity)
        console.log('Order Entity:', orderEntity)

        // 5. Handle webhook events (Prioritizing payment.captured)
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(paymentEntity)
                break

            case 'payment.failed':
                console.log(`❌ Payment failed notice received: ${paymentEntity.id}`)
                await handlePaymentFailed(paymentEntity)
                break

            default:
                console.log(`ℹ️ Webhook event received and logged: ${event}`)
        }

        // 6. Return 200 OK (CRITICAL: Razorpay requires 2xx response)
        return NextResponse.json({ status: 'ok' }, { status: 200 })

    } catch (error: any) {
        console.error('Webhook processing error:', error)

        // Still return 200 to prevent webhook from being disabled
        // Log error for manual review
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 200 }
        )
    }
}

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(payment: any) {
    try {
        const paymentId = payment.id
        const paymentRef = db.collection('payments').doc(paymentId)

        await paymentRef.set({
            status: 'authorized',
            authorized_at: new Date(payment.created_at * 1000).toISOString(),
            updated_at: FieldValue.serverTimestamp(),
            webhook_event: 'payment.authorized'
        }, { merge: true })

        console.log(`✅ Payment authorized: ${paymentId}`)
    } catch (error) {
        console.error('Error handling payment.authorized:', error)
    }
}

/**
 * Handle payment.captured event
 * REDUNDANCY: This ensures user status is updated even if they close the browser
 * before the callback redirect occurs.
 */
async function handlePaymentCaptured(payment: any) {
    try {
        const paymentId = payment.id
        const userId = payment.notes?.user_id
        const hasRoboSoccer = payment.notes?.include_robo_soccer === 'yes'

        const paymentRef = db.collection('payments').doc(paymentId)

        const paymentDetails = await fetchPaymentDetails(payment.id)

        const order = await fetchOrderDetails(paymentDetails.order_id)
        // const userId = order.notes?.user_id
        const userEmail = order.notes?.user_email
        
        // AUDIT LOG: Payment Details (Section 3.9.2.1)
        console.log('--- RAZORPAY FETCH SINGLE PAYMENT RESPONSE (AUDIT LOG) ---');
        console.log(JSON.stringify(paymentDetails, null, 2));
        
                // 6. Prepare Payment Method details
        const paymentMethodDetails: any = {
            type: paymentDetails.method || 'unknown',
        }
        if (paymentDetails.acquirer_data?.upi_transaction_id || paymentDetails.vpa) {
            paymentMethodDetails.upi_transaction_id = paymentDetails.acquirer_data?.upi_transaction_id || paymentDetails.vpa
        }
        if (paymentDetails.card?.last4) {
            paymentMethodDetails.card_last4 = paymentDetails.card.last4
        }
        if (paymentDetails.bank) paymentMethodDetails.bank = paymentDetails.bank
        if (paymentDetails.wallet) paymentMethodDetails.wallet = paymentDetails.wallet
        
                // 7. Prepare and Store Record
        const paymentRecord: Omit<PaymentRecord, 'user_id' | 'created_at' | 'updated_at'> = {
            razorpay_payment_id: payment.id,
            razorpay_order_id: paymentDetails.order_id,
            razorpay_signature: '',
            amount: typeof paymentDetails.amount === 'number' ? paymentDetails.amount : 0,
            currency: paymentDetails.currency || 'INR',
            status: paymentDetails.status === 'captured' ? 'captured' : 'authorized',
            user_email: userEmail as string,
            student_type: (userEmail as string)?.toLowerCase().endsWith('@sode-edu.in') ? 'internal' : 'external',
            payment_method: paymentDetails.method || 'unknown',
            payment_method_details: paymentMethodDetails,
            paid_at: new Date(paymentDetails.created_at * 1000).toISOString(),
            notes: payment.notes || {},
        }

        await db.runTransaction(async (transaction) => {
            // 1. Update payment record
            transaction.set(paymentRef, paymentRecord, { merge: true })

            // 2. Update user status if userId exists
            if (userId) {
                const userRef = db.collection('users').doc(userId)
                const userUpdate: any = {
                    hasPaid: true,
                    paymentId: paymentId,
                    updatedAt: FieldValue.serverTimestamp()
                }

                if (hasRoboSoccer) {
                    userUpdate.hasRoboSoccer = true
                    userUpdate.isRoboSoccerTeamLeader = true
                }

                transaction.update(userRef, userUpdate)
            }
        })

        console.log(`✅ Webhook: Payment captured and user updated: ${paymentId}`)
    } catch (error) {
        console.error('Error handling payment.captured webhook:', error)
    }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payment: any) {
    try {
        const paymentId = payment.id
        const paymentRef = db.collection('payments').doc(paymentId)

        await paymentRef.set({
            status: 'failed',
            error_code: payment.error_code,
            error_description: payment.error_description,
            failed_at: new Date().toISOString(),
            updated_at: FieldValue.serverTimestamp(),
            webhook_event: 'payment.failed'
        }, { merge: true })

        console.log(`❌ Payment failed: ${paymentId}`)
    } catch (error) {
        console.error('Error handling payment.failed:', error)
    }
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(payment: any, order: any) {
    try {
        const orderId = order.id
        const paymentId = payment.id

        // Update order status
        const orderRef = db.collection('orders').doc(orderId)
        await orderRef.set({
            status: 'paid',
            payment_id: paymentId,
            paid_at: new Date().toISOString(),
            updated_at: FieldValue.serverTimestamp(),
            webhook_event: 'order.paid'
        }, { merge: true })

        console.log(`✅ Order paid: ${orderId}`)
    } catch (error) {
        console.error('Error handling order.paid:', error)
    }
}

/**
 * Handle payment.dispute.created event
 */
async function handleDisputeCreated(dispute: any) {
    try {
        const disputeId = dispute.id
        const paymentId = dispute.payment_id

        // Store dispute information
        const disputeRef = db.collection('disputes').doc(disputeId)
        await disputeRef.set({
            dispute_id: disputeId,
            payment_id: paymentId,
            amount: dispute.amount,
            currency: dispute.currency,
            reason_code: dispute.reason_code,
            status: dispute.status,
            phase: dispute.phase,
            respond_by: new Date(dispute.respond_by * 1000).toISOString(),
            created_at: new Date(dispute.created_at * 1000).toISOString(),
            updated_at: FieldValue.serverTimestamp()
        })

        // Update payment record
        const paymentRef = db.collection('payments').doc(paymentId)
        await paymentRef.update({
            has_dispute: true,
            dispute_id: disputeId,
            updated_at: FieldValue.serverTimestamp()
        })

        console.log(`⚠️ Dispute created: ${disputeId} for payment: ${paymentId}`)
    } catch (error) {
        console.error('Error handling dispute.created:', error)
    }
}

/**
 * Handle refund.created event
 */
async function handleRefundCreated(refund: any) {
    try {
        const refundId = refund.id
        const paymentId = refund.payment_id

        // Store refund information
        const refundRef = db.collection('refunds').doc(refundId)
        await refundRef.set({
            refund_id: refundId,
            payment_id: paymentId,
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            created_at: new Date(refund.created_at * 1000).toISOString(),
            updated_at: FieldValue.serverTimestamp()
        })

        // Update payment record
        const paymentRef = db.collection('payments').doc(paymentId)
        await paymentRef.update({
            refund_status: 'partial',
            amount_refunded: refund.amount,
            updated_at: FieldValue.serverTimestamp()
        })

        console.log(`💰 Refund created: ${refundId} for payment: ${paymentId}`)
    } catch (error) {
        console.error('Error handling refund.created:', error)
    }
}
