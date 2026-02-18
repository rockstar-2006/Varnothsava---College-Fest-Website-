'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Database, Eye, Share2, Cookie, Mail, Phone, MapPin, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
})

const sections = [
    {
        title: "1. Consent",
        icon: Shield,
        content: [
            "By registering for Varnothsava and submitting your personal information, you consent to the collection, use, and processing of your information in accordance with this Privacy Policy.",
            "If you do not agree with any part of this policy, please refrain from submitting your information or participating in the event."
        ]
    },
    {
        title: "2. Eligibility",
        icon: AlertCircle,
        content: [
            "Registrations for Varnothsava are strictly limited to students from engineering colleges.",
            "If any participant provides false, misleading, or inaccurate information during registration, Varnothsava reserves the right to cancel the registration without refund."
        ]
    },
    {
        title: "3. Information We Collect",
        icon: Database,
        content: [
            "We collect personally identifiable information that you voluntarily provide during registration. This may include:",
            "• Full Name",
            "• Email Address",
            "• Phone Number",
            "• College Name",
            "• Payment-related details (Email used for payment, amount paid, payment method, UTR/Transaction ID)",
            "",
            "We do not store full card details, CVV numbers, or sensitive banking credentials."
        ]
    },
    {
        title: "4. Use of Information",
        icon: Eye,
        content: [
            "We use the collected information for:",
            "• Processing event registrations",
            "• Payment verification",
            "• Sending event updates and important announcements",
            "• Sharing promotional emails related to Varnothsava",
            "• Providing WhatsApp group links for event coordination",
            "• Responding to participant queries",
            "",
            "Participants may opt out of promotional communications at any time by contacting us."
        ]
    },
    {
        title: "5. Payment Processing and Security",
        icon: Lock,
        content: [
            "All payments are securely processed through our authorized payment gateway partner, Razorpay.",
            "Razorpay complies with PCI-DSS standards established by the PCI Security Standards Council, which includes major card brands such as Visa, Mastercard, American Express, and Discover.",
            "",
            "Important notes:",
            "• We do not store your debit/credit card details",
            "• Payment data such as email, transaction amount, payment method, and UTR/Transaction ID may be retained for verification and accounting purposes",
            "• Razorpay may process payment data in accordance with its own Privacy Policy and applicable laws",
            "",
            "For more information, please refer to Razorpay's official website."
        ]
    },
    {
        title: "6. Data Retention and Deletion",
        icon: Database,
        content: [
            "We retain your personal information only for as long as necessary to:",
            "• Fulfil event-related obligations",
            "• Comply with legal or financial record requirements",
            "",
            "Participants may request deletion of their personal data at any time by contacting us. Upon receiving a verified request, we will delete the personal data unless retention is required by law."
        ]
    },
    {
        title: "7. Sharing of Information",
        icon: Share2,
        content: [
            "We do not sell, rent, or trade your personal information.",
            "",
            "We may share your data only with:",
            "• Payment gateway partners (e.g., Razorpay)",
            "• Technical service providers assisting with website hosting or maintenance",
            "• Authorities if required under applicable laws",
            "",
            "All third-party partners are required to maintain confidentiality and data security."
        ]
    },
    {
        title: "8. Third-Party Services",
        icon: Share2,
        content: [
            "Our website may integrate third-party services such as payment gateways or communication tools.",
            "",
            "Please note:",
            "• Third-party providers may operate under different privacy policies",
            "• If redirected to another website, this Privacy Policy no longer applies",
            "• Your data may be subject to the jurisdiction of the third-party service provider",
            "",
            "We recommend reviewing the privacy policies of such providers."
        ]
    },
    {
        title: "9. Cookies",
        icon: Cookie,
        content: [
            "We may use cookies to:",
            "• Maintain user sessions",
            "• Improve user experience",
            "• Analyze website performance",
            "",
            "We do not use cookies to collect sensitive personal information or track users across unrelated websites."
        ]
    },
    {
        title: "10. Security Measures",
        icon: Lock,
        content: [
            "We implement industry-standard security measures including:",
            "• SSL encryption",
            "• Secure server infrastructure",
            "• Restricted access to authorized personnel only",
            "",
            "Despite our best efforts, no digital transmission or storage system is 100% secure. However, we strive to use commercially acceptable means to protect your personal information."
        ]
    },
    {
        title: "11. Links to Other Websites",
        icon: Share2,
        content: [
            "Our website may contain links to external websites. We are not responsible for the privacy practices or content of third-party websites. Users are advised to review their respective privacy policies."
        ]
    },
    {
        title: "12. Changes to This Privacy Policy",
        icon: AlertCircle,
        content: [
            "Varnothsava reserves the right to update or modify this Privacy Policy at any time.",
            "Any changes will become effective immediately upon posting on the website. Significant changes will be notified through appropriate communication channels.",
            "We encourage users to review this page periodically."
        ]
    }
]

export default function PrivacyPage() {
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
                        <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                    </motion.div>

                    <h1 className={`${orbitron.className} text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter`}>
                        <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                            PRIVACY POLICY
                        </span>
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-6">
                        Varnothsava - Organized by Shri Madhwa Vadiraja Institute of Technology and Management
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm max-w-3xl mx-auto">
                        At Varnothsava, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you register for and participate in our event.
                    </p>
                </motion.div>

                {/* Important Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-8 p-4 sm:p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl"
                >
                    <p className="text-emerald-400 text-sm sm:text-base text-center">
                        <strong>By accessing or registering on the Varnothsava website, you agree to the terms outlined in this Privacy Policy.</strong>
                    </p>
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
                            For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:
                        </p>
                        <div className="space-y-3 pl-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                                <a href="mailto:raghugs.cs@sode-edu.in" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    raghugs.cs@sode-edu.in
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

