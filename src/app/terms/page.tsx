'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Shield, AlertTriangle, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
})

const sections = [
    {
        title: "Overview",
        icon: FileText,
        content: [
            "This website is operated by Shri Madhwa Vadiraja Institute of Technology and Management, Bantakal, Karnataka, India. Throughout the site, the terms \"we\", \"us\", and \"our\" refer to the organizers of Varnothsava.",
            "By visiting our website and/or registering for or participating in Varnothsava, you engage in our \"Service\" and agree to be bound by the following Terms and Conditions (\"Terms of Service\", \"Terms\"), including any additional policies referenced herein.",
            "These Terms apply to all users of the website and participants of the event.",
            "If you do not agree to these Terms, you may not access the website or participate in Varnothsava."
        ]
    },
    {
        title: "Section 1 – Participation Eligibility",
        icon: Shield,
        content: [
            "Participation in Varnothsava is strictly limited to students from Engineering and Management colleges.",
            "Registrations found to be fraudulent, misleading, or from non-engineering or non-management institutions will be cancelled.",
            "In such cases, the organizers reserve the right to deny refunds.",
            "Participants must comply with all event rules and college regulations."
        ]
    },
    {
        title: "Section 2 – Code of Conduct",
        icon: AlertTriangle,
        content: [
            "Participants shall:",
            "• Not engage in illegal or unauthorized activities",
            "• Not violate any applicable laws of India",
            "• Not transmit harmful code, viruses, or malicious software",
            "• Maintain respectful behavior toward organizers, volunteers, judges, and fellow participants",
            "",
            "Any violation of these Terms may result in:",
            "• Immediate disqualification",
            "• Removal from the event",
            "• Cancellation of registration without refund",
            "• Further disciplinary or legal action if necessary"
        ]
    },
    {
        title: "Section 3 – General Conditions",
        icon: FileText,
        content: [
            "We reserve the right to refuse participation to anyone at our discretion.",
            "Event schedules, venues, rules, and formats may be modified without prior notice.",
            "Content submitted by participants (photos, videos, designs, presentations, etc.) may be used by the organizers for promotional and documentation purposes.",
            "Participants may not reproduce, duplicate, or exploit event content without written permission."
        ]
    },
    {
        title: "Section 4 – Registration and Payment",
        icon: FileText,
        content: [
            "Registration fees are subject to change without notice.",
            "Payments are processed securely through Razorpay.",
            "The organizers do not store debit/credit card details.",
            "Registration is confirmed only after successful payment verification.",
            "Refunds, if applicable, are subject to organizer discretion and event policy."
        ]
    },
    {
        title: "Section 5 – Event Modifications or Cancellation",
        icon: AlertTriangle,
        content: [
            "We reserve the right to:",
            "• Modify event details",
            "• Reschedule events",
            "• Change venues",
            "• Cancel events due to unforeseen circumstances (including but not limited to force majeure events such as natural disasters, government restrictions, technical failures, or emergencies)",
            "",
            "In such cases, liability shall be limited to the extent permitted by law."
        ]
    },
    {
        title: "Section 6 – Accuracy of Information",
        icon: FileText,
        content: [
            "Participants agree to provide:",
            "• Accurate",
            "• Complete",
            "• Current registration information",
            "",
            "Failure to provide accurate information may result in cancellation of participation.",
            "We are not responsible for errors caused by incorrect details submitted by participants."
        ]
    },
    {
        title: "Section 7 – Third-Party Services",
        icon: FileText,
        content: [
            "The website may contain third-party services such as:",
            "• Payment gateways",
            "• Communication platforms",
            "• External tools",
            "",
            "We are not responsible for third-party policies, services, or actions. Users are encouraged to review their respective terms and privacy policies."
        ]
    },
    {
        title: "Section 8 – User Submissions",
        icon: FileText,
        content: [
            "If participants submit creative ideas, designs, media, feedback, or suggestions, the organizers may use, edit, publish, and distribute such submissions for promotional or academic purposes without obligation of compensation.",
            "",
            "Participants confirm that their submissions:",
            "• Do not violate copyright or intellectual property rights",
            "• Do not contain unlawful or offensive content",
            "• Do not infringe on third-party rights"
        ]
    },
    {
        title: "Section 9 – Prohibited Uses",
        icon: AlertTriangle,
        content: [
            "Participants are prohibited from:",
            "• Violating laws or regulations",
            "• Infringing intellectual property rights",
            "• Harassing or discriminating against others",
            "• Submitting false information",
            "• Attempting to hack, scrape, or interfere with the website",
            "• Collecting personal information of other participants",
            "",
            "Violation may lead to immediate termination of participation."
        ]
    },
    {
        title: "Section 10 – Disclaimer of Warranties",
        icon: AlertTriangle,
        content: [
            "Varnothsava and its services are provided on an \"as is\" and \"as available\" basis.",
            "",
            "We do not guarantee:",
            "• Uninterrupted or error-free service",
            "• Accuracy or reliability of all information",
            "• That the event will meet individual expectations",
            "",
            "Participation is at your own risk."
        ]
    },
    {
        title: "Section 11 – Limitation of Liability",
        icon: Shield,
        content: [
            "To the maximum extent permitted by law, Shri Madhwa Vadiraja Institute of Technology and Management, its organizers, faculty, volunteers, sponsors, and affiliates shall not be liable for:",
            "• Any direct or indirect losses",
            "• Personal injury",
            "• Property damage",
            "• Data loss",
            "• Financial loss",
            "• Event cancellation impacts",
            "",
            "arising from participation in Varnothsava."
        ]
    },
    {
        title: "Section 12 – Indemnification",
        icon: Shield,
        content: [
            "You agree to indemnify and hold harmless Shri Madhwa Vadiraja Institute of Technology and Management, its organizers, faculty members, volunteers, and affiliates from any claims, damages, or legal expenses arising from your violation of these Terms or applicable laws."
        ]
    },
    {
        title: "Section 13 – Severability",
        icon: FileText,
        content: [
            "If any provision of these Terms is found to be unlawful or unenforceable, the remaining provisions shall remain valid and enforceable."
        ]
    },
    {
        title: "Section 14 – Termination",
        icon: AlertTriangle,
        content: [
            "We may terminate or suspend your participation without notice if:",
            "• You violate these Terms",
            "• You engage in misconduct",
            "• You provide false information",
            "",
            "Termination does not relieve you of any liabilities incurred prior to termination."
        ]
    },
    {
        title: "Section 15 – Governing Law",
        icon: FileText,
        content: [
            "These Terms shall be governed by and construed in accordance with the laws of India.",
            "Any disputes shall fall under the jurisdiction of courts located in Udupi, Karnataka."
        ]
    },
    {
        title: "Section 16 – Changes to Terms",
        icon: FileText,
        content: [
            "We reserve the right to update or modify these Terms at any time.",
            "Continued participation after changes constitutes acceptance of the updated Terms."
        ]
    }
]

export default function TermsPage() {
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
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                    </motion.div>

                    <h1 className={`${orbitron.className} text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter`}>
                        <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                            TERMS & CONDITIONS
                        </span>
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
                        Please read these terms carefully before participating in Varnothsava
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
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
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
                            For questions regarding these Terms and Conditions, please contact:
                        </p>
                        <div className="space-y-3 pl-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <a href="mailto:webmaster@sode-edu.in" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    webmaster@sode-edu.in
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <a href="tel:+919738405453" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    +91 9738405453
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
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
