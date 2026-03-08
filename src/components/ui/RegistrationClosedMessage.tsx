"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Clock } from 'lucide-react'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '900'],
})

export default function RegistrationClosedMessage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full relative bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[1.8rem] md:rounded-[2.5rem] shadow-[0_0_80px_rgba(16,185,129,0.15)] border border-emerald-500/20 overflow-hidden isolate p-8 sm:p-12 md:p-16 text-center"
        >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 bg-emerald-500/10 backdrop-blur-md rounded-full mb-8 relative border-2 border-emerald-500/30"
            >
                <Lock className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-400" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${orbitron.className} text-2xl sm:text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-wider`}
            >
                Registration Closed
            </motion.h2>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-xl mx-auto space-y-4"
            >
                <p className="text-gray-400 text-base sm:text-lg">
                    The online registration is closed and the registration will reopen on March 11 On Spot .
                </p>

                <div className="inline-flex items-center gap-3 mt-6 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
                        Resumes: March 11, 2026 - 8:00 AM
                    </span>
                </div>
            </motion.div>

            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-1 w-24 sm:w-48 mx-auto bg-gradient-to-r from-transparent via-emerald-500 to-transparent mt-10"
            />
        </motion.div>
    )
}
