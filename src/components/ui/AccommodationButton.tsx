'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hotel } from 'lucide-react'

const ACCOMMODATION_URL = 'https://forms.gle/8hxLvddT7a9GuARm6'
const ACCOM_LABELS = ["BOOK NOW", "STAY", "ROOMS"]

interface AccommodationButtonProps {
    isMobile: boolean
    themeRgb: string
}

export function AccommodationButton({ isMobile: isMobileProp, themeRgb }: AccommodationButtonProps) {
    const [accomLabelIndex, setAccomLabelIndex] = useState(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setAccomLabelIndex((prev) => (prev + 1) % ACCOM_LABELS.length)
        }, 2500)
        return () => clearInterval(timer)
    }, [])
    const isMobile = mounted ? isMobileProp : false

    return (
        <div className="absolute left-0 bottom-[110px] md:bottom-[-20px] md:left-[-110px] xl:left-[-130px] flex flex-col items-center gap-3 pointer-events-auto z-40">
            {/* Hint label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden xl:block px-4 py-2 bg-black/60 backdrop-blur-3xl border border-[rgba(var(--theme-rgb),0.2)] rounded-2xl shadow-2xl relative"
            >
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/60 border-r border-b border-[rgba(var(--theme-rgb),0.2)] rotate-45" />
                <div className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={ACCOM_LABELS[accomLabelIndex]}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25 }}
                            className="text-[rgb(var(--theme-rgb))] text-[10px] font-black tracking-[0.2em] uppercase"
                        >
                            {ACCOM_LABELS[accomLabelIndex]}
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-white/40 text-[8px] font-medium uppercase tracking-widest whitespace-nowrap">Accommodation</span>
                </div>
            </motion.div>

            {/* Button */}
            <a
                href={ACCOMMODATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative group"
                aria-label="Book Accommodation"
            >
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 md:p-5 bg-black/60 backdrop-blur-3xl border border-[rgba(var(--theme-rgb),0.3)] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
                >
                    <Hotel size={isMobile ? 22 : 24} className="text-[rgb(var(--theme-rgb))]" />
                    <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050805] animate-bounce shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </motion.div>

                {/* Mobile label */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 xl:hidden whitespace-nowrap">
                    <span className="text-[rgb(var(--theme-rgb))] text-[8px] font-black uppercase tracking-widest opacity-80 bg-black/20 px-2 py-0.5 rounded-full">Stay</span>
                </div>
            </a>
        </div>
    )
}