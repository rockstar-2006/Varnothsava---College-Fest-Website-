/**
 * API Route: Verify UPI Transaction (UTR)
 * POST /api/payment/verify-utr
 * 
 * Handles QR code payment verification
 * Creates payment record for manual verification by admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken, db } from '@/lib/firebaseAdmin'
import { PaymentRecord } from '@/types/payment'
import { storePaymentRecord } from '@/lib/paymentService'

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

        // 2. Parse and validate request body
        const body = await request.json()
        const { utrNumber, amount, includeRoboSoccer } = body

        if (!utrNumber || typeof utrNumber !== 'string') {
            return NextResponse.json(
                { error: 'Validation Error', message: 'UTR number is required' },
                { status: 400 }
            )
        }

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'Validation Error', message: 'Valid payment amount is required' },
                { status: 400 }
            )
        }

        const sanitizedUTR = utrNumber.trim().toUpperCase()

        if (sanitizedUTR.length < 10) {
            return NextResponse.json(
                { error: 'Validation Error', message: 'UTR number must be at least 10 characters' },
                { status: 400 }
            )
        }

        console.log(`📥 QR Payment Verification: User=${userId}, UTR=${sanitizedUTR}, Amount=₹${amount}, RoboSoccer=${includeRoboSoccer || false}`);

        // 3. Check for duplicate UTR
        const duplicateCheck = await db
            .collection('payments')
            .where('payment_method_details.upi_transaction_id', '==', sanitizedUTR)
            .limit(1)
            .get()

        if (!duplicateCheck.empty) {
            const existingPayment = duplicateCheck.docs[0].data()
            console.log(`⚠️ Duplicate UTR detected: ${sanitizedUTR}`);
            return NextResponse.json(
                {
                    error: 'Duplicate Payment',
                    message: 'This UTR number has already been submitted',
                    existingPayment: {
                        utr: sanitizedUTR,
                        submittedAt: existingPayment.created_at,
                        status: existingPayment.status
                    }
                },
                { status: 400 }
            )
        }

        // 4. Check if user has already paid
        const userDoc = await db.collection('users').doc(userId).get()
        const userData = userDoc.data()

        if (userData?.hasPaid) {
            return NextResponse.json(
                {
                    error: 'Already Paid',
                    message: 'You have already completed the payment'
                },
                { status: 400 }
            )
        }

        // 5. Generate unique payment ID for QR payment
        const timestamp = Date.now()
        const qrPaymentId = `qr_${userId.substring(0, 8)}_${timestamp}`

        // 6. Prepare payment record
        const studentType = userEmail.toLowerCase().endsWith('@sode-edu.in') ? 'internal' : 'external'
        
        const paymentRecord: Omit<PaymentRecord, 'user_id' | 'created_at' | 'updated_at'> = {
            razorpay_payment_id: qrPaymentId,
            razorpay_order_id: `qr_order_${timestamp}`,
            razorpay_signature: 'manual_qr_payment',
            amount: amount * 100, // Convert to paise (Razorpay format)
            currency: 'INR',
            status: 'captured',
            user_email: userEmail,
            student_type: studentType,
            payment_method: 'upi',
            payment_method_details: {
                type: 'upi',
                upi_transaction_id: sanitizedUTR,
            },
            paid_at: new Date().toISOString(),
            notes: {
                payment_type: 'qr_code',
                verification_status: 'pending_admin_verification',
                submitted_by_user: 'yes',
                include_robosoccer: includeRoboSoccer ? 'yes' : 'no',
                amount_rupees: amount.toString()
            },
        }

        await storePaymentRecord(userId, paymentRecord);

        console.log(`✅ QR Payment Record Created: ${qrPaymentId}`);

        // 8. Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'QR Payment submitted successfully. You can register for events now.',
                payment: {
                    id: qrPaymentId,
                    utr: sanitizedUTR,
                    amount: amount,
                    includeRoboSoccer: includeRoboSoccer || false,
                    status: 'captured',
                    submittedAt: new Date().toISOString()
                }
            },
            { status: 200 }
        )

    } catch (error: any) {
        console.error('🛑 UTR Verification Error:', error)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'Failed to process payment verification',
                details: error.message
            },
            { status: 500 }
        )
    }
}
