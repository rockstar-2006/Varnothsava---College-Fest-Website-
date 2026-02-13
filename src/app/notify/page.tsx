'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard, CheckCircle, Sparkles, Loader2,
    AlertCircle, ArrowRight, Shield, Zap, QrCode
} from 'lucide-react'
import Link from 'next/link'
import { Orbitron } from 'next/font/google'
import { useApp } from '@/context/AppContext'
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment'
import { useRouter } from 'next/navigation'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '900'],
})

export default function RegisterPage() {
    const { userData, isLoggedIn, isInitializing } = useApp()
    const { initiatePayment, checkPaymentStatus, isLoading, error, clearError } = useRazorpayPayment()
    const router = useRouter()

    const [paymentStatus, setPaymentStatus] = useState<{
        hasPaid: boolean
        payment: any
    } | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [checkingStatus, setCheckingStatus] = useState(true)

    // Check payment status on mount
    useEffect(() => {
        if (isLoggedIn && userData) {
            checkStatus()
        } else if (!isInitializing && !isLoggedIn) {
            setCheckingStatus(false)
        }
    }, [isLoggedIn, userData, isInitializing])

    const checkStatus = async () => {
        setCheckingStatus(true)
        const status = await checkPaymentStatus()
        setPaymentStatus(status)
        setCheckingStatus(false)

        if (status.hasPaid) {
            setShowSuccessModal(true)
        }
    }

    const handleRegisterClick = async () => {
        if (!isLoggedIn) {
            router.push('/login')
            return
        }

        if (paymentStatus?.hasPaid) {
            setShowSuccessModal(true)
            return
        }

        // Initiate payment
        await initiatePayment()

        // Recheck status after payment attempt
        setTimeout(() => {
            checkStatus()
        }, 1000)
    }

    // Calculate amount based on email
    const getAmount = () => {
        if (!userData) return 300
        return userData.email.toLowerCase().endsWith('@sode-edu.in') ? 200 : 300
    }

    const getStudentType = () => {
        if (!userData) return 'External'
        return userData.email.toLowerCase().endsWith('@sode-edu.in') ? 'SODE Student' : 'External Student'
    }

    if (isInitializing || checkingStatus) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Glowing Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]"
                />
            </div>

            <div className="max-w-4xl w-full relative z-10 px-2 sm:px-0">
                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_0_80px_rgba(16,185,129,0.15)] border border-emerald-500/20 overflow-hidden isolate"
                >
                    {/* Animated Border */}
                    <div className="absolute inset-[-2px] -z-10 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
                        <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#10b981_360deg)] animate-[spin_6s_linear_infinite]" />
                    </div>
                    <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-[1.4rem] md:rounded-[2.4rem] -z-5" />

                    {/* Header Section */}
                    <div className="relative p-6 sm:p-10 md:p-16 text-center overflow-hidden">
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-emerald-500/10 backdrop-blur-md rounded-full mb-6 md:mb-8 relative border-2 border-emerald-500/30"
                        >
                            <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-emerald-400" />
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 0, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 border-4 border-emerald-400 rounded-full"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`${orbitron.className} text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-[0.9] sm:leading-none`}
                        >
                            <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent block sm:inline">
                                REGISTER NOW
                            </span>
                            <br className="sm:hidden" />
                            <span className="text-emerald-400 mt-2 sm:mt-0 block sm:inline"> FOR VARNOTHSAVA</span>
                        </motion.h1>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="h-1 w-24 sm:w-36 md:w-48 mx-auto bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-6"
                        />

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-base sm:text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto"
                        >
                            Secure your spot at <span className="text-emerald-400 font-bold">Varnothsava 2K26</span>
                        </motion.p>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 sm:p-10 md:p-12 pt-0">
                        {/* Pricing Info */}
                        {isLoggedIn && userData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="mb-8 p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-1">
                                            Registration Fee
                                        </p>
                                        <p className="text-3xl md:text-4xl font-black text-white">
                                            ₹{getAmount()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {getStudentType()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Shield className="w-5 h-5" />
                                        <span className="text-xs font-bold">Secure Payment</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Error Display */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-red-400 text-sm font-medium">{error}</p>
                                    </div>
                                    <button
                                        onClick={clearError}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        ×
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Register Button */}
                        <motion.button
                            onClick={handleRegisterClick}
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.01 }}
                            whileTap={{ scale: isLoading ? 1 : 0.99 }}
                            className="relative w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold py-5 sm:py-6 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group isolate"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-lg tracking-wide uppercase">Processing...</span>
                                </>
                            ) : paymentStatus?.hasPaid ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-lg tracking-wide uppercase">Already Registered</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg tracking-wide uppercase">
                                        {isLoggedIn ? 'PAY NOW' : 'LOGIN TO REGISTER'}
                                    </span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>

                        <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Powered by Razorpay - Secure & Trusted
                        </p>

                        {/* Back to Home Link */}
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 font-medium transition-colors group"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSuccessModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
                        >
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/30"
                            >
                                <CheckCircle className="w-12 h-12 text-emerald-400" />
                            </motion.div>

                            <h2 className={`${orbitron.className} text-3xl font-black text-white text-center mb-4`}>
                                Successfully Registered!
                            </h2>

                            <p className="text-gray-400 text-center mb-6">
                                Your payment has been confirmed. Check your profile for the QR code.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-colors"
                                >
                                    Close
                                </button>
                                <Link
                                    href="/profile"
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-black font-bold text-center hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                                >
                                    <QrCode className="w-4 h-4" />
                                    View QR
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
