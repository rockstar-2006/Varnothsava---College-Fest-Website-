'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion'
import {
    User, Mail, Phone, School, Hash,
    ShieldCheck, QrCode, LogOut,
    Edit3, Award, Trophy, GraduationCap, CheckCircle,
    Settings, Globe, Calendar, Clock, CreditCard,
    BookOpen, Sparkles, ChevronRight, LayoutDashboard,
    ArrowRight, MapPin, Link2, X
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import Tilt from 'react-parallax-tilt'

// --- CONSTANTS ---
const ACCENT_GREEN = '#00ff9d'
const ACCENT_CYAN = '#00f2ff'

// --- ANIMATED BORDER WRAPPER ---
const AnimatedBorderCard = ({ children, className = "", noPadding = false, hoverEffect = true }: { children: React.ReactNode, className?: string, noPadding?: boolean, hoverEffect?: boolean }) => {
    return (
        <div className={`relative group p-[1px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ${className} gpu-accel`}>
            {/* The Animated Border Layer - Reduced intensity for performance */}
            <div className="absolute inset-[-200%] md:inset-[-1000%] animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00ff9d_0%,#00f2ff_25%,#10b981_50%,#00f2ff_75%,#00ff9d_100%)] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

            {/* The Glass Content Layer */}
            <div className={`
                relative w-full h-full backdrop-blur-2xl rounded-[1.45rem] md:rounded-[1.95rem] bg-[#08090f]/90 md:bg-[#08090f]/95 
                shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-500
                ${noPadding ? '' : 'p-5 md:p-8 lg:p-10'}
            `}>
                {children}
            </div>
        </div>
    )
}

// --- HIGH-ENERGY ANIMATED BACKGROUND ---

const BackgroundElements = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [isMounted, setIsMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        const handleMouseMove = (e: MouseEvent) => {
            if (!isMobile) setMousePos({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('resize', checkMobile)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [isMobile])

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#03050a]">
            {/* Animated Mesh Gradient Layer */}
            <div className="absolute inset-0 opacity-40">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 90, 0],
                        x: ['-20%', '20%', '-20%'],
                        y: ['-10%', '10%', '-10%'],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-30%] left-[-30%] w-[120%] h-[120%] bg-emerald-500/20 rounded-full blur-[180px]"
                />
                <motion.div
                    animate={{
                        scale: [1.3, 1, 1.3],
                        rotate: [0, -90, 0],
                        x: ['20%', '-20%', '20%'],
                        y: ['10%', '-10%', '10%'],
                    }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-blue-600/15 rounded-full blur-[180px]"
                />
            </div>

            {/* Interactive Neural Glow - Disabled on Mobile for performance */}
            {!isMobile && (
                <motion.div
                    animate={{
                        x: mousePos.x - 300,
                        y: mousePos.y - 300,
                    }}
                    transition={{ type: 'spring', damping: 40, stiffness: 40, mass: 1 }}
                    className="absolute w-[600px] h-[600px] bg-emerald-400/[0.08] rounded-full blur-[140px]"
                />
            )}

            {/* Micro-Particle Field - Reduced for mobile */}
            {isMounted && (
                <div className="absolute inset-0">
                    {[...Array(isMobile ? 10 : 30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                scale: Math.random() * 0.5 + 0.5
                            }}
                            animate={{
                                y: ['-10%', '110%'],
                                opacity: [0, 0.6, 0]
                            }}
                            transition={{
                                duration: Math.random() * 10 + 15,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 10
                            }}
                            className="absolute w-1 h-1 bg-emerald-400/40 rounded-full blur-[1px]"
                        />
                    ))}
                </div>
            )}

            {/* Dynamic Scanning Rays */}
            <motion.div
                animate={{
                    left: ['-50%', '150%']
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 w-[2px] h-full bg-emerald-500/10 skew-x-[45deg] blur-2xl"
            />
        </div>
    )
}

// --- HELPER COMPONENTS ---

const CountUp = ({ end, duration = 1.5 }: { end: number, duration?: number }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime: number | null = null
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }
        window.requestAnimationFrame(step)
    }, [end, duration])

    return <span className="tabular-nums">{count}</span>
}

