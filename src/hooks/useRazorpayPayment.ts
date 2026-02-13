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
                console.log('✅ Razorpay SDK already loaded')
                resolve(true)
                return
            }

            // Check if script tag already exists
            const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]')
            if (existingScript) {
                console.log('⏳ Razorpay SDK script tag exists, waiting for load...')
                // Wait a bit for it to load
                setTimeout(() => {
                    resolve(!!window.Razorpay)
                }, 2000)
                return
            }

            console.log('📥 Loading Razorpay SDK...')
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.async = true

            let timeoutId: NodeJS.Timeout

            script.onload = () => {
                clearTimeout(timeoutId)
                console.log('✅ Razorpay SDK loaded successfully')
                resolve(true)
            }

            script.onerror = (error) => {
                clearTimeout(timeoutId)
                console.error('❌ Failed to load Razorpay SDK:', error)
                resolve(false)
            }

            // Timeout after 10 seconds
            timeoutId = setTimeout(() => {
                console.error('❌ Razorpay SDK loading timeout')
                resolve(false)
            }, 10000)

            document.body.appendChild(script)
        })
    }, [])

    /**
     * Initiate payment flow
     */
    const initiatePayment = useCallback(async () => {
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
            })

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json()
                throw new Error(errorData.message || 'Failed to create payment order')
            }

            const orderData = await orderResponse.json()
            console.log('✅ Order created:', orderData.order.id)

            // 3. Load Razorpay script
            console.log('📥 Loading Razorpay SDK...')
            const scriptLoaded = await loadRazorpayScript()

            if (!scriptLoaded) {
                console.error('❌ Razorpay SDK failed to load')
                console.error('Possible reasons:')
                console.error('1. Internet connection issue')
                console.error('2. Browser blocking the script')
                console.error('3. Ad blocker or security extension')
                console.error('4. Network firewall')

                throw new Error(
                    'Failed to load Razorpay payment gateway. ' +
                    'Please check your internet connection and disable any ad blockers, then try again.'
                )
            }

            // Verify Razorpay is actually available
            if (!window.Razorpay) {
                console.error('❌ Razorpay object not found on window')
                throw new Error('Payment gateway not initialized. Please refresh the page and try again.')
            }

            console.log('✅ Razorpay SDK loaded successfully')

            // 4. Configure Razorpay options
            const options: RazorpayOptions = {
                key: orderData.razorpay_key,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: process.env.NEXT_PUBLIC_APP_NAME || 'Varnothsava 2K26',
                description: `Registration Fee - ${orderData.user.student_type === 'internal' ? 'SODE Student' : 'External Student'}`,
                order_id: orderData.order.id,
                prefill: {
                    name: userData.name,
                    email: userData.email,
                },
                theme: {
                    color: '#10b981', // Emerald-500
                },
                handler: async (response: any) => {
                    // Payment successful - verify on backend
                    await verifyPayment(response)
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false)
                        setError('Payment cancelled')
                    },
                },
            }

            // 5. Open Razorpay checkout
            const razorpay = new window.Razorpay(options)
            razorpay.open()

        } catch (err: any) {
            console.error('Payment Initiation Error:', err)
            setError(err.message || 'Failed to initiate payment')
            setIsLoading(false)
        }
    }, [userData, loadRazorpayScript])

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
