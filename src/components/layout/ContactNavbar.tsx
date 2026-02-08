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
    const themeColor = pageTheme?.rgb ? `rgb(${pageTheme.rgb})` : '#10b981'

    return (
        <div className={cn(
            "fixed top-6 right-6 z-[6000] flex font-mono gap-4",
            isDevPage ? "flex-col items-center justify-start" : "items-center justify-end"
        )}>
            <motion.div
                initial={false}
                animate={{
                    width: isOpen ? 'auto' : '56px',
                    height: '56px',
                    backgroundColor: isOpen ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
                    borderColor: isOpen ? `${themeColor}80` : 'rgba(255,255,255,0.1)'
                }}
                className={cn(
                    "relative h-[56px] rounded-full backdrop-blur-xl border overflow-hidden flex items-center shadow-2xl transition-all duration-300",
                    isDevPage ? "order-1" : "order-2",
                    isOpen ? "pl-8 pr-2" : "px-0 justify-center"
                )}
                style={{
                    boxShadow: isOpen ? `0 0 30px ${themeColor}40` : `0 0 0px ${themeColor}00`,
                }}
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-8 whitespace-nowrap mr-4"
                        >
                            <Link
                                href="/contact"
                                className="text-sm font-bold tracking-[0.2em] text-white/90 hover:text-white transition-colors uppercase"
                                style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                            >
                                Contact
                            </Link>

                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />

                            <Link
                                href="/developers"
                                className="text-sm font-bold tracking-[0.2em] text-white/90 hover:text-white transition-colors uppercase"
                                style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                            >
                                Developers
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dotted Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-[56px] h-[56px] flex items-center justify-center relative shrink-0 group z-10 bg-transparent"
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

                    <div className="grid grid-cols-2 gap-2 transition-transform duration-300 group-hover:rotate-90">
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
                                className="w-1.5 h-1.5 rounded-full shadow-sm"
                                style={{
                                    boxShadow: isOpen ? `0 0 5px ${themeColor}` : '0 0 2px rgba(255,255,255,0.8)'
                                }}
                            />
                        ))}
                    </div>
                </button>
            </motion.div>

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
                            "flex items-center gap-3",
                            isDevPage ? "flex-col order-2" : "flex-row order-1 mr-4"
                        )}
                    >
                        {isDevPage && (
                            <div
                                className="w-[1px] h-8 md:h-12"
                                style={{ backgroundColor: themeColor, boxShadow: `0 0 5px ${themeColor}` }}
                            />
                        )}

                        <div
                            className={cn(
                                "font-black tracking-[0.2em] uppercase",
                                isDevPage ? "flex flex-col items-center text-[10px] leading-none gap-1" : "text-xs"
                            )}
                            style={{
                                color: themeColor,
                                textShadow: `0 0 10px ${themeColor}80`
                            }}
                        >
                            {isDevPage ? (
                                labels[labelIndex].split('').map((char, i) => (
                                    <span key={i}>{char}</span>
                                ))
                            ) : (
                                labels[labelIndex]
                            )}
                        </div>

                        {!isDevPage && (
                            <div
                                className="h-[1px] w-8 md:w-12"
                                style={{ backgroundColor: themeColor, boxShadow: `0 0 5px ${themeColor}` }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
