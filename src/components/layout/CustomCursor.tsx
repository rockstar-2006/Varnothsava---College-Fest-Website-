'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'

export function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [cursorType, setCursorType] = useState('default')
    const [isMobile, setIsMobile] = useState(false) // Added: State to track mobile status

    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 250 }
    const springX = useSpring(cursorX, springConfig)
    const springY = useSpring(cursorY, springConfig)

    // Added: Effect to check for mobile/touch devices on mount
    useEffect(() => {
        const checkMobile = () => {
            // Check for screen width and touch capability
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };

        checkMobile(); // Run once on mount

        // Optional: Add a resize listener if you want to dynamically enable/disable
        // window.addEventListener('resize', checkMobile);
        // return () => window.removeEventListener('resize', checkMobile);
    }, []); // Empty dependency array ensures this runs once on mount

    useEffect(() => {
        // Added: If it's a mobile device, do not set up event listeners
        if (isMobile) {
            return;
        }

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
            if (!isVisible) setIsVisible(true)
        }

        const handleHoverStart = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const isClickable = target.closest('button, a, .cursor-pointer, input, select')
            if (isClickable) {
                setIsHovering(true)
                setCursorType('pointer')
            } else {
                setIsHovering(false)
                setCursorType('default')
            }
        }

        const handleMouseLeave = () => setIsVisible(false)
        const handleMouseEnter = () => setIsVisible(true)

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mouseover', handleHoverStart)
        document.addEventListener('mouseleave', handleMouseLeave)
        document.addEventListener('mouseenter', handleMouseEnter)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mouseover', handleHoverStart)
            document.removeEventListener('mouseleave', handleMouseLeave)
            document.removeEventListener('mouseenter', handleMouseEnter)
        }
    }, [cursorX, cursorY, isVisible])

    if (isMobile) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* THE INNER CORE */}
                        <motion.div
                            className="fixed top-0 left-0 w-2 h-2 bg-emerald-400 rounded-full z-20 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                            style={{
                                x: cursorX,
                                y: cursorY,
                                translateX: '-50%',
                                translateY: '-50%',
                                willChange: 'transform'
                            }}
                        />

                        {/* THE OUTER HUD RING */}
                        <motion.div
                            className="fixed top-0 left-0 w-10 h-10 border border-emerald-500/30 rounded-full flex items-center justify-center pointer-events-none"
                            style={{
                                x: springX,
                                y: springY,
                                translateX: '-50%',
                                translateY: '-50%',
                            }}
                            animate={{
                                scale: isHovering ? 1.5 : 1,
                                rotate: isHovering ? 90 : 0,
                                borderColor: isHovering ? 'rgba(52, 211, 153, 0.8)' : 'rgba(52, 211, 153, 0.3)',
                            }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        >
                            {/* HUD Brackets inside the ring */}
                            <div className="absolute inset-[-4px] border-t-2 border-l-2 border-emerald-500/20 rounded-tl-sm w-2 h-2" />
                            <div className="absolute inset-[-4px] border-b-2 border-r-2 border-emerald-500/20 rounded-br-sm w-2 h-2 right-0 bottom-0 top-auto left-auto" />

                            {/* Center Crosshair Lines */}
                            <motion.div
                                className="w-full h-[1px] bg-emerald-500/10 absolute"
                                animate={{ opacity: isHovering ? 0.4 : 0.1 }}
                            />
                            <motion.div
                                className="h-full w-[1px] bg-emerald-500/10 absolute"
                                animate={{ opacity: isHovering ? 0.4 : 0.1 }}
                            />
                        </motion.div>

                        {/* THE TRAILING LENS FLARE / GLOW */}
                        <motion.div
                            className="fixed top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none"
                            style={{
                                x: springX,
                                y: springY,
                                translateX: '-50%',
                                translateY: '-50%',
                            }}
                        />

                        {/* TACTICAL COORDINATES TEXT */}
                        <motion.div
                            className="fixed top-0 left-0 ml-8 mt-8 flex flex-col pointer-events-none"
                            style={{
                                x: springX,
                                y: springY,
                                willChange: 'transform'
                            }}
                            animate={{
                                opacity: isHovering ? 0.8 : 0.2,
                                scale: isHovering ? 0.8 : 0.6,
                            }}
                        >
                            <span className="text-[6px] font-black text-emerald-400 tracking-[0.2em] uppercase">POS_SYNC</span>
                            <div className="flex gap-2 text-[5px] font-mono text-white/40">
                                <span>X_{Math.round(cursorX.get())}</span>
                                <span>Y_{Math.round(cursorY.get())}</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
