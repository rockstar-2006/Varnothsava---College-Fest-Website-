/**
 * Razorpay Server-Side Utility
 * SECURITY: This file runs ONLY on the server (API routes)
 * Never import this in client components
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance (singleton pattern)
let razorpayInstance: Razorpay | null = null

export function getRazorpayInstance(): Razorpay {
    if (!razorpayInstance) {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            throw new Error(
                'Razorpay credentials not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local'
            )
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        })
    }

    return razorpayInstance
}

/**
 * Create a Razorpay order
 * @param amount - Amount in paise (₹200 = 20000 paise)
 * @param currency - Currency code (default: INR)
 * @param receipt - Unique receipt ID
 * @param notes - Additional metadata
 */
export async function createRazorpayOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string,
    notes?: Record<string, string>
) {
    try {
        const razorpay = getRazorpayInstance()

        const options = {
            amount, // amount in paise
            currency,
            receipt,
            notes: notes || {},
        }

        const order = await razorpay.orders.create(options)
        return order
    } catch (error: any) {
        console.error('Razorpay Order Creation Error:', error)
        throw new Error(`Failed to create Razorpay order: ${error.message}`)
    }
}

/**
 * Verify Razorpay payment signature
 * CRITICAL SECURITY FUNCTION - Prevents payment tampering
 * 
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Razorpay signature
 * @returns boolean - true if signature is valid
 */
export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keySecret) {
            throw new Error('RAZORPAY_KEY_SECRET not configured')
        }

        // Generate expected signature
        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex')

        // Constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(signature)
        )
    } catch (error: any) {
        console.error('Signature Verification Error:', error)
        return false
    }
}

/**
 * Fetch payment details from Razorpay
 * Used for additional verification and getting payment method details
 */
export async function fetchPaymentDetails(paymentId: string) {
    try {
        const razorpay = getRazorpayInstance()
        const payment = await razorpay.payments.fetch(paymentId)
        return payment
    } catch (error: any) {
        console.error('Fetch Payment Details Error:', error)
        throw new Error(`Failed to fetch payment details: ${error.message}`)
    }
}

/**
 * Generate unique receipt ID
 * Format: rcpt_<timestamp>_<random>
 */
export function generateReceiptId(userId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `rcpt_${userId.substring(0, 8)}_${timestamp}_${random}`
}
