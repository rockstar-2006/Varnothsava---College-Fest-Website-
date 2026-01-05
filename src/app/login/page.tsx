'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Rocket, ArrowRight, Shield, Globe, Cpu, User, School, Search, Upload, CheckCircle2, ChevronDown, Camera, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import GridScan from '@/components/ui/GridScan'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// --- COLLEGES DATA ---
const COLLEGES = [
    "Nitte Mahalinga Adyanthaya Memorial Institute of Technology (NMAMIT), Nitte, Udupi",
    "Moodlakatte Institute of Technology, Kundapura",
    "Shri Madhwa Vadiraja Institute of Technology & Management (SMVITM), Bantakal, Udupi",
    "Manipal Institute of Technology (MIT), Manipal",
    "Bearys Institute of Technology, Mangaluru",
    "Canara Engineering College, Bantwal",
    "Sahyadri College of Engineering & Management, Mangaluru",
    "Srinivas Institute of Technology, Mangaluru",
    "Yenepoya Institute of Technology, Moodabidri",
    "Vivekananda College of Engineering & Technology (VCET), Puttur",
    "B.M.S. College of Engineering, Bengaluru",
    "B.N.M. Institute of Technology, Bengaluru",
    "Bangalore Institute of Technology, Bengaluru",
    "Brindavan College of Engineering & Technology, Bengaluru",
    "City Engineering College, Bengaluru",
    "CMR Institute of Technology, Bengaluru",
    "Dayananda Sagar College of Engineering, Bengaluru",
    "Don Bosco Institute of Technology, Bengaluru",
    "Dr. Ambedkar Institute of Technology, Bengaluru",
    "H.K.B.K. College of Engineering, Bengaluru",
    "Indian Institute of Science (IISc), Bangalore",
    "International Institute of Information Technology, Bangalore (IIIT-B)",
    "New Horizon College of Engineering, Bengaluru",
    "PES University (Engineering), Bengaluru",
    "R.V. College of Engineering, Bengaluru",
    "Sapthagiri College of Engineering, Bengaluru",
    "SJB Institute of Technology, Bengaluru",
    "Sri Revana Siddeshwara Institute of Technology, Bengaluru",
    "Sri Venkateshwara College of Engineering, Bengaluru",
    "Vemana Institute of Technology, Bengaluru",
    "Other"
]

const GoogleIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
)

// --- 3D DECORATION ---
function NetworkPoints() {
    const count = 40
    const meshRef = useRef<THREE.Points>(null)
    const { mouse } = useThree()

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10
            velocities[i * 3] = (Math.random() - 0.5) * 0.015
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.015
        }
        return { positions, velocities }
    }, [count])

    useFrame(() => {
        if (!meshRef.current) return
        const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < count; i++) {
            posAttr.setXYZ(i,
                posAttr.getX(i) + particles.velocities[i * 3] + mouse.x * 0.002,
                posAttr.getY(i) + particles.velocities[i * 3 + 1] + mouse.y * 0.002,
                posAttr.getZ(i) + particles.velocities[i * 3 + 2]
            )
            if (Math.abs(posAttr.getX(i)) > 5) particles.velocities[i * 3] *= -1
            if (Math.abs(posAttr.getY(i)) > 5) particles.velocities[i * 3 + 1] *= -1
            if (Math.abs(posAttr.getZ(i)) > 5) particles.velocities[i * 3 + 2] *= -1
        }
        posAttr.needsUpdate = true
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.15} color="#6366f1" transparent opacity={0.6} sizeAttenuation />
        </points>
    )
}

import ElectricBorder from '@/components/ui/ElectricBorder'

