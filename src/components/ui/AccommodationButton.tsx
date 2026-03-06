'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hotel } from 'lucide-react'

const ACCOMMODATION_URL = 'https://forms.gle/8hxLvddT7a9GuARm6'

const LABELS = ["BOOK NOW", "ACCOMMODATION", "CLICK HERE"]

export function AccommodationButton() {
    const [labelIndex, setLabelIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setLabelIndex(prev => (prev + 1) % LABELS.length)
        }, 2500)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="fixed bottom-6 left-6 z-9998 flex items-center gap-3 pointer-events-none">
            {/* FAB Button */}
            <motion.a
                href={ACCOMMODATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#0a0a0a] border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(16,185,129,0.1)] flex items-center justify-center hover:border-emerald-500/60 hover:shadow-[0_8px_40px_rgba(16,185,129,0.15)] transition-all duration-300 group pointer-events-auto"
                aria-label="Accommodation Details"
            >
                <motion.span
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-2 border-emerald-500"
                />
                <motion.span
                    animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    className="absolute inset-0 rounded-full border border-emerald-500"
                />
                <Hotel className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors relative z-10" />
            </motion.a>

            {/* Cycling Label */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={LABELS[labelIndex]}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 sm:gap-3 pointer-events-none"
                >
                    <div
                        className="h-px w-6 sm:w-8"
                        style={{ backgroundColor: '#10b981', boxShadow: '0 0 5px #10b981' }}
                    />
                    <span
                        className="font-black tracking-[0.2em] uppercase text-[10px] sm:text-xs font-mono"
                        style={{ color: '#10b981', textShadow: '0 0 10px rgba(16,185,129,0.8)' }}
                    >
                        {LABELS[labelIndex]}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}