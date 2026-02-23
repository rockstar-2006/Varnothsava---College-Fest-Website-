'use client'

import React from 'react'
import Script from 'next/script'

/**
 * RazorpayScript Component
 * Loads the Razorpay Checkout SDK globally across the application.
 * This ensures the window.Razorpay object is available for payment flows.
 */
export const RazorpayScript = () => {
    return (
        <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
            onLoad={() => {
                console.log('✅ Razorpay SDK loaded successfully')
            }}
            onError={(e) => {
                console.error('❌ Razorpay SDK failed to load', e)
            }}
        />
    )
}

export default RazorpayScript;
