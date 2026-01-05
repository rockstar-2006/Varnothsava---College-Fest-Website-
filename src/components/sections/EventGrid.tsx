'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, Users, ChevronDown, Trophy, X, UserPlus, CheckCircle2, Loader2, ShieldCheck, Mail, Grid, Filter } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import ProEventBackground from '@/components/ui/ProEventBackground'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Event, MissionCard } from '@/components/ui/MissionCard'

gsap.registerPlugin(ScrollTrigger)

interface EventGridProps {
    missions: Event[]
}

const DUMMY_STUDENTS: Record<string, string> = {
    'VAR-X712': 'Rahul Sharma',
    'VAR-T998': 'Ananya Rao',
    'VAR-G451': 'Vikram Mehra',
    'VAR-C002': 'Sanya Singh',
    'VAR-K882': 'Aditya Das'
}

export function EventGrid({ missions }: EventGridProps) {
    const { userData, updateRegisteredEvents } = useApp()
    const [filter, setFilter] = useState<'All' | 'Technical' | 'Cultural' | 'Gaming'>('All')
    const [subFilter, setSubFilter] = useState<'All' | 'Hobby Club' | 'General' | 'Promotional'>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeThemeOverride, setActiveThemeOverride] = useState<'emerald' | 'amber' | 'cyan' | null>(null)

    // Registration State
    const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null)
    const [teamName, setTeamName] = useState('')
    const [memberCodes, setMemberCodes] = useState<{ code: string, name: string | null, loading: boolean }[]>([{ code: '', name: null, loading: false }])
    const [isSuccess, setIsSuccess] = useState(false)

    const gridRef = useRef<HTMLDivElement>(null)
    const techRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<HTMLDivElement>(null)
    const cultRef = useRef<HTMLDivElement>(null)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) setScrolled(true)
            else setScrolled(false)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const filtered = useMemo(() => missions.filter(m => {
        const matchesType = filter === 'All' || m.type === filter
        const matchesSub = filter !== 'Cultural' || subFilter === 'All' || m.category === subFilter
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSub && matchesSearch
    }), [missions, filter, subFilter, searchQuery])

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
                primary: 'cyan-500',
                secondary: 'cyan-400',
                glow: 'rgba(6, 182, 212, 0.6)',
                border: 'text-cyan-500/60 group-hover:text-cyan-400',
                borderHover: 'border-cyan-500/50',
                text: 'text-cyan-400',
                textHover: 'group-hover:text-cyan-300',
                bg: 'bg-cyan-500',
                bgHover: 'hover:bg-cyan-500',
                shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
                gradient: 'from-cyan-500 via-cyan-400 to-cyan-300',
                pulse: 'bg-cyan-500/5 group-hover:bg-cyan-500/20',
                radarColor: 'rgba(6, 182, 212, 0.15)'
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
        setActiveThemeOverride(null)
        if (!gridRef.current) return

        const isMobile = window.innerWidth < 768
        const cards = gridRef.current.querySelectorAll('.event-card-reveal')
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } })

        // Simplified Header Animation for mobile
        tl.fromTo(".header-reveal",
            { opacity: 0, y: isMobile ? -20 : -40, filter: isMobile ? "none" : "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: isMobile ? 0.8 : 1.2, stagger: isMobile ? 0.1 : 0.2 }
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
                            duration: isMobile ? 0.4 : 1.2,
                            delay: i * (isMobile ? 0.02 : 0.1),
                            ease: isMobile ? "sine.out" : "power4.out",
                            force3D: true
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

        const sections = [
            { ref: techRef, theme: 'emerald' as const },
            { ref: cultRef, theme: 'amber' as const },
            { ref: gameRef, theme: 'cyan' as const }
        ]

        sections.forEach(({ ref, theme }) => {
            if (!ref.current) return
            ScrollTrigger.create({
                trigger: ref.current,
                start: "top 60%",
                end: "bottom 40%",
                onEnter: () => setActiveThemeOverride(theme),
                onEnterBack: () => setActiveThemeOverride(theme),
            })
        })

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [filtered])

    const complexClip = filter === 'Cultural'
        ? `polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)`
        : `polygon(30px 0, 100% 0, 100% 100%, 70% 100%, 65% 94%, 35% 94%, 30% 100%, 0 100%, 0 60%, 10px 60%, 10px 40%, 0 40%, 0 30px)`

    const getBackgroundTheme = (): 'emerald' | 'amber' | 'cyan' => {
        if (filter === 'Cultural') return 'amber'
        if (filter === 'Gaming') return 'cyan'
        if (activeThemeOverride) return activeThemeOverride
        return 'emerald'
    }

    const getGlowColors = () => {
        if (filter === 'Cultural') return { primary: 'rgba(245, 158, 11, 0.12)', secondary: 'rgba(245, 158, 11, 0.08)' }
        if (filter === 'Gaming') return { primary: 'rgba(6, 182, 212, 0.12)', secondary: 'rgba(6, 182, 212, 0.08)' }
        return { primary: 'rgba(16, 185, 129, 0.12)', secondary: 'rgba(16, 185, 129, 0.08)' }
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

    const glowColors = getGlowColors()
    const gTheme = getGlobalTheme()

    // Registration Handlers
    const handleRegisterClick = (event: Event) => {
        setRegisteringEvent(event)
    }

    const handleAddMember = () => setMemberCodes([...memberCodes, { code: '', name: null, loading: false }])

    const handleUpdateCode = async (idx: number, val: string) => {
        const nc = [...memberCodes]
        const cleanVal = val.toUpperCase()
        nc[idx] = { ...nc[idx], code: cleanVal, loading: true, name: null }
        setMemberCodes(nc)

        // Mock fetch delay
        setTimeout(() => {
            const studentName = DUMMY_STUDENTS[cleanVal] || null
            const updated = [...memberCodes]
            updated[idx] = { ...updated[idx], code: cleanVal, loading: false, name: studentName }
            setMemberCodes(updated)
        }, 800)
    }

    const handleFinalRegister = async () => {
        setIsSuccess(true)
        setTimeout(() => {
            if (registeringEvent) {
                updateRegisteredEvents([{
                    id: registeringEvent.id,
                    teamName: teamName || 'Solo Participation'
                }])
            }
            setRegisteringEvent(null)
            setIsSuccess(false)
            setTeamName('')
            setMemberCodes([{ code: '', name: null, loading: false }])
        }, 2000)
    }

    // Memoize background to prevent re-renders
    const backgroundComponent = useMemo(() => (
        <ProEventBackground theme={getBackgroundTheme()} />
    ), [activeThemeOverride, filter])

    return (
        <section className="relative min-h-screen pt-20 pb-24 px-6 bg-[#020603] overflow-hidden">
            {backgroundComponent}

            <div className="container mx-auto max-w-7xl relative z-10 px-4 md:px-6">
                {/* Deployment Status Indicator */}
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
                                <span className="text-[10px] font-black text-emerald-500 tracking-[0.5em] uppercase italic animate-pulse">
                                    [ SCROLL_TO_INITIALIZE_MISSIONS ]
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
                    <div className="header-reveal space-y-1 w-full xl:w-auto text-center xl:text-left py-2">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={`flex items-center justify-center xl:justify-start gap-3 ${gTheme.text} font-mono text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black mb-2 md:mb-4`}
                        >
                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${gTheme.bg} rounded-full animate-pulse ${gTheme.glow}`} />
                            <span>Varnothsava 2026 // Explore Events</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-7xl lg:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] drop-shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                            FESTIVAL<br />
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gTheme.gradient} not-italic drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]`}>
                                .EVENTS_
                            </span>
                        </h2>
                    </div>

                    <div className="header-reveal relative w-full lg:max-w-xl group/search order-2 xl:order-2">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 400 50">
                            <path d="M 12 0 L 400 0 L 400 38 L 388 50 L 0 50 L 0 12 Z" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-white/60 ${gTheme.searchBorder}`} style={{ filter: `drop-shadow(0 0 20px ${gTheme.searchGlow})` }} />
                        </svg>
                        <div className={`relative flex items-center bg-white/[0.08] backdrop-blur-2xl overflow-hidden border border-white/10 ${gTheme.focusBorder} transition-all`} style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                            <div className={`pl-6 ${gTheme.text} flex items-center gap-2`}><Search className="w-5 h-5" /><div className={`w-[1.5px] h-5 ${gTheme.bg}/30 mx-1`} /></div>
                            <input type="text" placeholder="Search for an event..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none outline-none px-2 py-5 text-[12px] md:text-[13px] font-black uppercase tracking-[0.2em] text-white placeholder:text-white/60" />
                        </div>
                    </div>

                    <div className="header-reveal relative p-1 group/filter order-3 xl:order-3 w-full lg:w-auto mt-4 xl:mt-0">
                        <div className="flex flex-wrap items-center justify-center gap-1 bg-white/[0.05] p-1.5 backdrop-blur-2xl border border-white/5" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                            {['All', 'Technical', 'Cultural', 'Gaming'].map((t) => (
                                <button key={t} onClick={() => { setFilter(t as any); setSubFilter('All'); }} className={`px-4 md:px-6 py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${filter === t ? 'text-black z-10' : 'text-white/70 hover:text-white'}`}>
                                    {filter === t && <motion.div layoutId="activeFilter" className={`absolute inset-0 ${t === "Cultural" ? "bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.9)]" : "bg-white shadow-[0_0_40px_rgba(255,255,255,0.6)]"}`} style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                                    <span className="relative z-20">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {filter === 'Cultural' && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-wrap justify-center mb-8 gap-4">
                            {['All', 'Hobby Club', 'General', 'Promotional'].map((sf) => (
                                <button key={sf} onClick={() => setSubFilter(sf as any)} className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${subFilter === sf ? 'text-black' : 'text-white hover:text-white'}`} style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 8px)', background: subFilter === sf ? '#fbbf24' : 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
                                    {sf === 'Hobby Club' ? 'Club Events' : sf === 'General' ? 'General Events' : sf === 'Promotional' ? 'Media & Promo' : 'All Events'}
                                    {subFilter === sf && <motion.div layoutId="subGlow" className="absolute inset-0 bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.8)] blur-xl opacity-60 -z-10" />}
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
                                    <div className="flex items-center gap-4 px-8 opacity-80"><div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500" /><span className="font-mono font-black tracking-[0.3em] uppercase text-xl md:text-2xl text-emerald-500">Technical Events</span><div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 px-4 md:px-8">
                                        {groupedEvents.technical.map((event, idx) => (
                                            <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} onRegister={handleRegisterClick} className="will-change-gpu" />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {groupedEvents.cultural.length > 0 && (
                                <div ref={cultRef} className="space-y-16 mt-12">
                                    <div className="flex items-center gap-4 px-8 opacity-90"><div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500" /><div className="flex flex-col items-center"><span className="font-mono font-black tracking-[0.3em] uppercase text-xl md:text-3xl text-amber-500">Cultural Events</span><span className="text-[10px] tracking-[0.5em] text-amber-500/60 uppercase mt-2">Arts // Music // Dance</span></div><div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-16 xl:gap-24 px-4 md:px-8">
                                        {groupedEvents.cultural.map((event, idx) => (
                                            <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} onRegister={handleRegisterClick} className="will-change-gpu" />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {groupedEvents.gaming.length > 0 && (
                                <div ref={gameRef} className="space-y-12 mt-12">
                                    <div className="flex items-center gap-4 px-8 opacity-80"><div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-cyan-500" /><span className="font-mono font-black tracking-[0.3em] uppercase text-xl md:text-2xl text-cyan-500">Gaming Arena</span><div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 px-4 md:px-8">
                                        {groupedEvents.gaming.map((event, idx) => (
                                            <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} onRegister={handleRegisterClick} className="will-change-gpu" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${filter === 'Cultural' ? 'xl:grid-cols-3 gap-10 md:gap-16 xl:gap-24' : 'xl:grid-cols-4 gap-8 lg:gap-10'} px-4 md:px-8`}>
                            {filtered.map((event, idx) => (
                                <MissionCard key={event.id} event={event} idx={idx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} onRegister={handleRegisterClick} className="will-change-gpu" />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Popup */}
            <AnimatePresence>
                {registeringEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRegisteringEvent(null)} className={`absolute inset-0 bg-black/80 ${typeof window !== 'undefined' && window.innerWidth < 768 ? '' : 'backdrop-blur-md'}`} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-[#0a0f0a] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)]">
                            <div className="bg-emerald-500 px-6 md:px-10 py-6 md:py-8 flex justify-between items-center text-black">
                                <div className="space-y-1">
                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Registration Portal</span>
                                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Join Event</h3>
                                </div>
                                <button onClick={() => setRegisteringEvent(null)} className="p-2 md:p-3 hover:bg-black/10 rounded-full transition-colors"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
                            </div>
                            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                                {isSuccess ? (
                                    <div className="py-12 flex flex-col items-center text-center space-y-6">
                                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"><CheckCircle2 className="w-12 h-12 text-emerald-500" /></div>
                                        <div className="space-y-3"><h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">Registration Successful!</h4><p className="text-white/40 text-[11px] font-black uppercase tracking-widest leading-none">Your team has been registered for the event.</p></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 md:space-y-4 text-center mb-2 md:mb-4">
                                            <div className="flex items-center justify-center gap-4"><div className="h-[1px] w-8 bg-emerald-500/30" /><span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Get Started</span><div className="h-[1px] w-8 bg-emerald-500/30" /></div>
                                            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase leading-[0.85] tracking-tighter drop-shadow-2xl">{registeringEvent.title}</h2>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="space-y-3 group/field">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1 group-focus-within/field:text-emerald-500 transition-colors uppercase flex items-center gap-3"><Mail className="w-3.5 h-3.5" /> Team Name</label>
                                                <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-white font-bold tracking-widest focus:outline-none focus:border-emerald-500/50 transition-all uppercase" />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1 flex justify-between">Participant Codes<span className="text-emerald-500/50">Minimum 1 Participant</span></label>
                                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    {memberCodes.map((item, idx) => (
                                                        <div key={idx} className="relative group/input">
                                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/30 font-black italic">{idx + 1}</div>
                                                            <input type="text" value={item.code} onChange={(e) => handleUpdateCode(idx, e.target.value)} placeholder="VAR-000-000" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-16 pr-12 py-4 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all uppercase" />
                                                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                                {item.loading ? <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" /> : item.name ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ShieldCheck className="w-4 h-4 text-white/10" />}
                                                            </div>
                                                            <AnimatePresence>
                                                                {item.name && (
                                                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-2 right-4 px-2 bg-[#0a0f0a] text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">{item.name}</motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={handleAddMember} className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:text-white transition-all ml-1 group"><UserPlus className="w-4 h-4 group-hover:scale-110" /> Add Member Code</button>
                                            </div>
                                        </div>
                                        <button onClick={handleFinalRegister} className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] italic hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)] flex flex-col items-center gap-1 group overflow-hidden relative">
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 group-hover:h-full transition-all duration-300" />
                                            <span className="relative z-10">Complete Registration</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}
