'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Star, Shield, Activity } from 'lucide-react'

import { useApp } from '@/context/AppContext'

export function PageTransitionBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isSiteLoaded } = useApp()
    const [isLoading, setIsLoading] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])

    const initialLoadRef = useRef(true)
    // Track the last path we triggered a transition for to avoid double-firing or same-page loops
    const transitionTrigger = useRef<string>("")

    useEffect(() => {
        // STRICT GUARD: If main site hasn't finished its first loading screen, 
        // DO NOT show this transition bar.
        if (!isSiteLoaded) return;

        // Skip the very first time it becomes loaded (initial entrance)
        if (initialLoadRef.current) {
            initialLoadRef.current = false
            transitionTrigger.current = pathname + searchParams.toString()
            return
        }

        const currentKey = pathname + searchParams.toString()

        // Prevent transition if we are already on this exact page state
        if (transitionTrigger.current === currentKey) return

        transitionTrigger.current = currentKey

        // Trigger on VALID route/filter change
        setIsLoading(true)

        // Extended delay to cover "React Hydration" gap. 
        // This ensures the warp screen stays UP until the new page is actually ready.
        const timer = setTimeout(() => setIsLoading(false), 800)

        return () => clearTimeout(timer)
    }, [pathname, searchParams, isSiteLoaded])

    const clipValue = isMobile ? '20px' : '50px'
    const cockpitClip = `polygon(
        ${clipValue} 0, calc(100% - ${clipValue}) 0, 100% ${clipValue}, 
        100% calc(100% - ${clipValue}), calc(100% - ${clipValue}) 100%, 
        ${clipValue} 100%, 0 calc(100% - ${clipValue}), 0 ${clipValue}
    )`

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, pointerEvents: 'none' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[120000] bg-[#020603] flex items-center justify-center p-4 md:p-12 overflow-hidden pointer-events-auto"
                >
                    {/* BLACKOUT BASE */}
                    <div className="absolute inset-0 bg-black z-[-1]" />

                    {/* WARP SPEED BACKGROUND */}
                    <div className="absolute inset-0 z-0">
                        {[...Array(isMobile ? 25 : 60)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: (Math.random() - 0.5) * 100,
                                    y: (Math.random() - 0.5) * 100,
                                    z: -1000,
                                    opacity: 0,
                                    scale: 0.1
                                }}
                                animate={{
                                    x: (Math.random() - 0.5) * 4000,
                                    y: (Math.random() - 0.5) * 4000,
                                    z: 0,
                                    opacity: [0, 1, 0],
                                    scale: [0.1, 4, 0.1]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: Math.random() * 1.5,
                                    ease: "circIn"
                                }}
                                className="absolute w-[1.5px] h-[200px] bg-emerald-500/40 blur-[1px]"
                                style={{ transform: `rotate(${Math.random() * 360}deg)`, left: '50%', top: '50%' }}
                            />
                        ))}
                    </div>

                    {/* CINEMATIC COCKPIT FRAME */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "backOut" }}
                        className="relative w-full max-w-5xl h-[75vh] flex items-center justify-center"
                    >
                        <div
                            className="absolute inset-0 z-10"
                            style={{
                                clipPath: cockpitClip,
                                background: `linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(0,0,0,0.8))`,
                                backdropFilter: isMobile ? 'none' : 'blur(40px)',
                                border: `1px solid rgba(16, 185, 129, 0.2)`,
                                boxShadow: `0 0 100px rgba(0,0,0,1)`
                            }}
                        />

                        {/* HUD INTERFACE */}
                        <div className="absolute inset-0 z-20 pointer-events-none" style={{ clipPath: cockpitClip }}>
                            {/* Animated Scanline */}
                            <motion.div
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-x-0 h-[1px] bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            />

                            {/* Corner Brackets */}
                            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-emerald-500/60 rounded-tl-[40px]" />
                            <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-emerald-500/60 rounded-tr-[40px]" />
                            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-emerald-500/60 rounded-bl-[40px]" />
                            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-emerald-500/60 rounded-br-[40px]" />

                            {/* Metadata */}
                            <div className="absolute top-10 left-12 flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-emerald-500 font-black text-[9px] tracking-widest uppercase">
                                    <Terminal size={12} className="animate-pulse" /> SYSTEM_TRANSFER
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div key={i} animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, delay: i * 0.1 }} className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                                    ))}
                                </div>
                            </div>

                            <div className="absolute bottom-10 right-12 text-right">
                                <div className="text-emerald-500 font-black text-[9px] tracking-[0.4em] uppercase mb-1">VARNOTHSAVA // 2K26</div>
                                <div className="text-white/20 text-[7px] font-mono tracking-widest uppercase flex items-center justify-end gap-2">
                                    LOCATION: {pathname.toUpperCase() || 'CORE'} <Activity size={10} />
                                </div>
                            </div>
                        </div>

                        {/* CENTRAL PULSE */}
                        <div className="relative z-30 flex flex-col items-center gap-8">
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="w-32 h-32 border-2 border-emerald-500/10 rounded-full border-dashed"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border-2 border-emerald-500/30 rounded-full border-dotted"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                        <Star className="w-8 h-8 text-emerald-500 animate-spin-slow shadow-xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <motion.span
                                    animate={{ opacity: [0.3, 1, 0.3], letterSpacing: ['0.5em', '0.7em', '0.5em'] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="text-emerald-500 font-black text-xs md:text-sm uppercase italic tracking-[0.6em]"
                                >
                                    INITIALIZING_NODE
                                </motion.span>
                                <div className="font-mono text-[8px] text-white/30 tracking-[0.3em]">ENCRYPTING_SESSION_DATA...</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CORNER DETAILS */}
                    <div className="absolute top-4 right-4 text-[7px] font-mono text-white/10 hidden lg:block">
                        OS_VERSION: AG_01<br />
                        KERNEL: HYPER_DASH
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