export default function LoginPage() {
    const { login, registerUser, isLoggedIn } = useApp()
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Entry, 2: Complete Profile
    const [isRegister, setIsRegister] = useState(false)

    // Form States
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [usn, setUsn] = useState('')
    const [college, setCollege] = useState('')
    const [otherCollege, setOtherCollege] = useState('')
    const [idCardPreview, setIdCardPreview] = useState<string | null>(null)

    // Dropdown helpers
    const [collegeSearch, setCollegeSearch] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    useEffect(() => {
        if (isLoggedIn) {
            router.push('/events')
        }
    }, [isLoggedIn, router])

    const filteredColleges = COLLEGES.filter(c =>
        c.toLowerCase().includes(collegeSearch.toLowerCase())
    )

    const handleSubmitStep1 = (e: React.FormEvent) => {
        e.preventDefault()
        if (isRegister) {
            setStep(2)
        } else {
            login(email, password)
        }
    }

    const handleGoogleLoginStep1 = () => {
        // Mock Google Verification -> Move to details
        setStep(2)
        setEmail('operator@global.node') // Pre-filled from "Google"
        setName('NODE_OPERATOR')
    }

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const finalCollege = college === 'Other' ? otherCollege : college
        registerUser({
            name,
            email,
            password: password || 'oauth_encrypted_session',
            usn,
            collegeName: finalCollege,
            age: '18',
            phone: 'PENDING',
            idCardUrl: idCardPreview || undefined
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setIdCardPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    if (isLoggedIn) return null

    return (
        <main className="min-h-screen bg-black text-white relative flex flex-col items-center pt-32 pb-12 px-4 md:px-8 overflow-y-auto">
            <div className="fixed inset-0 z-0 opacity-100">
                <GridScan
                    sensitivity={0.55}
                    lineThickness={1}
                    linesColor="#392e4e"
                    gridScale={0.1}
                    scanColor="#818cf8"
                    scanOpacity={0.4}
                    enablePost
                    bloomIntensity={0.6}
                    chromaticAberration={0.002}
                    noiseIntensity={0.01}
                    scanOnClick={true}
                    enableGyro={true}
                />
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="relative z-10 w-full max-w-[460px]"
                    >
                        <ElectricBorder
                            color="#818cf8"
                            speed={1.2}
                            chaos={0.25}
                            borderRadius={40}
                        >
                            <div className="bg-[#050805]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                                <div className="text-center mb-10">
                                    <motion.div
                                        className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 relative"
                                    >
                                        <Rocket className="w-10 h-10 text-indigo-400 font-bold" />
                                    </motion.div>
                                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-white">
                                        {isRegister ? 'Register' : 'Login'}
                                    </h1>
                                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">Student Access Portal</p>
                                </div>

                                <button
                                    onClick={handleGoogleLoginStep1}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group text-white"
                                >
                                    <GoogleIcon />
                                    <span>Continue with Google</span>
                                </button>

                                <div className="flex items-center gap-4 py-6">
                                    <div className="h-[1px] flex-1 bg-white/10" />
                                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-none">or use credentials</span>
                                    <div className="h-[1px] flex-1 bg-white/10" />
                                </div>

                                <form onSubmit={handleSubmitStep1} className="space-y-5">
                                    <div className="space-y-2 group">
                                        <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-2">Email Identity</label>
                                        <div className="relative">
                                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="USER@STATION.COM"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-black focus:border-indigo-500/50 outline-none transition-all uppercase placeholder:text-white/20 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-2">Secure Passkey</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                required
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-black focus:border-indigo-500/50 outline-none transition-all text-white placeholder:text-white/20"
                                            />
                                        </div>
                                    </div>

                                    <button className="w-full py-5 bg-indigo-500 text-white font-black uppercase text-[12px] tracking-[0.3em] hover:bg-indigo-400 transition-all rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.3)] mt-6 flex items-center justify-center gap-2 active:scale-[0.98]">
                                        {isRegister ? 'Next Step' : 'Authorize Entrance'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => setIsRegister(!isRegister)}
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 hover:text-indigo-400 border-b border-indigo-400/20 pb-1"
                                    >
                                        {isRegister ? 'Already registered? Synchronize' : 'New student? Establish Identity'}
                                    </button>
                                </div>
                            </div>
                        </ElectricBorder>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.98 }}
                        className="relative z-10 w-full max-w-5xl"
                    >
                        <ElectricBorder
                            color="#818cf8"
                            speed={1}
                            chaos={0.2}
                            borderRadius={48}
                        >
                            <div className="flex flex-col lg:flex-row bg-[#050805]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                                {/* 3D Visual Sector */}
                                <div className="lg:w-2/5 p-8 lg:p-12 relative border-b lg:border-b-0 lg:border-r border-white/10 bg-emerald-500/5 flex flex-col justify-between overflow-hidden min-h-[300px]">
                                    <div className="absolute inset-0 z-0 opacity-60">
                                        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
                                            <ambientLight intensity={0.5} />
                                            <NetworkPoints />
                                        </Canvas>
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                                            <Cpu className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-white">
                                            Finalizing<br /><span className="text-indigo-500">Node Sync</span>
                                        </h2>
                                        <p className="text-[11px] text-white/50 font-black uppercase tracking-[0.2em] leading-relaxed max-w-[280px]">
                                            Establishing unique network identifier across the Varnothsava grid.
                                        </p>
                                    </div>

                                    <div className="relative z-10 flex items-center gap-4 pt-8">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050805] bg-indigo-500/30 ring-1 ring-indigo-500/20" />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                                            Joining 2,500+ Nodes
                                        </span>
                                    </div>
                                </div>

                                {/* Form Sector */}
                                <div className="lg:w-3/5 p-8 lg:p-16 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[12px] font-black text-indigo-500/80 uppercase tracking-[0.4em]">Sector: Profile Completion</h3>
                                        <button onClick={() => setStep(1)} className="text-[11px] font-black text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2 group transition-colors">
                                            <X className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" /> Back
                                        </button>
                                    </div>

                                    <form onSubmit={handleFinalSubmit} className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Name */}
                                            <div className="space-y-3 group">
                                                <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-indigo-400" /> Full Identity Name
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="OPERATOR NAME"
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black tracking-widest focus:border-indigo-500/50 outline-none transition-all uppercase text-white placeholder:text-white/10"
                                                />
                                            </div>
                                            {/* USN */}
                                            <div className="space-y-3 group">
                                                <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Serial Code (USN)
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={usn}
                                                    onChange={(e) => setUsn(e.target.value)}
                                                    placeholder="4XX00XX000"
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black tracking-widest focus:border-indigo-500/50 outline-none transition-all uppercase text-white placeholder:text-white/10"
                                                />
                                            </div>
                                        </div>

                                        {/* College Searchable Dropdown */}
                                        <div className="space-y-4 relative">
                                            <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <School className="w-3.5 h-3.5 text-indigo-400" /> Node Origin (College)
                                            </label>

                                            <div className="relative group">
                                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-500/40 group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="SEARCH COLLEGE REPOSITORY..."
                                                    value={isDropdownOpen ? collegeSearch : (college || collegeSearch)}
                                                    onFocus={() => { setIsDropdownOpen(true); setCollegeSearch('') }}
                                                    onChange={(e) => { setCollegeSearch(e.target.value); if (!isDropdownOpen) setIsDropdownOpen(true) }}
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-16 pr-14 py-5 text-sm font-black tracking-widest focus:border-indigo-500/50 outline-none transition-all uppercase text-white placeholder:text-white/10"
                                                />
                                                <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/40 transition-transform ${isDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />

                                                {/* Dropdown Menu */}
                                                <AnimatePresence>
                                                    {isDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            className="absolute top-full left-0 right-0 mt-3 bg-[#080c09] border border-white/10 rounded-2xl p-2 z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                                                        >
                                                            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                                                                {filteredColleges.length > 0 ? (
                                                                    filteredColleges.map((c) => (
                                                                        <button
                                                                            key={c}
                                                                            type="button"
                                                                            onClick={() => { setCollege(c); setIsDropdownOpen(false); setCollegeSearch('') }}
                                                                            className="w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-black transition-all rounded-xl flex items-center justify-between group/item"
                                                                        >
                                                                            <span className="max-w-[85%]">{c}</span>
                                                                            {college === c && <CheckCircle2 className="w-4 h-4 text-indigo-400 group-hover/item:text-black" />}
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-6 py-6 text-[11px] text-white/30 font-black uppercase tracking-widest italic text-center">Node mismatch // Use 'Other'</div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Manual "Other" Entry */}
                                            <AnimatePresence>
                                                {college === 'Other' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="pt-2"
                                                    >
                                                        <input
                                                            required
                                                            type="text"
                                                            value={otherCollege}
                                                            onChange={(e) => setOtherCollege(e.target.value)}
                                                            placeholder="SPECIFY UNLISTED COLLEGE"
                                                            className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-2xl px-6 py-4 text-sm font-black tracking-widest focus:border-indigo-400 outline-none transition-all uppercase text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ID Card Upload */}
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Camera className="w-3.5 h-3.5 text-indigo-400" /> ID Card Verification
                                            </label>
                                            <div className="relative group/upload">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="id-upload"
                                                />
                                                <label
                                                    htmlFor="id-upload"
                                                    className={`flex flex-col items-center justify-center gap-6 w-full h-48 border-2 border-dashed transition-all cursor-pointer rounded-[2rem] ${idCardPreview ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-indigo-500/5'}`}
                                                >
                                                    {idCardPreview ? (
                                                        <div className="relative w-full h-full p-2 group/preview">
                                                            <img src={idCardPreview} alt="ID card preview" className="w-full h-full object-contain rounded-[1.5rem]" />
                                                            <div className="absolute inset-0 bg-[#050805]/80 opacity-0 group-hover/preview:opacity-100 flex flex-col items-center justify-center transition-all duration-300 rounded-[1.5rem] gap-2">
                                                                <Upload className="w-6 h-6 text-indigo-400" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Replace Identity Scan</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:bg-indigo-500/10 transition-all duration-500">
                                                                <Upload className="w-7 h-7 text-white/20 group-hover/upload:text-indigo-400" />
                                                            </div>
                                                            <div className="text-center space-y-2">
                                                                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Authorize ID Identification</p>
                                                                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">JPG / PNG / PDF // Max 5MB</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <button className="w-full py-6 bg-indigo-500 text-white font-black uppercase text-sm tracking-[0.5em] hover:bg-indigo-400 hover:scale-[1.01] transition-all rounded-[2rem] shadow-[0_20px_60px_rgba(99,102,241,0.3)] mt-8 flex items-center justify-center gap-4 active:scale-95">
                                            Synchronize Identity
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </ElectricBorder>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
            `}</style>
        </main>
    )
}
