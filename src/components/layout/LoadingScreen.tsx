'use client'

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    Rocket, Shield, Activity, Zap, Target, Terminal,
    Star, Camera, Image as ImageIcon, User, Lock, Music
} from 'lucide-react'
import { useApp } from '@/context/AppContext'

type ThemeType = 'GENERAL' | 'CULTURAL' | 'GAMING' | 'GALLERY' | 'PROFILE' | 'LOGIN' | 'MOTO'

const MotorcycleIcon = ({ className, style }: { className?: string, style?: any }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
    >
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        <path d="M12 18h5.5v-5a3.5 3.5 0 0 0-3.5-3.5h-1l-2-3-3-2" />
        <path d="M9 18H5.5" />
        <path d="M13 11l2-5h3" />
    </svg>
)

function LoadingContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [step, setStep] = useState<'SYNCING' | 'READY' | 'MESSAGE' | 'LAUNCH'>('SYNCING')
    const [progress, setProgress] = useState(0)
    const [visible, setVisible] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const { setIsSiteLoaded } = useApp()

    const [isMounted, setIsMounted] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    // Parallax Motion Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth transforms for Parallax
    const moveX = useTransform(mouseX, [-1500, 1500], [20, -20]); // Reversed for background
    const moveY = useTransform(mouseY, [-1000, 1000], [20, -20]);
    const moveXFore = useTransform(mouseX, [-1500, 1500], [-30, 30]); // Foreground moves more
    const moveYFore = useTransform(mouseY, [-1000, 1000], [-30, 30]);

    useEffect(() => {
        setIsMounted(true)

        const handleMouseMove = (e: MouseEvent) => {
            // Disable Parallax on Mobile
            if (window.innerWidth < 768) return;

            // Update motion values
            mouseX.set(e.clientX - window.innerWidth / 2);
            mouseY.set(e.clientY - window.innerHeight / 2);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY])

    // Detemine theme based on route & search params
    const theme: ThemeType = useMemo(() => {
        const filter = searchParams?.get('filter')
        if (pathname === '/login') return 'LOGIN'
        if (pathname === '/profile') return 'PROFILE'
        if (pathname === '/gallery') return 'GALLERY'
        if (pathname === '/leaderboard') return 'MOTO'
        if (pathname === '/events' || pathname === '/') {
            if (filter === 'Cultural' || pathname?.includes('cultural')) return 'CULTURAL'
            if (filter === 'Gaming' || pathname?.includes('gaming')) return 'GAMING'
            if (filter === 'Technical' || pathname?.includes('events')) return 'GENERAL'
        }
        return 'GENERAL'
    }, [pathname, searchParams])

    const themeConfig = useMemo(() => {
        switch (theme) {
            case 'CULTURAL':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Music,
                    label: 'Unearthing Cultural Relics',
                    subLabel: 'Dusting off the ancient instruments...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Music
                }
            case 'GAMING':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Target,
                    label: 'Entering Ancient Arena',
                    subLabel: 'Summoning the challengers...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Zap
                }
            case 'GALLERY':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Camera,
                    label: 'Deciphering Visual Glyphs',
                    subLabel: 'Developing ancient memory reels...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: ImageIcon
                }
            case 'PROFILE':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: User,
                    label: 'Scanning Biometric Runes',
                    subLabel: 'Verifying explorer credentials...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Shield
                }
            case 'LOGIN':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Lock,
                    label: 'Portal Access Code',
                    subLabel: 'Whispering the secret password...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Rocket
                }
            case 'MOTO':
                return {
                    color: '#cd5c09', // Burnt Orange
                    dim: 'rgba(205, 92, 9, 0.1)',
                    icon: MotorcycleIcon,
                    label: 'Unearthing Machines',
                    subLabel: 'Firing up the ancient engines...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(205, 92, 9, 0.15) 0%, transparent 70%)',
                    accentIcon: Zap
                }
            default:
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Activity,
                    label: 'Entering The Lost World',
                    subLabel: 'Discovering Ancient Secrets...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Terminal
                }
        }
    }, [theme])

    // Pre-calculate particles to avoid Hydration Error
    const particles = useMemo(() => {
        return [...Array(20)].map((_, i) => ({
            id: i,
            w: 2 + Math.random() * 4,
            h: 2 + Math.random() * 4,
            t: Math.random() * 100,
            l: Math.random() * 100,
            dur: 6 + Math.random() * 8, // Made longer for smoothness
            delay: Math.random() * 5
        }))
    }, [])

    const snowParticles = useMemo(() => {
        return [...Array(isMobile ? 12 : 24)].map((_, i) => ({
            id: i,
            x: Math.random() * 2000 - 1000,
            yStart: Math.random() * 2000 - 1000,
            yEnd: Math.random() * 1000 + 500,
            dur: 20 + Math.random() * 15,
            rotate: Math.random() * 360
        }))
    }, [isMobile])

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        // SMART BYPASS: If session already loaded, skip EVERYTHING and render app immediately
        // SMART BYPASS DISABLED - User wants to see the intro every time for now
        /*
        const hasLoadedThisSession = sessionStorage.getItem('fest_initial_loaded')
        if (hasLoadedThisSession) {
            setVisible(false)
            setIsSiteLoaded(true)
            return
        }
        */

        if (step === 'SYNCING') {
            const timer = setInterval(() => {
                setProgress(p => {
                    // GATEKEEPER: Wait for DOM interactivity (snappier than full window load)
                    const isReady = typeof document !== 'undefined' &&
                        (document.readyState === 'complete' || document.readyState === 'interactive')

                    if (p >= 100) {
                        clearInterval(timer)
                        setTimeout(() => setStep('READY'), 100)
                        return 100
                    }

                    // Dynamic speed: Faster initial climb to feel responsive
                    const increment = isReady ? (p < 60 ? 4.0 : 2.5) : (p < 60 ? 2.0 : p < 90 ? 1.0 : 0.4)
                    return Math.min(p + increment, 100)
                })
            }, 20)
            return () => clearInterval(timer)
        }
    }, [step])

    useEffect(() => {
        if (step === 'MESSAGE') {
            const timer = setTimeout(() => {
                setStep('LAUNCH')
                setTimeout(() => {
                    setVisible(false)
                    setIsSiteLoaded(true) // UNLOCK THE SITE
                }, 300)
            }, 400)
            return () => clearTimeout(timer)
        }
    }, [step])

    const startExperience = () => {
        sessionStorage.setItem('fest_initial_loaded', 'true')
        setStep('MESSAGE')
    }

    const clipValue = isMobile ? '20px' : '50px'
    const cockpitClip = `polygon(
        ${clipValue} 0, calc(100% - ${clipValue}) 0, 100% ${clipValue}, 
        100% calc(100% - ${clipValue}), calc(100% - ${clipValue}) 100%, 
        ${clipValue} 100%, 0 calc(100% - ${clipValue}), 0 ${clipValue}
    )`

    const Icon = themeConfig.icon
    const AccentIcon = themeConfig.accentIcon

    if (!visible) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[11000] flex items-center justify-center p-4 md:p-12 overflow-hidden select-none"
                initial={{ opacity: 1 }}
                exit={{
                    scale: 1.05,
                    opacity: 0,
                    filter: "blur(10px)",
                    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
                }}
                style={{
                    willChange: 'opacity, transform',
                    backgroundColor: '#020604',
                }}
            >
                {/* 1. LUXURY CINEMATIC BACKGROUND */}
                {/* 1. LUXURY CINEMATIC BACKGROUND */}
                {/* 1. LUXURY CINEMATIC BACKGROUND */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {/* ANCIENT RUINS BACKGROUND IMAGE - WITH PARALLAX */}
                    {/* ANCIENT RUINS BACKGROUND IMAGE - WITH PARALLAX & BREATHE */}
                    <motion.div
                        className="absolute inset-[-5%] w-[110%] h-[110%] z-[-1]"
                        style={{ x: moveX, y: moveY }}
                        animate={{
                            scale: [1, 1.02, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <img
                            src="/img/ancient_ruins_dark.png"
                            alt="Ancient Ruins"
                            className="w-full h-full object-cover opacity-100 grayscale-0"
                        />
                        {/* Dark Vignette */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

                        {/* LIVELY ATMOSPHERE: Shifting Sunbeams / Light Leaks */}
                        <motion.div
                            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                            style={{
                                background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.4) 0%, transparent 60%)'
                            }}
                            animate={{
                                opacity: [0.1, 0.25, 0.1],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>

                    {/* ATMOSPHERIC MIST (New Layer) - HIDDEN ON MOBILE to save performance (blur-3xl is VERY heavy) */}
                    <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
                        <div className="absolute bottom-[-10%] left-0 w-full h-[50vh] bg-gradient-to-t from-[#022c22]/60 via-[#064e3b]/20 to-transparent blur-3xl animate-pulse-slow will-change-[opacity]" />
                    </div>

                    {/* High-End Film Grain Texture */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    {/* INTERACTIVE FIREFLIES (Parallax Foreground) - HIDDEN ON MOBILE */}
                    <motion.div
                        className="hidden md:block absolute inset-0 pointer-events-none z-10"
                        style={{ x: moveXFore, y: moveYFore }}
                    >
                        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-emerald-400 rounded-full blur-[1px] animate-float opacity-60" />
                        <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-amber-200 rounded-full blur-[2px] animate-float opacity-40 delay-300" />
                        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-emerald-300 rounded-full blur-[1px] animate-float opacity-70 delay-700" />
                        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-emerald-500/30 rounded-full blur-[4px] animate-float opacity-30 delay-1000" />
                    </motion.div>

                    {/* Digital Snowfall / Floating Assets - HIDDEN ON MOBILE */}
                    {(!isMobile && isMounted) && snowParticles.map((p) => (
                        <motion.div
                            key={`snow-${p.id}`}
                            initial={{ x: p.x, y: p.yStart, opacity: 0 }}
                            animate={{
                                y: [null, p.yEnd],
                                opacity: [0, 0.3, 0],
                                rotate: [0, p.rotate]
                            }}
                            transition={{ duration: p.dur, repeat: Infinity, ease: "linear" }}
                            className="absolute w-1 h-1 rounded-full blur-[0.5px] no-jank"
                            style={{ backgroundColor: themeConfig.color }}
                        />
                    ))}
                </div>
                {/* Signature Background Animations */}
                <div className="absolute inset-0 opacity-40">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                        className="absolute inset-0"
                        style={{ background: themeConfig.bgGradient }}
                    />

                    {/* Fireflies / Ancient Spores - FLOATY MAGIC - REDUCED ON MOBILE */}
                    {isMounted && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(isMobile ? 5 : 15)].map((_, i) => (
                                <motion.div
                                    key={`firefly-${i}`}
                                    className="absolute rounded-full mix-blend-screen"
                                    initial={{
                                        x: Math.random() * 100 + "%",
                                        y: Math.random() * 100 + "%",
                                        opacity: 0,
                                        scale: 0
                                    }}
                                    animate={{
                                        y: [null, Math.random() * -100 - 50], // Float up
                                        x: [null, (Math.random() - 0.5) * 50], // Drift sideways
                                        opacity: [0, 0.6, 0],
                                        scale: [0, 1.5, 0]
                                    }}
                                    transition={{
                                        duration: 8 + Math.random() * 10,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: Math.random() * 5
                                    }}
                                    style={{
                                        width: Math.random() * 4 + 2 + "px",
                                        height: Math.random() * 4 + 2 + "px",
                                        backgroundColor: i % 3 === 0 ? '#fbbf24' : '#10b981', // Golden & Emerald mix
                                        boxShadow: `0 0 ${10 + Math.random() * 20}px ${i % 3 === 0 ? '#fbbf24' : '#10b981'}`
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {isMounted && !isMobile && (
                        <>
                            {/* Theme-Specific Overlay */}
                            {theme === 'CULTURAL' && (
                                <motion.div
                                    className="absolute inset-0 opacity-10"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M200 0L240 160L400 200L240 240L200 400L160 240L0 200L160 160Z' fill='${themeConfig.color.replace('#', '%23')}' /%3E%3C/svg%3E")`,
                                        backgroundSize: '200px 200px'
                                    }}
                                />
                            )}

                            {theme === 'GAMING' && (
                                <div className="absolute inset-0 overflow-hidden">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={`speed-${i}`}
                                            className="absolute w-[2px] h-[300%] opacity-20"
                                            style={{
                                                left: `${i * 15 + 5}%`,
                                                backgroundColor: themeConfig.color,
                                                transform: 'rotate(25deg)'
                                            }}
                                            animate={{ y: ['-50%', '50%'] }}
                                            transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: 'linear' }}
                                        />
                                    ))}
                                </div>
                            )}

                            {theme === 'GALLERY' && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={`blade-${i}`}
                                            className="absolute w-[100%] h-[300%] origin-center"
                                            style={{
                                                backgroundColor: themeConfig.color,
                                                rotate: i * 45,
                                                clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
                                            }}
                                            animate={{ rotate: [i * 45, i * 45 + 20, i * 45] }}
                                            transition={{ duration: 5, repeat: Infinity }}
                                        />
                                    ))}
                                </div>
                            )}

                            {theme === 'PROFILE' && (
                                <motion.div
                                    className="absolute inset-x-0 h-[2px] z-50 opacity-50"
                                    style={{ backgroundColor: themeConfig.color, boxShadow: `0 0 30px ${themeConfig.color}` }}
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                            )}

                            {/* Animated Particles - Desktop Only for Performance */}
                            {!isMobile && particles.map((p) => (
                                <motion.div
                                    key={p.id}
                                    className="absolute rounded-full"
                                    style={{
                                        width: p.w,
                                        height: p.h,
                                        top: `${p.t}%`,
                                        left: `${p.l}%`,
                                        backgroundColor: themeConfig.color,
                                        opacity: 0.2
                                    }}
                                    animate={{
                                        y: [0, -400, 0],
                                        opacity: [0.1, 0.8, 0.1],
                                        scale: [1, 3, 1]
                                    }}
                                    transition={{
                                        duration: p.dur * 0.6,
                                        repeat: Infinity,
                                        delay: p.delay
                                    }}
                                />
                            ))}
                        </>
                    )}
                </div>

                {/* HUD FRAME - COMPLETELY TRANSPARENT NOW */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-7xl h-[85dvh] md:h-[90vh] flex items-center justify-center p-2"
                >
                    {/* The Cinematic Frame - No Background Fill, Just Structure */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            clipPath: cockpitClip,
                            boxShadow: `inset 0 0 150px rgba(0,0,0,0.8)`, // Dark inner shadow for contrast
                            // border: `1px solid ${themeConfig.color}11` // Removed outer border to keep only corners
                        }}
                    >
                        {/* Subtle darker tint ONLY on edges for text readability, clear center */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
                    </div>

                    {/* Professional Corner Brackets (The 'Good' Borders) - REFINED SIZE */}
                    <div className="absolute inset-0 pointer-events-none" style={{ clipPath: cockpitClip }}>
                        {/* Top-Left */}
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-0 left-0 w-16 h-16 md:w-20 md:h-20 border-t border-l"
                            style={{ borderColor: themeConfig.color, borderRadius: '20px 0 0 0' }}
                        />
                        {/* Top-Right */}
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                            className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 border-t border-r"
                            style={{ borderColor: themeConfig.color, borderRadius: '0 20px 0 0' }}
                        />
                        {/* Bottom-Left */}
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                            className="absolute bottom-0 left-0 w-16 h-16 md:w-20 md:h-20 border-b border-l"
                            style={{ borderColor: themeConfig.color, borderRadius: '0 0 0 20px' }}
                        />
                        {/* Bottom-Right */}
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 3 }}
                            className="absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 border-b border-r"
                            style={{ borderColor: themeConfig.color, borderRadius: '0 0 20px 0' }}
                        />
                    </div>

                    {/* Corner HUD Metrics - Sharp & Visible */}
                    <div className="absolute top-8 left-8 md:top-12 md:left-16 flex flex-col gap-2 drop-shadow-lg">
                        <div className="flex items-center gap-3 font-black text-[10px] md:text-xs tracking-[0.3em] uppercase" style={{ color: themeConfig.color }}>
                            <Terminal className="w-4 h-4" /> SYSTEM // {theme}
                        </div>
                        <div className="h-[1px] w-24 bg-gradient-to-r from-white/40 to-transparent" />
                        <div className="text-white/60 text-[8px] md:text-[9px] font-mono tracking-widest uppercase">
                            Signal Str: 100%
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 md:top-12 md:right-16 text-right flex flex-col gap-2 items-end drop-shadow-lg">
                        <div className="flex items-center justify-end gap-3 font-black text-[10px] md:text-xs tracking-[0.3em] uppercase" style={{ color: themeConfig.color }}>
                            V_ARCHIVE_26 <Star className="w-4 h-4" />
                        </div>
                        <div className="h-[1px] w-24 bg-gradient-to-l from-white/40 to-transparent" />
                        <div className="text-white/60 text-[8px] md:text-[9px] font-mono tracking-widest uppercase">
                            Secure Link
                        </div>
                    </div>

                    {/* CENTER CONTENT - BALANCED & THEMATIC */}
                    <div className="relative z-10 w-full max-w-6xl text-center flex flex-col items-center justify-center p-4">
                        <AnimatePresence mode="wait">
                            {step === 'SYNCING' && (
                                <motion.div
                                    key="syncing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                                    className="w-full flex flex-col items-center gap-10"
                                >
                                    {/* Main Title - Smaller, cleaner, more elegant */}
                                    <div className="relative z-20">
                                        <h1 className="text-3xl sm:text-5xl md:text-6xl text-white tracking-[0.1em] uppercase leading-tight drop-shadow-[0_4px_11px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Rye', serif" }}>
                                            ENTERING<br />
                                            <span
                                                className="text-transparent bg-clip-text bg-gradient-to-r from-white/60 via-white to-white/60 tracking-[0.1em] mt-2 block md:text-7xl animate-text-shimmer"
                                            >
                                                THE UNKNOWN
                                            </span>
                                        </h1>
                                    </div>

                                    {/* High Contrast Progress Bar - Compact */}
                                    <div className="w-full max-w-md space-y-4 backdrop-blur-sm bg-black/30 p-5 rounded-2xl border border-white/10 shadow-2xl">
                                        <div className="flex justify-between items-end px-2">
                                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-400 shadow-black drop-shadow-md">
                                                {themeConfig.label}
                                            </span>
                                            <span className="text-2xl md:text-3xl font-black italic tabular-nums text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                                {Math.round(progress)}%
                                            </span>
                                        </div>

                                        <div className="relative h-1 w-full bg-white/10 overflow-hidden rounded-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="absolute inset-y-0 left-0 rounded-full"
                                                style={{
                                                    backgroundColor: themeConfig.color,
                                                    boxShadow: `0 0 15px ${themeConfig.color}`
                                                }}
                                            />
                                        </div>

                                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/50 font-mono">
                                            <span>Loading Assets...</span>
                                            <span>{themeConfig.subLabel}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'READY' && (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="flex flex-col items-center gap-8 z-20"
                                >
                                    {/* Icon Container - Glowing & Distinct */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        className="relative group cursor-pointer"
                                    >
                                        <div className="absolute inset-0 rounded-full blur-[40px] opacity-30" style={{ backgroundColor: themeConfig.color }} />
                                        <div
                                            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.6)] group-hover:bg-black/50 transition-all duration-300"
                                            style={{ boxShadow: `0 0 20px ${themeConfig.color}11` }}
                                        >
                                            <Icon className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ color: themeConfig.color }} />
                                        </div>
                                    </motion.div>

                                    {/* Main Welcome Text - Balanced Size */}
                                    <div className="text-center space-y-3">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex flex-col items-center"
                                        >
                                            <span
                                                className="text-sm md:text-base tracking-[0.2em] text-white/70 uppercase mb-2 drop-shadow-md"
                                                style={{ fontFamily: "'Rye', serif" }}
                                            >
                                                Welcome To
                                            </span>
                                            <h2
                                                className="text-5xl sm:text-6xl md:text-7xl uppercase leading-none text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
                                                style={{ fontFamily: "'Rye', serif" }}
                                            >
                                                SMVITM
                                            </h2>
                                            <span
                                                className="text-transparent bg-clip-text bg-gradient-to-r from-white/80 via-[#10b981] to-white/80 text-xl md:text-2xl tracking-[0.4em] uppercase mt-2 drop-shadow-sm animate-text-shimmer"
                                                style={{ fontFamily: "'Rye', serif" }}
                                            >
                                                FESTIVAL
                                            </span>
                                        </motion.div>
                                    </div>

                                    {/* The Button - Ancient Stone Artifact Design */}
                                    {/* The Button - LEVITATING RUNESTONE (Ancient & Heavy) */}
                                    {/* The Button - FRACTURED ENERGY SEAL */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={startExperience}
                                        className="relative group mt-8 md:mt-12 cursor-pointer outline-none focus:outline-none w-[85vw] max-w-[380px]"
                                    >
                                        {/* Outer Glow (The Aura) */}
                                        <div className="absolute -inset-1 bg-emerald-500/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Button Container */}
                                        <div className="relative px-6 py-5 md:px-12 md:py-6 bg-black border border-emerald-900 overflow-hidden flex items-center justify-center rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)]">

                                            {/* THE CRACKS - jagged lines created with rotated gradients */}
                                            {/* Main Fissure */}
                                            <div className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                                <div className="absolute top-[-50%] left-[40%] w-[2px] h-[200%] bg-emerald-400 rotate-[25deg] shadow-[0_0_10px_#10b981]" />
                                                <div className="absolute top-[-50%] left-[45%] w-[1px] h-[200%] bg-emerald-500 rotate-[15deg] translate-x-4" />
                                                <div className="absolute top-[20%] left-[20%] w-[60%] h-[2px] bg-emerald-400 rotate-[-10deg] shadow-[0_0_15px_#10b981]" />
                                                <div className="absolute bottom-[30%] right-[20%] w-[40%] h-[1px] bg-white/80 rotate-[45deg]" />
                                            </div>

                                            {/* Fractured Glass/Energy Texture */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Text Content */}
                                            <span className="relative z-10 text-xl md:text-3xl text-white uppercase tracking-[0.2em] flex items-center gap-4 drop-shadow-lg whitespace-nowrap" style={{ fontFamily: "'Rye', serif" }}>
                                                <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors hidden sm:inline">❖</span>
                                                Enter Portal
                                                <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors hidden sm:inline">❖</span>
                                            </span>

                                        </div>
                                        {/* Subtext underneath */}
                                        <div className="absolute -bottom-6 left-0 right-0 text-center">
                                            <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-500/50 font-sans group-hover:text-emerald-400 transition-colors">
                                                Break The Seal
                                            </span>
                                        </div>
                                    </motion.button>
                                </motion.div>
                            )}

                            {step === 'MESSAGE' && (
                                <motion.div
                                    key="message"
                                    initial={{ opacity: 0, scale: 1.2 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, filter: 'blur(20px)' }}
                                    className="flex flex-col items-center justify-center"
                                >
                                    <h2 className="text-6xl sm:text-8xl md:text-[150px] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                                        GO
                                    </h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom HUD metrics - Cleaner */}
                    <div className="absolute bottom-10 inset-x-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 opacity-80 z-20">
                        <div className="flex items-center gap-3 drop-shadow-md">
                            <Activity className="w-3 h-3" style={{ color: themeConfig.color }} />
                            <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">System Online</span>
                        </div>
                    </div>
                </motion.div>

                {/* Outer HUD Decorative Elements */}
                <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-40 z-[12000]">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeConfig.color }} />
                    <span className="text-white text-[9px] font-black tracking-[0.5em] uppercase italic">National_Festival // Live_Feed</span>
                </div>

                <div className="fixed inset-0 pointer-events-none z-[12000] border-[20px] md:border-[40px] border-transparent">
                    <div className="w-full h-full relative">
                        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 rounded-tl-3xl opacity-20" style={{ borderColor: themeConfig.color }} />
                        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 rounded-tr-3xl opacity-20" style={{ borderColor: themeConfig.color }} />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 rounded-bl-3xl opacity-20" style={{ borderColor: themeConfig.color }} />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 rounded-br-3xl opacity-20" style={{ borderColor: themeConfig.color }} />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export function LoadingScreen() {
    return (
        <Suspense fallback={<div className="fixed inset-0 bg-[#020402] z-[12000]" />}>
            <LoadingContent />
        </Suspense>
    )
}
