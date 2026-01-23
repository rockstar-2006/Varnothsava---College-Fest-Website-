'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    Rocket, Shield, Activity, Zap, Target, Terminal,
    Star, Camera, Image as ImageIcon, User, Lock, Music
} from 'lucide-react'

type ThemeType = 'GENERAL' | 'CULTURAL' | 'GAMING' | 'GALLERY' | 'PROFILE' | 'LOGIN'

function LoadingContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [step, setStep] = useState<'SYNCING' | 'READY' | 'COUNTDOWN' | 'MESSAGE' | 'LAUNCH'>('SYNCING')
    const [progress, setProgress] = useState(0)
    const [countdown, setCountdown] = useState(3)
    const [visible, setVisible] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Detemine theme based on route & search params
    const theme: ThemeType = useMemo(() => {
        const filter = searchParams?.get('filter')
        if (pathname === '/login') return 'LOGIN'
        if (pathname === '/profile') return 'PROFILE'
        if (pathname === '/gallery') return 'GALLERY'
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
                    label: 'Unveiling Cultural Memories',
                    subLabel: 'Preparing the stage & instruments...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Music
                }
            case 'GAMING':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Target,
                    label: 'Opening Gaming Arena',
                    subLabel: 'Readying the players & scores...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Zap
                }
            case 'GALLERY':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Camera,
                    label: 'Browsing Fest Gallery',
                    subLabel: 'Preparing photos & cinematic reels...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: ImageIcon
                }
            case 'PROFILE':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: User,
                    label: 'Accessing Student Profile',
                    subLabel: 'Loading your fest credentials...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Shield
                }
            case 'LOGIN':
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Lock,
                    label: 'Student Login Portal',
                    subLabel: 'Verifying student access...',
                    bgGradient: 'radial-gradient(circle_at_50%_50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    accentIcon: Rocket
                }
            default:
                return {
                    color: '#10b981', // Emerald-500
                    dim: 'rgba(16, 185, 129, 0.1)',
                    icon: Activity,
                    label: 'Loading Student Portal',
                    subLabel: 'Connecting to Varnothsava 2026...',
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
        return [...Array(24)].map((_, i) => ({
            id: i,
            x: Math.random() * 2000 - 1000,
            yStart: Math.random() * 2000 - 1000,
            yEnd: Math.random() * 1000 + 500,
            dur: 25 + Math.random() * 20,
            rotate: Math.random() * 360
        }))
    }, [])

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        if (step === 'SYNCING') {
            const timer = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(timer)
                        setTimeout(() => setStep('READY'), 500)
                        return 100
                    }
                    return p + 2.5
                })
            }, 30)
            return () => clearInterval(timer)
        }
    }, [step])

    useEffect(() => {
        if (step === 'COUNTDOWN') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 800)
                return () => clearTimeout(timer)
            } else {
                setStep('MESSAGE')
            }
        }
    }, [step, countdown])

    useEffect(() => {
        if (step === 'MESSAGE') {
            const timer = setTimeout(() => {
                setStep('LAUNCH')
                setTimeout(() => setVisible(false), 800)
            }, 1800)
            return () => clearTimeout(timer)
        }
    }, [step])

    const startExperience = () => {
        setStep('COUNTDOWN')
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
                    scale: 1.15,
                    opacity: 0,
                    filter: 'blur(80px)',
                    transition: { duration: 1.5, ease: [0.7, 0, 0.3, 1] }
                }}
                style={{
                    willChange: 'opacity, transform, filter',
                    backgroundColor: '#020604',
                }}
            >
                {/* 1. LUXURY CINEMATIC BACKGROUND */}
                {/* 1. LUXURY CINEMATIC BACKGROUND */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {/* Volumetric Spotlights */}
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.5, 0.3],
                            x: ['-4%', '4%', '-4%'],
                            y: ['-2%', '2%', '-2%'],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(circle at 50% 40%, ${themeConfig.color}22 0%, transparent 70%)`
                        }}
                    />

                    {/* Elegant Light Leaks */}
                    <motion.div
                        animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-30%] left-[-20%] w-[100%] h-[100%] rounded-full blur-[200px]"
                        style={{ background: `radial-gradient(circle, ${themeConfig.color}22, transparent)` }}
                    />
                    <motion.div
                        animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.15, 1], rotate: [0, -45, 0] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] rounded-full blur-[220px]"
                        style={{ background: `radial-gradient(circle, ${themeConfig.color}11, transparent)` }}
                    />

                    {/* High-End Film Grain Texture */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    {/* Digital Snowfall / Floating Assets - Only render on client to avoid hydration error */}
                    {isMounted && snowParticles.map((p) => (
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

                    {isMounted && (
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

                            {/* Animated Particles */}
                            {particles.map((p) => (
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

                {/* HUD FRAME */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-5xl h-[85dvh] md:h-[75vh] flex items-center justify-center p-2"
                >
                    {/* The Cinematic Glass Frame */}
                    <div
                        className="absolute inset-0"
                        style={{
                            clipPath: cockpitClip,
                            background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4))`,
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                            border: `1px solid rgba(255,255,255,0.05)`,
                            boxShadow: `0 40px 100px rgba(0,0,0,0.8)`
                        }}
                    />

                    {/* Professional Corner Brackets (The 'Good' Borders) */}
                    <div className="absolute inset-0 pointer-events-none" style={{ clipPath: cockpitClip }}>
                        {/* Top-Left */}
                        <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2"
                            style={{ borderColor: themeConfig.color, borderRadius: '40px 0 0 0' }}
                        />
                        {/* Top-Right */}
                        <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2"
                            style={{ borderColor: themeConfig.color, borderRadius: '0 40px 0 0' }}
                        />
                        {/* Bottom-Left */}
                        <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                            className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2"
                            style={{ borderColor: themeConfig.color, borderRadius: '0 0 0 40px' }}
                        />
                        {/* Bottom-Right */}
                        <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                            className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2"
                            style={{ borderColor: themeConfig.color, borderRadius: '0 0 40px 0' }}
                        />
                    </div>

                    <div
                        className="absolute inset-[4px] bg-[#010302]/90"
                        style={{ clipPath: cockpitClip }}
                    />

                    {/* Corner HUD Metrics */}
                    <div className="absolute top-6 left-6 md:top-14 md:left-16 flex flex-col gap-1 md:gap-2">
                        <div className="flex items-center gap-2 font-black text-[7px] md:text-[8px] tracking-widest uppercase mb-0.5 md:mb-1" style={{ color: themeConfig.color }}>
                            <Terminal className="w-2.5 h-2.5 md:w-3 md:h-3" /> Campus // {theme}
                        </div>
                        <div className="text-white/10 text-[6px] md:text-[7px] font-mono tracking-widest uppercase truncate max-w-[100px] md:max-w-none">Account: Active</div>
                        <div className="text-white/10 text-[6px] md:text-[7px] font-mono tracking-widest uppercase">Verified Access</div>
                    </div>

                    <div className="absolute top-6 right-6 md:top-14 md:right-16 text-right flex flex-col gap-1 md:gap-2">
                        <div className="flex items-center justify-end gap-2 font-black text-[7px] md:text-[8px] tracking-widest uppercase mb-0.5 md:mb-1" style={{ color: themeConfig.color }}>
                            V_ARCHIVE <Star className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </div>
                        <div className="text-white/10 text-[6px] md:text-[7px] font-mono tracking-widest uppercase">2026 EDITION</div>
                    </div>

                    {/* CENTER CONTENT */}
                    <div className="relative z-10 w-full max-w-2xl text-center space-y-12 px-8">
                        <AnimatePresence mode="wait">
                            {step === 'SYNCING' && (
                                <motion.div
                                    key="syncing"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="space-y-10"
                                >
                                    <div className={`space-y-6 md:space-y-10 p-10 md:p-14 lg:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl gpu-accel relative overflow-hidden group shadow-2xl`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-100" />

                                        {/* Animated Border Trail */}
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none"
                                            animate={{
                                                background: [
                                                    `conic-gradient(from 0deg at 50% 50%, transparent 0%, ${themeConfig.color}44 10%, transparent 20%)`,
                                                    `conic-gradient(from 360deg at 50% 50%, transparent 0%, ${themeConfig.color}44 10%, transparent 20%)`
                                                ]
                                            }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            style={{ padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
                                        />

                                        <div className="absolute inset-[-1px] border border-emerald-500/20 rounded-[inherit] pointer-events-none" />

                                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-0 relative z-10">
                                            <div className="flex flex-col items-center sm:items-start gap-3">
                                                <span className="text-[11px] md:text-[13px] font-bold tracking-[0.5em] text-white/40 uppercase text-center sm:text-left">
                                                    SYSTEM_AUTHENTICATION
                                                </span>
                                                <span className="text-white font-black text-2xl md:text-3xl uppercase tracking-widest">{themeConfig.label}</span>
                                            </div>
                                            <span className="text-5xl md:text-8xl font-black text-white italic tracking-tighter tabular-nums">{Math.round(progress)}%</span>
                                        </div>

                                        <div className="h-[2px] md:h-[3px] w-full bg-white/5 relative overflow-hidden rounded-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="absolute inset-y-0 left-0"
                                                style={{ backgroundColor: themeConfig.color, boxShadow: `0 0 20px ${themeConfig.color}` }}
                                            />
                                        </div>

                                        <div className="flex justify-center gap-10 pt-4 opacity-30">
                                            <Icon className="w-4 h-4" style={{ color: themeConfig.color }} />
                                            <div className="w-10 h-[1px] bg-white/10 my-auto" />
                                            <AccentIcon className="w-4 h-4" style={{ color: themeConfig.color }} />
                                            <div className="w-10 h-[1px] bg-white/10 my-auto" />
                                            <Star className="w-4 h-4" style={{ color: themeConfig.color }} />
                                        </div>
                                    </div>

                                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white italic tracking-[0.05em] uppercase leading-none opacity-20 select-none text-center">
                                        VARNOTHSAVA<br /><span className="text-white/5 not-italic">2K26</span>
                                    </h1>
                                </motion.div>
                            )}

                            {step === 'READY' && (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-10"
                                >
                                    <div className={`relative p-10 md:p-16 border border-white/10 bg-white/[0.01] ${isMobile ? '' : 'backdrop-blur-xl'} rounded-[3rem] md:rounded-[4rem] gpu-accel shadow-2xl overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.03] to-transparent" />

                                        {/* Animated Border Trail for Ready Card */}
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none"
                                            animate={{
                                                background: [
                                                    `conic-gradient(from 0deg at 50% 50%, transparent 0%, ${themeConfig.color}44 10%, transparent 20%)`,
                                                    `conic-gradient(from 360deg at 50% 50%, transparent 0%, ${themeConfig.color}44 10%, transparent 20%)`
                                                ]
                                            }}
                                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                            style={{ padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
                                        />

                                        <div className="w-20 h-20 md:w-28 md:h-28 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner relative group">
                                            <motion.div
                                                className="absolute inset-0 rounded-[2rem] opacity-20 blur-xl"
                                                style={{ backgroundColor: themeConfig.color }}
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            <Icon className="w-10 h-10 md:w-14 md:h-14 relative z-10" style={{ color: themeConfig.color }} />
                                        </div>

                                        <h2 className="relative text-3xl sm:text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-2 md:mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] leading-none overflow-hidden">
                                            WELCOME TO <br className="sm:hidden" />
                                            <span className="relative inline-block">
                                                <span style={{ color: themeConfig.color, textShadow: `0 0 20px ${themeConfig.color}88` }}>SMVITM</span>
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
                                                    animate={{ x: ['-200%', '200%'] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                            </span>
                                        </h2>
                                        <p className="text-white/40 text-[11px] md:text-[13px] uppercase tracking-[0.4em] font-medium mb-12 max-w-sm mx-auto leading-relaxed">Your premium student festival <br /> dashboard is ready for access.</p>

                                        <button
                                            onClick={startExperience}
                                            className="w-[200px] sm:w-[280px] md:w-full mx-auto py-4 md:py-7 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] hover:text-white transition-all shadow-2xl relative overflow-hidden group/btn"
                                            style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                                        >
                                            <div
                                                className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                                                style={{ backgroundColor: themeConfig.color }}
                                            />
                                            <span className="relative z-10">OPEN PORTAL</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'COUNTDOWN' && (
                                <motion.div
                                    key="countdown"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 3 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        key={countdown}
                                        initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
                                        animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                                        className="text-[10rem] md:text-[15rem] font-black text-white italic tracking-tighter leading-none"
                                        style={{ textShadow: `0 0 50px ${themeConfig.color}44` }}
                                    >
                                        {countdown}
                                    </motion.div>
                                    <div className="mt-8 font-black text-[10px] md:text-[12px] tracking-[1.5em] md:tracking-[2em] uppercase opacity-40 italic" style={{ color: themeConfig.color }}>Synchronizing...</div>
                                </motion.div>
                            )}

                            {step === 'MESSAGE' && (
                                <motion.div
                                    key="message"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, filter: 'blur(30px)' }}
                                    className="space-y-12"
                                >
                                    <div className="flex flex-col items-center gap-10">
                                        <div className="w-32 h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${themeConfig.color}, transparent)` }} />
                                        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-[0.1em] uppercase italic text-center leading-none">
                                            FESTIVAL<br />
                                            <span style={{ color: themeConfig.color }}>STARTS_NOW</span>
                                        </h2>
                                        <div className="flex items-center gap-6 text-emerald-400 font-mono text-[12px] md:text-[14px] tracking-[0.6em] uppercase font-bold">
                                            PORTAL UNLOCKED _ 2026
                                        </div>
                                        <div className="w-32 h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${themeConfig.color}, transparent)` }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom HUD metrics */}
                    <div className="absolute bottom-10 inset-x-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 opacity-60">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4" style={{ color: themeConfig.color }} />
                            <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">Experience Protocol Active</span>
                        </div>
                        <div className="hidden md:block w-16 h-[1px] bg-white/5" />
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">Verified Node Access</span>
                            <Shield className="w-4 h-4" style={{ color: themeConfig.color }} />
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
