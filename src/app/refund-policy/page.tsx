'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, CreditCard, AlertCircle, XCircle, ShieldCheck, Lock, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
})

const sections = [
    {
        title: "1. Introduction",
        icon: DollarSign,
        content: [
            "Varnothsava uses Razorpay, a secure and PCI-DSS compliant payment gateway, to ensure a smooth and secure registration process.",
            "This Refund Policy outlines the terms under which refunds may be processed and clarifies our stance on registration payments.",
            "By completing a registration on our website, you agree to this Refund Policy."
        ]
    },
    {
        title: "2. Payment Process",
        icon: CreditCard,
        content: [
            "We offer a seamless and secure online payment experience through Razorpay.",
            "",
            "Available payment methods may include:",
            "• Debit Cards",
            "• Credit Cards",
            "• Net Banking",
            "• UPI",
            "• Other digital payment options supported by Razorpay",
            "",
            "Once you select your preferred payment method, you will be redirected to Razorpay's secure payment gateway to complete the transaction.",
            "We do not store your card details on our servers."
        ]
    },
    {
        title: "3. Refunds for Failed or Unsuccessful Transactions",
        icon: AlertCircle,
        content: [
            "In case of:",
            "• Technical errors",
            "• Payment gateway failures",
            "• Network interruptions",
            "• Duplicate transactions due to system error",
            "",
            "If the transaction is unsuccessful but the amount is debited from your account, the payment gateway will automatically initiate a refund.",
            "The refunded amount will typically be credited back to your original payment source within 5–7 business days, depending on your bank or payment provider.",
            "This automatic refund applies only to unsuccessful or failed transactions caused by technical or processing errors."
        ]
    },
    {
        title: "4. Non-Refundable Registrations",
        icon: XCircle,
        content: [
            "All successful registrations for Varnothsava are non-refundable.",
            "",
            "Once payment is successfully processed:",
            "• Registration fees cannot be cancelled",
            "• No refund will be issued for non-attendance",
            "• No refund will be issued for voluntary withdrawal",
            "",
            "This policy ensures fair allocation of limited event slots and proper event planning."
        ]
    },
    {
        title: "5. Fraudulent or Ineligible Registrations",
        icon: ShieldCheck,
        content: [
            "Participation in Varnothsava is strictly limited to engineering and management college students.",
            "",
            "If:",
            "• A participant provides false information",
            "• A registration is made from a non-engineering or non-management institution",
            "• Any fraudulent activity is detected",
            "",
            "The organizing committee reserves the right to:",
            "• Cancel the registration",
            "• Disqualify the participant",
            "• Deny any refund"
        ]
    },
    {
        title: "6. Event Modification or Cancellation",
        icon: AlertCircle,
        content: [
            "In the rare event that Varnothsava is cancelled or rescheduled due to unforeseen circumstances (such as government restrictions, force majeure events, or emergencies), refund decisions will be made at the discretion of the organizing committee and communicated officially."
        ]
    },
    {
        title: "7. Payment Security",
        icon: Lock,
        content: [
            "We prioritize your payment security.",
            "",
            "All transactions are processed through Razorpay, which follows:",
            "• PCI-DSS compliance standards",
            "• Industry-standard encryption protocols",
            "• Secure authentication mechanisms",
            "",
            "We only retain limited payment-related details such as:",
            "• Email used for payment",
            "• Transaction amount",
            "• Payment method",
            "• UTR / Transaction ID",
            "",
            "We do not store card numbers, CVV, or banking credentials."
        ]
    }
]

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-[#020202] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Glowing Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-40 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute bottom-40 left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
            />

            <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 backdrop-blur-md rounded-full mb-6 border-2 border-emerald-500/30"
                    >
                        <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                    </motion.div>

                    <h1 className={`${orbitron.className} text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter`}>
                        <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                            REFUND POLICY
                        </span>
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-6">
                        Varnothsava - Organized by Shri Madhwa Vadiraja Institute of Technology and Management
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm max-w-3xl mx-auto">
                        Bantakal, Karnataka, India
                    </p>
                </motion.div>

                {/* Important Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-8 p-4 sm:p-6 bg-red-500/10 border border-red-500/30 rounded-2xl"
                >
                    <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm sm:text-base">
                            <strong>Important:</strong> All successful registrations for Varnothsava are non-refundable. Please read this policy carefully before completing your payment.
                        </p>
                    </div>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                            className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6 sm:p-8 hover:border-emerald-500/40 transition-all"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <section.icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className={`${orbitron.className} text-xl sm:text-2xl font-bold text-white pt-1`}>
                                    {section.title}
                                </h2>
                            </div>
                            <div className="pl-0 sm:pl-14 space-y-3">
                                {section.content.map((paragraph, pIndex) => (
                                    <p key={pIndex} className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-8 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6 sm:p-8"
                >
                    <h2 className={`${orbitron.className} text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3`}>
                        <Mail className="w-6 h-6 text-emerald-400" />
                        Contact Information
                    </h2>
                    <div className="space-y-4 text-gray-400">
                        <p className="text-sm sm:text-base">
                            For any questions regarding payments or refunds, please contact:
                        </p>
                        <div className="space-y-3 pl-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                                <a href="mailto:webmaster@sode-edu.in" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    webmaster@sode-edu.in
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                                <a href="tel:+919738405453" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    +91 9738405453
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                                <span className="text-gray-400">
                                    Shri Madhwa Vadiraja Institute of Technology and Management,<br />
                                    Bantakal, Karnataka, India
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Our team will respond to your queries at the earliest.
                        </p>
                    </div>
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-emerald-400 font-semibold transition-all"
                    >
                        ← Back to Home
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

