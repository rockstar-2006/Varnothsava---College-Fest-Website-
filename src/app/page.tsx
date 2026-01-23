'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import {
    Sparkles, ArrowRight,
    Plus, Coffee, Gamepad2,
    Rocket, Palette, Globe,
    ShieldCheck, Zap, Users,
    Trophy, MapPin, Clock,
    ChevronDown, ExternalLink,
    Play, Calendar, Command
} from 'lucide-react'
import Lenis from 'lenis'
import dynamic from 'next/dynamic'

// Dynamically import 3D model
const AncientForestModel = dynamic(() => import('@/components/sections/Fest3DModel'), { ssr: false })

// --- Premium UI Components ---

const SectionBadge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[11px] font-bold tracking-[0.2em] uppercase ${className}`}
    >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
        {children}
    </motion.div>
)

const SplitPrimaryButton = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="relative group px-10 py-5 bg-emerald-500 text-black font-extrabold text-[15px] rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all flex items-center gap-3 overflow-hidden"
    >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <span className="relative z-10 flex items-center gap-3 uppercase tracking-tight font-black">
            {children} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </span>
    </motion.button>
)

const SplitSecondaryButton = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
        whileTap={{ scale: 0.98 }}
        className="px-10 py-5 border border-white/10 text-white font-extrabold text-[15px] rounded-2xl transition-all flex items-center gap-3 backdrop-blur-xl uppercase tracking-tight font-black"
    >
        {children}
    </motion.button>
)

// --- Page Component ---

export default function LandingPage() {
    const router = useRouter()
    const { isLoggedIn } = useApp()
    const containerRef = useRef<HTMLDivElement>(null)
    const [activeDay, setActiveDay] = useState(0)

    useEffect(() => {
        const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
        return () => lenis.destroy()
    }, [])

    const schedule = [
        { day: 'Day 01', date: 'March 11', title: 'The Convergence', theme: 'Cultural Foundations', events: ['Vocal Solo', 'Street Play', 'Sacred Rituals', 'Workshop: AI in Art'], img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800' },
        { day: 'Day 02', title: 'The Forge', date: 'March 12', theme: 'Technological Zenith', events: ['Hack-a-thon', 'Robot Wars', 'Shark Tank', 'UI/UX Battle'], img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
        { day: 'Day 03', title: 'State of Art', date: 'March 13', theme: 'Artistic Ethereal', events: ['Battle of Bands', 'Fashion Show', 'Short Film', 'Art Gallery'], img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800' },
        { day: 'Day 04', title: 'Final Zenith', date: 'March 14', theme: 'The Grand Legacy', events: ['Valedictory', 'Mega Concert', 'Fusion Dance', 'Awards'], img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' }
    ]

    return (
        <div ref={containerRef} className="relative bg-[#050505] text-[#f5f5f5] font-sans antialiased selection:bg-emerald-500/30 overflow-x-hidden">

            {/* CONTINUOUS AMBIENT LAYER (LIVELY) */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="ambient-glow top-[-10%] left-[20%] w-[800px] h-[800px] bg-emerald-500/[0.08]" />
                <div className="ambient-glow bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/[0.06] [animation-delay:-5s]" />
                <div className="ambient-glow top-[40%] left-[60%] w-[400px] h-[400px] bg-emerald-500/[0.04] [animation-delay:-10s]" />
            </div>

            {/* NOISE OVERLAY FOR PREMIUM TEXTURE */}
            <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* 1. HERO SECTION - ULTRA WIDE SPLIT */}
            <section className="relative min-h-screen flex items-center justify-center px-6 md:px-16 pt-32 overflow-hidden">
                <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* LEFT SIDE: TITLES (META STYLE) */}
                    <div className="relative z-10 space-y-12">
                        <SectionBadge>SMVITM Campus • March 11-14</SectionBadge>

                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="text-4xl sm:text-6xl lg:text-7xl font-[1000] tracking-[-0.04em] leading-tight text-white uppercase"
                            >
                                VARNOTHSAVA <span className="text-emerald-500">2K26</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-base sm:text-lg lg:text-xl text-[#888] font-bold max-w-xl leading-relaxed uppercase tracking-tight"
                            >
                                Ancestral <span className="text-white">heritage</span> meets future-ready <span className="text-white">innovation</span>. A legacy being written today.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center gap-6"
                        >
                            <SplitPrimaryButton onClick={() => router.push('/events')}>
                                Explore Quests
                            </SplitPrimaryButton>
                            <SplitSecondaryButton onClick={() => router.push(isLoggedIn ? '/profile' : '/login')}>
                                Portal Access
                            </SplitSecondaryButton>
                        </motion.div>

                        {/* Metric Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-16 pt-16 border-t border-white/5">
                            {[
                                { label: 'TRIBE', value: '10K+' },
                                { label: 'TREASURE', value: '₹5L+' },
                                { label: 'QUESTS', value: '50+' },
                                { label: 'LIFETIME', value: '04D' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="space-y-2"
                                >
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-[900] text-white tracking-tighter">{stat.value}</div>
                                    <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE: CONTINUOUS 3D MODEL */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative h-[400px] sm:h-[600px] lg:h-[1000px] w-full select-none cursor-grab active:cursor-grabbing order-first lg:order-none"
                    >
                        <AncientForestModel />

                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-10 right-10 flex items-center gap-4 px-8 py-4 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-2xl"
                        >
                            <Command className="w-5 h-5 text-emerald-500" />
                            <span className="text-[12px] font-black uppercase tracking-widest text-emerald-400">Interact with Relic</span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Vertical Scroll Ref */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-20">
                    <motion.div
                        animate={{ height: [40, 80, 40] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-[1px] bg-emerald-500"
                    />
                    <span className="text-[10px] uppercase font-black tracking-[0.6em] rotate-180 [writing-mode:vertical-lr]">Discover Morphs</span>
                </div>
            </section>

            {/* 2. THE CHRONICLES - CONTINUOUS ANIMATED FLEX */}
            <section className="py-48 px-6 bg-transparent relative overflow-hidden">
                <div className="max-w-[1800px] mx-auto space-y-32">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-16">
                        <div className="space-y-6">
                            <SectionBadge>Temporal Path</SectionBadge>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[1000] text-white tracking-tighter leading-none">
                                THE <span className="text-emerald-500">CYCLE</span>
                            </h2>
                        </div>
                        <p className="max-w-md text-[#777] font-bold text-xl leading-relaxed uppercase tracking-tighter">
                            A non-linear journey through technology and art, carefully mapped across four cycles of existence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Day Selector Area */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {schedule.map((day, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setActiveDay(i)}
                                    whileHover={{ x: 10 }}
                                    className={`relative p-8 md:p-10 text-left rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-700 flex flex-col justify-between group overflow-hidden ${activeDay === i ? 'bg-emerald-500 border-emerald-500 scale-[1.02] md:scale-[1.05] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]' : 'bg-[#0a0a0a] border-white/5 hover:border-emerald-500/40'}`}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <span className={`text-[12px] font-black uppercase tracking-[0.4em] ${activeDay === i ? 'text-black' : 'text-emerald-500'}`}>{day.day}</span>
                                        <Zap className={`w-6 h-6 ${activeDay === i ? 'text-black' : 'text-[#222]'}`} />
                                    </div>
                                    <div className="relative z-10 space-y-2 pt-8 md:pt-12">
                                        <h3 className={`text-2xl md:text-4xl font-[950] uppercase tracking-tighter leading-none ${activeDay === i ? 'text-black' : 'text-white'}`}>{day.title}</h3>
                                        <p className={`text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] ${activeDay === i ? 'text-black/50' : 'text-[#444]'}`}>{day.date}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Detail Display Area */}
                        <motion.div
                            layout
                            className="lg:col-span-8 relative rounded-[3.5rem] overflow-hidden bg-[#0a0a0a] border border-white/5 p-16 md:p-24 flex flex-col justify-between"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeDay}
                                    initial={{ opacity: 0, scale: 1.2 }}
                                    animate={{ opacity: 0.15, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 1.5 }}
                                    className="absolute inset-0 pointer-events-none"
                                >
                                    <img src={schedule[activeDay].img} className="w-full h-full object-cover" alt="" />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeDay}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                    className="relative z-10 flex flex-col justify-between h-full space-y-24"
                                >
                                    <div className="space-y-4 md:space-y-6">
                                        <h4 className="text-emerald-500 font-black text-[10px] md:text-sm uppercase tracking-[0.8em]">{schedule[activeDay].theme}</h4>
                                        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-[1000] text-white tracking-tight uppercase leading-none">{schedule[activeDay].title}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 md:gap-x-20 gap-y-6 md:gap-y-12">
                                        {schedule[activeDay].events.map((event, j) => (
                                            <motion.div
                                                key={j}
                                                whileHover={{ x: 10, color: '#10b981' }}
                                                className="group/item flex items-center justify-between border-b border-white/5 pb-4 md:pb-6 cursor-default"
                                            >
                                                <div className="flex items-center gap-4 md:gap-6">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500/30 group-hover/item:bg-emerald-500 group-hover/item:scale-150 transition-all duration-500" />
                                                    <span className="text-lg md:text-2xl font-[900] text-[#eee] uppercase tracking-tighter">{event}</span>
                                                </div>
                                                <Command className="w-5 h-5 text-[#222] group-hover/item:text-emerald-500 group-hover/item:rotate-12 transition-all" />
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                                        <SplitPrimaryButton onClick={() => router.push('/events')}>Register For Quest</SplitPrimaryButton>
                                        <p className="text-[#555] font-black text-[10px] md:text-[12px] uppercase tracking-[0.3em] max-w-[200px] text-center sm:text-left">Node synchronization active</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. BEYOND LIMITS (EXPERIENCES) - LIVELY CARDS */}
            <section className="py-48 px-6">
                <div className="max-w-[1800px] mx-auto space-y-24">
                    <div className="text-center space-y-8">
                        <SectionBadge>Sensory Overload</SectionBadge>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[1000] text-white uppercase tracking-tighter leading-none">REALM <span className="text-emerald-500">SHIFT.</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { title: "Arena 2K", icon: Gamepad2, img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800", span: "md:col-span-2", h: "h-[700px]", delay: 0 },
                            { title: "The Hub", icon: Coffee, img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800", span: "md:col-span-1", h: "h-[700px]", delay: 0.1 },
                            { title: "Inno Forge", icon: Rocket, img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800", span: "md:col-span-1", h: "h-[600px]", delay: 0.2 },
                            { title: "Zenith Stage", icon: Globe, img: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=800", span: "md:col-span-2", h: "h-[600px]", delay: 0.3 }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: item.delay }}
                                className={`group relative rounded-[3.5rem] overflow-hidden border border-white/5 ${item.span} ${item.h}`}
                            >
                                <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110" alt={item.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                                <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 flex flex-col items-start gap-4 md:gap-6">
                                    <motion.div
                                        animate={{ rotate: [0, 10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.5rem] bg-emerald-500/20 backdrop-blur-3xl flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/20"
                                    >
                                        <item.icon className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                                    </motion.div>
                                    <h3 className="text-4xl md:text-6xl font-[1000] text-white tracking-[-0.05em] uppercase">{item.title}</h3>
                                    <div className="h-[3px] w-0 group-hover:w-full bg-emerald-500 transition-all duration-1000 ease-in-out" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FINAL CTA - KINETIC IMPACT */}
            <section className="py-72 px-6 relative overflow-hidden bg-transparent">
                <div className="relative z-10 max-w-[1800px] mx-auto flex flex-col items-center text-center space-y-20">
                    <motion.h2
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="text-4xl sm:text-6xl lg:text-8xl font-[1000] tracking-tighter leading-tight text-white uppercase"
                    >
                        BE THE <br /><span className="text-emerald-500 drop-shadow-[0_0_80px_rgba(16,185,129,0.3)]">STATIC.</span>
                    </motion.h2>
                    <p className="text-lg sm:text-2xl text-[#666] font-[900] max-w-3xl mx-auto uppercase tracking-tight leading-relaxed">
                        Disconnect from the ordinary. Sync into the Varnothsava network.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-12 pt-12">
                        <SplitPrimaryButton onClick={() => router.push('/login')}>Initiate Link</SplitPrimaryButton>
                        <SplitSecondaryButton onClick={() => router.push('/events')}>Read Prophecy</SplitSecondaryButton>
                    </div>
                </div>
            </section>

            {/* PROFESSIONAL FOOTER */}
            <footer className="py-20 md:py-32 px-6 md:px-16 border-t border-white/5 bg-[#050505] relative z-20">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start gap-24">
                    <div className="space-y-8">
                        <div className="text-5xl font-[1000] tracking-[-0.08em] uppercase">
                            VARNOTH<span className="text-emerald-500">SAVA.</span>
                        </div>
                        <p className="text-[13px] text-[#444] font-black uppercase tracking-[0.6em] leading-loose max-w-sm">
                            SMVITM CAMPUS • 2006<br />
                            THE CORE HAS BEEN RESTORED
                        </p>
                    </div>

                    <div className="flex flex-col gap-12">
                        <div className="text-[12px] font-black text-emerald-500/40 uppercase tracking-[0.4em]">Strategic Nodes</div>
                        <div className="flex gap-16 opacity-30 group">
                            <img src="/nmamit-logo.png" className="h-16 w-auto invert grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="SMVITM" />
                            <img src="/nitte-logo.png" className="h-16 w-auto invert grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="Nitte" />
                        </div>
                    </div>

                    <div className="text-[14px] text-[#222] font-black uppercase tracking-[0.2em] max-w-[300px] leading-relaxed">
                        Engineered for pioneers. <br />
                        Developed by the Hive Mind.
                    </div>
                </div>
            </footer >
        </div >
    )
}
