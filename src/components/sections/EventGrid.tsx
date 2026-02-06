'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { Search, Zap, ChevronDown, Trophy, X, CheckCircle2, Loader2, ShieldCheck, Mail, Grid, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import ProEventBackground from '@/components/ui/ProEventBackground'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Event, MissionCard } from '@/components/ui/MissionCard'
import { RegistrationModal } from '@/components/ui/RegistrationModal'

gsap.registerPlugin(ScrollTrigger)

interface EventGridProps {
    missions: Event[]
}

export function EventGrid({ missions }: EventGridProps) {
    const { userData, registerMission, isLoggedIn, isSiteLoaded } = useApp()
    const router = useRouter()
    const [filter, setFilter] = useState<'All' | 'Technical' | 'Cultural' | 'Gaming'>('All')
    const [subFilter, setSubFilter] = useState<
        'All' | 'Solo' | 'Duo' | 'Group' | 'Promotional'
    >('All')

    const [searchQuery, setSearchQuery] = useState('')
    const [activeThemeOverride, setActiveThemeOverride] = useState<'emerald' | 'amber' | 'cyan' | 'gaming' | null>(null)
    const [isRegModalOpen, setIsRegModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<any>(null)

    const gridRef = useRef<HTMLDivElement>(null)
    const techRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<HTMLDivElement>(null)
    const cultRef = useRef<HTMLDivElement>(null)
    const [scrolled, setScrolled] = useState(false)
    const { scrollYProgress } = useScroll()

    // Smooth transform for parallax
    const headerY = useTransform(scrollYProgress, [0, 1], [0, -150])
    const techY = useTransform(scrollYProgress, [0, 1], [0, -80])
    const cultY = useTransform(scrollYProgress, [0, 1], [0, -40])
    const gameY = useTransform(scrollYProgress, [0, 1], [0, -100])

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) setScrolled(true)
            else setScrolled(false)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const filtered = useMemo(() => {
        return missions.filter((m) => {
            // Main category filter (Technical / Cultural / Gaming)
            const matchesType = filter === 'All' || m.type === filter

            // Sub-filter ONLY for Cultural events, based on teamFormat
            let matchesSub = true
            if (filter === 'Cultural' && subFilter !== 'All') {
                const tf = m.teamFormate?.toLowerCase() || ''

                if (subFilter === 'Solo') matchesSub = tf.includes('solo')
                else if (subFilter === 'Duo') matchesSub = tf.includes('duo') || tf.includes('pair')
                else if (subFilter === 'Group') matchesSub = tf.includes('group')
                else if (subFilter === 'Promotional')
                    matchesSub = tf.includes('media') || tf.includes('promo')
            }

            // Search filter
            const matchesSearch =
                m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.description.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesType && matchesSub && matchesSearch
        })
    }, [missions, filter, subFilter, searchQuery])


    const groupedEvents = useMemo(() => ({
        technical: filtered.filter(m => m.type === 'Technical'),
        gaming: filtered.filter(m => m.type === 'Gaming'),
        cultural: filtered.filter(m => m.type === 'Cultural')
    }), [filtered])

    const getEventTheme = useCallback((type: 'Technical' | 'Cultural' | 'Gaming') => {
        if (type === 'Cultural') {
            return {
                primary: 'amber-500',
                secondary: 'orange-400',
                glow: 'rgba(245, 158, 11, 0.6)',
                border: 'text-amber-500/60 group-hover:text-amber-400',
                borderHover: 'border-amber-500/50',
                text: 'text-amber-400',
                textHover: 'group-hover:text-amber-300',
                bg: 'bg-amber-500',
                bgHover: 'hover:bg-amber-500',
                shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
                gradient: 'from-amber-500 via-amber-400 to-orange-300',
                pulse: 'bg-amber-500/5 group-hover:bg-amber-500/20',
                radarColor: 'rgba(245, 158, 11, 0.15)'
            }
        }

        if (type === 'Gaming') {
            return {
                primary: 'violet-600',
                secondary: 'cyan-500',
                glow: 'rgba(139, 92, 246, 0.6)',
                border: 'text-violet-600/60 group-hover:text-violet-500',
                borderHover: 'border-violet-600/50',
                text: 'text-violet-500',
                textHover: 'group-hover:text-violet-400',
                bg: 'bg-violet-600',
                bgHover: 'hover:bg-violet-600',
                shadow: 'shadow-[0_0_20px_rgba(139, 92, 246, 0.4)]',
                gradient: 'from-violet-600 via-violet-500 to-cyan-200',
                pulse: 'bg-violet-600/5 group-hover:bg-violet-600/20',
                radarColor: 'rgba(139, 92, 246, 0.15)'
            }
        }

        return {
            primary: 'emerald-500',
            secondary: 'green-400',
            glow: 'rgba(16, 185, 129, 0.6)',
            border: 'text-emerald-500/60 group-hover:text-emerald-400',
            borderHover: 'border-emerald-500/50',
            text: 'text-emerald-400',
            textHover: 'group-hover:text-emerald-300',
            bg: 'bg-emerald-500',
            bgHover: 'hover:bg-emerald-500',
            shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
            gradient: 'from-emerald-500 via-emerald-400 to-emerald-300',
            pulse: 'bg-emerald-500/5 group-hover:bg-emerald-500/20',
            radarColor: 'rgba(16, 185, 129, 0.15)'
        }
    }, [])

    useEffect(() => {
        if (!isSiteLoaded) return
        setActiveThemeOverride(null)
        if (!gridRef.current) return

        const isMobile = window.innerWidth < 768
        const cards = gridRef.current.querySelectorAll('.event-card-reveal')

        gsap.killTweensOf(cards)

        if (isMobile) {
            gsap.set(cards, { opacity: 1, y: 0, scale: 1, x: 0, rotateX: 0, rotateY: 0, filter: "none" })
            gsap.set(".header-reveal", { opacity: 1, y: 0, filter: "none" })
            return
        }

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } })

        tl.fromTo(".header-reveal",
            { opacity: 0, y: -40, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.2 }
        )

        gsap.set(cards, { opacity: 0, y: isMobile ? 50 : 150, scale: isMobile ? 1 : 0.8 })

        ScrollTrigger.batch(cards, {
            onEnter: (elements) => {
                elements.forEach((el, i) => {
                    const isEven = i % 2 === 0
                    gsap.fromTo(el,
                        {
                            opacity: 0,
                            y: isMobile ? 20 : 120,
                            scale: isMobile ? 1 : 0.85,
                            rotateX: isMobile ? 0 : -20,
                            rotateY: isMobile ? 0 : (isEven ? 15 : -15),
                            x: isMobile ? 0 : (isEven ? -40 : 40)
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotateX: 0,
                            rotateY: 0,
                            x: 0,
                            duration: isMobile ? 0.3 : 1.2,
                            delay: i * (isMobile ? 0.05 : 0.1),
                            ease: isMobile ? "power2.out" : "power4.out",
                            clearProps: "all",
                            force3D: true,
                            willChange: 'transform, opacity'
                        }
                    )
                })
            },
            onLeaveBack: (elements) => {
                gsap.to(elements, {
                    opacity: 0,
                    y: isMobile ? 30 : 100,
                    scale: isMobile ? 0.95 : 0.9,
                    duration: 0.4,
                    overwrite: true
                })
            },
            start: isMobile ? "top bottom" : "top bottom-=50",
            fastScrollEnd: true
        })

        ScrollTrigger.refresh()

        const sections = [
            { ref: techRef, theme: 'emerald' as const },
            { ref: cultRef, theme: 'amber' as const },
            { ref: gameRef, theme: 'gaming' as const }
        ]

        sections.forEach(({ ref, theme }) => {
            if (!ref.current) return
            ScrollTrigger.create({
                trigger: ref.current,
                start: "top 60%",
                end: "bottom 40%",
                onEnter: () => {
                    const themeValue = theme as string
                    setActiveThemeOverride(theme)
                    document.documentElement.style.setProperty('--nav-current-theme', themeValue === 'amber' ? '245, 158, 11' : themeValue === 'cyan' ? '6, 182, 212' : themeValue === 'gaming' ? '139, 92, 246' : '16, 185, 129')
                },
                onEnterBack: () => {
                    const themeValue = theme as string
                    setActiveThemeOverride(theme)
                    document.documentElement.style.setProperty('--nav-current-theme', themeValue === 'amber' ? '245, 158, 11' : themeValue === 'cyan' ? '6, 182, 212' : themeValue === 'gaming' ? '139, 92, 246' : '16, 185, 129')
                },
            })
        })

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [filtered, isSiteLoaded])

    const complexClip = filter === 'Cultural'
        ? `polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)`
        : `polygon(30px 0, 100% 0, 100% 100%, 70% 100%, 65% 94%, 35% 94%, 30% 100%, 0 100%, 0 60%, 10px 60%, 10px 40%, 0 40%, 0 30px)`

    const getBackgroundTheme = (): 'emerald' | 'amber' | 'cyan' | 'indigo' | 'gaming' => {
        if (filter === 'Cultural') return 'amber'
        if (filter === 'Gaming') return 'gaming'
        if (activeThemeOverride) return activeThemeOverride
        return 'emerald'
    }

    const getGlobalTheme = () => {
        if (filter === 'Cultural') {
            return {
                text: 'text-amber-400',
                textMuted: 'text-amber-500/80',
                bg: 'bg-amber-500',
                border: 'border-amber-500/50',
                focusBorder: 'group-focus-within/search:border-amber-500/50',
                focusText: 'group-focus-within/search:text-amber-300',
                focusPlaceholder: 'group-focus-within/search:placeholder:text-amber-400/50',
                glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]',
                dropGlow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
                gradient: 'from-amber-600 via-amber-400 to-amber-200',
                searchBorder: 'group-focus-within/search:text-amber-500',
                searchGlow: 'rgba(245,158,11,0.3)',
                focusBg: 'group-focus-within/search:bg-amber-500/10'
            }
        } else if (filter === 'Gaming') {
            return {
                text: 'text-violet-400',
                textMuted: 'text-violet-500/80',
                bg: 'bg-violet-500',
                border: 'border-violet-500/50',
                focusBorder: 'group-focus-within/search:border-violet-500/50',
                focusText: 'group-focus-within/search:text-violet-300',
                focusPlaceholder: 'group-focus-within/search:placeholder:text-violet-400/50',
                glow: 'shadow-[0_0_10px_rgba(139, 92, 246, 0.5)]',
                dropGlow: 'drop-shadow-[0_0_8px_rgba(139, 92, 246, 0.6)]',
                gradient: 'from-violet-600 via-violet-400 to-cyan-200',
                searchBorder: 'group-focus-within/search:text-violet-500',
                searchGlow: 'rgba(139, 92, 246, 0.3)',
                focusBg: 'group-focus-within/search:bg-violet-500/10'
            }
        }
        return {
            text: 'text-emerald-400',
            textMuted: 'text-emerald-500/80',
            bg: 'bg-emerald-500',
            border: 'border-emerald-500/60',
            focusBorder: 'group-focus-within/search:border-emerald-400',
            focusText: 'group-focus-within/search:text-emerald-300',
            focusPlaceholder: 'group-focus-within/search:placeholder:text-emerald-400/50',
            glow: 'shadow-[0_0_25px_rgba(16,185,129,0.8)]',
            dropGlow: 'drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]',
            gradient: 'from-emerald-600 via-emerald-400 to-emerald-200',
            searchBorder: 'group-focus-within/search:text-emerald-400',
            searchGlow: 'rgba(16, 185, 129, 0.6)',
            focusBg: 'group-focus-within/search:bg-emerald-500/15'
        }
    }

    const gTheme = getGlobalTheme()

    const handleRegisterClick = (event: Event) => {
        if (!isLoggedIn) {
            router.push('/login')
            return
        }
        setSelectedEvent(event)
        setIsRegModalOpen(true)
    }

    const handleConfirmRegistration = async (data: { teamName: string, members: string[] }) => {
        try {
            const success = await registerMission(selectedEvent.id, data.teamName, data.members)
            if (success) {
                alert(`Successfully registered team '${data.teamName}' for ${selectedEvent.title}!`)
            }
        } catch (error: any) {
            alert(`Registration failed: ${error.message}`)
        }
    }

    const backgroundComponent = useMemo(() => (
        <ProEventBackground theme={getBackgroundTheme()} scrollProgress={scrollYProgress} />
    ), [activeThemeOverride, filter, scrollYProgress])

    return (
        <section className="relative min-h-[100dvh] pt-20 pb-24 px-4 md:px-6 bg-[#020206] overflow-hidden root-container">
            {backgroundComponent}

            <div className="container mx-auto max-w-7xl relative z-10 px-4 md:px-6">
                <AnimatePresence>
                    {!scrolled && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50 mix-blend-difference pointer-events-none"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-[1px] w-12 bg-emerald-500/50" />
                                <span className="text-[10px] font-bold text-emerald-500 tracking-[0.5em] uppercase italic animate-pulse">
                                    [ SCROLL TO EXPLORE EVENTS ]
                                </span>
                                <div className="h-[1px] w-12 bg-emerald-500/50" />
                            </div>
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <ChevronDown className="w-6 h-6 text-emerald-500" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`flex flex-col xl:flex-row items-center xl:items-end justify-between ${(searchQuery === '' && filter === 'All') ? 'mb-8 md:mb-16' : 'mb-4 md:mb-8'} gap-6 md:gap-10 border-b border-white/10 pb-6 md:pb-10 relative`}>
                    <motion.div
                        className="header-reveal space-y-1 w-full xl:w-auto text-center xl:text-left py-2"
                        style={{ y: headerY }}
                    >
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={`flex items-center justify-center xl:justify-start gap-3 ${gTheme.text} font-mono text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black mb-2 md:mb-4`}
                        >
                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${gTheme.bg} rounded-full animate-pulse ${gTheme.glow}`} />
                            <span>Varnothsava 2026 // Fest Events</span>
                        </motion.div>
                        <h2 className="text-h2 font-black text-white italic tracking-tighter uppercase leading-[0.8] drop-shadow-[0_0_50px_rgba(16,185,129,0.4)] gpu-accel">
                            FESTIVAL<br />
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gTheme.gradient} not-italic drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]`}>
                                EXPLORE EVENTS
                            </span>
                        </h2>
                    </motion.div>

                    <div className={`header-reveal relative w-full lg:max-w-xl group/search order-2 xl:order-2 will-change-transform will-change-opacity translate-z-0`} style={{ contain: 'content' }}>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 400 50">
                            <path d="M 12 0 L 400 0 L 400 38 L 388 50 L 0 50 L 0 12 Z" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-white/60 ${gTheme.searchBorder}`} />
                        </svg>
                        <div className={`relative flex items-center bg-white/[0.08] backdrop-blur-2xl overflow-hidden border border-white/10 ${gTheme.focusBorder} transition-all`} style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                            <div className={`pl-6 ${gTheme.text} flex items-center gap-2`}><Search className="w-5 h-5" /><div className={`w-[1.5px] h-5 ${gTheme.bg}/30 mx-1`} /></div>
                            <input type="text" placeholder="Search for an event..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none outline-none px-2 py-5 text-[12px] md:text-[13px] font-black uppercase tracking-[0.2em] text-white placeholder:text-white/60" />
                        </div>
                    </div>

                    <div className="header-reveal relative p-1 group/filter order-3 xl:order-3 w-full lg:w-auto mt-4 xl:mt-0">
                        <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-1 bg-white/[0.05] p-1.5 backdrop-blur-2xl border border-white/5 overflow-x-auto custom-scrollbar-hide" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                            {['All', 'Technical', 'Cultural', 'Gaming']
                                .filter(t => !(filter === 'Cultural' && t === 'All'))
                                .map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            setFilter(t as any)
                                            setSubFilter('All')
                                        }}
                                        className={`px-4 md:px-6 py-3 md:py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all relative min-h-[48px] md:min-h-0 flex-shrink-0 ${filter === t ? 'text-black z-10' : 'text-white/70 hover:text-white'
                                            }`}
                                    >
                                        {filter === t && (
                                            <motion.div
                                                layoutId="activeFilter"
                                                className="absolute inset-0 shadow-[0_0_40px_rgba(255,255,255,0.6)]"
                                                style={{
                                                    backgroundColor: t === 'Cultural' ? '#f59e0b' : '#ffffff',
                                                    clipPath:
                                                        'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                                                }}
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-20">{t}</span>
                                    </button>
                                ))}

                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {filter === 'Cultural' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-nowrap md:flex-wrap justify-start md:justify-center mb-8 gap-4 overflow-x-auto custom-scrollbar-hide pb-2"
                        >
                            {['All', 'Solo', 'Duo', 'Group', 'Promotional'].map((sf) => (
                                <button
                                    key={sf}
                                    onClick={() => setSubFilter(sf as any)}
                                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex-shrink-0 ${subFilter === sf ? 'text-black' : 'text-white hover:text-white'
                                        }`}
                                    style={{
                                        clipPath:
                                            'polygon(8px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 8px)',
                                        background:
                                            subFilter === sf ? '#fbbf24' : 'rgba(255,255,255,0.02)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {sf === 'Solo'
                                        ? 'Solo Events'
                                        : sf === 'Duo'
                                            ? 'Duo Events'
                                            : sf === 'Group'
                                                ? 'Group Events'
                                                : sf === 'Promotional'
                                                    ? 'Media & Promo'
                                                    : 'All Events'}


                                    {subFilter === sf && (
                                        <motion.div
                                            layoutId="subGlow"
                                            className="absolute inset-0 shadow-[0_0_30px_rgba(245,158,11,0.8)] blur-xl opacity-60 -z-10"
                                            style={{ backgroundColor: '#fbbf24' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>


                <div ref={gridRef} className="flex flex-col gap-24 pb-20">
                    {searchQuery === '' && filter === 'All' ? (
                        <>
                            {groupedEvents.technical.length > 0 && (
                                <div ref={techRef} className="space-y-12">
                                    <motion.div className="flex items-center gap-4 px-8 opacity-90" style={{ y: techY }}>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500" />
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold tracking-[0.3em] uppercase text-xl md:text-2xl text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">Technical Events</span>
                                            <div className="h-0.5 w-1/2 bg-emerald-500 mt-2 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                        </div>
                                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500" />
                                    </motion.div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 px-4 md:px-8">
                                        {groupedEvents.technical.map((event, idx) => (
                                            <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} isLoggedIn={isLoggedIn} onRegister={handleRegisterClick} className="will-change-gpu" priority={idx < 4} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {groupedEvents.cultural.length > 0 && (
                                <div ref={cultRef} className="space-y-16 mt-12">
                                    <motion.div className="flex items-center gap-4 px-8 opacity-90" style={{ y: cultY }}>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500" />
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold tracking-[0.3em] uppercase text-xl md:text-3xl text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">Cultural Events</span>
                                            <span className="text-[10px] tracking-[0.5em] text-amber-500/80 uppercase mt-2">Arts // Music // Dance</span>
                                            <div className="h-0.5 w-full bg-amber-500 mt-3 shadow-[0_0_10px_rgba(245,158,11,1)]" />
                                        </div>
                                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500" />
                                    </motion.div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 xl:gap-24 px-4 md:px-12">
                                        {groupedEvents.cultural.map((event, idx) => (
                                            <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} isLoggedIn={isLoggedIn} onRegister={handleRegisterClick} className="will-change-gpu" />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {groupedEvents.gaming.length > 0 && (
                                <div ref={gameRef} className="space-y-12 mt-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 px-4 md:px-8 pt-12">
                                        {groupedEvents.gaming.map((event, idx) => (
                                            <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} isLoggedIn={isLoggedIn} onRegister={handleRegisterClick} className="will-change-gpu" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${filter === 'Cultural' ? 'lg:grid-cols-3 gap-10 md:gap-16 xl:gap-24 px-8 md:px-12' : 'xl:grid-cols-3 2xl:grid-cols-4 gap-8 lg:gap-10 px-4 md:px-8'}`}>
                            {filtered.map((event, idx) => (
                                <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} isLoggedIn={isLoggedIn} onRegister={handleRegisterClick} className="will-change-gpu" />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {userData && (
                <RegistrationModal
                    isOpen={isRegModalOpen}
                    onClose={() => setIsRegModalOpen(false)}
                    event={selectedEvent}
                    userData={userData}
                    onConfirm={handleConfirmRegistration}
                />
            )}
        </section>
    )
}
