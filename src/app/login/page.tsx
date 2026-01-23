'use client'

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Rocket, ArrowRight, Shield, Globe, Cpu, User, School, Search, Upload, CheckCircle2, ChevronDown, Camera, X, Phone, Zap } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useRouter, useSearchParams } from 'next/navigation'
import GridScan from '@/components/ui/GridScan'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import ElectricBorder from '@/components/ui/ElectricBorder'
import { createUserWithEmail, loginWithEmail, loginWithGoogle, onUserSignedIn } from '@/lib/firebaseClient'
import { NetworkPoints } from '@/components/ui/NeuralNetworkBackground'

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

function StudentPortalSphere() {
    const meshRef = useRef<THREE.Mesh>(null)
    const innerRef = useRef<THREE.Mesh>(null)
    const pointsRef = useRef<THREE.Points>(null)
    const { mouse } = useThree()

    useFrame((state) => {
        if (!meshRef.current || !pointsRef.current || !innerRef.current) return
        const t = state.clock.getElapsedTime()
        meshRef.current.rotation.y = t * 0.2
        innerRef.current.rotation.y = -t * 0.4
        pointsRef.current.rotation.y = -t * 0.15

        meshRef.current.position.x += (mouse.x * 2 - meshRef.current.position.x) * 0.05
        meshRef.current.position.y += (mouse.y * 2 - meshRef.current.position.y) * 0.05
        pointsRef.current.position.copy(meshRef.current.position)
        innerRef.current.position.copy(meshRef.current.position)
    })

    return (
        <group>
            {/* Outer Wireframe */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <meshStandardMaterial
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={2}
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>
            {/* Inner Core */}
            <mesh ref={innerRef}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshStandardMaterial
                    color="#34d399"
                    emissive="#10b981"
                    emissiveIntensity={4}
                    transparent
                    opacity={0.6}
                />
            </mesh>
            <points ref={pointsRef}>
                <sphereGeometry args={[4.2, 64, 64]} />
                <pointsMaterial
                    size={0.035}
                    color="#10b981"
                    transparent
                    opacity={0.4}
                    sizeAttenuation
                />
            </points>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={3} color="#10b981" />
            <pointLight position={[-10, -10, -10]} intensity={1.5} color="#3b82f6" />
        </group>
    )
}

import Lottie from 'lottie-react'

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-[#050b14]" />}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const { needsOnboarding, registerUser, isLoggedIn, mountUser, login, isInitializing, userData } = useApp()
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [isRegister, setIsRegister] = useState(false)

    // Form States
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [usn, setUsn] = useState('')
    const [age, setAge] = useState('')
    const [phone, setPhone] = useState('')
    const [gender, setGender] = useState('Male')
    const [college, setCollege] = useState('')
    const [otherCollege, setOtherCollege] = useState('')
    const [idCardPreview, setIdCardPreview] = useState('')

    // Dropdown helpers
    const [collegeSearch, setCollegeSearch] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Auto-select college for internal users
    useEffect(() => {
        if (email.endsWith('@sode-edu.in')) {
            setCollege("Shri Madhwa Vadiraja Institute of Technology & Management (SMVITM), Bantakal, Udupi")
        }
    }, [email])

    // Handle authentication state changes
    useEffect(() => {
        // Only redirect if fully initialized and logged in with complete profile
        if (!isInitializing && isLoggedIn && !needsOnboarding && userData) {
            router.push('/profile')
        }
        // If needs onboarding, show step 2
        if (!isInitializing && needsOnboarding) {
            setStep(2)
        }
    }, [isLoggedIn, needsOnboarding, isInitializing, userData, router])

    const filteredColleges = useMemo(() => COLLEGES.filter(c =>
        c.toLowerCase().includes(collegeSearch.toLowerCase())
    ), [collegeSearch])

    const handleSubmitStep1 = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLoading) return
        setIsLoading(true)
        if (isRegister) {
            try {
                await createUserWithEmail(email, password)
                setStep(2)
            } catch (error: any) {
                alert(error.message || "An error occurred during registration.")
            } finally {
                setIsLoading(false)
            }
        } else {
            try {
                await login(email, password)
                router.push('/profile')
            } catch (error: any) {
                console.error("Login failed:", error)
                setIsLoading(false)
            }
        }
    }

    const handleGoogleLoginStep1 = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            const user = await loginWithGoogle()
            if (needsOnboarding) {
                setStep(2)
                setEmail(user.email || '')
                setName(user.displayName || '')
            } else {
                router.push('/profile')
            }
        } catch (error: any) {
            console.error("Google login failed:", error)
            if (error.code === 'auth/popup-blocked') {
                alert("The login popup was blocked by your browser. Please allow popups for this site and try again.")
            } else if (error.code === 'auth/cancelled-popup-request') {
                console.log("Popup request cancelled.")
            } else {
                alert("Google login failed: " + error.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setIdCardPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLoading) return
        setIsLoading(true)
        const finalCollege = college === 'Other' ? otherCollege : college
        try {
            // Only send required fields - email comes from Firebase token
            await registerUser({
                name,
                usn,
                collegeName: finalCollege,
                phone,
            })
            router.push('/profile')
        } catch (error: any) {
            console.error("Registration failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isInitializing) {
        return (
            <div className="h-screen w-full bg-[#050b14] flex items-center justify-center">
                <GridScan />
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-emerald-500 font-medium text-sm tracking-widest uppercase animate-pulse">Setting things up...</p>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen w-full bg-[#050b14] text-white relative flex items-center justify-center py-10 md:py-20 overflow-x-hidden root-container">
            {/* LIVELY STARFIELD BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[#050b14]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#0c1a2e_0%,#050b14_100%)]" />

                {/* Stars and Soft Nebula */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                        <StarsBackground />
                    </Canvas>
                </div>

                {/* Soft Nebula Drifts */}
                <motion.div
                    animate={{
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)] blur-3xl"
                />
            </div>

            <div className="relative z-10 w-full max-w-6xl px-6 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 xl:gap-20">

                {/* LEFT CONTENT: Friendly Branding */}
                <div className="lg:w-[45%] space-y-10 hidden lg:block">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* 3D Visual - Softer Sphere */}
                        <div className="w-[300px] h-[300px] xl:w-[380px] xl:h-[380px] relative mb-12">
                            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                                <ambientLight intensity={1.5} />
                                <pointLight position={[10, 10, 10]} intensity={2} color="#10b981" />
                                <StudentPortalSphere />
                            </Canvas>
                            <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] rounded-full -z-10" />
                        </div>

                        <h1 className="text-display font-bold tracking-tight leading-tight gpu-accel">
                            Varnothsava<br />
                            <span className="text-emerald-500 font-extrabold italic">Fest Hub.</span>
                        </h1>
                        <p className="mt-6 text-lg xl:text-xl text-white/70 font-medium leading-relaxed max-w-sm">
                            Join the celebration at the official college fest hub.
                            Stay updated and manage your events easily.
                        </p>
                    </motion.div>

                    <div className="flex items-center gap-6 pt-10 border-t border-white/5">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-11 h-11 rounded-full border-2 border-[#050b14] bg-emerald-900/30 backdrop-blur-md" />
                            ))}
                        </div>
                        <p className="text-sm text-white/70 font-semibold tracking-wide uppercase">Join 2,500+ attendees</p>
                    </div>
                </div>

                {/* RIGHT CONTENT: Professional Card */}
                <div className="w-full lg:w-[48%] max-w-[480px] gpu-accel">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0c1420]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 xl:p-14 shadow-2xl relative"
                    >
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-2 text-center lg:text-left">
                                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                            {isRegister ? 'Sign Up' : 'Welcome Back'}
                                        </h2>
                                        <p className="text-white/75 font-medium text-xs sm:text-sm">
                                            {isRegister ? 'Join the fest today.' : 'Login to your fest dashboard.'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleGoogleLoginStep1}
                                        disabled={isLoading}
                                        className="w-full min-h-[50px] md:min-h-[56px] flex items-center justify-center gap-3 bg-white text-black hover:bg-white/90 rounded-2xl text-[12px] md:text-[13px] font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover-effect"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <span>Connecting...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <GoogleIcon />
                                                <span>Continue with Google</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">or Email</span>
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                    </div>

                                    <form onSubmit={handleSubmitStep1} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-white/80 ml-1">Email Address</label>
                                            <input
                                                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@university.edu"
                                                className="w-full bg-white/[0.05] border border-white/20 rounded-2xl px-6 py-5 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-white/30 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-white/80 ml-1">Password</label>
                                            <input
                                                required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full bg-white/[0.05] border border-white/20 rounded-2xl px-6 py-5 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-white/30 text-white"
                                            />
                                        </div>

                                        <button
                                            disabled={isLoading}
                                            className="w-full min-h-[50px] md:min-h-[56px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-[13px] md:text-[14px] transition-all shadow-xl mt-4 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 hover-effect"
                                        >
                                            {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                            {isRegister ? 'Create Account' : 'Login'}
                                        </button>
                                    </form>

                                    <div className="text-center">
                                        <button onClick={() => setIsRegister(!isRegister)} className="text-sm font-bold text-white/70 hover:text-emerald-500 transition-colors underline decoration-emerald-500/0 hover:decoration-emerald-500 underline-offset-4">
                                            {isRegister ? 'Already have an account? Sign In' : "New attendee? Create Account"}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="onboarding"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"
                                >
                                    <div className="space-y-2 text-center lg:text-left">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-3xl font-bold tracking-tight">About You</h2>
                                            {email.endsWith('@sode-edu.in') ? (
                                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Internal Student</span>
                                                </div>
                                            ) : email && (
                                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5 text-white/40" />
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">External Student</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-white/75 font-medium text-sm">Awesome! Let's get your fest pass ready with a few details.</p>
                                    </div>

                                    <form onSubmit={handleFinalSubmit} className="space-y-5">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-white/80 ml-1">Full Name</label>
                                                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-white/[0.05] border border-white/20 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-white/30 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-white/80 ml-1">USN / Roll Number</label>
                                                <input required type="text" value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="College ID / USN" className="w-full bg-white/[0.05] border border-white/20 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-white/30 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-white/80 ml-1">College</label>
                                                <div className="relative">
                                                    <select
                                                        required
                                                        value={college}
                                                        onChange={(e) => setCollege(e.target.value)}
                                                        disabled={email.endsWith('@sode-edu.in')}
                                                        className={`w-full bg-white/[0.05] border border-white/20 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer text-white ${email.endsWith('@sode-edu.in') ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="" disabled className="bg-[#0c1420]">Select Institution</option>
                                                        {COLLEGES.map(c => <option key={c} value={c} className="bg-[#0c1420] text-white">{c}</option>)}
                                                    </select>
                                                    {!email.endsWith('@sode-edu.in') && <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />}
                                                </div>
                                                {email.endsWith('@sode-edu.in') && (
                                                    <p className="text-[10px] text-emerald-400 ml-1 font-medium">Verified student domain detected.</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-white/80 ml-1">Phone Number</label>
                                                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXX-XXX-XXXX" className="w-full bg-white/[0.05] border border-white/20 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-white/30 text-white" />
                                            </div>
                                        </div>

                                        <button
                                            disabled={isLoading}
                                            className="w-full min-h-[56px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50 hover-effect"
                                        >
                                            {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                                            Finish Hub Setup
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.2); border-radius: 10px; }
            `}</style>
        </main>
    )
}

function StarsBackground() {
    const starsRef = useRef<THREE.Points>(null)
    const [starCount] = useState(2500)

    // Create random stars
    const [positions, sizes] = useMemo(() => {
        const pos = new Float32Array(starCount * 3)
        const sz = new Float32Array(starCount)
        for (let i = 0; i < starCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 60
            pos[i * 3 + 1] = (Math.random() - 0.5) * 60
            pos[i * 3 + 2] = (Math.random() - 0.5) * 30
            sz[i] = Math.random() * 0.1 + 0.05
        }
        return [pos, sz]
    }, [starCount])

    useFrame((state) => {
        if (!starsRef.current) return
        starsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02
        starsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1
    })

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#ffffff"
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