// --- MAIN PAGE ---

export default function ProfilePage() {
    const { userData, logout, isLoggedIn, needsOnboarding, mountUser, updateAvatar, updateProfile } = useApp()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [activeModal, setActiveModal] = useState<'settings' | 'qr' | 'scanner' | 'editProfile' | null>(null)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    // Edit Profile Form State
    const [editName, setEditName] = useState('')
    const [editUsn, setEditUsn] = useState('')
    const [editPhone, setEditPhone] = useState('')

    useEffect(() => {
        if (userData) {
            setEditName(userData.name)
            setEditUsn(userData.usn)
            setEditPhone(userData.phone || '')
        }
    }, [userData])

    // Obvious Parallax & Motion Scale
    const { scrollY } = useScroll()

    // Convert absolute scroll to visible transforms
    const headerY = useTransform(scrollY, [0, 400], [0, -100])
    const contentY = useTransform(scrollY, [0, 600], [0, -60])
    const rotationX = useTransform(scrollY, [0, 1000], [0, 8])
    const backgroundOpacity = useTransform(scrollY, [0, 500], [0.6, 0.2])

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 100, filter: 'blur(20px)', scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 80,
                duration: 1.2
            } as any
        }
    }

    useEffect(() => {
        const init = async () => {
            setMounted(true)
            await mountUser()
        }
        init()
    }, [])

    useEffect(() => {
        if (mounted && needsOnboarding) {
            router.push('/login')
        }
    }, [mounted, needsOnboarding, router])

    if (!mounted || !isLoggedIn || !userData) {
        return (
            <div className="min-h-screen bg-[#030408] flex items-center justify-center overflow-hidden">
                <BackgroundElements />
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-emerald-500 font-medium text-sm tracking-widest uppercase animate-pulse">Entering the Hub...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#030408] text-white selection:bg-emerald-500/20 overflow-x-hidden font-sans relative">
            <motion.div style={{ opacity: backgroundOpacity }} className="fixed inset-0 pointer-events-none z-0">
                <BackgroundElements />
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="relative z-10 max-w-6xl mx-auto pt-20 md:pt-32 pb-40 px-4 md:px-8 root-container"
                style={{ perspective: 1500 }}
            >
                {/* --- CONTROL CENTER HEADER --- */}
                <motion.div
                    variants={itemVariants}
                    style={{ y: headerY, rotateX: rotationX }}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16"
                >
                    <div className="flex flex-col items-start gap-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                            <Sparkles size={14} className="text-emerald-400" />
                            <span className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest">Student Portal</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.8] gpu-accel text-white uppercase italic">
                                MY <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PROFILE</span>
                            </h1>
                            <div className="h-1.5 w-32 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                            <p className="text-slate-400 text-sm md:text-lg font-medium max-w-lg leading-relaxed">
                                Welcome, <span className="text-white font-bold">{userData.name}</span>. View your festival participation and manage your details.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <AnimatedBorderCard noPadding className="!rounded-2xl flex-1 md:min-w-[280px]">
                            <div className="px-5 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                        <ShieldCheck size={20} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">Campus Access</p>
                                        <p className="text-xs font-black text-white uppercase flex items-center gap-2">
                                            Verified Student
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveModal('settings')}
                                    className="p-2 hover:bg-emerald-500/10 rounded-xl text-slate-400 hover:text-emerald-400 transition-all group"
                                    title="Synthesis Studio"
                                >
                                    <Settings size={20} className="group-hover:rotate-180 transition-transform duration-1000" />
                                </button>
                            </div>
                        </AnimatedBorderCard>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={logout}
                            className="flex items-center gap-4 px-8 py-5 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl group h-full"
                        >
                            <LogOut size={18} />
                            LOGOUT
                        </motion.button>
                    </div>
                </motion.div>

            </motion.div>

            <motion.div
                variants={itemVariants}
                style={{ y: contentY }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start"
            >

                {/* --- LEFT SIDEBAR --- */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    <motion.div variants={itemVariants}>
                        <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1000}>
                            <AnimatedBorderCard noPadding className="!rounded-[2rem] md:rounded-[2.5rem]">
                                <div className="p-6 md:p-8 space-y-6 md:space-y-10 relative z-10">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-6 group/avatar">
                                            <div className="absolute -inset-6 bg-emerald-500/20 blur-[40px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                                            <div className="relative w-28 md:w-36 h-28 md:h-36 rounded-[2rem] md:rounded-[2.5rem] p-1.5 bg-gradient-to-br from-emerald-500/50 via-cyan-500/50 to-emerald-500/50">
                                                <div className="w-full h-full bg-[#05060a] rounded-[1.8rem] md:rounded-[2.2rem] overflow-hidden border border-white/10">
                                                    <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveModal('qr')}
                                                className="absolute -bottom-2 -right-2 w-12 md:w-12 h-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-black shadow-2xl transition-transform hover:scale-110 hover:rotate-12 border-2 md:border-4 border-[#08090f] z-20 min-h-[48px] min-w-[48px]"
                                            >
                                                <QrCode size={22} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <h2 className="text-lg md:text-2xl font-bold text-white px-2 leading-tight uppercase tracking-tight">{userData.name}</h2>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                                <span className="text-[10px] md:text-sm font-bold text-emerald-400 tracking-wider">PASS ID: {userData.profileCode}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 md:p-5 bg-white/[0.03] border border-white/10 rounded-2xl group transition-all hover:bg-emerald-500/5 hover:border-emerald-500/20">
                                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Events</p>
                                            <p className="text-xl md:text-3xl font-bold text-white leading-none"><CountUp end={userData.registeredEvents?.length || 0} /></p>
                                        </div>
                                        <div className="p-4 md:p-5 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col justify-center items-center">
                                            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1.5">
                                                <CheckCircle size={18} className="text-emerald-400" />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Entry</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveModal('editProfile')}
                                        className="w-full py-5 bg-emerald-500 hover:bg-cyan-400 text-black font-black uppercase text-[10px] md:text-xs tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 active:scale-95 ring-4 ring-emerald-500/20 border border-white/20 min-h-[56px] hover-effect"
                                    >
                                        <Edit3 size={16} /> Update Profile
                                    </button>
                                </div>
                            </AnimatedBorderCard>
                        </Tilt>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.06)' }}
                        onClick={() => setActiveModal('scanner')}
                        className="p-6 md:p-8 rounded-[1.8rem] md:rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between group cursor-pointer transition-all duration-500 shadow-xl min-h-[80px]"
                    >
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-all border border-emerald-500/20">
                                <QrCode size={20} />
                            </div>
                            <div>
                                <p className="text-sm md:text-lg font-black text-white leading-none mb-1">Pass Scanner</p>
                                <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Scan Event QR</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.06)' }}
                        className="p-6 md:p-8 rounded-[1.8rem] md:rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer transition-all duration-500 shadow-xl min-h-[80px]"
                    >
                        <div className="flex items-center gap-4 md:gap-5">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all border border-white/5">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-sm md:text-lg font-black text-white leading-none mb-1">Billing Archive</p>
                                <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction History</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                </div>

                {/* --- RIGHT CONTENT --- */}
                <div className="lg:col-span-8 space-y-8 md:space-y-10">
                    <motion.div variants={itemVariants}>
                        <AnimatedBorderCard className="!rounded-[2rem] md:rounded-[2.5rem]">
                            <div className="flex items-center gap-6 md:gap-8 mb-8 md:mb-12">
                                <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[1.8rem] flex items-center justify-center text-emerald-400 shadow-xl relative overflow-hidden group/icon">
                                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                    <User size={32} strokeWidth={1.5} className="relative z-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">PERSONAL_INFO</h3>
                                    <p className="text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mt-2 opacity-70">Verified Profile Details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-8 md:gap-y-10">
                                {[
                                    { label: "Full Name", value: userData.name, icon: User },
                                    { label: "College Email", value: userData.email, icon: Mail },
                                    { label: "Phone Number", value: userData.phone || 'NOT_LINKED', icon: Phone },
                                    { label: "USN / Roll Number", value: userData.usn, icon: Hash }
                                ].map((field, idx) => (
                                    <div key={idx} className="space-y-2 md:space-y-3 pb-4 md:pb-6 border-b border-white/5 group/field relative">
                                        <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/field:text-emerald-400 transition-colors">
                                            <field.icon size={12} className="opacity-60" />
                                            {field.label}
                                        </div>
                                        <p className="text-xs md:text-base font-semibold text-white/95 truncate tracking-tight">{field.value}</p>
                                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover/field:w-full transition-all duration-700" />
                                    </div>
                                ))}
                            </div>
                        </AnimatedBorderCard>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <AnimatedBorderCard className="!rounded-[2rem] md:rounded-[2.5rem]">
                            <div className="flex items-center gap-6 md:gap-8 mb-10 md:mb-14">
                                <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[1.8rem] flex items-center justify-center text-cyan-400 shadow-xl relative overflow-hidden group/icon">
                                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                    <School size={32} strokeWidth={1.5} className="relative z-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">COLLEGE_INFO</h3>
                                    <p className="text-[10px] md:text-xs font-black text-cyan-500 uppercase tracking-[0.3em] mt-2 opacity-70">Registered College Information</p>
                                </div>
                            </div>

                            <div className="p-6 md:p-10 bg-[#0c0d15]/50 border border-emerald-500/20 ring-1 ring-white/10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden group/college shadow-2xl">
                                <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                                    <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Validated Node</p>
                                    <div className="px-3 md:px-5 py-1.5 md:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 md:gap-3 backdrop-blur-md">
                                        <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase italic">Linked</span>
                                    </div>
                                </div>
                                <p className="text-lg md:text-3xl font-bold text-white leading-tight uppercase tracking-tight relative z-10">
                                    {userData.collegeName}
                                </p>
                                <div className="mt-6 md:mt-10 flex items-center gap-3 md:gap-4 text-slate-300 relative z-10 py-3 md:py-4 px-4 md:px-6 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                                    <MapPin size={16} className="text-emerald-500" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">National Level Techno-Cultural Fest</span>
                                </div>
                                <div className="absolute -top-20 -right-20 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/[0.03] blur-[120px] pointer-events-none" />
                            </div>
                        </AnimatedBorderCard>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <AnimatedBorderCard className="!rounded-[2rem] md:rounded-[3rem]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 md:mb-16">
                                <div className="flex items-center gap-6 md:gap-8">
                                    <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[1.8rem] flex items-center justify-center text-emerald-400 shadow-xl relative overflow-hidden group/icon">
                                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                        <BookOpen size={32} strokeWidth={1.5} className="relative z-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">MY_EVENTS</h3>
                                        <p className="text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mt-2 opacity-70">Participated Events for 2026</p>
                                    </div>
                                </div>

                                <div className="px-5 md:px-7 py-2 md:py-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl flex items-center gap-6 md:gap-8">
                                    <p className="text-3xl md:text-5xl font-bold text-white leading-none bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        <CountUp end={userData.registeredEvents?.length || 0} />
                                    </p>
                                    <div className="w-px h-6 md:h-10 bg-white/10" />
                                    <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase leading-tight tracking-widest">Confirmed<br />Sessions</p>
                                </div>
                            </div>

                            {!userData.registeredEvents?.length ? (
                                <div className="py-20 md:py-28 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] md:rounded-[4rem] bg-white/[0.01] transition-all duration-700 hover:border-emerald-500/20 group/empty">
                                    <Trophy size={80} strokeWidth={1} className="text-white/5 mb-8 group-hover/empty:scale-110 transition-transform" />
                                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-10 text-center italic opacity-60">No active registrations found.</p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push('/events')}
                                        className="px-8 md:px-12 py-5 md:py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black uppercase tracking-widest text-xs rounded-2xl md:rounded-3xl shadow-2xl min-h-[56px] hover-effect"
                                    >
                                        View Event Board <ArrowRight size={18} className="inline ml-3" />
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    {userData.registeredEvents.map((event, idx) => (
                                        <motion.div
                                            whileHover={{ y: -5, scale: 1.01 }}
                                            key={idx}
                                            className="p-8 md:p-10 bg-[#0c101a] border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] transition-all duration-500 relative overflow-hidden group/event shadow-2xl"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] opacity-0 group-hover/event:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-between mb-8 relative z-10">
                                                <div className="w-12 md:w-14 h-12 md:h-14 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                                    <Award size={26} />
                                                </div>
                                                <span className="px-4 py-1.5 bg-cyan-400/10 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-cyan-500/20 italic">LIVE</span>
                                            </div>
                                            <h4 className="text-lg md:text-2xl font-bold text-white uppercase mb-8 leading-tight tracking-tight pr-4">
                                                {event.id.replace(/-/g, ' ')}
                                            </h4>
                                            <div className="pt-6 md:pt-8 border-t border-white/5 flex items-center justify-between relative z-10 mt-4">
                                                <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest">Team Unit</span>
                                                <span className="text-[10px] md:text-xs font-bold text-white hover:text-emerald-400 transition-colors uppercase">{event.teamName}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatedBorderCard>
                    </motion.div>

                    <div className="pt-12 text-center opacity-20">
                        <p className="text-[10px] font-mono tracking-widest uppercase">Secure Session Active</p>
                    </div>
                </div>
            </motion.div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: 30 }}
                            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar no-jank p-[1px] rounded-[2rem] overflow-hidden"
                        >
                            {/* Mobile Modal Glass Wrapper */}
                            <div className="relative glass-modal rounded-[1.95rem] p-6 shadow-2xl overflow-hidden min-h-[300px]">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none" />

                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h3 className="text-lg md:text-xl font-black uppercase italic text-white flex items-center gap-3">
                                        {activeModal === 'settings' && <><Settings size={18} className="text-emerald-400" /> Personalization</>}
                                        {activeModal === 'qr' && <><QrCode size={18} className="text-emerald-400" /> Digital Pass</>}
                                        {activeModal === 'scanner' && <><LayoutDashboard size={18} className="text-emerald-400" /> Scanner</>}
                                        {activeModal === 'editProfile' && <><Edit3 size={18} className="text-emerald-400" /> Update Hub</>}
                                    </h3>
                                    <button
                                        onClick={() => setActiveModal(null)}
                                        className="p-3 bg-white/5 hover:bg-emerald-500/10 rounded-full text-slate-400 hover:text-emerald-400 transition-all active:scale-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {activeModal === 'settings' && (
                                        <div className="text-center space-y-6">
                                            <div className="relative group/avatar-edit mx-auto">
                                                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/20 shadow-2xl relative bg-[#05060a]">
                                                    {isRegenerating && (
                                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                    <img src={userData.avatar} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-black text-white uppercase italic">Choose Your Character</p>
                                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                    Select a fun avatar for the festival.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    disabled={isRegenerating}
                                                    onClick={async () => {
                                                        setIsRegenerating(true)
                                                        try {
                                                            const seed = Math.floor(Math.random() * 1000)
                                                            await updateAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=male`)
                                                        } finally {
                                                            setIsRegenerating(false)
                                                        }
                                                    }}
                                                    className={`p-4 bg-white/5 border border-white/10 ring-1 ring-white/5 text-white font-bold uppercase text-[9px] tracking-widest rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col items-center justify-center gap-1 ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span className="text-xs">Pick Male</span>
                                                    <span className="text-[7px] text-slate-500">BOY AVATAR</span>
                                                </button>
                                                <button
                                                    disabled={isRegenerating}
                                                    onClick={async () => {
                                                        setIsRegenerating(true)
                                                        try {
                                                            const seed = Math.floor(Math.random() * 1000)
                                                            await updateAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=female`)
                                                        } finally {
                                                            setIsRegenerating(false)
                                                        }
                                                    }}
                                                    className={`p-4 bg-white/5 border border-white/10 ring-1 ring-white/5 text-white font-bold uppercase text-[9px] tracking-widest rounded-xl hover:bg-pink-500/10 hover:border-pink-500/30 transition-all flex flex-col items-center justify-center gap-1 ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span className="text-xs">Pick Female</span>
                                                    <span className="text-[7px] text-slate-500">GIRL AVATAR</span>
                                                </button>
                                            </div>

                                            <button
                                                disabled={isRegenerating}
                                                onClick={async () => {
                                                    setIsRegenerating(true)
                                                    try {
                                                        const seed = Math.floor(Math.random() * 10000)
                                                        const styles = ['avataaars', 'bottts', 'pixel-art', 'lorelei']
                                                        const style = styles[Math.floor(Math.random() * styles.length)]
                                                        await updateAvatar(`https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`)
                                                    } finally {
                                                        setIsRegenerating(false)
                                                    }
                                                }}
                                                className={`w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.3)] ring-4 ring-emerald-500/20 border border-white/20 ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isRegenerating ? 'UPDATING...' : <><Sparkles size={16} /> Random Avatar</>}
                                            </button>
                                        </div>
                                    )}

                                    {activeModal === 'qr' && (
                                        <div className="text-center space-y-6">
                                            <div className="p-4 bg-white rounded-[2rem] inline-block shadow-2xl ring-8 ring-emerald-500/10">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userData.profileCode}`}
                                                    alt="Entry Pass QR"
                                                    className="w-48 h-48"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-white uppercase italic tracking-tight">{userData.name}</p>
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-2">PASS ID: {userData.profileCode}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed bg-white/5 p-4 rounded-2xl">
                                                Present this QR code at event checkpoints for instant verification and entry.
                                            </p>
                                        </div>
                                    )}

                                    {activeModal === 'scanner' && (
                                        <div className="text-center py-8 space-y-6">
                                            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <QrCode size={40} className="text-emerald-400 animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-white font-bold uppercase italic">Scanner Deployment</h4>
                                                <p className="text-xs text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                                                    Initialize your device camera to scan event access tokens or coordinator codes.
                                                </p>
                                            </div>
                                            <button className="px-8 py-3 border border-emerald-500/50 text-emerald-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-500 hover:text-black transition-all">
                                                Activate Camera
                                            </button>
                                        </div>
                                    )}

                                    {activeModal === 'editProfile' && (
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault()
                                                setIsUpdating(true)
                                                try {
                                                    const success = await updateProfile({
                                                        name: editName,
                                                        usn: editUsn,
                                                        phone: editPhone,
                                                        collegeName: userData.collegeName
                                                    })
                                                    if (success) {
                                                        setActiveModal(null)
                                                    }
                                                } finally {
                                                    setIsUpdating(false)
                                                }
                                            }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Character Appearance</p>
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <button
                                                        type="button"
                                                        disabled={isRegenerating}
                                                        onClick={async () => {
                                                            setIsRegenerating(true)
                                                            try {
                                                                const seed = Math.floor(Math.random() * 1000)
                                                                await updateAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=male`)
                                                            } finally {
                                                                setIsRegenerating(false)
                                                            }
                                                        }}
                                                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-emerald-500/10 transition-all text-[10px] font-bold text-white uppercase"
                                                    >
                                                        Switch to Male
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isRegenerating}
                                                        onClick={async () => {
                                                            setIsRegenerating(true)
                                                            try {
                                                                const seed = Math.floor(Math.random() * 1000)
                                                                await updateAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=female`)
                                                            } finally {
                                                                setIsRegenerating(false)
                                                            }
                                                        }}
                                                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-pink-500/10 transition-all text-[10px] font-bold text-white uppercase"
                                                    >
                                                        Switch to Female
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                                    <input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white font-medium"
                                                        placeholder="Your Name"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">USN / ID</label>
                                                    <input
                                                        value={editUsn}
                                                        onChange={(e) => setEditUsn(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white font-medium"
                                                        placeholder="College USN"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                                    <input
                                                        value={editPhone}
                                                        onChange={(e) => setEditPhone(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white font-medium"
                                                        placeholder="Phone Number"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                                            >
                                                {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                body {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(16, 185, 129, 0.2) transparent;
                }
            `}</style>
        </div >
    )
}
