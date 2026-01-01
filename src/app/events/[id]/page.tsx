'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    ShoppingCart,
    FileText,
    Play,
    Users,
    Calendar,
    MapPin,
    Trophy,
    Info,
    Download,
    Phone,
    Mail,
    Globe,
    Shield,
    ArrowRight
} from 'lucide-react'
import { missions } from '@/data/missions'
import { useApp } from '@/context/AppContext'
import { CosmicBackground } from '@/components/ui/CosmicBackground'
import MissionCard, { Mission } from '@/components/ui/MissionCard'

export default function EventDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { addToCart, cart } = useApp()
    const [mission, setMission] = useState<Mission | null>(null)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)

    useEffect(() => {
        const found = missions.find(m => m.id === id)
        if (found) {
            setMission(found)
        } else {
            router.push('/events')
        }
    }, [id, router])

    if (!mission) return <div className="h-screen bg-black flex items-center justify-center text-emerald-500 font-mono">LOADING_DATA...</div>

    const isAdded = cart.find((c: any) => c.id === mission.id)
    const themeColor = mission.type === 'Cultural' ? 'amber' : 'emerald'
    const primaryGlow = mission.type === 'Cultural' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.5)'

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-white/20">
            <CosmicBackground variant={mission.type === 'Cultural' ? 'amber' : 'emerald'} />

            {/* HUD Sector Scan Activation Animation */}
            <motion.div
                initial={{ top: "-100%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                className={`fixed inset-x-0 h-[30vh] bg-gradient-to-b from-transparent via-${themeColor}-500/10 to-transparent z-[100] pointer-events-none blur-3xl`}
            />
            <motion.div
                initial={{ top: "-100%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.4 }}
                className={`fixed inset-x-0 h-[1px] bg-${themeColor}-400/50 z-[100] pointer-events-none shadow-[0_0_20px_${primaryGlow}]`}
            />

            {/* Global Ambient Sector Glow */}
            <div className={`absolute inset-0 bg-gradient-to-b from-${themeColor}-500/5 via-transparent to-transparent pointer-events-none z-[1]`} />

            {/* Professional HUD Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 md:px-12 pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="pointer-events-auto flex items-center gap-3 text-white/50 hover:text-white transition-all group px-5 py-2.5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full hover:border-white/30"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">SEC_EXIT // BACK</span>
                </motion.button>
            </nav>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 pt-20 pb-16 md:pt-24 md:pb-20 px-6 md:px-12 max-w-[1400px] mx-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Left Column: Visual and Primary Action */}
                    <div className="lg:col-span-5 space-y-6 md:space-y-8 lg:sticky lg:top-32">
                        {/* Tactical Back Link */}
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => router.back()}
                            className="group flex items-center gap-3 text-white/40 hover:text-${themeColor}-400 transition-all font-mono"
                        >
                            <div className="w-8 h-[1px] bg-white/20 group-hover:w-12 group-hover:bg-${themeColor}-500/50 transition-all" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">[[ TACTICAL_RETREAT // RETURN_TO_BASE ]]</span>
                        </motion.button>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative aspect-video md:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-${themeColor}-500/30 group bg-zinc-900 shadow-[0_0_50px_${primaryGlow.replace('0.5', '0.2')}]`}
                        >
                            <img
                                src={mission.visual}
                                alt={mission.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-100"
                            />
                            {/* Targeted Intelligence Overlay - Minimal obstruction of the visual */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-[2]" />

                            {/* Inner Frame HUD Detail */}
                            <div className={`absolute inset-0 border border-${themeColor}-500/20 rounded-3xl z-[3] pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]`} />

                            {/* Title & Stats Overlay at Bottom */}
                            <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 pb-12 space-y-6 z-[4]">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1 h-3 bg-${themeColor}-500 animate-pulse`} />
                                            <p className="text-[9px] font-black font-mono text-white/40 tracking-[0.4em] uppercase">SYSTEM_INITIALIZATION_SEQUENCE</p>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex flex-wrap gap-2"
                                        >
                                            <span className={`px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-sm text-[8px] font-black uppercase tracking-[0.2em] border border-${themeColor}-500/30 text-${themeColor}-400 font-mono`}>
                                                STATUS: [[ DECRYPTED ]]
                                            </span>
                                            <span className={`px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-sm text-[8px] font-black uppercase tracking-[0.2em] border border-${themeColor}-500/30 text-${themeColor}-400 font-mono`}>
                                                PRIORITY: [[ LEVEL_OMEGA ]]
                                            </span>
                                            <span className={`px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-sm text-[8px] font-black uppercase tracking-[0.2em] border border-${themeColor}-500/30 text-${themeColor}-400 font-mono`}>
                                                ID: {mission.id}
                                            </span>
                                        </motion.div>
                                    </div>
                                    <div className="relative group/title">
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.8, ease: "circOut" }}
                                            className={`absolute -left-4 top-0 bottom-0 w-1 bg-${themeColor}-500 shadow-[0_0_15px_${primaryGlow}]`}
                                        />
                                        <motion.h1
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className={`text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight leading-[0.85] ${mission.type === 'Cultural' ? 'text-amber-500' : 'text-emerald-500'}`}
                                            style={{ textShadow: `0 0 50px ${primaryGlow}` }}
                                        >
                                            {mission.title.replace('_', ' ')}
                                        </motion.h1>
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em] font-mono">UPLINK_ESTABLISHED_0x29A</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Corner Decorative Element */}
                            <div className={`absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-${themeColor}-500/40 m-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => addToCart({
                                    id: mission.id,
                                    title: mission.title,
                                    type: mission.type,
                                    price: mission.fee,
                                    image: mission.visual
                                })}
                                className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 transition-all duration-500 font-extrabold uppercase tracking-[0.5em] border-2 text-sm relative overflow-hidden group/auth ${isAdded
                                    ? `bg-${themeColor}-600/20 border-${themeColor}-500 text-${themeColor}-400 shadow-[0_0_60px_rgba(16,185,129,0.15)]`
                                    : `bg-${themeColor}-500 border-${themeColor}-400 text-black hover:shadow-[0_0_50px_${primaryGlow}]`
                                    }`}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover/auth:opacity-10 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)`, backgroundSize: '100% 4px' }} />
                                <div className="flex items-center gap-3 relative z-10">
                                    <Shield size={20} className={isAdded ? `text-${themeColor}-400` : `text-black`} />
                                    <span>{isAdded ? 'MISSION_AUTHORIZED' : 'ADD_TO_CART @ ₹' + mission.fee}</span>
                                </div>
                                <div className="absolute right-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={18} />
                                </div>
                            </motion.button>

                            <div className="grid grid-cols-2 gap-4">
                                <button className={`py-5 relative group/btn bg-white/[0.03] border border-${themeColor}-500/20 hover:border-${themeColor}-500/50 transition-all rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/70 overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-${themeColor}-500/0 group-hover/btn:bg-${themeColor}-500/5 transition-colors`} />
                                    <Download size={16} className={`text-${themeColor}-500/50 group-hover/btn:text-${themeColor}-400`} />
                                    <span className="relative z-10 group-hover/btn:text-white transition-colors">BROCHURE</span>
                                    {/* Geometric Corner Accents */}
                                    <div className={`absolute top-2 left-2 w-1 h-1 border-t border-l border-${themeColor}-500/40 opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                                    <div className={`absolute bottom-2 right-2 w-1 h-1 border-b border-r border-${themeColor}-500/40 opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                                </button>
                                <button className={`py-5 relative group/btn bg-white/[0.03] border border-${themeColor}-500/20 hover:border-${themeColor}-500/50 transition-all rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/70 overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-${themeColor}-500/0 group-hover/btn:bg-${themeColor}-500/5 transition-colors`} />
                                    <Globe size={16} className={`text-${themeColor}-500/50 group-hover/btn:text-${themeColor}-400`} />
                                    <span className="relative z-10 group-hover/btn:text-white transition-colors">SYNC_DATA</span>
                                    {/* Geometric Corner Accents */}
                                    <div className={`absolute top-2 left-2 w-1 h-1 border-t border-l border-${themeColor}-500/40 opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                                    <div className={`absolute bottom-2 right-2 w-1 h-1 border-b border-r border-${themeColor}-500/40 opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info Sections */}
                    <div className="lg:col-span-7 space-y-6 md:space-y-10">

                        {/* Video Section with Professional Wrapper */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-3 md:space-y-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${mission.type === 'Cultural' ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} />
                                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/40">SEC_VISUAL // EVENT_GLIMPSE</h2>
                            </div>
                            <div className={`relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-zinc-900 group shadow-2xl`}>
                                {!isVideoPlaying ? (
                                    <div
                                        className="w-full h-full cursor-pointer relative"
                                        onClick={() => setIsVideoPlaying(true)}
                                    >
                                        <img src={mission.visual} className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                                            <div className={`w-24 h-24 rounded-full border-2 ${mission.type === 'Cultural' ? 'border-amber-500/50 group-hover:border-amber-500' : 'border-emerald-500/50 group-hover:border-emerald-500'} flex items-center justify-center bg-black/50 backdrop-blur-xl group-hover:scale-110 transition-all duration-500 shadow-2xl`}>
                                                <Play fill={mission.type === 'Cultural' ? '#f59e0b' : '#10b981'} size={32} className="translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full">
                                        {mission.videoUrl?.includes('youtube.com') || mission.videoUrl?.includes('youtu.be') ? (
                                            <iframe
                                                src={mission.videoUrl.replace('watch?v=', 'embed/')}
                                                className="w-full h-full"
                                                allow="autoplay; fullscreen"
                                            />
                                        ) : (
                                            <video
                                                src={mission.videoUrl}
                                                autoPlay
                                                controls
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Mission Brief with Enhanced Typography */}
                        <motion.section
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="space-y-3 md:space-y-5 relative"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${mission.type === 'Cultural' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/40">SEC_INTEL // MISSION_BRIEF</h2>
                            </div>
                            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 relative overflow-hidden group hover:border-${themeColor}-500/30 transition-all backdrop-blur-xl">
                                <p className="text-lg md:text-xl font-medium text-white leading-relaxed tracking-tight">
                                    "{mission.description}"
                                </p>
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${themeColor}-500/10 blur-3xl rounded-full translate-x-16 -translate-y-16`} />
                            </div>
                        </motion.section>

                        {/* Rules & Requirements Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.section
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                                className={`group relative bg-black/95 backdrop-blur-3xl border border-${themeColor}-500/20 p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_50px_${primaryGlow.replace('0.5', '0.05')}] hover:shadow-[0_0_80px_${primaryGlow.replace('0.5', '0.15')}]`}
                            >
                                {/* Geometric Parallax Engine */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-${themeColor}-500/10 to-transparent blur-3xl opacity-30`} />
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className={`absolute border border-${themeColor}-500/10 rounded-full`}
                                            animate={{
                                                scale: [1, 1.15, i === 1 ? 1.1 : 1],
                                                rotate: [i * 45, i * 45 + 180, i * 45],
                                                opacity: [0.05, 0.15, 0.05]
                                            }}
                                            transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'easeInOut' }}
                                            style={{
                                                width: 150 + i * 150,
                                                height: 150 + i * 150,
                                                left: `${-30 + i * 20}%`,
                                                top: `${-20 + i * 10}%`,
                                            }}
                                        />
                                    ))}
                                    {/* HUD Background Grid Integration */}
                                    <div className={`absolute inset-0 opacity-[0.02]`} style={{ backgroundImage: `linear-gradient(${themeColor === 'amber' ? '#f59e0b 1px' : '#10b981 1px'}, transparent 1px), linear-gradient(90deg, ${themeColor === 'amber' ? '#f59e0b 1px' : '#10b981 1px'}, transparent 1px)`, backgroundSize: '40px 40px' }} />
                                </div>

                                {/* Technical Precision Frame Architecture */}
                                <div className={`absolute inset-2 border border-white/5 rounded-[2rem] pointer-events-none z-10`} />
                                <div className={`absolute inset-0 border-2 border-${themeColor}-500/30 rounded-[2.5rem] pointer-events-none z-10 group-hover:border-${themeColor}-500/50 transition-colors duration-500`} />

                                {/* High-Resolution Corner Brackets */}
                                <div className={`absolute -top-1 -left-1 w-16 h-16 border-t-4 border-l-4 border-${themeColor}-500 rounded-tl-[2.2rem] z-20 pointer-events-none shadow-[0_0_20px_${primaryGlow}] group-hover:shadow-[0_0_40px_${primaryGlow}] group-hover:w-24 group-hover:h-24 transition-all duration-700`} />
                                <div className={`absolute -bottom-1 -right-1 w-16 h-16 border-b-4 border-r-4 border-${themeColor}-500 rounded-br-[2.2rem] z-20 pointer-events-none shadow-[0_0_20px_${primaryGlow}] group-hover:shadow-[0_0_40px_${primaryGlow}] group-hover:w-24 group-hover:h-24 transition-all duration-700`} />



                                <div className="relative z-30 space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`relative w-1.2 h-8 md:h-12 overflow-hidden rounded-full bg-${themeColor}-950 border border-${themeColor}-500/30`}>
                                            <motion.div
                                                className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-${themeColor}-400 to-transparent shadow-[0_0_15px_${primaryGlow}]`}
                                                animate={{ top: ['-100%', '200%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500 shadow-[0_0_5px_${primaryGlow}] animate-pulse`} />
                                                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 leading-none">SEC_INTEL_STREAM</p>
                                            </div>
                                            <h3 className={`text-xl md:text-3xl font-extrabold uppercase tracking-tight text-white`}>PROTOCOLS</h3>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 md:space-y-4">
                                        {mission.rules.map((rule, idx) => (
                                            <li key={idx} className="flex gap-4 md:gap-6 text-sm text-white/80 font-sans leading-relaxed group/item">
                                                <div className="flex flex-col items-center pt-1.5">
                                                    <span className={`text-sm text-${themeColor}-500 group-hover/item:text-${themeColor}-300 transition-colors font-mono font-black`}>[0{idx + 1}]</span>
                                                    <div className={`w-[1px] h-full bg-gradient-to-b from-${themeColor}-500/50 to-transparent mt-2`} />
                                                </div>
                                                <span className="group-hover/item:text-white transition-all transform group-hover/item:translate-x-1 duration-300">{rule}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.section>

                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                                className={`group relative bg-black/95 backdrop-blur-3xl border border-${themeColor}-500/20 p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_50px_${primaryGlow.replace('0.5', '0.05')}] hover:shadow-[0_0_80px_${primaryGlow.replace('0.5', '0.15')}]`}
                            >
                                {/* Geometric Parallax Engine */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-${themeColor}-500/10 to-transparent blur-3xl opacity-30`} />
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className={`absolute border border-${themeColor}-500/10 rounded-full`}
                                            animate={{
                                                scale: [1, 1.15, i === 1 ? 1.1 : 1],
                                                rotate: [i * 90, i * 90 - 180, i * 90],
                                                opacity: [0.05, 0.15, 0.05]
                                            }}
                                            transition={{ duration: 18 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
                                            style={{
                                                width: 120 + i * 140,
                                                height: 120 + i * 140,
                                                right: `${-20 + i * 15}%`,
                                                bottom: `${-10 + i * 10}%`,
                                            }}
                                        />
                                    ))}
                                    {/* HUD Background Grid Integration */}
                                    <div className={`absolute inset-0 opacity-[0.02]`} style={{ backgroundImage: `linear-gradient(${themeColor === 'amber' ? '#f59e0b' : '#10b981'} 1px, transparent 1px), linear-gradient(90deg, ${themeColor === 'amber' ? '#f59e0b' : '#10b981'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                                </div>

                                {/* Technical Precision Frame Architecture */}
                                <div className={`absolute inset-2 border border-white/5 rounded-[2rem] pointer-events-none z-10`} />
                                <div className={`absolute inset-0 border-2 border-${themeColor}-500/30 rounded-[2.5rem] pointer-events-none z-10 group-hover:border-${themeColor}-500/50 transition-colors duration-500`} />

                                {/* High-Resolution Corner Brackets */}
                                <div className={`absolute -top-1 -left-1 w-16 h-16 border-t-4 border-l-4 border-${themeColor}-500 rounded-tl-[2.2rem] z-20 pointer-events-none shadow-[0_0_20px_${primaryGlow}] group-hover:shadow-[0_0_40px_${primaryGlow}] group-hover:w-24 group-hover:h-24 transition-all duration-700`} />
                                <div className={`absolute -bottom-1 -right-1 w-16 h-16 border-b-4 border-r-4 border-${themeColor}-500 rounded-br-[2.2rem] z-20 pointer-events-none shadow-[0_0_20px_${primaryGlow}] group-hover:shadow-[0_0_40px_${primaryGlow}] group-hover:w-24 group-hover:h-24 transition-all duration-700`} />

                                <div className="relative z-30 space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`relative w-1.2 h-8 md:h-12 overflow-hidden rounded-full bg-${themeColor}-950 border border-${themeColor}-500/30`}>
                                            <motion.div
                                                className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-${themeColor}-400 to-transparent shadow-[0_0_15px_${primaryGlow}]`}
                                                animate={{ top: ['-100%', '200%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500 shadow-[0_0_5px_${primaryGlow}] animate-pulse`} />
                                                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 leading-none">SEC_GOAL_STREAM</p>
                                            </div>
                                            <h3 className={`text-xl md:text-3xl font-extrabold uppercase tracking-tight text-white`}>EVALUATION</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:space-y-4">
                                        {(mission.evaluation || ['Execution', 'Technical Prowess', 'Innovation', 'Originality']).map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ x: 8 }}
                                                className="space-y-1.5 md:space-y-2 group/item"
                                            >
                                                <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 group-hover/item:text-${themeColor}-400 transition-colors">
                                                    <span>CRITERION_0{idx + 1}</span>
                                                </div>
                                                <div className={`h-10 md:h-12 flex items-center px-5 bg-white/[0.04] border border-white/5 rounded-xl md:rounded-2xl group-hover/item:border-${themeColor}-500/40 group-hover/item:bg-white/[0.08] transition-all font-sans text-xs md:text-sm text-white/80 group-hover/item:text-white shadow-2xl relative overflow-hidden`}>
                                                    <div className={`absolute inset-0 bg-gradient-to-r from-${themeColor}-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity`} />
                                                    {item}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        </div>

                        {/* Commanders Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${mission.type === 'Cultural' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">SEC_COMMAND // COORDINATORS</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mission.coordinators.map((name, idx) => (
                                    <div key={idx} className="group relative">
                                        <div className={`absolute inset-0 bg-gradient-to-r from-${themeColor}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl`} />
                                        <div
                                            className={`relative p-6 bg-black backdrop-blur-3xl border-2 border-${themeColor}-500/30 rounded-2xl hover:border-${themeColor}-400 transition-all flex items-center justify-between group-hover:bg-black overflow-hidden shadow-[0_0_30px_${primaryGlow.replace('0.5', '0.1')}] hover:shadow-[0_0_50px_${primaryGlow.replace('0.5', '0.2')}]`}
                                            style={{
                                                background: `linear-gradient(to top, black 50%, ${mission.type === 'Cultural' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'} 100%)`
                                            }}
                                        >
                                            {/* Top Scanning Line */}
                                            <motion.div
                                                className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-${themeColor}-400 to-transparent opacity-0 group-hover:opacity-100 z-10 shadow-[0_0_10px_${primaryGlow}]`}
                                                animate={{ left: ['-100%', '100%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            />

                                            {/* Corner Detail */}
                                            <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-${themeColor}-500/20 rounded-tr-xl pointer-events-none transition-all group-hover:border-${themeColor}-500 group-hover:shadow-[0_0_10px_${primaryGlow}]`} />
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-full bg-${themeColor}-500/10 flex items-center justify-center border border-${themeColor}-500/20`}>
                                                    <Users size={24} className={`text-${themeColor}-400`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white/90 group-hover:text-white transition-colors">{name}</h3>
                                                    <p className={`text-[9px] font-black text-${themeColor}-500/60 uppercase tracking-[0.2em] mt-1`}>CORE_OPERATIVE</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <a href={`tel:${mission.coordinatorsContact?.[idx] || '#'}`} className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-${themeColor}-500/20 transition-all border border-white/10`}>
                                                    <Phone size={16} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                    </div>
                </div>

                {/* Logistics Bar - Integrated Experience */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {[
                        { icon: Calendar, label: 'DEPLOY_DATE', value: mission.date },
                        { icon: MapPin, label: 'ZONE_LOCATION', value: 'SECTOR_07' },
                        { icon: Trophy, label: 'CREDIT_POOL', value: mission.prizePool },
                        { icon: Info, label: 'MAX_SQUAD', value: '04 MEMBERS' }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className={`p-6 bg-black backdrop-blur-3xl border-2 border-${themeColor}-500/40 rounded-xl text-center space-y-3 hover:bg-black hover:border-${themeColor}-300 transition-all group relative overflow-hidden shadow-[0_0_30px_${primaryGlow.replace('0.5', '0.1')}] hover:shadow-[0_0_60px_${primaryGlow.replace('0.5', '0.3')}]`}
                            style={{
                                background: `linear-gradient(to top, black 30%, ${mission.type === 'Cultural' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'} 100%)`
                            }}
                        >
                            {/* Animated Top Glow for Logistics */}
                            <motion.div
                                className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${themeColor}-400 to-transparent opacity-0 group-hover:opacity-100 z-10 shadow-[0_0_15px_${primaryGlow}]`}
                                animate={{ left: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                            <item.icon size={20} className={`mx-auto text-${themeColor}-500/60 group-hover:text-${themeColor}-400 transition-colors`} />
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">{item.label}</p>
                                <p className="text-2xl font-black uppercase tracking-tighter text-white/80 group-hover:text-white transition-colors">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Global Bottom HUD Line */}
            <div className={`fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-${themeColor}-500/50 to-transparent z-50`} />
        </main>
    )
}
