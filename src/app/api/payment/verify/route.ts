/**
 * API Route: Verify Razorpay Payment
 * POST /api/payment/verify
 * 
 * Verifies payment signature and stores payment record
 * CRITICAL SECURITY: Server-side signature verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/firebaseAdmin'
import { verifyRazorpaySignature, fetchPaymentDetails } from '@/lib/razorpay'
import { storePaymentRecord, isDuplicatePayment } from '@/lib/paymentService'
import { PaymentRecord } from '@/types/payment'

export async function POST(request: NextRequest) {
    try {
        // 1. Verify authentication
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
                { status: 401 }
            )
        }

        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await verifyAuthToken(token)

        if (!decodedToken) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Invalid token' },
                { status: 401 }
            )
        }

        const userId = decodedToken.uid
        const userEmail = decodedToken.email || ''

        // 2. Parse request body
        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                {
                    error: 'Bad Request',
                    message: 'Missing required payment verification parameters',
                },
                { status: 400 }
            )
        }

        // 3. Check for duplicate payment (idempotency)
        const isDuplicate = await isDuplicatePayment(razorpay_order_id, razorpay_payment_id)
        if (isDuplicate) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Payment already processed',
                    duplicate: true,
                },
                { status: 200 }
            )
        }

        // 4. Verify signature (CRITICAL SECURITY CHECK)
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )

        if (!isValid) {
            return NextResponse.json(
                {
                    error: 'Payment Verification Failed',
                    message: 'Invalid payment signature. Payment may be tampered.',
                },
                { status: 400 }
            )
        }

        // 5. Fetch payment details from Razorpay
        const paymentDetails = await fetchPaymentDetails(razorpay_payment_id)

        // 6. Determine student type
        const isSodeStudent = userEmail.toLowerCase().endsWith('@sode-edu.in')

        // 7. Prepare payment method details (remove undefined values)
        const paymentMethodDetails: any = {
            type: paymentDetails.method || 'unknown',
        }

        // Only add fields that have values
        if (paymentDetails.acquirer_data?.upi_transaction_id || paymentDetails.vpa) {
            paymentMethodDetails.upi_transaction_id = paymentDetails.acquirer_data?.upi_transaction_id || paymentDetails.vpa
        }
        if (paymentDetails.card?.last4) {
            paymentMethodDetails.card_last4 = paymentDetails.card.last4
        }
        if (paymentDetails.card?.network) {
            paymentMethodDetails.card_network = paymentDetails.card.network
        }
        if (paymentDetails.bank) {
            paymentMethodDetails.bank = paymentDetails.bank
        }
        if (paymentDetails.wallet) {
            paymentMethodDetails.wallet = paymentDetails.wallet
        }

        // Helper function to remove undefined values
        function removeUndefined(obj: any): any {
            if (obj === null || obj === undefined) return obj
            if (typeof obj !== 'object') return obj
            if (Array.isArray(obj)) return obj.map(removeUndefined)

            const cleaned: any = {}
            for (const key in obj) {
                if (obj[key] !== undefined) {
                    cleaned[key] = removeUndefined(obj[key])
                }
            }
            return cleaned
        }

        // AUDIT LOG: Payment Record Preparation
        const paymentRecord: Omit<PaymentRecord, 'user_id' | 'created_at' | 'updated_at'> = {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            amount: typeof paymentDetails.amount === 'number' ? paymentDetails.amount : 0,
            currency: paymentDetails.currency || 'INR',
            status: paymentDetails.status === 'captured' ? 'captured' : 'authorized',
            user_email: userEmail,
            student_type: isSodeStudent ? 'internal' : 'external',
            payment_method: paymentDetails.method || 'unknown',
            payment_method_details: paymentMethodDetails,
            paid_at: new Date(paymentDetails.created_at * 1000).toISOString(),
            notes: paymentDetails.notes || {},
        }

        console.log('--- PAYMENT VERIFICATION AUDIT LOG ---');
        console.log(`Payment ID: ${razorpay_payment_id}`);
        console.log(`Order ID: ${razorpay_order_id}`);
        console.log(`Status: ${paymentRecord.status}`);
        console.log(`Method: ${paymentRecord.payment_method}`);

        // Clean undefined values before storing
        const cleanedPaymentRecord = removeUndefined(paymentRecord) as Omit<PaymentRecord, 'user_id' | 'created_at' | 'updated_at'>

        // 9. Store payment record in Firestore
        const storedPayment = await storePaymentRecord(userId, cleanedPaymentRecord)

        // 9. Return success response
        return NextResponse.json({
            success: true,
            message: 'Payment verified and recorded successfully',
            payment: {
                id: storedPayment.razorpay_payment_id,
                amount: storedPayment.amount / 100, // Convert paise to rupees
                currency: storedPayment.currency,
                status: storedPayment.status,
                paid_at: storedPayment.paid_at,
                payment_method: storedPayment.payment_method,
            },
        })

    } catch (error: any) {
        console.error('Payment Verification Error:', error)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error.message || 'Failed to verify payment',
            },
            { status: 500 }
        )
    }
}
