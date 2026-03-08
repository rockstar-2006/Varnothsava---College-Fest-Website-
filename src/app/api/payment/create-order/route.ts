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

        // 2. Extract options from request body
        let includeRoboSoccer = false
        try {
            const body = await request.json()
            includeRoboSoccer = !!body.includeRoboSoccer
        } catch (e) {
            // No body or invalid body, default to false
        }

        // 3. Check if user has already paid
        const { hasPaid, hasRoboSoccer, payment } = await checkUserPaymentStatus(userId)

        // Case 1: Already paid everything (Base + Robo)
        if (hasPaid && (!includeRoboSoccer || hasRoboSoccer)) {
            return NextResponse.json(
                {
                    error: 'Already Registered',
                    message: hasRoboSoccer ? 'You are already registered for everything' : 'You have already completed the individual registration',
                    payment,
                },
                { status: 400 }
            )
        }

        const now = Date.now()
        const CLOSING_TIME = new Date('2026-03-09T23:59:59+05:30').getTime()
        const REOPENING_TIME = new Date('2026-03-11T08:00:00+05:30').getTime()

        if (now > CLOSING_TIME && now < REOPENING_TIME) {
            return NextResponse.json(
                { error: 'Registration Closed', message: 'The online registration is closed and the registration will reopen on March 11.' },
                { status: 403 }
            )
        }

        // 4. Determine amount based on email domain and Robo Soccer selection
        // Base Fee: After March 11 8 AM = ₹350, otherwise sode-edu.in = ₹200, others = ₹300
        // Robo Soccer Fee: + ₹300
        const isSodeStudent = userEmail.toLowerCase().endsWith('@sode-edu.in')

        let amountInRupees = 0

        // If they already paid the base fee, only charge for Robo Soccer
        if (hasPaid) {
            if (includeRoboSoccer && !hasRoboSoccer) {
                amountInRupees = 300 // Only the Robo Soccer fee
            }
        } else {
            // New registration
            amountInRupees = now >= REOPENING_TIME ? 350 : (isSodeStudent ? 200 : 300)
            if (includeRoboSoccer) {
                amountInRupees += 300
            }
        }

        if (amountInRupees === 0) {
            return NextResponse.json(
                { error: 'Invalid Request', message: 'No payment required for this selection' },
                { status: 400 }
            )
        }

        const amountInPaise = amountInRupees * 100

        // 5. Create Razorpay order
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
            include_robo_soccer: includeRoboSoccer ? 'yes' : 'no',
            event_type: includeRoboSoccer ? 'registration_with_robo_soccer' : 'registration_only'
        }

        // AUDIT LOG: Request (Step 2.1)
        console.log('--- RAZORPAY ORDER REQUEST (AUDIT LOG) ---');
        console.log(JSON.stringify({ amount: amountInPaise, currency: 'INR', receipt, payment_capture: 1, notes }, null, 2));

        const order = await createRazorpayOrder(
            amountInPaise,
            'INR',
            receipt,
            notes
        )

        // AUDIT LOG: Response (Step 2.2)
        console.log('--- RAZORPAY ORDER RESPONSE (AUDIT LOG) ---');
        console.log(JSON.stringify(order, null, 2));

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
