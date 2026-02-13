/**
 * Payment QR Code Component
 * Displays payment status and verification QR code
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, CreditCard, Shield } from 'lucide-react'
import Image from 'next/image'
import QRCode from 'qrcode'

interface PaymentQRProps {
    userId: string
    userName: string
    userEmail: string
    profileCode: string
}

export function PaymentQR({ userId, userName, userEmail, profileCode }: PaymentQRProps) {
    const [paymentStatus, setPaymentStatus] = useState<{
        hasPaid: boolean
        payment: any
        loading: boolean
    }>({
        hasPaid: false,
        payment: null,
        loading: true,
    })
    const [qrDataUrl, setQrDataUrl] = useState<string>('')

    useEffect(() => {
        checkPaymentStatus()
        generateQRCode()
    }, [userId])

    const checkPaymentStatus = async () => {
        try {
            // Get auth token from Firebase
            const { getAuthToken } = await import('@/lib/firebaseClient')
            const token = await getAuthToken()

            if (!token) {
                setPaymentStatus({ hasPaid: false, payment: null, loading: false })
                return
            }

            const response = await fetch('/api/payment/status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setPaymentStatus({
                    hasPaid: data.hasPaid,
                    payment: data.payment,
                    loading: false,
                })
            } else {
                setPaymentStatus({ hasPaid: false, payment: null, loading: false })
            }
        } catch (error) {
            console.error('Payment status check failed:', error)
            setPaymentStatus({ hasPaid: false, payment: null, loading: false })
        }
    }

    const generateQRCode = async () => {
        try {
            // Generate QR code with payment verification data
            const qrData = JSON.stringify({
                userId,
                profileCode,
                userName,
                userEmail,
                timestamp: Date.now(),
            })

            const dataUrl = await QRCode.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            })

            setQrDataUrl(dataUrl)
        } catch (error) {
            console.error('QR code generation failed:', error)
        }
    }

    if (paymentStatus.loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Payment Status Badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border-2 ${paymentStatus.hasPaid
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStatus.hasPaid
                                ? 'bg-emerald-500/20'
                                : 'bg-red-500/20'
                            }`}
                    >
                        {paymentStatus.hasPaid ? (
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                            <XCircle className="w-6 h-6 text-red-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p
                            className={`text-sm font-bold uppercase tracking-wider ${paymentStatus.hasPaid
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }`}
                        >
                            {paymentStatus.hasPaid ? 'Payment Active' : 'Payment Pending'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {paymentStatus.hasPaid
                                ? 'Registration fee paid successfully'
                                : 'Please complete payment to activate'}
                        </p>
                    </div>
                </div>

                {/* Payment Details */}
                {paymentStatus.hasPaid && paymentStatus.payment && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Amount Paid:</span>
                            <span className="text-white font-bold">
                                ₹{paymentStatus.payment.amount} {paymentStatus.payment.currency}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Payment Method:</span>
                            <span className="text-white font-bold uppercase">
                                {paymentStatus.payment.payment_method || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Student Type:</span>
                            <span className="text-white font-bold uppercase">
                                {paymentStatus.payment.student_type === 'internal'
                                    ? 'SODE Student'
                                    : 'External'}
                            </span>
                        </div>
                        {paymentStatus.payment.paid_at && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Paid On:</span>
                                <span className="text-white font-bold">
                                    {new Date(paymentStatus.payment.paid_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* QR Code */}
            {paymentStatus.hasPaid && qrDataUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center space-y-4"
                >
                    <div className="p-6 bg-white rounded-3xl inline-block shadow-2xl ring-8 ring-emerald-500/10">
                        <img
                            src={qrDataUrl}
                            alt="Payment Verification QR"
                            className="w-48 h-48"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                            <Shield className="w-4 h-4" />
                            <p className="text-xs font-bold uppercase tracking-wider">
                                Verified Payment
                            </p>
                        </div>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                            Show this QR code at event checkpoints for instant payment verification
                            and entry.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Pending Payment CTA */}
            {!paymentStatus.hasPaid && (
                <motion.a
                    href="/notify"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-center rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                    <CreditCard className="w-5 h-5" />
                    Complete Payment
                </motion.a>
            )}
        </div>
    )
}
