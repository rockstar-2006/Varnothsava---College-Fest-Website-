'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion'
import {
    User, Mail, Phone, School, Hash,
    ShieldCheck, QrCode, LogOut,
    Edit3, Award, Trophy, GraduationCap, CheckCircle,
    Settings, Globe, Calendar, Clock, CreditCard,
    BookOpen, Sparkles, ChevronRight, LayoutGrid, LayoutDashboard,
    ArrowRight, MapPin, Link2, X, Fingerprint, Eye, Users
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getAuthToken } from '@/lib/firebaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Tilt from 'react-parallax-tilt'
import QRCode from 'qrcode'
import { QrScanner } from '@/components/ui/QrScanner'
import { missions } from '@/data/missions'

// --- CONSTANTS ---
const ACCENT_GREEN = '#00ff9d'
const ACCENT_CYAN = '#00f2ff'

const ANIME_AVATARS = [
    { id: 'solo_male', name: 'Hunter SJW', src: '/avatars/solo_male.png', color: 'from-blue-500 to-indigo-500' },
    { id: 'solo_female', name: 'Hunter CHA', src: '/avatars/solo_female.png', color: 'from-yellow-400 to-amber-500' },
    { id: 'ds_male', name: 'Slayer TAN', src: '/avatars/ds_male.png', color: 'from-cyan-400 to-blue-500' },
    { id: 'ds_female', name: 'Slayer SHI', src: '/avatars/ds_female.png', color: 'from-purple-400 to-pink-500' },
    { id: 'jjk_male', name: 'Sorcerer GOJ', src: '/avatars/jjk_male.png', color: 'from-indigo-400 to-purple-500' },
    { id: 'jjk_female', name: 'Sorcerer KUG', src: '/avatars/jjk_female.png', color: 'from-orange-400 to-red-500' },
    { id: 'mha_male', name: 'Hero DEK', src: '/avatars/mha_male.png', color: 'from-emerald-400 to-green-500' },
    { id: 'mha_female', name: 'Hero URA', src: '/avatars/mha_female.png', color: 'from-pink-400 to-rose-500' },
]

// --- ANIMATED BORDER WRAPPER ---
const AnimatedBorderCard = ({ children, className = "", noPadding = false, hoverEffect = true }: { children: React.ReactNode, className?: string, noPadding?: boolean, hoverEffect?: boolean }) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    return (
        <div className={`relative group p-[1px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ${className} gpu-accel`}>
            {/* The Animated Border Layer - Disabled on mobile for 60fps scroll */}
            {!isMobile && (
                <div className="absolute inset-[-1000%] animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00ff9d_0%,#00f2ff_25%,#10b981_50%,#00f2ff_75%,#00ff9d_100%)] opacity-20 group-hover:opacity-40 transition-opacity duration-1000 will-change-transform" />
            )}
            {isMobile && (
                <div className="absolute inset-0 border border-emerald-500/20 rounded-[inherit]" />
            )}

            {/* The Glass Content Layer */}
            <div className={`
                relative w-full h-full ${isMobile ? 'backdrop-blur-none bg-[#08090f]' : 'backdrop-blur-xl bg-[#08090f]/95'} rounded-[1.45rem] md:rounded-[1.95rem] 
                shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)] transition-transform duration-500 transform-gpu translate-z-0
                ${noPadding ? '' : 'p-5 md:p-8 lg:p-10'}
            `}>
                {children}
            </div>
        </div>
    )
}

// --- HIGH-ENERGY ANIMATED BACKGROUND ---

