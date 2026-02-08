'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

export function ContactNavbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [labelIndex, setLabelIndex] = useState(0)
    const pathname = usePathname()
    const { pageTheme } = useApp()

    const labels = ["MENU", "CONTACT", "TEAM"]

    // Auto-close on path change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Cycle labels
    useEffect(() => {
        const timer = setInterval(() => {
            setLabelIndex(prev => (prev + 1) % labels.length)
        }, 2500)
        return () => clearInterval(timer)
    }, [])

    // Theme color backup
    const isDevPage = pathname === '/developers'
    // const isDevPage = false
    const themeColor = pageTheme?.rgb ? `rgb(${pageTheme.rgb})` : '#10b981'

    return (
        <div
            className={cn(
                "fixed z-[6000] flex font-mono gap-4",
                "top-3 right-3 sm:top-6 sm:right-6",
                "items-center justify-end",
                "w-full max-w-[100vw] px-2 sm:px-0"
            )}
        >
            {/* Toggle Button */}
            <motion.div
                initial={false}
                animate={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: isOpen ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
                    borderColor: isOpen ? `${themeColor}80` : 'rgba(255,255,255,0.1)'
                }}
                className={cn(
                    "relative rounded-full backdrop-blur-xl border flex items-center justify-center shadow-2xl transition-all duration-300",
                    "order-2",
                    "h-[44px] w-[44px] sm:h-[56px] sm:w-[56px]"
                )}
                style={{
                    boxShadow: isOpen ? `0 0 30px ${themeColor}40` : `0 0 0px ${themeColor}00`,
                }}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full h-full flex items-center justify-center relative shrink-0 group z-10 bg-transparent"
                    aria-label="Menu"
                >
                    {/* Intense Attention Rings when closed */}
                    {!isOpen && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full border-2"
                                style={{ borderColor: themeColor }}
                            />
                            <motion.div
                                animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                className="absolute inset-0 rounded-full border"
                                style={{ borderColor: themeColor }}
                            />
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-1 sm:gap-2 transition-transform duration-300 group-hover:rotate-90">
                        {[0, 1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    backgroundColor: isOpen ? themeColor : '#ffffff',
                                    scale: isOpen ? 1 : [1, 1.1, 1],
                                }}
                                transition={{
                                    scale: {
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                        ease: "easeInOut"
                                    },
                                    backgroundColor: { duration: 0.3 }
                                }}
                                className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shadow-sm"
                                style={{
                                    boxShadow: isOpen ? `0 0 5px ${themeColor}` : '0 0 2px rgba(255,255,255,0.8)'
                                }}
                            />
                        ))}
                    </div>
                </button>
            </motion.div>

            {/* Dropdown Menu for mobile (glassmorphic, glowing, theme color) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -8 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="absolute top-14 right-1 sm:static sm:top-auto sm:right-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-6 px-4 py-3 sm:px-6 sm:py-3 z-[6100] min-w-[120px] max-w-[92vw]"
                        style={{
                            background: `linear-gradient(135deg, rgba(0,0,0,0.82) 60%, rgba(0,0,0,0.68) 100%)`,
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            borderRadius: '1.3rem',
                            border: `1.5px solid ${themeColor}55`,
                            boxShadow: `0 0 18px 0 ${themeColor}50, 0 2px 16px 0 #0007, 0 0 0 0.5px #fff2 inset`,
                            overflow: 'hidden',
                        }}
                    >
                        <Link
                            href="/contact"
                            className="text-[15px] sm:text-sm font-extrabold tracking-[0.18em] text-white/90 hover:text-white transition-all duration-150 uppercase text-center hover:scale-[1.04] active:scale-95"
                            style={{
                                color: themeColor,
                                textShadow: `0 0 10px ${themeColor}70, 0 0 2px #000`,
                                letterSpacing: '0.18em',
                            }}
                            onClick={() => setIsOpen(false)}
                        >
                            Contact
                        </Link>

                        <div className="w-full h-[1px] bg-white/10 sm:w-1.5 sm:h-1.5 sm:rounded-full sm:bg-white/50 sm:my-0 my-1" style={{boxShadow: `0 0 4px ${themeColor}40`}} />

                        <Link
                            href="/developers"
                            className="text-[15px] sm:text-sm font-extrabold tracking-[0.18em] text-white/90 hover:text-white transition-all duration-150 uppercase text-center hover:scale-[1.04] active:scale-95"
                            style={{
                                color: themeColor,
                                textShadow: `0 0 10px ${themeColor}70, 0 0 2px #000`,
                                letterSpacing: '0.18em',
                            }}
                            onClick={() => setIsOpen(false)}
                        >
                            Developers
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attention Text - Cycling Label */}
            <AnimatePresence mode="wait">
                {!isOpen && (
                    <motion.div
                        key={labels[labelIndex]}
                        initial={isDevPage ? { opacity: 0, y: -10 } : { opacity: 0, x: 10 }}
                        animate={isDevPage ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
                        exit={isDevPage ? { opacity: 0, y: 10 } : { opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "flex items-center gap-2 sm:gap-3",
                            "flex-row order-1 mr-2 sm:mr-4"
                        )}
                    >
                        <div
                            className={cn(
                                "font-black tracking-[0.2em] uppercase",
                                "text-[10px] sm:text-xs"
                            )}
                            style={{
                                color: themeColor,
                                textShadow: `0 0 10px ${themeColor}80`
                            }}
                        >
                            {labels[labelIndex]}
                        </div>
                        {!isDevPage && (
                            <div
                                className="h-[1px] w-6 sm:w-8 md:w-12"
                                style={{ backgroundColor: themeColor, boxShadow: `0 0 5px ${themeColor}` }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
