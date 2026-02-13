/**
 * API Route: Check Payment Status
 * GET /api/payment/status
 * 
 * Returns the payment status for the logged-in user
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/firebaseAdmin'
import { checkUserPaymentStatus } from '@/lib/paymentService'

export async function GET(request: NextRequest) {
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

        // 2. Check payment status
        const { hasPaid, payment } = await checkUserPaymentStatus(userId)

        // 3. Return status
        return NextResponse.json({
            hasPaid,
            payment: payment ? {
                id: payment.razorpay_payment_id,
                amount: payment.amount / 100, // Convert paise to rupees
                currency: payment.currency,
                status: payment.status,
                paid_at: payment.paid_at,
                payment_method: payment.payment_method,
                student_type: payment.student_type,
            } : null,
            message: hasPaid ? 'Payment completed' : 'No payment found',
        })

    } catch (error: any) {
        console.error('Payment Status Check Error:', error)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error.message || 'Failed to check payment status',
            },
            { status: 500 }
        )
    }
}
