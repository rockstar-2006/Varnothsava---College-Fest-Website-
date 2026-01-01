'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { Activity, Search, MousePointer2, Zap, Rocket, Globe, ShoppingCart, Users, Clock, ChevronDown } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import ProEventBackground from '@/components/ui/ProEventBackground'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MissionCard, { Mission } from '@/components/ui/MissionCard'

gsap.registerPlugin(ScrollTrigger)

import { missions } from '@/data/missions'

export function EventGrid() {
    const [filter, setFilter] = useState<'All' | 'Technical' | 'Cultural' | 'Gaming'>('All')
    const [subFilter, setSubFilter] = useState<'All' | 'Hobby Club' | 'General' | 'Promotional'>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeThemeOverride, setActiveThemeOverride] = useState<'emerald' | 'amber' | 'cyan' | null>(null)
    const { addToCart, cart } = useApp()

    const gridRef = useRef<HTMLDivElement>(null)
    const techRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<HTMLDivElement>(null)
    const cultRef = useRef<HTMLDivElement>(null)

    const filtered = useMemo(() => missions.filter(m => {
        const matchesType = filter === 'All' || m.type === filter
        const matchesSub = filter !== 'Cultural' || subFilter === 'All' || m.category === subFilter
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSub && matchesSearch
    }), [filter, subFilter, searchQuery])

    const groupedMissions = useMemo(() => ({
        technical: filtered.filter(m => m.type === 'Technical'),
        gaming: filtered.filter(m => m.type === 'Gaming'),
        cultural: filtered.filter(m => m.type === 'Cultural')
    }), [filtered])

    // Dynamic color theme based on event type
    // Only Cultural events get amber/gold - Technical and Gaming stay emerald
    const getEventTheme = useCallback((type: 'Technical' | 'Cultural' | 'Gaming') => {
        if (type === 'Cultural') {
            return {
                primary: 'amber-500',
                secondary: 'orange-400',
                glow: 'rgba(245, 158, 11, 0.6)', // amber-500
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

        return {
            primary: 'emerald-500',
            secondary: 'green-400',
            glow: 'rgba(16, 185, 129, 0.6)', // emerald-500
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
        // Reset theme override on filter change to prevent stale state from "All" view persisting
        setActiveThemeOverride(null)

        if (!gridRef.current) return

        const cards = gridRef.current.querySelectorAll('.event-card-reveal')

        // 1. Header Elements Entrance
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } })
        tl.fromTo(".header-reveal",
            { opacity: 0, y: -40, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.2 }
        )

        // 2. Card Batch Reveal
        gsap.set(cards, { opacity: 0, y: 80, scale: 0.9, rotateX: -15 })

        ScrollTrigger.batch(cards, {
            onEnter: (elements) => {
                gsap.to(elements, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotateX: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power4.out",
                    overwrite: true,
                    force3D: true
                })
            },
            onLeaveBack: (elements) => {
                gsap.to(elements, {
                    opacity: 0,
                    y: 80,
                    scale: 0.9,
                    rotateX: -15,
                    duration: 0.6,
                    overwrite: true,
                    force3D: true
                })
            },
            start: "top bottom-=100",
            fastScrollEnd: true
        })

        // 3. Section Theme Transitions
        const sections = [
            { ref: techRef, theme: 'emerald' as const },
            { ref: cultRef, theme: 'amber' as const },
            { ref: gameRef, theme: 'emerald' as const }
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
        ? `polygon(
            15px 0, calc(100% - 15px) 0, 100% 15px, 
            100% calc(100% - 15px), calc(100% - 15px) 100%, 
            15px 100%, 0 calc(100% - 15px), 0 15px
        )`
        : `polygon(
            30px 0, 100% 0, 
            100% 100%, 
            70% 100%, 65% 94%, 35% 94%, 30% 100%, 
            0 100%, 
            0 60%, 10px 60%, 10px 40%, 0 40%, 
            0 30px
        )`

    // Determine background theme based on filter priority
    const getBackgroundTheme = (): 'emerald' | 'amber' | 'cyan' => {
        // 1. Explicit Filter Overrides (Priority)
        if (filter === 'Cultural') return 'amber'
        if (filter === 'Gaming') return 'emerald'

        // 2. Scroll-based Overrides (Only for "All" view)
        if (activeThemeOverride) return activeThemeOverride

        // 3. Default Validation
        return 'emerald'
    }

    // Get dynamic glow colors based on current filter
    const getGlowColors = () => {
        if (filter === 'Cultural') {
            return {
                primary: 'rgba(245, 158, 11, 0.12)', // amber
                secondary: 'rgba(245, 158, 11, 0.08)'
            }
        }
        return {
            primary: 'rgba(16, 185, 129, 0.12)', // emerald
            secondary: 'rgba(16, 185, 129, 0.08)'
        }
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
            border: 'border-emerald-500/50',
            focusBorder: 'group-focus-within/search:border-emerald-500/50',
            focusText: 'group-focus-within/search:text-emerald-300',
            focusPlaceholder: 'group-focus-within/search:placeholder:text-emerald-400/50',
            glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]',
            dropGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
            gradient: 'from-emerald-500 via-emerald-400 to-emerald-300',
            searchBorder: 'group-focus-within/search:text-emerald-500',
            searchGlow: 'rgba(16,185,129,0.3)',
            focusBg: 'group-focus-within/search:bg-emerald-500/10'
        }
    }

    const glowColors = getGlowColors()
    const gTheme = getGlobalTheme()

    return (
        <section className="relative min-h-screen pt-20 pb-24 px-6 bg-[#020603] overflow-hidden">
            <ProEventBackground theme={getBackgroundTheme()} />

            {/* High-Luminosity Center Backlight (Lifting Visibility for Event Cards) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80vh] bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_80%)] pointer-events-none z-0" />

            {/* Dynamic Global Glow Accents */}
            <motion.div
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                animate={{
                    background: `radial-gradient(circle at 20% 20%, ${glowColors.primary}, transparent 60%)`
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-0"
                animate={{
                    background: `radial-gradient(circle at 80% 80%, ${glowColors.secondary}, transparent 50%)`
                }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
            />

            <div className="container mx-auto max-w-7xl relative z-10 px-4 md:px-6">
                {/* Advanced Structural Header Unit */}
                <div className={`flex flex-col xl:flex-row items-center xl:items-end justify-between ${(searchQuery === '' && filter === 'All') ? 'mb-8 md:mb-16' : 'mb-4 md:mb-8'} gap-10 border-b border-white/10 pb-10 relative`}>
                    {/* Background Glass Panel for Header structure - Enhanced visibility */}
                    <div className="absolute inset-x-[-4rem] inset-y-[-2rem] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-[4px] -z-10 xl:block hidden border-x border-t border-white/5"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />

                    {/* LEFT: Title Area */}
                    <div className="header-reveal space-y-1 w-full xl:w-auto text-center xl:text-left py-2">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={`flex items-center justify-center xl:justify-start gap-3 ${gTheme.text} font-mono text-[9px] uppercase tracking-[0.4em] font-black mb-4`}
                        >
                            <div className={`w-2 h-2 ${gTheme.bg} rounded-full animate-pulse ${gTheme.glow}`} />
                            <span>VARNOTHSAVA_2K26 // OFFICIAL_EVENTS</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.8] drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            EVENT<br />
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gTheme.gradient} not-italic`}>
                                .CATEGORIES_
                            </span>
                        </h2>
                    </div>

                    {/* CENTER: Tactical Search Bar - Enhanced Visibility */}
                    <div className="header-reveal relative w-full lg:max-w-xl group/search order-2 xl:order-2">
                        {/* Outer Geometric Border (Sharp White/Emerald) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 400 50">
                            <path
                                d="M 12 0 L 400 0 L 400 38 L 388 50 L 0 50 L 0 12 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className={`text-white/50 ${gTheme.searchBorder} group-hover/search:text-white/70 transition-all duration-500`}
                                style={{ filter: `drop-shadow(0 0 15px ${gTheme.searchGlow})` }}
                            />
                        </svg>

                        {/* High-Luminosity Glow for Focus */}
                        <div className={`absolute inset-0 bg-white/0 ${gTheme.focusBg} shadow-[inner_0_0_30px_rgba(245,158,11,0.1)] transition-all duration-500 pointer-events-none`}
                            style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }} />

                        <div
                            className={`relative flex items-center bg-white/[0.08] backdrop-blur-2xl overflow-hidden border border-white/10 ${gTheme.focusBorder} transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]`}
                            style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                        >
                            <div className={`pl-6 ${gTheme.text} ${gTheme.focusText} group-focus-within/search:scale-110 transition-all flex items-center gap-2`}>
                                <Search className={`w-5 h-5 ${gTheme.dropGlow}`} />
                                <div className={`w-[1.5px] h-5 ${gTheme.bg}/30 mx-1`} />
                            </div>
                            <input
                                type="text"
                                placeholder="SEARCH THE EVENT // ENTER_QUERY..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full bg-transparent border-none outline-none px-2 py-5 text-[12px] md:text-[13px] font-black uppercase tracking-[0.2em] text-white placeholder:text-white/60 ${gTheme.focusPlaceholder} transition-all`}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Geometric Filters Area - Responsive Stack */}
                    <div className="header-reveal relative p-1 group/filter order-3 xl:order-3 w-full lg:w-auto mt-4 xl:mt-0">
                        {/* Outer Geometric Border (Sharp White) - Desktop Only or Responsive SVG */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block" preserveAspectRatio="none" viewBox="0 0 360 50">
                            <path
                                d="M 12 0 L 360 0 L 360 38 L 348 50 L 0 50 L 0 12 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-white/30 group-hover/filter:text-white/60 transition-colors duration-500"
                            />
                        </svg>

                        <div
                            className="flex flex-wrap items-center justify-center lg:justify-start gap-1 bg-white/[0.05] p-1.5 backdrop-blur-2xl relative z-0 border border-white/5 md:border-none"
                            style={{ clipPath: 'md:polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                        >
                            {['All', 'Technical', 'Cultural', 'Gaming'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setFilter(t as any); setSubFilter('All'); }}
                                    className={`px-4 md:px-6 py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${filter === t
                                        ? 'text-black z-10'
                                        : 'text-white/70 hover:text-white'
                                        }`}
                                >
                                    {filter === t && (
                                        <motion.div
                                            layoutId="activeFilter"
                                            className={`absolute inset-0 ${t === "Cultural" ? "bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.9)]" : "bg-white shadow-[0_0_40px_rgba(255,255,255,0.6)]"}`}
                                            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-20 font-black tracking-widest">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sub-Filter System for Cultural Section */}
                <AnimatePresence>
                    {filter === 'Cultural' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-wrap justify-center mb-8 gap-4"
                        >
                            {['All', 'Hobby Club', 'General', 'Promotional'].map((sf) => (
                                <div key={sf} className="relative group/sub">
                                    {/* Outer Border (Sharp White) */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 160 40">
                                        <path
                                            d="M 8 0 L 160 0 L 160 30 L 150 40 L 0 40 L 0 8 Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className={`${subFilter === sf ? 'text-white' : 'text-white/20 group-hover/sub:text-white/40'} transition-all duration-500`}
                                            style={subFilter === sf ? { filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' } : {}}
                                        />
                                    </svg>

                                    <button
                                        onClick={() => setSubFilter(sf as any)}
                                        className={`relative px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all z-0 ${subFilter === sf
                                            ? 'text-black'
                                            : `text-white hover:text-white drop-shadow-[0_0_8px_${filter === 'Cultural' ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.4)'}]`
                                            }`}
                                        style={{
                                            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 8px)',
                                            background: subFilter === sf ? (filter === 'Cultural' ? '#fbbf24' : '#ffffff') : 'rgba(255,255,255,0.02)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        {sf === 'Hobby Club' ? 'Club Events' : sf === 'General' ? 'General Events' : sf === 'Promotional' ? 'Media & Promo' : 'All Events'}

                                        {/* Glow effect for active tab */}
                                        {subFilter === sf && (
                                            <motion.div
                                                layoutId="subGlow"
                                                className={`absolute inset-0 ${filter === "Cultural" ? "bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.8)]" : "bg-white shadow-[0_0_30px_rgba(255,255,255,0.8)]"} blur-xl opacity-60 -z-10`}
                                            />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* High-End Scroll Directive - Hidden during Search or Filtering */}
                {/* Professional HUD Scroll Directive */}
                {searchQuery === '' && (filter === 'All' || filter === 'Cultural') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="flex flex-col items-center gap-4 mb-32 mt-8 relative z-20"
                    >
                        {/* Elegant Transparent Mask for Readability */}
                        <div className="absolute inset-x-[-10vw] inset-y-[-4rem] bg-gradient-to-r from-transparent via-black/30 to-transparent blur-3xl pointer-events-none" />

                        <div className="flex flex-col items-center gap-5 relative z-10 text-center">
                            {/* Technical Header with Brackets */}
                            <div className="flex items-center gap-4">
                                <div className={`h-[1px] w-12 md:w-32 bg-gradient-to-r from-transparent ${filter === 'Cultural' ? 'via-amber-500/80 to-amber-500' : 'via-emerald-500/80 to-emerald-500'}`} />
                                <div className="flex items-center gap-3">
                                    <div className={`w-1 h-1 ${filter === 'Cultural' ? 'bg-amber-400' : 'bg-emerald-400'} rotate-45`} />
                                    <span className={`text-[10px] md:text-[11px] font-black ${filter === 'Cultural' ? 'text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,1)]' : 'text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,1)]'} uppercase tracking-[0.4em] font-mono`}>
                                        EXPLORE_ALL_EVENTS
                                    </span>
                                    <div className={`w-1 h-1 ${filter === 'Cultural' ? 'bg-amber-400' : 'bg-emerald-400'} rotate-45`} />
                                </div>
                                <div className={`h-[1px] w-12 md:w-32 bg-gradient-to-l from-transparent ${filter === 'Cultural' ? 'via-amber-500/80 to-amber-500' : 'via-emerald-500/80 to-emerald-500'}`} />
                            </div>

                            <div className="relative group/scroll flex flex-col items-center gap-3">
                                {/* Minimalist Scroll Icon Unit */}
                                <div className="relative flex flex-col items-center mt-2">
                                    <motion.div
                                        animate={{ y: [0, 8, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className={`relative w-6 h-10 border border-white/20 rounded-full flex justify-center p-1.5 backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.05)]`}
                                    >
                                        <motion.div
                                            animate={{ opacity: [1, 0.4, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className={`w-1 h-2 ${filter === 'Cultural' ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full`}
                                        />
                                    </motion.div>

                                    {/* Side Decorative Brackets */}
                                    <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-6 border-l border-y ${filter === 'Cultural' ? 'border-amber-500/10' : 'border-emerald-500/10'}`} />
                                    <div className={`absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-6 border-r border-y ${filter === 'Cultural' ? 'border-amber-500/10' : 'border-emerald-500/10'}`} />
                                </div>

                                <span className={`text-[8px] font-black ${filter === 'Cultural' ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]'} uppercase tracking-[0.6em] mt-1`}>
                                    SCROLL_TO_BROWSE
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Dynamic Grid Layout: Split Sections for "All" View, Unified for Others */}
                {searchQuery === '' && filter === 'All' ? (
                    <div ref={gridRef} className="flex flex-col gap-24 pb-20">
                        {/* Technical Section */}
                        {groupedMissions.technical.length > 0 && (
                            <div ref={techRef} className="space-y-12">
                                <div className="flex items-center gap-4 px-8 opacity-80">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500" />
                                    <span className="font-mono font-black tracking-[0.3em] uppercase text-xl md:text-2xl text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                        TECHNICAL_EVENTS
                                    </span>
                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 px-4 md:px-8">
                                    {groupedMissions.technical.map((mission, idx) => (
                                        <MissionCard
                                            key={mission.id}
                                            mission={mission}
                                            idx={idx}
                                            theme={getEventTheme(mission.type)}
                                            complexClip={complexClip}
                                            cart={cart}
                                            addToCart={addToCart}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cultural Section - 3 Column Grandeur */}
                        {groupedMissions.cultural.length > 0 && (
                            <div ref={cultRef} className="space-y-16 mt-12">
                                <div className="flex items-center gap-4 px-8 opacity-90">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500" />
                                    <div className="flex flex-col items-center">
                                        <span className="font-mono font-black tracking-[0.3em] uppercase text-xl md:text-3xl text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                                            CULTURAL_EVENTS
                                        </span>
                                        <span className="text-[10px] tracking-[0.5em] text-amber-500/60 uppercase mt-2">Arts // Music // DANCE</span>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-32 px-4 md:px-8">
                                    {groupedMissions.cultural.map((mission, idx) => (
                                        <MissionCard
                                            key={mission.id}
                                            mission={mission}
                                            idx={idx}
                                            theme={getEventTheme(mission.type)}
                                            complexClip={complexClip}
                                            cart={cart}
                                            addToCart={addToCart}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gaming Section */}
                        {groupedMissions.gaming.length > 0 && (
                            <div ref={gameRef} className="space-y-12 mt-12">
                                <div className="flex items-center gap-4 px-8 opacity-80">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500" />
                                    <span className="font-mono font-black tracking-[0.3em] uppercase text-xl md:text-2xl text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                        GAMING_ZONE
                                    </span>
                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 px-4 md:px-8">
                                    {groupedMissions.gaming.map((mission, idx) => (
                                        <MissionCard
                                            key={mission.id}
                                            mission={mission}
                                            idx={idx}
                                            theme={getEventTheme(mission.type)}
                                            complexClip={complexClip}
                                            cart={cart}
                                            addToCart={addToCart}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div ref={gridRef} className={`grid grid-cols-1 md:grid-cols-2 ${filter === 'Cultural' ? 'xl:grid-cols-3 gap-32' : 'xl:grid-cols-4 gap-8 lg:gap-10'} px-4 md:px-8`}>
                        {filtered.map((mission, idx) => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                                idx={idx}
                                theme={getEventTheme(mission.type)}
                                complexClip={complexClip}
                                cart={cart}
                                addToCart={addToCart}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Retired in favor of Dynamic Page Routing */}
        </section>
    )
}