/**
 * API Route: Razorpay Payment Cancel
 * GET /api/payment/cancel
 * 
 * Handles user cancellation from Razorpay Hosted Checkout
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    console.log('⚠️ Payment Cancelled by User');
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/notify?payment=cancelled`)
}
