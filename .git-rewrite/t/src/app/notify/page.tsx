'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, CheckCircle, Sparkles, Calendar, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '900'],
})

export default function NotifyPage() {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        fetch('/api/notify/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        }).then(async (res) => {
            if (res.ok) {
                // Success
                setIsLoading(false)
                setIsSubmitted(true)
                setEmail('')
            } else {
                // Handle error
                setIsLoading(false)
            }
        }).catch(() => {
            // Handle network error
            setIsLoading(false)
        })
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

            {/* Floating Particles */}
            {[
                { left: 5, top: 20, x: 10, duration: 5 },
                { left: 13, top: 45, x: -8, duration: 6 },
                { left: 21, top: 70, x: 12, duration: 4.5 },
                { left: 29, top: 35, x: -15, duration: 5.5 },
                { left: 37, top: 60, x: 8, duration: 6.5 },
                { left: 45, top: 25, x: -10, duration: 4 },
                { left: 53, top: 80, x: 14, duration: 7 },
                { left: 61, top: 50, x: -12, duration: 5 },
                { left: 69, top: 40, x: 9, duration: 6 },
                { left: 77, top: 65, x: -11, duration: 4.5 },
                { left: 85, top: 30, x: 13, duration: 5.5 },
                { left: 93, top: 75, x: -9, duration: 6.5 }
            ].map((particle, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
                    animate={{
                        y: [0, -50, 0],
                        x: [0, particle.x, 0],
                        opacity: [0, 0.6, 0]
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: i * 0.3
                    }}
                    style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`
                    }}
                />
            ))}

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
                            <Bell className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-emerald-400" />
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
                                REGISTRATIONS
                            </span>
                            <br className="sm:hidden" />
                            <span className="text-emerald-400 mt-2 sm:mt-0 block sm:inline"> OPENING SOON</span>
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
                            Be the first to secure your spot at <span className="text-emerald-400 font-bold underline decoration-emerald-500/30">Varnothsava 2K26</span>
                        </motion.p>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 sm:p-10 md:p-12 pt-0">
                        {!isSubmitted ? (
                            <>
                                {/* Info Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 md:mb-10">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="group relative p-5 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative flex items-center gap-3 sm:gap-4 text-left">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                                                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">Opening Date</p>
                                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Announced Very Soon</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="group relative p-5 sm:p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative flex items-center gap-3 sm:gap-4 text-left">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                                                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm font-bold text-purple-400 uppercase tracking-wider">Priority Access</p>
                                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Get Notified Instantly</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Email Form */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="relative"
                                >
                                    <div className="text-center mb-6 md:mb-8 px-4 sm:px-0">
                                        <h2 className={`${orbitron.className} text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 tracking-tight`}>
                                            GET INSTANT NOTIFICATION
                                        </h2>
                                        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                                            Enter your email and we'll notify you the moment registrations open
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 max-w-xl mx-auto px-2 sm:px-0">
                                        <div className="relative group">
                                            <Mail className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/60 group-focus-within:text-emerald-400 transition-colors z-10" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your.email@example.com"
                                                required
                                                className="w-full pl-12 sm:pl-14 pr-5 py-4 sm:py-5 bg-black/50 border-2 border-emerald-500/20 rounded-2xl focus:border-emerald-500 focus:bg-black/70 focus:outline-none transition-all text-white placeholder-gray-500 font-medium backdrop-blur-sm text-sm sm:text-base"
                                            />
                                            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="relative w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold py-4 sm:py-5 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group isolate"
                                        >
                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity text-sm sm:text-base" />
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                                                    <span className="text-base sm:text-lg">Subscribing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-base sm:text-lg tracking-wide uppercase">NOTIFY ME</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>

                                    <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-6 flex items-center justify-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        Your privacy is protected. Unsubscribe anytime.
                                    </p>
                                </motion.div>
                            </>
                        ) : (
                            // Success State
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 sm:py-12"
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 bg-emerald-500/20 rounded-full mb-6 sm:mb-8 border-4 border-emerald-500/30 relative"
                                >
                                    <CheckCircle className="w-10 h-10 sm:w-16 sm:h-16 text-emerald-400" />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 border-4 border-emerald-400 rounded-full"
                                    />
                                </motion.div>

                                <h2 className={`${orbitron.className} text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight`}>
                                    YOU'RE ALL SET! 🎉
                                </h2>
                                <p className="text-base sm:text-xl text-gray-400 mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
                                    We'll notify you instantly when registrations open. Check your inbox!
                                </p>

                                <motion.button
                                    onClick={() => setIsSubmitted(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors border-b-2 border-emerald-400/30 hover:border-emerald-400 pb-1 text-sm sm:text-base"
                                >
                                    Subscribe Another Email
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Back to Home Link */}
                        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5 text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-400 hover:text-emerald-400 font-medium transition-colors group"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-gray-500 mt-6 sm:mt-8 text-[11px] sm:text-sm flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-4"
                >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                    <span>Join thousands waiting for Varnothsava 2K26</span>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                </motion.p>
            </div>
        </div>
    )
}
