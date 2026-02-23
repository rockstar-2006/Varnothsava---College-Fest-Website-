/**
 * Custom Hook: useRazorpayPayment
 * Client-side Razorpay integration
 */

import { useState, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { getAuthToken } from '@/lib/firebaseClient'

interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    prefill: {
        name: string
        email: string
    }
    theme: {
        color: string
    }
    handler: (response: any) => void
    modal: {
        ondismiss: () => void
    }
}

declare global {
    interface Window {
        Razorpay: any
    }
}

export function useRazorpayPayment() {
    const { userData, mountUser } = useApp()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Load Razorpay script dynamically with retry logic
     */
    const loadRazorpayScript = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            // Check if already loaded
            if (window.Razorpay) {
                console.log(' Razorpay SDK already loaded')
                resolve(true)
                return
            }

            // Check if script tag already exists
            const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]')
            if (existingScript) {
                console.log(' Razorpay SDK script tag exists, waiting for load...')
                // Wait a bit for it to load
                setTimeout(() => {
                    resolve(!!window.Razorpay)
                }, 2000)
                return
            }

            console.log(' Loading Razorpay SDK...')
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.async = true

            let timeoutId: NodeJS.Timeout

            script.onload = () => {
                clearTimeout(timeoutId)
                console.log(' Razorpay SDK loaded successfully')
                resolve(true)
            }

            script.onerror = (error) => {
                clearTimeout(timeoutId)
                console.error(' Failed to load Razorpay SDK:', error)
                resolve(false)
            }

            // Timeout after 10 seconds
            timeoutId = setTimeout(() => {
                console.error(' Razorpay SDK loading timeout')
                resolve(false)
            }, 10000)

            document.body.appendChild(script)
        })
    }, [])

    /**
     * Initiate payment flow (HDFC CollectNow Mandatory Hosted Checkout)
     */
    const initiatePayment = useCallback(async (options?: { includeRoboSoccer?: boolean }) => {
        if (!userData) {
            setError('Please login to continue')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // 1. Get auth token
            const token = await getAuthToken()
            if (!token) {
                throw new Error('Authentication failed. Please login again.')
            }

            // 2. Create order
            const orderResponse = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    includeRoboSoccer: options?.includeRoboSoccer || false,
                }),
            })

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json()
                throw new Error(errorData.message || 'Failed to create payment order')
            }

            const orderData = await orderResponse.json()
            console.log('✅ Order created:', orderData.order.id)

            /**
             * 3. MANDATORY HDFC COLLECTNOW FLOW (EMBEDDED REDIRECT)
             * Reverted to the Redirect method as requested.
             * This uses the full-page HDFC/Razorpay hosted checkout.
             */
            const callbackUrl = `${window.location.origin}/api/payment/callback`
            const cancelUrl = `${window.location.origin}/api/payment/cancel`

            const fields: Record<string, string> = {
                key_id: orderData.razorpay_key,
                order_id: orderData.order.id,
                amount: orderData.order.amount.toString(),
                currency: orderData.order.currency,
                name: process.env.NEXT_PUBLIC_APP_NAME || 'Varnothsava 2K26',
                description: `Official Registration - ${userData.name}${options?.includeRoboSoccer ? ' + Robo Soccer' : ''}`,
                image: 'https://varnothsava.sode-edu.in/logo.png',
                'prefill[name]': userData.name,
                'prefill[email]': userData.email,
                'prefill[contact]': userData.phone || '',
                'notes[user_id]': userData.id || '',
                'notes[include_robo_soccer]': options?.includeRoboSoccer ? 'yes' : 'no',
                callback_url: callbackUrl,
                cancel_url: cancelUrl,
            }

            console.log('🚀 Redirecting to HDFC Hosted/Embedded Checkout...');

            // Create and submit hidden form
            const form = document.createElement('form')
            form.method = 'POST'
            form.action = 'https://api.razorpay.com/v1/checkout/embedded'

            Object.entries(fields).forEach(([key, value]) => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = key
                input.value = value
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()

        } catch (err: any) {
            console.error('Payment Initiation Error:', err)
            setError(err.message || 'Failed to initiate payment')
            setIsLoading(false)
        }
    }, [userData])

    /**
     * Verify payment on backend
     */
    const verifyPayment = useCallback(async (response: any) => {
        try {
            const token = await getAuthToken()
            if (!token) {
                throw new Error('Authentication failed')
            }

            const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                }),
            })

            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json()
                throw new Error(errorData.message || 'Payment verification failed')
            }

            const verifyData = await verifyResponse.json()

            // Refresh user data to update payment status
            await mountUser()

            setIsLoading(false)

            // Redirect to events page after successful payment
            window.location.href = '/events'

            return verifyData

        } catch (err: any) {
            console.error('Payment Verification Error:', err)
            setError(err.message || 'Payment verification failed')
            setIsLoading(false)
            throw err
        }
    }, [mountUser])

    /**
     * Check payment status
     */
    const checkPaymentStatus = useCallback(async () => {
        try {
            const token = await getAuthToken()
            if (!token) {
                return { hasPaid: false, payment: null }
            }

            const response = await fetch('/api/payment/status', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                return { hasPaid: false, payment: null }
            }

            const data = await response.json()
            return data

        } catch (err: any) {
            console.error('Payment Status Check Error:', err)
            return { hasPaid: false, payment: null }
        }
    }, [])

    return {
        initiatePayment,
        checkPaymentStatus,
        isLoading,
        error,
        clearError: () => setError(null),
    }
}