const BackgroundElements = React.memo(() => {
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
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#03050a] transform-gpu">
            {/* Animated Mesh Gradient Layer */}
            <div className="absolute inset-0 opacity-40">
                <motion.div
                    animate={isMobile ? {} : {
                        scale: [1, 1.3, 1],
                        rotate: [0, 90, 0],
                        x: ['-20%', '20%', '-20%'],
                        y: ['-10%', '10%', '-10%'],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className={`absolute top-[-30%] left-[-30%] w-[120%] h-[120%] bg-emerald-500/20 rounded-full ${isMobile ? 'blur-[100px]' : 'blur-[180px]'} will-change-transform`}
                />
                {!isMobile && (
                    <motion.div
                        animate={{
                            scale: [1.3, 1, 1.3],
                            rotate: [0, -90, 0],
                            x: ['20%', '-20%', '20%'],
                            y: ['10%', '-10%', '10%'],
                        }}
                        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-blue-600/15 rounded-full blur-[180px] will-change-transform"
                    />
                )}
            </div>

            {/* Interactive Neural Glow - Disabled on Mobile */}
            {!isMobile && (
                <motion.div
                    animate={{
                        x: mousePos.x - 300,
                        y: mousePos.y - 300,
                    }}
                    transition={{ type: 'spring', damping: 50, stiffness: 30, mass: 1 }}
                    className="absolute w-[600px] h-[600px] bg-emerald-400/[0.08] rounded-full blur-[140px] will-change-transform"
                />
            )}

            {/* Micro-Particle Field - Disabled on mobile */}
            {isMounted && !isMobile && (
                <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                scale: Math.random() * 0.5 + 0.5
                            }}
                            animate={{
                                y: ['-5%', '105%'],
                                opacity: [0, 0.4, 0]
                            }}
                            transition={{
                                duration: Math.random() * 10 + 15,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 5
                            }}
                            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full blur-[1px] will-change-transform"
                        />
                    ))}
                </div>
            )}

            {/* Dynamic Scanning Rays - Disabled on mobile */}
            {!isMobile && (
                <motion.div
                    animate={{
                        left: ['-20%', '120%']
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 w-[2px] h-full bg-emerald-500/10 skew-x-[45deg] blur-xl will-change-transform"
                />
            )}
        </div>
    )
})
BackgroundElements.displayName = 'BackgroundElements'

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
    const { userData, logout, isLoggedIn, needsOnboarding, mountUser, updateAvatar, updateProfile, isAdmin } = useApp()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [activeModal, setActiveModal] = useState<'settings' | 'qr' | 'scanner' | 'editProfile' | 'registrationDetails' | 'payment' | null>(null)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    // Edit Profile Form State
    const [editName, setEditName] = useState('')
    const [editUsn, setEditUsn] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [qrDataUrl, setQrDataUrl] = useState<string>('')

    // Registration Details State
    const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)

    const fetchRegistrationDetails = async (registrationId: string) => {
        setIsLoadingDetails(true)
        try {
            const token = await getAuthToken()
            const response = await fetch(`/api/registration/${registrationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch registration details')
            }
            const data = await response.json()
            setSelectedRegistration(data.registration)
            setActiveModal('registrationDetails')
        } catch (error) {
            console.error('Error fetching registration details:', error)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    // Robust scroll lock for modal and hide bottom nav
    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        };
    }, [activeModal])

    useEffect(() => {
        if (userData) {
            setEditName(userData.name)
            setEditUsn(userData.usn)
            setEditPhone(userData.phone || '')

            // Generate QR Code locally
            QRCode.toDataURL(userData.profileCode, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }).then(url => setQrDataUrl(url))
                .catch(err => console.error('QR Generation Error:', err))
        }
    }, [userData])

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const init = async () => {
            setMounted(true)
            setIsMobile(window.innerWidth < 768)
            await mountUser()
        }
        init()

        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Obvious Parallax & Motion Scale
    const { scrollY } = useScroll()

    // Convert absolute scroll to visible transforms
    // Convert absolute scroll to visible transforms - ONLY ON DESKTOP
    const headerY = useTransform(scrollY, [0, 400], [0, isMobile ? 0 : -100])
    const contentY = useTransform(scrollY, [0, 600], [0, isMobile ? 0 : -60])
    const rotationX = useTransform(scrollY, [0, 1000], [0, isMobile ? 0 : 8])
    const backgroundOpacity = useTransform(scrollY, [0, 500], [0.6, 0.4])

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
        hidden: {
            opacity: 0,
            y: isMobile ? 10 : 100,
            scale: isMobile ? 1 : 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                damping: isMobile ? 30 : 20,
                stiffness: isMobile ? 150 : 80,
                duration: isMobile ? 0.3 : 1.2,
                willChange: 'transform, opacity'
            } as any
        }
    }

    useEffect(() => {
        if (mounted && (needsOnboarding || !isLoggedIn)) {
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
        <div className={`min-h-screen bg-[#030408] text-white selection:bg-emerald-500/20 overflow-x-hidden font-sans relative no-jank ${activeModal ? "overflow-y-hidden max-h-dvh" : ""}`}>
            <motion.div style={{ opacity: backgroundOpacity }} className="fixed inset-0 pointer-events-none z-0">
                <BackgroundElements />
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20px" }}
                className="relative z-10 max-w-6xl mx-auto pt-10 md:pt-32 pb-40 px-4 md:px-8 root-container transform-gpu translate-z-0"
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
                            <h1 className="text-display font-extrabold tracking-tight leading-[1] gpu-accel text-white uppercase italic">
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

                        {isAdmin && (
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/admin')}
                                className="flex items-center gap-4 px-8 py-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl group h-full whitespace-nowrap"
                            >
                                <LayoutGrid size={18} />
                                ADMIN
                            </motion.button>
                        )}

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

                {/* --- PAYMENT PROMPT BANNER --- */}
                {!userData.hasPaid && (
                    <motion.div
                        variants={itemVariants}
                        className="mb-12 relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-6 md:p-8 bg-black/60 backdrop-blur-2xl border border-emerald-500/30 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden shadow-2xl">
                            {/* Animated Background Accents */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[60px] animate-pulse" />

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <CreditCard size={32} className="animate-bounce" />
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-2xl font-black text-white italic uppercase tracking-tight">REGISTRATION INCOMPLETE</h3>
                                    <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">
                                        Your festival pass is not yet active. Complete the payment to access all events.
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveModal('payment')}
                                className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] md:text-xs tracking-[0.2em] rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group/btn"
                            >
                                START PAYMENT <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

            </motion.div>

            <motion.div
                variants={itemVariants}
                style={{ y: contentY }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start -mt-40 relative z-20"
            >

                {/* --- LEFT SIDEBAR --- */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    <motion.div variants={itemVariants}>
                        {isMobile ? (
                            <AnimatedBorderCard noPadding className="!rounded-[2rem] md:rounded-[2.5rem]">
                                <div className="p-6 md:p-8 space-y-6 md:space-y-10 relative z-10">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-6 group/avatar">
                                            <div className="relative w-28 md:w-36 h-28 md:h-36 rounded-[2rem] md:rounded-[2.5rem] p-1.5 bg-gradient-to-br from-emerald-500/50 via-cyan-500/50 to-emerald-500/50">
                                                <div className="w-full h-full bg-[#05060a] rounded-[1.8rem] md:rounded-[2.2rem] overflow-hidden border border-white/10 relative">
                                                    <Image
                                                        src={userData.avatar || ANIME_AVATARS[0].src}
                                                        alt={userData.name}
                                                        unoptimized
                                                        fill
                                                        sizes="(max-width: 768px) 112px, 144px"
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveModal('qr')}
                                                className="absolute -bottom-2 -right-2 w-12 md:w-12 h-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-black shadow-2xl transition-transform hover:scale-110 hover:rotate-12 border-2 md:border-4 border-[#08090f] z-50 min-h-[48px] min-w-[48px] pointer-events-auto cursor-pointer"
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
                        ) : (
                            <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1000}>
                                <AnimatedBorderCard noPadding className="!rounded-[2rem] md:rounded-[2.5rem]">
                                    <div className="p-6 md:p-8 space-y-6 md:space-y-10 relative z-10">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-6 group/avatar">
                                                <div className="absolute -inset-6 bg-emerald-500/20 blur-[40px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                                                <div className="relative w-28 md:w-36 h-28 md:h-36 rounded-[2rem] md:rounded-[2.5rem] p-1.5 bg-gradient-to-br from-emerald-500/50 via-cyan-500/50 to-emerald-500/50">
                                                    <div className="w-full h-full bg-[#05060a] rounded-[1.8rem] md:rounded-[2.2rem] overflow-hidden border border-white/10 relative">
                                                        <Image
                                                            src={userData.avatar || ANIME_AVATARS[0].src}
                                                            alt={userData.name}
                                                            unoptimized
                                                            fill
                                                            sizes="(max-width: 768px) 112px, 144px"
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setActiveModal('qr')}
                                                    className="absolute -bottom-2 -right-2 w-12 md:w-12 h-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-black shadow-2xl transition-transform hover:scale-110 hover:rotate-12 border-2 md:border-4 border-[#08090f] z-50 min-h-[48px] min-w-[48px] pointer-events-auto cursor-pointer"
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
                        )}
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
                        onClick={() => !userData.hasPaid && setActiveModal('payment')}
                        className={`p-5 md:p-8 rounded-[1.8rem] md:rounded-[2rem] border flex items-center justify-between group cursor-pointer transition-all duration-500 shadow-xl min-h-[80px] ${userData.hasPaid ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}
                    >
                        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                            <div className={`w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-all border ${userData.hasPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                <CreditCard size={18} className="md:w-5 md:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm md:text-lg font-black text-white leading-tight mb-1 truncate">Billing Status</p>
                                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest ${userData.hasPaid ? 'text-emerald-500' : 'text-red-500'} truncate`}>
                                    {userData.hasPaid ? 'PAID // ALL ACCESS' : 'PENDING // ACTION'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={16} className={`flex-shrink-0 ml-2 group-hover:translate-x-1 transition-all ${userData.hasPaid ? 'text-emerald-500' : 'text-red-500'}`} />
                    </motion.div>
                </div>

                {/* --- RIGHT CONTENT --- */}
                <div className="lg:col-span-8 space-y-8 md:space-y-10">
                    <motion.div variants={itemVariants}>
                        <AnimatedBorderCard className="!rounded-[2rem] md:rounded-[2.5rem]">
                            <div className="flex items-center gap-6 md:gap-8 mb-8 md:mb-12">
                                <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[1.8rem] flex items-center justify-center text-emerald-400 shadow-xl relative overflow-hidden group/icon">
                                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                    <Fingerprint size={32} strokeWidth={1.5} className="relative z-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">PERSONAL INFO</h3>
                                    <p className="text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mt-2 opacity-70">Verified Profile Details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-8 md:gap-y-10">
                                {[
                                    { label: "Full Name", value: userData.name, icon: User },
                                    { label: "College Email", value: userData.email, icon: Mail },
                                    { label: "Phone Number", value: userData.phone || 'NOT LINKED', icon: Phone },
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
                                    <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">COLLEGE INFO</h3>
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
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-6 md:mb-16">
                                <div className="flex items-center gap-6 md:gap-8">
                                    <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[1.8rem] flex items-center justify-center text-emerald-400 shadow-xl relative overflow-hidden group/icon">
                                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                        <BookOpen size={32} strokeWidth={1.5} className="relative z-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">MY EVENTS</h3>
                                        <p className="text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mt-2 opacity-70">Participated Events for 2026</p>
                                    </div>
                                </div>

                                <div className="px-5 md:px-7 py-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl flex items-center gap-6 md:gap-8">
                                    <p className="text-3xl md:text-5xl font-bold text-white leading-none bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        <CountUp end={userData.registeredEvents?.length || 0} />
                                    </p>
                                    <div className="w-px h-6 md:h-10 bg-white/10" />
                                    <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase leading-tight tracking-widest">Confirmed<br />Sessions</p>
                                </div>
                            </div>

                            {!userData.registeredEvents?.length ? (
                                <div className="py-20 md:py-28 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl bg-white/[0.01] transition-all duration-700 hover:border-emerald-500/20 group/empty">
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
                                    {userData.registeredEvents.map((registration, idx) => (
                                        <motion.div
                                            whileHover={{ y: -5, scale: 1.01 }}
                                            key={idx}
                                            className="p-8 md:p-10 bg-[#0c101a] border border-white/10 rounded-2xl md:rounded-3xl transition-all duration-500 relative overflow-hidden group/event shadow-2xl"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] opacity-0 group-hover/event:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-between mb-8 relative z-10">
                                                <div className="w-12 md:w-14 h-12 md:h-14 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                                    <Award size={26} />
                                                </div>
                                                <span className="px-4 py-1.5 bg-cyan-400/10 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-cyan-500/20 italic">LIVE</span>
                                            </div>
                                            <h4 className="text-lg md:text-2xl font-bold text-white uppercase mb-8 leading-tight tracking-tight pr-4">
                                                {missions.find((mission) => mission.id === registration.eventId)?.title || 'Unknown Event'}
                                            </h4>
                                            <div className="pt-6 md:pt-8 border-t border-white/5 space-y-4 relative z-10 mt-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest">Team Unit</span>
                                                    <span className="text-[10px] md:text-xs font-bold text-white hover:text-emerald-400 transition-colors uppercase">{registration.teamName}</span>
                                                </div>
                                                <button
                                                    onClick={() => fetchRegistrationDetails(registration.id)}
                                                    disabled={isLoadingDetails}
                                                    className="w-full py-4 mt-8 bg-emerald-500 text-black font-black uppercase text-[10px] md:text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg disabled:opacity-50"
                                                >
                                                    <Eye size={16} />
                                                    {isLoadingDetails ? 'Loading...' : 'View Details'}
                                                </button>
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

            <AnimatePresence>
                {activeModal && (
                    <div className="fixed top-0 inset-0 z-[20000] flex items-center justify-center p-4 h-[100dvh] w-screen overflow-hidden">
                        {/* Stronger Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="absolute inset-0 bg-black/90 cursor-pointer backdrop-blur-[4px] md:backdrop-blur-[12px]"
                        />

                        {/* Centered Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg p-[1px] rounded-[1.5rem] md:rounded-[2rem] mx-auto z-10 shadow-2xl flex flex-col max-h-[min(85dvh,calc(100vh-3rem))] overflow-hidden"
                        >
                            {/* Mobile Modal Glass Wrapper */}
                            <div className="relative glass-modal rounded-[1.45rem] shadow-2xl flex flex-col overflow-hidden h-full">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none" />

                                <div className="flex justify-between items-center p-4 md:p-6 pb-4 relative z-10 flex-shrink-0">
                                    <h3 className="text-lg md:text-xl font-black uppercase italic text-white flex items-center gap-3">
                                        {activeModal === 'settings' && <><Settings size={18} className="text-emerald-400" /> Personalization</>}
                                        {activeModal === 'qr' && <><QrCode size={18} className="text-emerald-400" /> Digital Pass</>}
                                        {activeModal === 'scanner' && <><LayoutDashboard size={18} className="text-emerald-400" /> Scanner</>}
                                        {activeModal === 'editProfile' && <><Edit3 size={18} className="text-emerald-400" /> Update Hub</>}
                                        {activeModal === 'registrationDetails' && <><Award size={18} className="text-emerald-400" /> Registration Details</>}
                                        {activeModal === 'payment' && <><CreditCard size={18} className="text-emerald-400" /> Payment Options</​>}
                                    </h3>
                                    <button
                                        onClick={() => setActiveModal(null)}
                                        className="p-3 bg-white/5 hover:bg-emerald-500/10 rounded-full text-slate-400 hover:text-emerald-400 transition-all active:scale-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div
                                    className="space-y-6 overflow-y-scroll custom-scrollbar p-4 md:p-6 pt-0 flex-1"
                                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
                                    data-lenis-prevent
                                    data-lenis-prevent-wheel
                                    data-lenis-prevent-touch
                                >
                                    {activeModal === 'settings' && (
                                        <div className="text-center space-y-6">
                                            <div className="relative group/avatar-edit mx-auto justify-center flex">
                                                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/20 shadow-2xl relative bg-[#05060a]">
                                                    {isRegenerating && (
                                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                    <Image
                                                        src={userData.avatar || ANIME_AVATARS[0].src}
                                                        alt="Avatar"
                                                        unoptimized
                                                        fill
                                                        sizes="128px"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-black text-white uppercase italic">Choose Your Character</p>
                                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                    Select a fun avatar for the festival.
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-4 gap-2 md:gap-3">
                                                    {ANIME_AVATARS.map((avatar) => (
                                                        <button
                                                            key={avatar.id}
                                                            disabled={isRegenerating}
                                                            onClick={async () => {
                                                                setIsRegenerating(true)
                                                                try {
                                                                    await updateAvatar(avatar.src)
                                                                } finally {
                                                                    setIsRegenerating(false)
                                                                }
                                                            }}
                                                            className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-white/40 transition-all active:scale-95"
                                                        >
                                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${avatar.color}`} />
                                                            <Image
                                                                src={avatar.src}
                                                                alt={avatar.name}
                                                                unoptimized
                                                                fill
                                                                sizes="100px"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {userData.avatar === avatar.src && (
                                                                <div className="absolute inset-0 ring-2 ring-emerald-500 ring-offset-2 ring-offset-black rounded-2xl" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-mono tracking-widest text-center pt-2">Tap to equip signature avatar set</p>
                                            </div>


                                        </div>
                                    )}

                                    {activeModal === 'qr' && (
                                        <div className="text-center space-y-6 flex flex-col items-center">
                                            {/* --- RECEIPT / TICKET STYLE PASS --- */}
                                            <div className="relative mx-auto w-full max-w-[320px] perspective-1000 animate-in fade-in zoom-in-95 duration-500">
                                                <div id="printable-receipt" className="bg-white text-black p-8 shadow-2xl relative overflow-hidden flex flex-col items-center"
                                                    style={{
                                                        clipPath: 'polygon(0 0, 100% 0, 100% 95%, 98% 97%, 95% 95%, 92% 97%, 89% 95%, 86% 97%, 83% 95%, 80% 97%, 77% 95%, 74% 97%, 71% 95%, 68% 97%, 65% 95%, 62% 97%, 59% 95%, 56% 97%, 53% 95%, 50% 97%, 47% 95%, 43% 97%, 40% 95%, 37% 97%, 34% 95%, 31% 97%, 28% 95%, 25% 97%, 22% 95%, 19% 97%, 16% 95%, 13% 97%, 10% 95%, 7% 97%, 4% 95%, 2% 97%, 0 95%)'
                                                    }}>

                                                    {/* Internal Watermark */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-[-35deg]">
                                                        <span className="text-5xl font-black">OFFICIAL PASS</span>
                                                    </div>

                                                    {/* User Segment */}
                                                    <div className="w-full border-b-2 border-dashed border-gray-300 pb-5 mb-6 flex flex-col items-center">
                                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 mb-3 shadow-lg ring-4 ring-emerald-500/10">
                                                            <img src={userData.avatar || ANIME_AVATARS[0].src} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <h4 className="text-xl font-black tracking-tighter uppercase leading-none">{userData.name}</h4>
                                                        <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] mt-2 italic">DIGITAL ACCESS TOKEN</p>
                                                    </div>

                                                    {/* QR Code Segment */}
                                                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 shadow-inner mb-6 relative group">
                                                        {qrDataUrl ? (
                                                            <Image
                                                                src={qrDataUrl}
                                                                alt="Entry Pass QR"
                                                                width={200}
                                                                height={200}
                                                                unoptimized
                                                                className="w-40 h-40 group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-40 h-40 flex items-center justify-center">
                                                                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ID Info */}
                                                    <div className="w-full space-y-3 mb-6">
                                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                                            <span className="text-gray-400 uppercase tracking-widest">Entry Code:</span>
                                                            <span className="text-emerald-600 font-mono text-xs">{userData.profileCode}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                                            <span className="text-gray-400 uppercase tracking-widest">Phone:</span>
                                                            <span className="text-black">{userData.phone || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                                            <span className="text-gray-400 uppercase tracking-widest">Type:</span>
                                                            <span className="text-black uppercase">{userData.studentType}</span>
                                                        </div>
                                                    </div>

                                                    {/* Status Banner */}
                                                    <div className="w-full py-3 border-t border-dashed border-gray-300 flex flex-col items-center">
                                                        <div className={`
                                                            text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-lg border-2 mb-1
                                                            ${userData.hasPaid ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-600'}
                                                        `}>
                                                            {userData.hasPaid ? 'PAYMENT VERIFIED' : 'PAYMENT PENDING'}
                                                        </div>
                                                        <p className="text-[7px] text-gray-400 uppercase font-black tracking-widest pt-1">
                                                            Varnothsava 2026 // Secure Node ID {userData.profileCode.split('').reverse().join('')}
                                                        </p>
                                                    </div>

                                                    <div className="h-6" /> {/* Edge padding */}
                                                </div>
                                            </div>

                                            <div className="flex gap-4 w-full max-w-[320px]">
                                                <button
                                                    onClick={() => window.print()}
                                                    className="flex-1 py-4 bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/20 transition-all active:scale-95 border border-white/5"
                                                >
                                                    Save Pass
                                                </button>
                                                <button
                                                    onClick={() => setActiveModal(null)}
                                                    className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeModal === 'scanner' && (
                                        <QrScanner onClose={() => setActiveModal(null)} />
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
                                                {/* Added Large Avatar Preview for Consistency */}
                                                <div className="relative group/avatar-edit mx-auto mb-6">
                                                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-emerald-500/20 shadow-2xl relative bg-[#05060a] mx-auto">
                                                        {isRegenerating && (
                                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                            </div>
                                                        )}
                                                        <Image
                                                            src={userData.avatar}
                                                            alt="Avatar"
                                                            unoptimized
                                                            fill
                                                            sizes="96px"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-6">
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 text-center">Select New Avatar</p>
                                                    <div className="grid grid-cols-4 gap-2 md:gap-3">
                                                        {ANIME_AVATARS.map((avatar) => (
                                                            <button
                                                                key={avatar.id}
                                                                type="button"
                                                                disabled={isRegenerating}
                                                                onClick={async () => {
                                                                    setIsRegenerating(true)
                                                                    try {
                                                                        await updateAvatar(avatar.src)
                                                                    } finally {
                                                                        setIsRegenerating(false)
                                                                    }
                                                                }}
                                                                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-white/40 transition-all active:scale-95"
                                                            >
                                                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${avatar.color}`} />
                                                                <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                                                                {userData.avatar === avatar.src && (
                                                                    <div className="absolute inset-0 ring-2 ring-emerald-500 ring-offset-2 ring-offset-black rounded-2xl" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
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

                                    {activeModal === 'registrationDetails' && selectedRegistration && (
                                        <div className="space-y-6">
                                            {/* Event Banner */}
                                            <div className="relative h-32 rounded-2xl overflow-hidden">
                                                <Image
                                                    src={selectedRegistration.eventVisual}
                                                    alt={selectedRegistration.eventName}
                                                    fill
                                                    className="object-cover opacity-40"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-[#08090f]/80 to-transparent" />
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">
                                                        {selectedRegistration.eventName}
                                                    </h4>
                                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">
                                                        {selectedRegistration.eventCategory}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Registration Info */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Team Name</p>
                                                    <p className="text-sm font-bold text-white truncate">{selectedRegistration.teamName}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Team Type</p>
                                                    <p className="text-sm font-bold text-emerald-400">{selectedRegistration.teamType}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Members</p>
                                                    <p className="text-sm font-bold text-white">{selectedRegistration.memberCount}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Registered</p>
                                                    <p className="text-sm font-bold text-white">
                                                        {new Date(selectedRegistration.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Team Members */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Users size={16} className="text-emerald-400" />
                                                    <h5 className="text-sm font-black uppercase text-white tracking-widest">Team Members</h5>
                                                </div>
                                                <div className="space-y-3">
                                                    {selectedRegistration.members.map((member: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/20 transition-all">
                                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                                                <Image
                                                                    src={member.avatar}
                                                                    alt={member.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="object-cover"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-white truncate">{member.name}</p>
                                                                <p className="text-[10px] text-slate-500 font-medium">{member.profileCode}</p>
                                                            </div>
                                                            {member.isLeader && (
                                                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                                                    Leader
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => {
                                                        setActiveModal(null)
                                                        router.push(`/events/${selectedRegistration.eventId}`)
                                                    }}
                                                    className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg"
                                                >
                                                    View Event
                                                </button>
                                                <button
                                                    onClick={() => setActiveModal(null)}
                                                    className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all active:scale-95"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeModal === 'payment' && (
                                        <div className="space-y-6">
                                            <div className="text-center space-y-4">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                                                    <CreditCard size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-white uppercase italic">Choose Payment Method</h4>
                                                    <p className="text-xs text-slate-400 font-medium mt-2">Select how you'd like to complete your registration</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Pay Using QR Option */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 242, 255, 0.1)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => router.push('/qr-payment')}
                                                    className="w-full p-6 bg-white/5 border border-cyan-500/20 rounded-2xl hover:border-cyan-500/40 transition-all flex items-center gap-4 group/payment active:scale-95"
                                                >
                                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover/payment:bg-cyan-500/20 transition-all">
                                                        <QrCode size={24} />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="text-sm md:text-base font-black text-white uppercase tracking-tight">Pay Using QR</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Scan Payment Code</p>
                                                    </div>
                                                    <ChevronRight size={18} className="text-cyan-500 group-hover/payment:translate-x-1 transition-transform" />
                                                </motion.button>

                                                {/* Payment Gateway Option */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setActiveModal(null)
                                                        router.push('/notify')
                                                    }}
                                                    className="w-full p-6 bg-white/5 border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-all flex items-center gap-4 group/payment active:scale-95"
                                                >
                                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover/payment:bg-emerald-500/20 transition-all">
                                                        <Globe size={24} />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="text-sm md:text-base font-black text-white uppercase tracking-tight">Payment Gateway</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Coming Soon • Secure Online</p>
                                                    </div>
                                                    <ChevronRight size={18} className="text-emerald-500 group-hover/payment:translate-x-1 transition-transform" />
                                                </motion.button>
                                            </div>

                                            <button
                                                onClick={() => setActiveModal(null)}
                                                className="w-full py-3 bg-white/5 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/10"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                )
                }
            </AnimatePresence >

            <style jsx global>{`
                body {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(16, 185, 129, 0.2) transparent;
                }
                
                /* Hide bottom navbar when modal is open */
                body.modal-open .innovative-navbar {
                    opacity: 0;
                    pointer-events: none;
                    transform: translateY(100px);
                }
                
                /* Custom scrollbar for modal */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.3);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.5);
                }
            `}</style>
        </div >
    )
}
