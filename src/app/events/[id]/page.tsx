'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    ChevronLeft,
    ShoppingCart,
    FileText,
    Play,
    Users,
    Lightbulb,
    Calendar,
    MapPin,
    Trophy,
    Info,
    Download,
    Phone,
    Mail,
    Globe
} from 'lucide-react'
import { missions } from '@/data/missions'
import { useApp } from '@/context/AppContext'
import ProEventBackground from '@/components/ui/ProEventBackground'
import { MissionCard } from '@/components/ui/MissionCard'

// Helper to get theme
const getTheme = (type: string) => {
    if (type === 'Cultural') return 'amber'
    if (type === 'Gaming') return 'gaming'
    return 'emerald'
}

// Map logical themes to Tailwind color keys
const getTailwindTheme = (theme: string) => {
    if (theme === 'gaming') return 'red'
    return theme
}

// Geometric Tech Card Component
// Geometric Tech Card Component
const TechStatCard = ({ icon: Icon, label, value, theme }: any) => (
    <div className="relative group min-h-[120px] md:min-h-[170px]">
        {/* Background Glow - Visible on hover */}
        <div
            className={`absolute inset-0 bg-${theme}-500/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
        />

        {/* Border Container */}
        <div
            className={`relative w-full h-full p-[1px] md:p-[2px] bg-gradient-to-b from-${theme}-500 via-${theme}-500/20 to-${theme}-500 overflow-hidden`}
            style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
        >
            {/* Corner Accents */}
            <div className={`absolute top-0 left-0 w-4 h-4 md:w-8 md:h-8 border-t-2 border-l-2 border-${theme}-500`} />
            <div className={`absolute top-0 right-0 w-4 h-4 md:w-8 md:h-8 border-t-2 border-r-2 border-${theme}-500`} />
            <div className={`absolute bottom-0 left-0 w-4 h-4 md:w-8 md:h-8 border-b-2 border-l-2 border-${theme}-500`} />
            <div className={`absolute bottom-0 right-0 w-4 h-4 md:w-8 md:h-8 border-b-2 border-r-2 border-${theme}-500`} />

            {/* Inner Content */}
            <div
                className="relative bg-black/80 backdrop-blur-lg md:backdrop-blur-2xl p-4 md:p-8x h-full flex flex-col items-center justify-center gap-1 md:gap-3 text-center"
                style={{ clipPath: 'polygon(15px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 8px 100%, 0 calc(100% - 8px), 0 15px)' }}
            >
                <div className={`p-2 md:p-3 bg-${theme}-500/20 border-2 border-${theme}-500/40 group-hover:scale-110 transition-transform active:scale-95`} style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)', willChange: 'transform' }}>
                    <Icon size={16} className={`text-${theme}-500`} />
                </div>
                <div>
                    <p className={`text-[7px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-${theme}-500/70 mb-0.5 md:mb-1`}>{label}</p>
                    <p className="text-sm sm:text-lg md:text-2xl font-black italic uppercase tracking-tight text-white leading-snug">
                        {value}</p>
                </div>
            </div>
        </div>
    </div>
)

// Geometric Tech Content Wrapper
const TechContentCard = ({ children, theme }: any) => (
    <div className="relative group h-full">
        {/* Background Glow - Visible on hover */}
        <div
            className={`absolute inset-0 bg-${theme}-500/10 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
        />

        {/* Border Container - Enhanced Geometric */}
        <div
            className={`relative w-full h-full p-[2px] bg-gradient-to-br from-${theme}-500 via-${theme}-500/30 to-${theme}-500 overflow-hidden`}
            style={{ clipPath: 'polygon(30px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 30px), calc(100% - 30px) 100%, 15px 100%, 0 calc(100% - 15px), 0 30px)' }}
        >
            {/* Corner Accents */}
            <div className={`absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-${theme}-500 opacity-50`} />
            <div className={`absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-${theme}-500 opacity-50`} />
            <div className={`absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-${theme}-500 opacity-50`} />
            <div className={`absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-${theme}-500 opacity-50`} />

            {/* Spinning Light Effect (Hover) */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 animate-spin`} style={{ animationDuration: '3s' }} />

            {/* Inner Content */}
            <div
                className="relative bg-black/80 backdrop-blur-lg md:backdrop-blur-2xl p-8 h-full"
                style={{ clipPath: 'polygon(29px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 29px), calc(100% - 29px) 100%, 14px 100%, 0 calc(100% - 14px), 0 29px)' }}
            >
                {children}
            </div>
        </div>
    </div>
)

export default function EventDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { addToCart, cart } = useApp()

    const [mission, setMission] = useState<any | null>(null)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const { scrollYProgress } = useScroll()
    // Transform scroll progress to percentage for the progress bar width
    const scrollBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

    useEffect(() => {
        const found = missions.find(m => m.id === id)
        if (found) {
            setMission(found)
        }
    }, [id])

    const isAdded = false

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [])

    if (!mission) return <div className="h-screen bg-black flex items-center justify-center text-emerald-500 font-mono">LOADING_DATA...</div>

    const handleRegisterClick = (event: any) => {
        // Placeholder for now - redirect to login if not logged in, else open modal
        if (!isAdded) {
            router.push('/login')
        }
    }

    const themeColor = mission ? (
        mission.type === 'Cultural' ? 'amber' :
            (mission.type === 'Gaming' ?
                (mission.title.toLowerCase().includes('valorant') ? 'gaming' : 'amber') :
                'emerald')
    ) : 'emerald'

    const twTheme = getTailwindTheme(themeColor)
    const primaryGlow = themeColor === 'amber' ? 'rgba(245, 158, 11, 0.5)' : (themeColor === 'gaming' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)')

    return (
        <main className="min-h-screen bg-[#020202] text-white relative overflow-x-hidden font-sans" style={{ contain: 'layout paint' }}>


            {/* Scroll Progress Indicator - GPU Optimized */}
            <motion.div
                className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r ${twTheme === 'amber' ? 'from-amber-500 to-amber-300' : (twTheme === 'red' ? 'from-red-500 to-red-300' : 'from-emerald-500 to-emerald-300')} z-[100] origin-left`}
                style={{
                    scaleX: scrollYProgress,
                    boxShadow: `0 0 20px ${themeColor === 'amber' ? 'rgba(245, 158, 11, 0.8)' : (themeColor === 'gaming' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)')}`
                }}
            />

            {/* Header / Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="pointer-events-auto flex items-center gap-2 text-white/60 hover:text-white transition-colors group px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">BACK_TO_EVENTS</span>
                </motion.button>
            </nav>

            <div className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left Column: Visual and Quick Actions */}
                    <div className="w-full lg:col-span-5 space-y-6 lg:space-y-8 relative lg:sticky lg:top-32">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="relative aspect-video sm:aspect-[4/3] md:aspect-[4/5] group w-full"
                        >
                            {/* Geometric Border & Glow */}
                            <div className={`absolute inset-0 bg-${twTheme}-500/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                            {/* ... (rest of the image container remains similar but ensure w-full) ... */}
                            {/* Re-use existing inner content logic but ensure wrapper is responsive */}
                            <div
                                className={`relative w-full h-full p-[2px] bg-gradient-to-br from-${twTheme}-500 via-${twTheme}-500/30 to-${twTheme}-500 overflow-hidden`}
                                style={{ clipPath: 'polygon(30px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 30px), calc(100% - 30px) 100%, 15px 100%, 0 calc(100% - 15px), 0 30px)' }}
                            >
                                {/* Corner Accents */}
                                <div className={`absolute top-0 left-0 w-8 h-8 md:w-12 md:h-12 border-t-2 border-l-2 border-${twTheme}-500`} />
                                <div className={`absolute top-0 right-0 w-8 h-8 md:w-12 md:h-12 border-t-2 border-r-2 border-${twTheme}-500`} />
                                <div className={`absolute bottom-0 left-0 w-8 h-8 md:w-12 md:h-12 border-b-2 border-l-2 border-${twTheme}-500`} />
                                <div className={`absolute bottom-0 right-0 w-8 h-8 md:w-12 md:h-12 border-b-2 border-r-2 border-${twTheme}-500`} />

                                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 animate-spin`} style={{ animationDuration: '3s' }} />

                                {/* Image Container */}
                                <div className="relative w-full h-full bg-black/40" style={{ clipPath: 'polygon(29px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 29px), calc(100% - 29px) 100%, 14px 100%, 0 calc(100% - 14px), 0 29px)' }}>
                                    <img
                                        src={mission.visual}
                                        alt={mission.title}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                                        <motion.h1
                                            className={`text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-3 md:mb-4 ${twTheme === 'amber' ? 'text-amber-500' : (twTheme === 'red' ? 'text-red-500' : 'text-emerald-500')}`}
                                            style={{ textShadow: `0 0 30px ${primaryGlow}` }}
                                        >


                                            {mission.title.replace('_', ' ')}
                                        </motion.h1>

                                        <div className="flex flex-wrap gap-3 md:gap-4 items-center">
                                            <span className="px-2 md:px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-white/20">
                                                ID: {mission.id}
                                            </span>
                                            <span className={`px-2 md:px-3 py-1 bg-${twTheme}-500/10 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-${twTheme}-500/30 text-${twTheme}-400`}>
                                                {mission.type}
                                            </span>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>


                        <motion.div
                            className="grid grid-cols-2 gap-3 md:gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRegisterClick(mission)}
                                className={`col-span-2 py-4 md:py-5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-black uppercase tracking-widest border text-sm md:text-base ${isAdded
                                    ? `bg-${twTheme}-600 border-${twTheme}-500 text-white`
                                    : `bg-${twTheme}-500 border-${twTheme}-400 text-black hover:bg-${twTheme}-400`
                                    }`}
                            >
                                <ShoppingCart size={18} />
                                {isAdded ? 'REGISTERED' : 'REGISTER NOW'}
                            </motion.button>
                            {/* ... buttons ... */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="py-3 md:py-4 bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
                            >
                                <Download size={14} />
                                BROCHURE
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="py-3 md:py-4 bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
                            >
                                <Globe size={14} />
                                TEASER
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Right Column: Detailed Info - Ensure responsive spacing */}
                    <div className="w-full lg:col-span-7 space-y-8 md:space-y-12">
                        {/* ... keep existing logic but check for padding/margins ... */}
                        {mission.videoUrl && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-3 md:space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Play size={18} className={`text-${twTheme}-500`} />
                                    <h2 className="text-xs md:text-sm font-black uppercase tracking-widest">EVENT GLIMPSE</h2>
                                </div>
                                {/* ... video container ... */}
                                <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40 group">
                                    {!isVideoPlaying ? (
                                        <div
                                            className="w-full h-full cursor-pointer relative"
                                            onClick={() => setIsVideoPlaying(true)}
                                        >
                                            <img src={mission.visual} className="w-full h-full object-cover opacity-40 blur-sm scale-105" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-${twTheme}-500 flex items-center justify-center bg-${twTheme}-500/10 group-hover:scale-110 transition-transform`}>
                                                    <Play fill="currentColor" size={24} className={`text-${twTheme}-500 translate-x-1 md:w-8 md:h-8`} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/50 font-mono text-sm">
                                            [VIDEO_STREAM_PLACEHOLDER]
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        )}

                        <motion.section
                            initial={{ opacity: 0, x: themeColor === 'emerald' ? -50 : 0, y: themeColor === 'emerald' ? 0 : 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-3 md:space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <Info size={18} className={`text-${twTheme}-500`} />
                                <h2 className="text-xs md:text-sm font-black uppercase tracking-widest">MISSION BRIEF</h2>
                            </div>
                            <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium leading-relaxed font-mono">
                                {mission.description}
                            </p>
                        </motion.section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* ... Rules ... */}
                            <motion.div
                                initial={{ opacity: 0, x: themeColor === 'emerald' ? -50 : 0, y: themeColor === 'emerald' ? 0 : 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4 }}
                            >
                                <TechContentCard theme={twTheme}>
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className={`text-${twTheme}-500`} />
                                            <h2 className="text-xs md:text-sm font-black uppercase tracking-widest">RULES</h2>
                                        </div>
                                        <ul className="space-y-3 md:space-y-4">
                                            {mission.rules?.map((rule: string, idx: number) => (
                                                <li key={idx} className="flex gap-3 text-xs md:text-sm text-white/60 font-mono items-start">
                                                    <span className={`text-${twTheme}-500 mt-0.5 md:mt-1`}>▶</span>
                                                    {rule}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </TechContentCard>
                            </motion.div>

                            {mission.evaluation && mission.evaluation.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: themeColor === 'emerald' ? 50 : 0, y: themeColor === 'emerald' ? 0 : 20 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <TechContentCard theme={twTheme}>
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Trophy size={18} className="text-amber-500" />
                                                <h2 className="text-xs md:text-sm font-black uppercase tracking-widest">
                                                    EVALUATION
                                                </h2>
                                            </div>

                                            <ul className="space-y-3 md:space-y-4">
                                                {mission.evaluation.map((item: string, idx: number) => (
                                                    <li
                                                        key={idx}
                                                        className="flex gap-3 text-xs md:text-sm text-white/60 font-mono items-start"
                                                    >
                                                        <span className="text-amber-500 mt-0.5 md:mt-1 font-bold">
                                                            {idx + 1}.
                                                        </span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </TechContentCard>
                                </motion.div>
                            )}
                            {mission.themeIdeas && mission.themeIdeas.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: themeColor === 'emerald' ? -50 : 0, y: themeColor === 'emerald' ? 0 : 20 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <TechContentCard theme={twTheme}>
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Lightbulb size={18} className={`text-${twTheme}-500`} />
                                                <h2 className="text-xs md:text-sm font-black uppercase tracking-widest">
                                                    THEME IDEAS
                                                </h2>
                                            </div>

                                            <ul className="space-y-3 md:space-y-4">
                                                {mission.themeIdeas.map((theme: string, idx: number) => (
                                                    <li
                                                        key={idx}
                                                        className="flex gap-3 text-xs md:text-sm text-white/60 font-mono items-start"
                                                    >
                                                        <span className={`text-${twTheme}-500 mt-0.5 md:mt-1 font-bold`}>
                                                            {idx + 1}.
                                                        </span>
                                                        {theme}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </TechContentCard>
                                </motion.div>
                            )}



                        </div>

                        {mission?.rounds && (
                            <motion.div
                                initial={{ opacity: 0, x: themeColor === 'emerald' ? 50 : 0, y: themeColor === 'emerald' ? 0 : 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.4 }}
                            >
                                <TechContentCard theme={twTheme}>
                                    <div className="space-y-4 md:space-y-6">
                                        <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">
                                            ROUNDS
                                        </h2>

                                        <div className="space-y-5">
                                            {Object.entries(mission.rounds).map(([roundKey, value]) => {
                                                if (!Array.isArray(value)) return null

                                                const points = value as string[]

                                                return (
                                                    <div key={roundKey} className="space-y-3">
                                                        <h3 className="text-sm md:text-base font-bold uppercase">
                                                            {roundKey.replace('round', 'Round ')}
                                                        </h3>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                            {points.map((text, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex gap-3 items-center p-3 bg-white/5 rounded-lg border border-white/5"
                                                                >
                                                                    <div className={`w-1.5 h-1.5 rounded-full bg-${twTheme}-500`} />
                                                                    <span className="text-[10px] md:text-xs font-mono text-white/70">
                                                                        {text}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </TechContentCard>
                            </motion.div>
                        )}
                        {mission.coordinators?.map((name: string, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: themeColor === 'emerald' ? (idx === 0 ? -30 : 30) : 0 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <TechContentCard theme={twTheme}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base md:text-lg font-black uppercase tracking-tighter">
                                                {name}
                                            </h3>
                                            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                                {idx === 0 ? 'Faculty Coordinator' : 'Student Coordinator'}
                                            </p>
                                        </div>

                                        <div className="flex gap-4">
                                            <a
                                                href={`tel:${mission.coordinatorsContact?.[idx] || '#'}`}
                                                className="text-white/40 hover:text-emerald-500 transition-colors"
                                            >
                                                <Phone size={16} />
                                            </a>
                                            <a href="#" className="text-white/40 hover:text-emerald-500 transition-colors">
                                                <Mail size={16} />
                                            </a>
                                        </div>
                                    </div>
                                </TechContentCard>
                            </motion.div>
                        ))}


                    </div>
                </div>

                {/* Logistics Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-12 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
                >
                    <TechStatCard
                        icon={Calendar}
                        label="EVENT DATE"
                        value={mission.date}
                        theme={twTheme}
                    />
                    <TechStatCard
                        icon={MapPin}
                        label="LOCATION"
                        value={mission.location}
                        theme={twTheme}
                    />

                    <TechStatCard
                        icon={Trophy}
                        label="PRIZE POOL"
                        value={mission.prizePool}
                        theme={twTheme}
                    />
                    <TechStatCard
                        icon={Users}
                        label="TEAM FORMAT"
                        value={mission.teamFormate}
                        theme={twTheme}
                    />
                </motion.div>
            </div>

            {/* Custom Bottom Border / Footer Glimpse */}
            <div className={`fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${twTheme}-500/50 to-transparent opacity-50`} />
        </main>
    )
}
