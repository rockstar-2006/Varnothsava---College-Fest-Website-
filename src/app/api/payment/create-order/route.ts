/**
 * API Route: Create Razorpay Order
 * POST /api/payment/create-order
 * 
 * Creates a Razorpay order for the logged-in user
 * Amount is determined by user's email domain (sode-edu.in = ₹200, others = ₹300)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/firebaseAdmin'
import { createRazorpayOrder, generateReceiptId } from '@/lib/razorpay'
import { checkUserPaymentStatus } from '@/lib/paymentService'

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

        // 2. Check if user has already paid
        const { hasPaid, payment } = await checkUserPaymentStatus(userId)

        if (hasPaid) {
            return NextResponse.json(
                {
                    error: 'Already Paid',
                    message: 'You have already completed the payment',
                    payment,
                },
                { status: 400 }
            )
        }

        // 3. Determine amount based on email domain
        // sode-edu.in = ₹200 (20000 paise)
        // others = ₹300 (30000 paise)
        const isSodeStudent = userEmail.toLowerCase().endsWith('@sode-edu.in')
        const amountInRupees = isSodeStudent ? 200 : 300
        const amountInPaise = amountInRupees * 100

        // 4. Create Razorpay order
        // Check if Razorpay credentials are configured
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret || keyId.includes('xxxxxxxxxx') || keySecret.includes('xxxxxxxxxx')) {
            return NextResponse.json(
                {
                    error: 'Configuration Error',
                    message: 'Razorpay credentials not configured. Please add your keys to .env.local',
                    help: {
                        step1: 'Get keys from https://dashboard.razorpay.com',
                        step2: 'Add to .env.local: RAZORPAY_KEY_SECRET and NEXT_PUBLIC_RAZORPAY_KEY_ID',
                        step3: 'Restart the server'
                    }
                },
                { status: 500 }
            )
        }

        const receipt = generateReceiptId(userId)
        const notes = {
            user_id: userId,
            user_email: userEmail,
            student_type: isSodeStudent ? 'internal' : 'external',
            amount_rupees: amountInRupees.toString(),
        }

        const order = await createRazorpayOrder(
            amountInPaise,
            'INR',
            receipt,
            notes
        )

        // 5. Return order details to frontend
        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
            },
            user: {
                email: userEmail,
                student_type: isSodeStudent ? 'internal' : 'external',
            },
            razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        })

    } catch (error: any) {
        console.error('Create Order Error:', error)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error.message || 'Failed to create payment order',
            },
            { status: 500 }
        )
    }
}
