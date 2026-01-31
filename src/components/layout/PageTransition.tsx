'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'

/**
 * PageTransition System
 * Optimized to ensure zero black-screen flashes when returning home.
 */
export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const { pageTheme } = useApp()
    const [isMobile, setIsMobile] = useState(false)
    const isLandingPage = pathname === '/'

    useEffect(() => {
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }, [])

    // CRITICAL: When the target is the landing page, we completely bypass AnimatePresence.
    // This forces the old page to unmount INSTANTLY and the home page to mount INSTANTLY.
    // This eliminates the "wait" time where a black screen could flash.
    if (isLandingPage) {
        return (
            <div className="relative w-full bg-[#020202]">
                {children}
            </div>
        )
    }

    return (
        <div className="relative w-full overflow-hidden bg-[#020202]">
            {/* The Foundation Layer - ensures the viewport is never empty */}
            <div className="fixed inset-0 bg-[#020202] -z-[10000] pointer-events-none" />

            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full"
                    style={{ willChange: 'opacity, transform' }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            {/* Cinematic Shutter - Only for sub-pages, DISABLED for leaderboard to prevent clash */}
            {/* Mini Loading Screen - Ensures smooth transition and readiness */}
            {pathname !== '/leaderboard' && (
                <motion.div
                    key={`loader-${pathname}`}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeInOut" }}
                    onAnimationComplete={(definition) => {
                        // Optional: Logic after load
                    }}
                    className="fixed inset-0 z-[9999] pointer-events-none bg-[#020202] flex items-center justify-center"
                >
                    <div className="flex flex-col items-center gap-4">
                        {/* Advanced Spinner */}
                        <div className="relative w-12 h-12">
                            <div
                                className="absolute inset-0 border-2 rounded-full animate-spin"
                                style={{
                                    borderTopColor: 'transparent',
                                    borderRightColor: `rgba(${pageTheme.rgb}, 0.5)`,
                                    borderBottomColor: `rgba(${pageTheme.rgb}, 0.5)`,
                                    borderLeftColor: `rgba(${pageTheme.rgb}, 0.5)`
                                }}
                            />
                            <div
                                className="absolute inset-2 border-2 rounded-full animate-spin-reverse opacity-60"
                                style={{
                                    borderTopColor: 'transparent',
                                    borderRightColor: `rgba(${pageTheme.rgb}, 0.8)`,
                                    borderBottomColor: `rgba(${pageTheme.rgb}, 0.8)`,
                                    borderLeftColor: `rgba(${pageTheme.rgb}, 0.8)`
                                }}
                            />
                        </div>

                        {/* Loading Text */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse" style={{ color: `rgb(${pageTheme.rgb})` }}>
                                Initializing
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
