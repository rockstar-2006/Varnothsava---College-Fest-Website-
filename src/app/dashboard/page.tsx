'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Zap, Shield, Terminal, Cpu, ChevronRight, Activity, ScanLine, Trophy } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import TerminalBackground from '@/components/ui/TerminalBackground'
import HolographicAvatar from '@/components/ui/HolographicAvatar'
import GridScan from '@/components/ui/GridScan'

export default function DashboardPage() {
    const { userData, logout, isLoggedIn, updateAvatar } = useApp()
    const router = useRouter()
    const [currentTime, setCurrentTime] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    if (!isLoggedIn || !userData) {
        if (typeof window !== 'undefined') router.push('/login')
        return null
    }

    const getSeedFromUrl = (url: string) => {
        try {
            const u = new URL(url)
            return u.searchParams.get('seed') || userData.name
        } catch {
            return userData.name
        }
    }

    const handleAvatarUpdate = (newSeed: string) => {
        const newUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${newSeed}&backgroundColor=transparent`
        updateAvatar(newUrl)
    }

    return (
        <main className="min-h-screen bg-black text-emerald-400 font-mono relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
            <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
                <GridScan
                    sensitivity={0.55}
                    lineThickness={1}
                    linesColor="#064e3b"
                    gridScale={0.15}
                    scanColor="#10b981"
                    scanOpacity={0.3}
                    enablePost
                    bloomIntensity={0.5}
                    chromaticAberration={0.003}
                    noiseIntensity={0.02}
                    scanOnClick={false}
                    enableGyro={false}
                />
            </div>

            <div
                className="relative z-10 max-w-7xl mx-auto pt-24 pb-20 px-6"
            >

                {/* Console Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4 border-b border-emerald-500/30 pb-4">
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
                            className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center rounded-xl relative overflow-hidden"
                        >
                            <Terminal size={24} />
                            <motion.div
                                className="absolute inset-0 bg-emerald-500/20"
                                animate={{ y: ['100%', '-100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-white flex gap-2">
                                STUDENT
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-emerald-500"
                                >
                                    _PORTAL
                                </motion.span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                />
                                <p className="text-xs text-emerald-400/50 uppercase tracking-widest">
                                    v2.4.2 // ONLINE // ID: {userData.profileCode}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-2xl font-bold text-white mb-1 font-mono tracking-widest">{currentTime}</div>
                        <div className="text-[10px] text-emerald-500/50 flex justify-end items-center gap-2">
                            <Activity size={10} className="animate-pulse" />
                            SYSTEM TIME // ASIA_KOLKATA
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* COL 1: Student Profile (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* ID Card System */}
                        <div className="bg-[#050905]/90 border border-emerald-500/30 p-1 relative shadow-[0_0_40px_rgba(34,197,94,0.15)] rounded-2xl overflow-hidden group">
                            {/* Scanning Effect Overlay */}
                            <motion.div
                                className="absolute inset-x-0 h-[2px] bg-emerald-400/80 z-20 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                                animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Decorative Corner Lines */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500 rounded-tl-xl m-2 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500 rounded-tr-xl m-2 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500 rounded-bl-xl m-2 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500 rounded-br-xl m-2 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="bg-emerald-500/5 p-8 backdrop-blur-sm rounded-xl h-full relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="text-[10px] font-bold uppercase border border-emerald-500/50 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 tracking-wider">
                                        {userData.studentType}
                                    </div>
                                    <Cpu size={18} className="text-emerald-500/50 animate-pulse" />
                                </div>

                                {/* Avatar */}
                                <div className="w-40 h-40 mx-auto border-2 border-emerald-500/50 rounded-full p-2 mb-6 bg-emerald-500/5 relative group/avatar cursor-pointer overflow-hidden ring-4 ring-emerald-500/10">
                                    <motion.div
                                        className="absolute inset-0 bg-emerald-500/20 rounded-full"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <img src={userData.avatar} className="w-full h-full rounded-full object-cover group-hover/avatar:scale-105 transition-all duration-500 filter sepia-[0.3] hue-rotate-[90deg] hover:sepia-0 hover:hue-rotate-0" alt="Student" />
                                </div>

                                <h2 className="text-2xl font-black text-center uppercase mb-2 text-white tracking-tight">{userData.name}</h2>
                                <p className="text-center text-xs text-emerald-400 uppercase tracking-[0.2em] mb-8 font-bold">
                                    <span className="opacity-50">ID:</span> {userData.profileCode}
                                </p>

                                {/* Bio Data */}
                                <div className="space-y-4 text-xs border-t border-emerald-500/20 pt-6">
                                    <div className="flex justify-between items-center group/item hover:bg-white/5 p-1 rounded transition-colors">
                                        <span className="text-emerald-500/60 font-bold">EMAIL</span>
                                        <span className="text-emerald-300 text-right w-3/4 truncate group-hover/item:text-white transition-colors">{userData.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center group/item hover:bg-white/5 p-1 rounded transition-colors">
                                        <span className="text-emerald-500/60 font-bold">PHONE</span>
                                        <span className="text-emerald-300 group-hover/item:text-white transition-colors">{userData.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center group/item hover:bg-white/5 p-1 rounded transition-colors">
                                        <span className="text-emerald-500/60 font-bold">COLLEGE</span>
                                        <span className="text-emerald-300 text-right w-3/4 truncate group-hover/item:text-white transition-colors">{userData.collegeName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Access Module */}
                        <div className="bg-[#050905]/90 border border-emerald-500/30 p-8 flex flex-col items-center text-center rounded-2xl shadow-lg relative overflow-hidden">
                            {/* Scanning laser for QR */}
                            <motion.div
                                className="absolute w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20"
                                animate={{ top: ['10%', '90%', '10%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            />

                            <h3 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-white">
                                <Shield size={16} className="text-emerald-500" /> Digital Entry Pass
                            </h3>
                            <div className="p-3 bg-white rounded-lg flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: userData.id, code: userData.profileCode }))}&color=000000&bgcolor=ffffff`}
                                    className="w-32 h-32"
                                    alt="QR"
                                />
                            </div>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Show this QR at event venues</p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { logout(); router.push('/'); }}
                            className="w-full py-4 border border-red-500/20 bg-red-500/5 text-red-500/70 transition-all uppercase text-xs font-bold tracking-[0.2em] flex items-center justify-center gap-2 rounded-xl"
                        >
                            <LogOut size={14} /> Log Out System
                        </motion.button>
                    </div>

                    {/* COL 2: Main Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* System Notice */}
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-xl flex items-center gap-4 text-sm shadow-[0_0_20px_rgba(34,197,94,0.1)] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />

                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="p-2 bg-emerald-500/20 rounded-full shrink-0"
                            >
                                <Zap size={18} className="text-emerald-400" />
                            </motion.div>
                            <div className="overflow-hidden whitespace-nowrap w-full">
                                <motion.div
                                    animate={{ x: ['10%', '-100%'] }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="font-bold text-emerald-200 inline-block"
                                >
                                    WELCOME TO VARNOTHSAVA 2K26. REGISTRATION LINES ARE OFFICIALLY OPEN. SECURE YOUR SPOT IN THE EVENTS NOW.
                                </motion.div>
                            </div>
                        </div>

                        {/* Avatar Customizer (Holo) */}
                        <div className="bg-[#050905]/90 border border-emerald-500/30 overflow-hidden relative rounded-2xl shadow-2xl">
                            <div className="bg-emerald-500/10 p-3 flex justify-between items-center px-6 border-b border-emerald-500/20">
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-2">
                                    <ScanLine size={14} /> Avatar Studio
                                </span>
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 bg-red-500/40 rounded-full"></div>
                                    <div className="w-2.5 h-2.5 bg-yellow-500/40 rounded-full"></div>
                                    <div className="w-2.5 h-2.5 bg-green-500/40 rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-0">
                                <HolographicAvatar currentSeed={getSeedFromUrl(userData.avatar)} onUpdate={handleAvatarUpdate} />
                            </div>
                        </div>

                        {/* Events / Missions */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-1 bg-emerald-500/20 rounded">
                                    <ChevronRight size={20} className="text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-bold uppercase text-white tracking-tight">Your Events</h2>
                                <span className="text-xs text-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    {userData.registeredEvents?.length || 0} ACTIVE
                                </span>
                            </div>

                            {!userData.registeredEvents || userData.registeredEvents.length === 0 ? (
                                <div className="border border-dashed border-emerald-500/30 p-12 text-center bg-emerald-500/5 rounded-2xl">
                                    <Trophy size={48} className="mx-auto text-emerald-500/20 mb-4" />
                                    <h3 className="text-lg font-bold mb-2 text-emerald-200">No Events Registered</h3>
                                    <p className="text-emerald-400/60 text-xs max-w-md mx-auto mb-8 leading-relaxed">
                                        You haven't participated in any events yet. Explore the catalog to join the competition.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push('/events')}
                                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs tracking-[0.2em] transition-all rounded-lg shadow-lg shadow-emerald-600/20"
                                    >
                                        Browse Events
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-12 gap-4 text-[10px] text-emerald-500/60 px-6 uppercase tracking-widest border-b border-emerald-500/20 pb-3 font-bold">
                                        <div className="col-span-2">REF ID</div>
                                        <div className="col-span-6">EVENT DETAILS</div>
                                        <div className="col-span-4 text-right">STATUS</div>
                                    </div>

                                    {userData.registeredEvents.map((event, index) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="grid grid-cols-12 gap-4 items-center p-5 bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all cursor-default rounded-xl group relative overflow-hidden"
                                        >
                                            {/* Hover highlight effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

                                            <div className="col-span-2 font-mono text-xs text-emerald-500/70 group-hover:text-emerald-400">
                                                #{event.id.substring(0, 4)}
                                            </div>
                                            <div className="col-span-6">
                                                <div className="font-bold text-sm uppercase text-emerald-100 group-hover:text-white transition-colors">{event.id.replace(/-/g, ' ')}</div>
                                                <div className="text-[10px] text-emerald-500/50 mt-1 font-bold">TEAM: {event.teamName}</div>
                                            </div>
                                            <div className="col-span-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-md border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    CONFIRMED
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}
