'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                className="gpu-accel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
