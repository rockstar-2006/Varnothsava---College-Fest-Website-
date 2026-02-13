'use client'

import Script from 'next/script'

export function RazorpayScript() {
    return (
        <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
            onLoad={() => {
                console.log('✅ Razorpay SDK loaded via Next.js Script')
            }}
            onError={(e) => {
                console.error('❌ Razorpay SDK failed to load via Next.js Script:', e)
            }}
        />
    )
}
