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
        <div className={`relative w-full overflow-hidden z-10 ${pathname === '/events' ? 'bg-transparent' : 'bg-[#020202]'}`}>
            {/* The Foundation Layer - ensures the viewport is never empty */}
            <div className={`fixed inset-0 -z-[10000] pointer-events-none ${pathname === '/events' ? 'bg-transparent' : 'bg-[#020202]'}`} />

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


        </div>

    )
}
