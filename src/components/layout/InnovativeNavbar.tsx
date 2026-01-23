'use client'

import { motion, AnimatePresence, useScroll, useMotionValueEvent, useSpring } from 'framer-motion'
import { LayoutGrid, Zap, Trophy, Camera, User, ShoppingCart, Rocket, Menu, X, ArrowUpRight, Fingerprint } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import { Magnetic } from '@/components/ui/Magnetic'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
    { name: 'HOME', href: '/', icon: LayoutGrid },
    { name: 'EVENTS', href: '/events', icon: Zap },
    { name: 'SCORES', href: '/leaderboard', icon: Trophy },
    { name: 'GALLERY', href: '/gallery', icon: Camera },
]

export function InnovativeNavbar() {
    const pathname = usePathname()
    const { isLoggedIn, cart } = useApp()

    // UI STATES
    const [isScrolled, setIsScrolled] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    // BIOMETRIC STATES
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [scanComplete, setScanComplete] = useState(false)
    const [pressProgress, setPressProgress] = useState(0)
    const [showError, setShowError] = useState(false)
    const pressIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (pressIntervalRef.current) clearInterval(pressIntervalRef.current)
        }
    }, [])

    const handlePressStart = () => {
        if (isUnlocked || scanComplete) return
        if (pressIntervalRef.current) clearInterval(pressIntervalRef.current)

        setIsScanning(true)
        setShowError(false)
        setPressProgress(0)

        const startTime = Date.now()
        pressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime
            const progress = Math.min((elapsed / 3000) * 100, 100)
            setPressProgress(progress)

            if (elapsed >= 3000) {
                if (pressIntervalRef.current) clearInterval(pressIntervalRef.current)
                setScanComplete(true)
                setTimeout(() => setIsUnlocked(true), 800)
            }
        }, 16)
    }

    const handlePressEnd = () => {
        if (scanComplete) return

        if (pressProgress < 100) {
            if (pressIntervalRef.current) clearInterval(pressIntervalRef.current)
            setIsScanning(false)
            setPressProgress(0)
            setShowError(true)
            setTimeout(() => setShowError(false), 3000)
        }
    }

    const { scrollY } = useScroll()


    // Magnetic pull for the whole navbar
    const navX = useSpring(0, { stiffness: 100, damping: 30 })
    const navY = useSpring(0, { stiffness: 100, damping: 30 })

    useEffect(() => {
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            rafId = requestAnimationFrame(() => {
                const { clientX, clientY } = e
                const { innerWidth, innerHeight } = window
                const x = (clientX - innerWidth / 2) / 60 // Reduced intensity
                const y = (clientY - innerHeight / 2) / 60
                setMousePosition({ x, y })
                navX.set(x)
                navY.set(y)
            })
        }
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(rafId)
        }
    }, [])

    // Navbar intelligence: Scroll direction and magnitude

    useMotionValueEvent(scrollY, "change", (latest) => {
        const direction = latest > lastScrollY ? "down" : "up"

        if (latest < 30) {
            setIsVisible(true)
            setIsScrolled(false)
        } else {
            setIsScrolled(true)
            if (direction === "down" && latest > 150) {
                setIsVisible(false)
            } else if (direction === "up" && Math.abs(latest - lastScrollY) > 5) {
                setIsVisible(true)
            }
        }
        setLastScrollY(latest)
    })

    useEffect(() => {
        const checkMobile = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768); // Mobile standard breakpoint
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const springConfig = { damping: 25, stiffness: 180, mass: 0.8 }



    return (
        <>
            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.div
                        initial={{ y: 150, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 150, opacity: 0 }}
                        style={{ x: isMobile ? 0 : navX, y: isMobile ? 0 : navY }}
                        transition={{ type: 'spring', ...springConfig }}
                        className="fixed z-[5000] bottom-0 left-0 right-0 flex justify-center pb-4 md:pb-8 px-2 md:px-4 pointer-events-none no-jank"
                    >
                        {/* HOLOGRAPHIC SHOCKWAVE EFFECT */}
                        <AnimatePresence>
                            {isUnlocked && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 1 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="absolute inset-x-0 bottom-10 mx-auto w-24 h-24 border-2 border-emerald-500 rounded-full blur-md pointer-events-none z-0"
                                />
                            )}
                        </AnimatePresence>

                        {!isUnlocked ? (
                            /* THE CYBER-BIOMETRIC TERMINAL */
                            <motion.div
                                layoutId="nav-container"
                                className="pointer-events-auto flex flex-col items-center gap-6 no-jank"
                            >
                                <AnimatePresence>
                                    {showError && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute -top-16 bg-red-500/10 border border-red-500/50 backdrop-blur-xl px-4 py-2 rounded-xl"
                                        >
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                                HOLD DOWN TO ACCESS
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative flex items-center justify-center">
                                    {/* Rotating HUD Rings (Background) */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-[180px] h-[180px] border border-emerald-500/10 rounded-full border-dashed z-0"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-[140px] h-[140px] border-2 border-emerald-500/5 rounded-full border-dotted z-0"
                                    />

                                    {/* Progress Ring (Top Layer) */}
                                    <div className="absolute z-20 pointer-events-none">
                                        <svg className={`${isMobile ? 'w-[130px] h-[130px]' : 'w-[110px] h-[110px]'} -rotate-90`}>
                                            <circle
                                                cx={isMobile ? "65" : "55"}
                                                cy={isMobile ? "65" : "55"}
                                                r={isMobile ? "62" : "52"}
                                                fill="none"
                                                stroke="rgba(16, 185, 129, 0.1)"
                                                strokeWidth="3"
                                            />
                                            <motion.circle
                                                cx={isMobile ? "65" : "55"}
                                                cy={isMobile ? "65" : "55"}
                                                r={isMobile ? "62" : "52"}
                                                fill="none"
                                                stroke="rgba(16, 185, 129, 0.9)"
                                                strokeWidth="3"
                                                strokeDasharray={isMobile ? "390" : "327"}
                                                animate={{ strokeDashoffset: (isMobile ? 390 : 327) - ((isMobile ? 390 : 327) * pressProgress) / 100 }}
                                                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>

                                    {/* DATA SHARDS */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 w-full flex justify-center px-4">
                                        <motion.div
                                            animate={{ opacity: [0.3, 0.9, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-[7px] md:text-[8px] text-emerald-300 font-bold flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm max-w-full truncate"
                                        >
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] flex-shrink-0" />
                                            <span className="truncate">STUDENT PORTAL ACCESS // 2026</span>
                                        </motion.div>
                                    </div>

                                    <motion.button
                                        onMouseDown={handlePressStart}
                                        onMouseUp={handlePressEnd}
                                        onMouseLeave={handlePressEnd}
                                        onTouchStart={handlePressStart}
                                        onTouchEnd={handlePressEnd}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        animate={isScanning ? {
                                            x: [0, -1, 1, -1, 1, 0],
                                            y: [0, 1, -1, 1, -1, 0]
                                        } : {}}
                                        transition={isScanning ? {
                                            duration: 0.1,
                                            repeat: Infinity,
                                            ease: "linear"
                                        } : {}}
                                        className="relative w-28 h-28 md:w-24 md:h-24 rounded-full bg-emerald-950/40 backdrop-blur-3xl border border-emerald-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.2)] z-20 group"
                                    >
                                        <Fingerprint
                                            size={isMobile ? 56 : 48}
                                            strokeWidth={1.2}
                                            className={cn(
                                                "transition-all duration-500 z-10",
                                                isScanning ? "text-emerald-300 scale-110 drop-shadow-[0_0_15px_rgba(110,231,183,1)]" : "text-emerald-500/60",
                                                scanComplete && "text-black scale-125"
                                            )}
                                        />
                                    </motion.button>

                                    {/* COORDINATE LABELS */}
                                    <div className="absolute -right-24 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 text-[9px] text-emerald-400/80 bg-black/40 p-2 rounded-lg border border-emerald-500/20 backdrop-blur-md">
                                        <span className="flex justify-between gap-4"><span>STATUS:</span> <span className="text-emerald-400 font-bold">READY</span></span>
                                        <span className="flex justify-between gap-4"><span>FEST:</span> <span className="text-emerald-400 font-bold">2026</span></span>
                                        <span className="flex justify-between gap-4"><span>ACCESS:</span> <span className="text-emerald-400 font-bold">OPEN</span></span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="text-[9px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.5em] text-emerald-400 uppercase drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] text-center px-4"
                                    >
                                        {scanComplete ? "WELCOME STUDENT" : isScanning ? "UNLOCKING..." : "HOLD TO ACCESS"}
                                    </motion.span>
                                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                                </div>
                            </motion.div>
                        ) : (
                            /* THE CYBER-DOCK [OBSIDIAN NEON] */
                            <motion.div
                                layoutId="nav-container"
                                initial={{ width: 100, height: 100, borderRadius: 50, filter: "brightness(0)" }}
                                animate={{ width: "100%", height: isMobile ? 70 : 80, borderRadius: isMobile ? 24 : 0, filter: "brightness(1)" }}
                                className="relative w-full max-w-[700px] h-[70px] md:h-[80px] flex items-center pointer-events-auto group/nav no-jank"
                                style={{ willChange: 'transform, opacity, width, height', overflow: 'visible' }}
                            >
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-[6000] pointer-events-none">
                                    <div className={cn("absolute left-1/2 -translate-x-1/2", isMobile ? "-top-14" : "-top-20")}>
                                        <Link href="/events" className="pointer-events-auto">
                                            <Magnetic strength={0.4}>
                                                <div className={cn("relative", isMobile ? "w-[70px] h-[70px]" : "w-[92px] h-[92px]")}>
                                                    {/* Ambient Energy Ripples */}
                                                    <motion.div
                                                        animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0.2, 0] }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                                                        className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"
                                                    />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.8, 2.2], opacity: [0.3, 0.1, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 1 }}
                                                        className="absolute inset-0 bg-emerald-400/10 rounded-full blur-lg pointer-events-none"
                                                    />

                                                    <motion.div
                                                        animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity }}
                                                        className="absolute -inset-4 border border-[rgba(var(--nav-current-theme,16,185,129),0.2)] rounded-full border-dashed"
                                                    />
                                                    <motion.div
                                                        whileHover={{ scale: 1.15, filter: "hue-rotate(30deg)" }}
                                                        className="w-[70px] h-[70px] md:w-[92px] md:h-[92px] bg-gradient-to-br from-[rgb(var(--nav-current-theme,16,185,129))] to-black rounded-full border-[6px] md:border-[8px] border-[#0a120a] shadow-[0_20px_50px_rgba(var(--nav-current-theme,16,185,129),0.5)] flex items-center justify-center group relative overflow-hidden"
                                                    >
                                                        <Zap size={isMobile ? 28 : 36} className="text-black group-hover:scale-125 transition-transform" />
                                                    </motion.div>
                                                </div>
                                            </Magnetic>
                                        </Link>
                                    </div>
                                </div>

                                <div className="absolute inset-0 -z-10 overflow-visible">
                                    <svg width="100%" height="80" viewBox="0 0 700 80" preserveAspectRatio="none" fill="none" className="absolute inset-0 z-0 drop-shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                                        <path
                                            d="M0 40C0 17.9086 17.9086 0 40 0H270C285 0 290 5 300 18C315 35 385 35 400 18C410 5 415 0 430 0H660C682.091 0 700 17.9086 700 40V80H0V40Z"
                                            fill="rgba(5, 8, 5, 0.95)"
                                        />
                                        <path
                                            d="M1 40C1 18.5 18.5 1 40 1H270C285 1 290 6 300 19C315 36 385 36 400 19C410 6 415 1 430 1H660C681 1 699 18.5 699 40"
                                            stroke="rgba(var(--nav-current-theme, 16, 185, 129), 0.5)"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] -z-20 pointer-events-none" style={{ clipPath: 'polygon(0% 20%, 100% 20%, 100% 100%, 0% 100%)' }} />
                                </div>

                                <div className="flex-1 flex justify-around items-center px-2 md:px-4">
                                    <Link href="/" className="group flex flex-col items-center gap-1 py-2 min-w-[60px] md:min-w-[80px]">
                                        <div className={cn("relative p-3.5 rounded-2xl transition-all duration-500", pathname === '/' ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                            <LayoutGrid size={24} />
                                        </div>
                                        <span className={cn("text-[9px] md:text-[11px] tracking-[0.2em] font-bold uppercase transition-all duration-300", pathname === '/' ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--nav-current-theme),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>HOME</span>
                                    </Link>
                                    <Link href="/leaderboard" className="group flex flex-col items-center gap-1 py-2 min-w-[60px] md:min-w-[80px]">
                                        <div className={cn("relative p-3.5 rounded-2xl transition-all duration-500", pathname === '/leaderboard' ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                            <Trophy size={24} />
                                        </div>
                                        <span className={cn("text-[9px] md:text-[11px] tracking-[0.2em] font-bold uppercase transition-all duration-300", pathname === '/leaderboard' ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--nav-current-theme),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>SCORES</span>
                                    </Link>
                                </div>

                                {/* Central Spacer for action button */}
                                <div className="w-20 md:w-32 flex-shrink-0" />

                                <div className="flex-1 flex justify-around items-center px-2 md:px-4">
                                    <Link href="/gallery" className="group flex flex-col items-center gap-1 py-2 min-w-[60px] md:min-w-[80px]">
                                        <div className={cn("relative p-3.5 rounded-2xl transition-all duration-500", pathname === '/gallery' ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                            <Camera size={24} />
                                        </div>
                                        <span className={cn("text-[9px] md:text-[11px] tracking-[0.2em] font-bold uppercase transition-all duration-300", pathname === '/gallery' ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--nav-current-theme),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>GALLERY</span>
                                    </Link>
                                    <Link href={isLoggedIn ? "/profile" : "/login"} className="group flex flex-col items-center gap-1 py-2 min-w-[60px] md:min-w-[80px]">
                                        <div className={cn("relative p-3.5 rounded-2xl transition-all duration-500", (pathname === '/profile' || pathname === '/login') ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                            <User size={24} />
                                        </div>
                                        <span className={cn("text-[9px] md:text-[11px] tracking-[0.2em] font-bold uppercase transition-all duration-300", (pathname === '/profile' || pathname === '/login') ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--nav-current-theme),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>{isLoggedIn ? 'PROFILE' : 'LOGIN'}</span>
                                    </Link>
                                </div>

                                <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-emerald-400/40 rounded-tl-[2.5rem] shadow-[-5px_-5px_15px_rgba(52,211,153,0.1)]" />
                                <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-emerald-400/40 rounded-tr-[2.5rem] shadow-[5px_-5px_15px_rgba(52,211,153,0.1)] flex items-start justify-end p-2 px-4 overflow-hidden">
                                    {/* Live System Monitoring (Student Waveform) */}
                                    <div className="flex items-end gap-[1px] h-3 opacity-40">
                                        {[1, 2, 3, 4, 3, 2, 1, 2, 3].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [`${h * 20}%`, `${(h + 2) * 20}%`, `${h * 20}%`] }}
                                                transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                                className="w-[1px] bg-emerald-400 rounded-full"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[8px] text-emerald-400/60 ml-1 mt-[2px] tracking-tighter">FESTIVAL LIVE: 2026</span>
                                </div>

                                <div className="absolute right-[-100px] bottom-0 flex flex-col items-center gap-4 pointer-events-auto">
                                    <Link href="/checkout" className="block relative group">
                                        <motion.div whileHover={{ scale: 1.1, x: 10 }} className="p-5 bg-black/60 backdrop-blur-3xl border border-emerald-500/30 rounded-[1.5rem] shadow-2xl overflow-hidden">
                                            <ShoppingCart size={22} className="text-emerald-400" />
                                            {cart.length > 0 && (
                                                <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050805]">
                                                    {cart.length}
                                                </span>
                                            )}
                                        </motion.div>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 lg:hidden"
                    >
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                            <X size={24} />
                        </button>
                        <div className="flex flex-col gap-8 text-center">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div key={link.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter hover:text-emerald-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
