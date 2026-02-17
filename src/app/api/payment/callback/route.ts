/**
 * API Route: Razorpay Payment Callback
 * POST /api/payment/callback
 * 
 * Handles the redirect from Razorpay Hosted Checkout
 * Verifies signature and redirects user to success/failure page
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature, fetchPaymentDetails, fetchOrderDetails } from '@/lib/razorpay'
import { storePaymentRecord, isDuplicatePayment } from '@/lib/paymentService'
import { PaymentRecord } from '@/types/payment'

export async function POST(request: NextRequest) {
    try {
        console.log('📥 Razorpay Callback Received');

        // 1. Parse Form Data (Razorpay sends application/x-www-form-urlencoded)
        const formData = await request.formData()
        const razorpay_order_id = formData.get('razorpay_order_id') as string
        const razorpay_payment_id = formData.get('razorpay_payment_id') as string
        const razorpay_signature = formData.get('razorpay_signature') as string

        // AUDIT LOG: Response Objects (Section 3.9.1)
        console.log('--- RAZORPAY CALLBACK RESPONSE OBJECTS (AUDIT LOG) ---');
        console.log(JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }, null, 2));

        console.log(`🔍 Processing Callback: Order=${razorpay_order_id}, Payment=${razorpay_payment_id}`);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('❌ Missing verification parameters');
            const host = request.headers.get('host') || 'localhost:3000';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            return NextResponse.redirect(`${protocol}://${host}/notify?payment=failed&reason=missing_params`, 303)
        }

        // 2. Verify Signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )

        if (!isValid) {
            console.error('❌ Invalid signature detected');
            const host = request.headers.get('host') || 'localhost:3000';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            return NextResponse.redirect(`${protocol}://${host}/notify?payment=failed&reason=invalid_signature`, 303)
        }

        // 3. Fetch Order to get metadata (user_id)
        const order = await fetchOrderDetails(razorpay_order_id)
        const userId = order.notes?.user_id
        const userEmail = order.notes?.user_email

        if (!userId) {
            console.error('❌ User ID missing in order notes');
            const host = request.headers.get('host') || 'localhost:3000';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            return NextResponse.redirect(`${protocol}://${host}/notify?payment=failed&reason=user_context_lost`, 303)
        }

        // 4. Check for duplicate payment
        const isDuplicate = await isDuplicatePayment(razorpay_order_id, razorpay_payment_id)
        if (isDuplicate) {
            console.log('⚠️ Duplicate payment detected, skipping storage');
            const host = request.headers.get('host') || 'localhost:3000';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            return NextResponse.redirect(`${protocol}://${host}/events?payment=already_processed`, 303)
        }

        // 5. Fetch payment details for storage
        const paymentDetails = await fetchPaymentDetails(razorpay_payment_id)

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
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            amount: typeof paymentDetails.amount === 'number' ? paymentDetails.amount : 0,
            currency: paymentDetails.currency || 'INR',
            status: paymentDetails.status === 'captured' ? 'captured' : 'authorized',
            user_email: userEmail as string,
            student_type: (userEmail as string)?.toLowerCase().endsWith('@sode-edu.in') ? 'internal' : 'external',
            payment_method: paymentDetails.method || 'unknown',
            payment_method_details: paymentMethodDetails,
            paid_at: new Date(paymentDetails.created_at * 1000).toISOString(),
            notes: paymentDetails.notes || {},
        }

        await storePaymentRecord(userId as string, paymentRecord)
        console.log('✅ Payment recorded via callback');

        // 8. Redirect to success page
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        return NextResponse.redirect(`${protocol}://${host}/events?payment=success`, 303)

    } catch (error: any) {
        console.error('🛑 Callback Handler Error:', error)
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        return NextResponse.redirect(`${protocol}://${host}/notify?payment=failed&reason=internal_error`, 303)
    }
}
