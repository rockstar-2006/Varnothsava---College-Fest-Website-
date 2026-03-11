'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle, Loader2,
    AlertCircle, ArrowRight, QrCode
} from 'lucide-react'
import Link from 'next/link'
import { Orbitron } from 'next/font/google'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/lib/firebaseClient'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '900'],
})

// Single QR Code for all payments
const QR_CODE_IMAGE = '/scanner-pay.jpeg'

function QRPaymentContent() {
    const { userData, isLoggedIn, isInitializing, isAdmin } = useApp()
    const router = useRouter()

    const [utrNumber, setUtrNumber] = useState('')
    const [confirmUtrNumber, setConfirmUtrNumber] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [includeRoboSoccer, setIncludeRoboSoccer] = useState(false)

    // Calculate payment amount
    const calculateAmount = () => {
        if (!userData?.email) return 0

        // Base fee: Fixed at 300 for all
        let amount = 300

        // Add 300 if user wants RoboSoccer
        if (includeRoboSoccer) {
            amount += 300
        }

        return amount
    }

    const totalAmount = calculateAmount()

    if (!userData?.email) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Please Log In</h1>
                    <p className="text-gray-400">You need to be logged in to proceed with payment.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold rounded-xl hover:shadow-lg transition-shadow"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    const handleVerifyPayment = async () => {
        setError('')

        if (!utrNumber.trim()) {
            setError('Please enter UTR number')
            return
        }

        if (utrNumber.length < 10) {
            setError('UTR number must be at least 10 characters')
            return
        }

        if (!confirmUtrNumber.trim()) {
            setError('Please confirm UTR number')
            return
        }

        if (utrNumber.toUpperCase() !== confirmUtrNumber.toUpperCase()) {
            setError('UTR numbers do not match')
            return
        }

        setIsVerifying(true)

        try {
            const token = await auth.currentUser?.getIdToken()

            const response = await fetch('/api/payment/verify-utr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    utrNumber: utrNumber.toUpperCase(),
                    includeRoboSoccer: includeRoboSoccer,
                    amount: totalAmount
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Verification failed. Please try again.')
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push(isAdmin ? '/admin' : '/profile')
            }, 5000)
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please try again.')
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center px-2 sm:px-4 py-8 sm:py-12 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Glowing Orb */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.25, 0.15]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
            />

            <div className="max-w-2xl w-full relative z-10">
                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[1.8rem] md:rounded-[2.5rem] shadow-[0_0_80px_rgba(16,185,129,0.15)] border border-emerald-500/20 overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-6 sm:p-10 md:p-16 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-emerald-500/10 backdrop-blur-md rounded-full mb-6 relative border-2 border-emerald-500/30"
                        >
                            <QrCode className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`${orbitron.className} text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter`}
                        >
                            <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                                UPI PAYMENT
                            </span>
                        </motion.h1>

                        <p className="text-gray-400 text-sm md:text-base">Scan QR or pay via UPI</p>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-10 md:p-12 pt-0 space-y-8">
                        {/* RoboSoccer Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors cursor-pointer"
                            onClick={() => setIncludeRoboSoccer(!includeRoboSoccer)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <div className={`relative w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${includeRoboSoccer
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'bg-transparent border-white/30'
                                    }`}>
                                    {includeRoboSoccer && (
                                        <CheckCircle className="w-4 h-4 text-black" />
                                    )}
                                </div>

                                {/* Text */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-white font-bold text-base">Enable RoboSoccer Access</h3>
                                        <span className="text-emerald-400 font-bold text-lg whitespace-nowrap">+₹300</span>
                                    </div>
                                    <p className="text-gray-400 text-xs">
                                        Pay extra ₹300 to unlock eligibility for RoboSoccer event registration.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Amount Display */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-6 space-y-4"
                        >
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">
                                Payment Amount
                            </p>

                            <div className="space-y-3">
                                {/* Base Fee */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">
                                        Base Fee
                                    </span>
                                    <span className="text-white font-bold">
                                        ₹300
                                    </span>
                                </div>

                                {/* RoboSoccer Fee */}
                                {includeRoboSoccer && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">RoboSoccer Access</span>
                                        <span className="text-white font-bold">₹300</span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t border-emerald-500/20 my-3"></div>

                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-400 font-bold text-lg uppercase tracking-wide">
                                        Total Amount
                                    </span>
                                    <span className={`${orbitron.className} text-3xl font-black text-white`}>
                                        ₹{totalAmount}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* QR Code Display */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">
                                Scan This QR
                            </p>
                            <div className="flex justify-center bg-white/5 border border-emerald-500/20 rounded-2xl">
                                <div className="flex justify-center items-center p-0 rounded-xl overflow-hidden w-full">
                                    <Image
                                        src={QR_CODE_IMAGE}
                                        alt="UPI Payment QR Code"
                                        width={400}
                                        height={400}
                                        unoptimized
                                        className="w-full sm:w-72 md:w-80 object-contain"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* UTR Number Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-3"
                        >
                            <label className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">
                                Enter UTR Number
                            </label>
                            <input
                                type="text"
                                value={utrNumber}
                                onChange={(e) => {
                                    setUtrNumber(e.target.value.toUpperCase())
                                    setError('')
                                }}
                                placeholder="Enter UTR number"
                                maxLength={30}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors text-lg font-mono font-bold tracking-widest"
                            />
                            <p className="text-[10px] text-gray-500 font-medium">
                                You'll find this in your bank's transaction details
                            </p>
                        </motion.div>

                        {/* Confirm UTR Number Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="space-y-3"
                        >
                            <label className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">
                                Confirm UTR Number
                            </label>
                            <input
                                type="text"
                                value={confirmUtrNumber}
                                onChange={(e) => {
                                    setConfirmUtrNumber(e.target.value.toUpperCase())
                                    setError('')
                                }}
                                placeholder="Re-enter UTR number"
                                maxLength={30}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors text-lg font-mono font-bold tracking-widest"
                            />
                            <p className="text-[10px] text-gray-500 font-medium">
                                Please re-enter your UTR number for confirmation
                            </p>
                        </motion.div>

                        {/* Error Display */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-400 text-sm font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Verify Button */}
                        <motion.button
                            onClick={handleVerifyPayment}
                            disabled={isVerifying || !utrNumber.trim() || !confirmUtrNumber.trim()}
                            whileHover={{ scale: isVerifying ? 1 : 1.01 }}
                            whileTap={{ scale: isVerifying ? 1 : 0.99 }}
                            className="relative w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold py-5 sm:py-6 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group isolate"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isVerifying ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-lg tracking-wide uppercase">Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg tracking-wide uppercase">Verify Payment</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>

                        {/* Back Link */}
                        <div className="text-center pt-4 border-t border-white/5">
                            <Link
                                href={isAdmin ? "/admin" : "/profile"}
                                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 font-medium transition-colors group"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Back to Profile
                            </Link>
                        </div>

                        {/* Footer Links */}
                        <div className="pt-6 mt-6 border-t border-white/5">
                            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                                    Terms of Service
                                </Link>
                                <span className="text-gray-700">•</span>
                                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                                    Privacy Policy
                                </Link>
                                <span className="text-gray-700">•</span>
                                <Link href="/refund-policy" className="hover:text-emerald-400 transition-colors">
                                    Refund Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0a0a0a] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/30"
                            >
                                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
                            </motion.div>

                            <h2 className={`${orbitron.className} text-2xl sm:text-3xl font-black text-white text-center mb-4`}>
                                Payment Submitted!
                            </h2>

                            <p className="text-gray-400 text-sm text-center">
                                Your payment has been submitted successfully. You can now register for events. Redirecting to profile in a moment...
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function QRPaymentPage() {
    return <QRPaymentContent />
}