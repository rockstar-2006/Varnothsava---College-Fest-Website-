'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity, useAnimationFrame, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Orbitron } from 'next/font/google' // Import new font
import {
    ArrowRight, MapPin, Mail, Phone,
    Facebook, Instagram, Youtube, Twitter,
    ChevronDown, Plus, Utensils, Gamepad2, Lightbulb, Zap, Activity,
    Sparkles, Star, Users, Trophy, Mic, Music
} from 'lucide-react'
import { TaranaInPixels, OriginalMusic } from '@/components/sections/TaranaSections'

// --- Pro Nite / Band Section Data ---
// --- Pro Nite / Band Section Data ---
const bandMembers = [
    {
        name: "Shreyas B Rao",
        role: "VOCALIST | Founder",
        img: "/img/shreyas_rao.png",
        icon: Mic,
        color: "text-emerald-400",
        desc: "Yede Thumbi Haduvenu Runner-Up. Shared stage with Raghu Dixit, Rajesh Vaidhya, Manju Drums. A powerhouse vocalist with boundless range."
    },
    {
        name: "Aditya Rajaram",
        role: "FLAUTIST",
        img: "/img/aditya_rajaram.png",
        icon: Music,
        color: "text-teal-400",
        desc: "Carnatic Trained with 10+ years of experience. The Show Stealer who invokes deep emotions through his soulful melodies."
    },
    {
        name: "Sujan Rao",
        role: "PERCUSSIONIST / MANAGER",
        img: "/img/sujan_rao.png",
        icon: Zap,
        color: "text-emerald-300",
        desc: "Certified by Trinity College of Music. Completed Junior Exam in Mridangam. A rhythmic force driving the band's pulse."
    },
    {
        name: "Saathvik Raghavendra",
        role: "DRUMMER",
        img: "/img/saathvik.png",
        icon: Sparkles,
        color: "text-teal-300",
        desc: "Certified by Trinity School of London Music. 10+ years experience. Performed alongside maestros like Arun Kumar and Giridar Udupa."
    },
    {
        name: "Harsh Makam",
        role: "BASSIST",
        img: "/img/harsh_makam.png",
        icon: Activity,
        color: "text-green-400",
        desc: "10 years of experience. Renowned for melodic and groove-driven bass lines that stand out in the mix. Not hidden, always heard."
    },
    {
        name: "Shreyas Bharadhwaj",
        role: "GUITARIST",
        img: "/img/shreyas_bharadwaj.png",
        icon: Music,
        color: "text-emerald-500",
        desc: "Self-taught prodigy with 3 years of experience. Tight, precise, and always punctual. Enhances the ensemble with sharp riffs."
    }
]

// --- Solo Leveling / System UI Components ---

const SystemText = ({ children, className = "" }: { children: string, className?: string }) => (
    <div className={`font-[family-name:var(--font-orbitron)] tracking-widest uppercase ${className}`}>
        {children}
    </div>
)

const SystemWindow = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div className="relative bg-[#020a05]/90 border border-emerald-500/50 p-6 rounded-sm shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl group overflow-hidden">
        {/* Tech Borders */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />

        {/* Scanline BG */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

        {title && (
            <div className="absolute top-0 left-0 bg-emerald-600/20 px-4 py-1 border-b border-r border-emerald-500/50">
                <SystemText className="text-[10px] text-emerald-300 font-bold">{title}</SystemText>
            </div>
        )}
        {children}
    </div>
)

// --- 3D Stage Component ---
const ConcertStage = () => {
    return (
        <div className="absolute inset-0 perspective-1000 pointer-events-none overflow-hidden bg-[#020202]">
            {/* Atmospheric Backglow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#020202] to-[#020202]" />

            {/* Realistic Stage Background Image - ANIMATED LIVE FEEL */}
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-40 mix-blend-screen grayscale-[0.5] sm:animate-none"
            >
                <Image
                    src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1740&auto=format&fit=crop"
                    alt="Concert Stage"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
            </motion.div>

            {/* Grid */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] h-[100vh] bg-[linear-gradient(rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:50px_50px] [transform:rotateX(60deg)_translateY(200px)] opacity-50 origin-bottom" />

            {/* Particles */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        </div>
    )
}

const ProNiteSection = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const [activeIndex, setActiveIndex] = useState(-2) // -2: Intro, -1: Group, 0+: Members, -3: Exit

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        // Tighter exit logic to remove gap
        if (latest > 0.98) {
            setActiveIndex(-3) // Exit phase
        } else if (latest < 0.1) {
            setActiveIndex(-2) // "SYSTEM ALERT"
        } else if (latest < 0.2) {
            setActiveIndex(-1) // Group Photo
        } else {
            // Compressed range for artists to finish sooner
            const memberProgress = (latest - 0.2) / 0.78
            const index = Math.floor(memberProgress * bandMembers.length)
            setActiveIndex(Math.min(index, bandMembers.length - 1))
        }
    })

    return (
        <section ref={containerRef} className="relative h-[550vh] bg-[#020202]"> {/* Tighter height */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Background Stage - Fades out on exit */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: activeIndex === -3 ? 0 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <ConcertStage />
                </motion.div>

                <AnimatePresence mode='wait'>
                    {/* --- STAGE -2: SYSTEM ALERT INTRO - GRAND ENTRANCE --- */}
                    {activeIndex === -2 && (
                        <motion.div
                            key="system-intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
                        >
                            <SystemWindow title="PRO NITE // BAND SPOTLIGHT">
                                <div className="p-12 text-center space-y-6 flex flex-col items-center">
                                    <motion.div
                                        animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
                                        className="text-emerald-500 text-7xl font-bold mb-6"
                                    >
                                        <Music />
                                    </motion.div>

                                    {/* GRAND TEXT ANIMATION */}
                                    <div className="overflow-hidden">
                                        <motion.h1
                                            initial={{ y: 100, rotateX: 90 }}
                                            animate={{ y: 0, rotateX: 0 }}
                                            transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
                                            className="text-hero text-white font-[900] glow-text-emerald tracking-tighter leading-none"
                                        >
                                            TARANA BAND
                                        </motion.h1>
                                    </div>

                                    <div className="h-1 w-[200px] bg-emerald-500 animate-pulse my-4" />

                                    <motion.div
                                        initial={{ opacity: 0, letterSpacing: "1em" }}
                                        animate={{ opacity: 1, letterSpacing: "0.2em" }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="text-2xl text-white font-bold uppercase"
                                    >
                                        PRO NITE 2K26
                                    </motion.div>
                                    <p className="text-emerald-500/60 font-mono text-sm tracking-widest mt-2">CLASSICAL ROOTS // ROCK ENERGY</p>
                                </div>
                            </SystemWindow>
                        </motion.div>
                    )}

                    {/* --- STAGE -1: GROUP REVEAL --- */}
                    {activeIndex === -1 && (
                        <motion.div
                            key="group-reveal"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none"
                        >
                            <SystemWindow title="PRO NITE // TARGET: TARANA">
                                <div className="relative w-[90vw] h-[70vh] overflow-hidden rounded-sm border-2 border-emerald-500/30 bg-black group">

                                    {/* NEW: Volumetric Construction + Stat Radar */}
                                    <VolumetricImage />
                                    <RadarChart />

                                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/90 to-transparent z-40 flex items-end justify-between">
                                        <div>
                                            <h2 className="text-display font-[1000] text-white tracking-tighter uppercase leading-none font-[family-name:var(--font-orbitron)] drop-shadow-[0_0_25px_rgba(16,185,129,1)]">
                                                TARANA BAND
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </SystemWindow>
                        </motion.div>
                    )}

                    {/* --- STAGE 0+: MEMBER SPOTLIGHTS --- */}
                    {activeIndex >= 0 && bandMembers[activeIndex] && (
                        <motion.div
                            key={activeIndex}
                            className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center px-4 md:px-6 relative z-30"
                        >
                            {/* TEXT CONTENT (Left) */}
                            <motion.div
                                initial={{ x: -200, opacity: 0, rotateY: -30 }}
                                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                                exit={{ x: -200, opacity: 0, rotateY: 30 }}
                                transition={{ type: "spring", stiffness: 100, damping: 12, mass: 1.2 }}
                                className="order-2 lg:order-1 perspective-1000 mt-2 md:mt-0"
                            >
                                <SystemWindow title="PRO NITE // S-RANK ARTIST">
                                    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-black/40 backdrop-blur-md">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="p-3 md:p-4 bg-emerald-500/10 border border-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                                {React.createElement(bandMembers[activeIndex].icon, { className: "w-6 h-6 md:w-10 md:h-10 text-emerald-400" })}
                                            </div>
                                            <div>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="text-[10px] md:text-sm text-emerald-500 font-extrabold tracking-[0.2em] uppercase"
                                                >
                                                    Role
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="text-lg md:text-2xl text-white font-[family-name:var(--font-orbitron)] font-bold"
                                                >
                                                    {bandMembers[activeIndex].role}
                                                </motion.div>
                                            </div>
                                        </div>

                                        <div className="space-y-1 md:space-y-2">
                                            <div className="text-[10px] md:text-xs text-emerald-500 font-bold tracking-widest uppercase">Identity</div>
                                            {/* STAGGERED TEXT REVEAL FOR NAME */}
                                            <h3 className="text-2xl md:text-7xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white uppercase tracking-tighter leading-none font-[family-name:var(--font-orbitron)] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] flex flex-wrap gap-x-2 gap-y-1 break-words">
                                                {bandMembers[activeIndex].name.split(" ").map((word, i) => (
                                                    <motion.span
                                                        key={i}
                                                        initial={{ opacity: 0, y: 50, rotateX: 90 }}
                                                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                                        transition={{ delay: 0.3 + (i * 0.1), type: "spring" }}
                                                        className="inline-block"
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </h3>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-emerald-500/30">
                                            <div className="text-[10px] md:text-xs text-emerald-500 font-bold tracking-widest uppercase mb-1 md:mb-2">Analysis</div>
                                            <div className="text-xs md:text-xl text-emerald-100/90 leading-relaxed font-mono pl-3 md:pl-4 border-l-4 border-emerald-500">
                                                {/* TYPEWRИТER EFFECT FOR DESCRIPTION */}
                                                {bandMembers[activeIndex].desc.split(" ").map((word, i) => (
                                                    <motion.span
                                                        key={i}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.5 + (i * 0.03) }}
                                                        className="inline-block mr-2"
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </SystemWindow>
                            </motion.div>

                            {/* IMAGE (Right) - LEGENDARY HOLOGRAM ENTRANCE */}
                            <motion.div
                                className="order-1 lg:order-2 relative h-[35vh] md:h-[65vh] w-full flex items-center justify-center perspective-1000"
                                initial={{ x: 200, opacity: 0, scale: 0.5, rotateY: 60 }}
                                animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ x: 200, opacity: 0, scale: 1.2, rotateY: -60, filter: "brightness(2) blur(20px)" }}
                                transition={{ type: "spring", stiffness: 80, damping: 15, mass: 1.5 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 opacity-30"
                                >
                                    {React.createElement(bandMembers[activeIndex].icon, { className: "w-[120%] h-[120%] text-emerald-900 blur-sm" })}
                                </motion.div>

                                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black shadow-[0_0_80px_rgba(16,185,129,0.3)] group transform-style-3d">
                                    <div className="absolute top-0 left-0 w-8 md:w-12 h-8 md:h-12 border-t-4 border-l-4 border-emerald-400 z-30" />
                                    <div className="absolute top-0 right-0 w-8 md:w-12 h-8 md:h-12 border-t-4 border-r-4 border-emerald-400 z-30" />
                                    <div className="absolute bottom-0 left-0 w-8 md:w-12 h-8 md:h-12 border-b-4 border-l-4 border-emerald-400 z-30" />
                                    <div className="absolute bottom-0 right-0 w-8 md:w-12 h-8 md:h-12 border-b-4 border-r-4 border-emerald-400 z-30" />

                                    <motion.div
                                        className="absolute inset-0 bg-emerald-500 z-20 mix-blend-color"
                                        initial={{ height: "100%" }}
                                        animate={{ height: "0%" }}
                                        transition={{ duration: 0.8, ease: "circInOut", delay: 0.2 }}
                                    />

                                    <Image
                                        src={bandMembers[activeIndex].img}
                                        alt={bandMembers[activeIndex].name}
                                        fill
                                        className="object-cover object-top hover:scale-110 transition-transform duration-1000 z-10"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:40px_40px] opacity-20 pointer-events-none z-20 mix-blend-screen" />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}


// Configure unique font
const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '900'],
    variable: '--font-orbitron'
})

// Utility for wrapping numbers
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

// Dynamically import the 3D model (Optimized loading)
const Fest3DModel = dynamic(() => import('@/components/sections/Fest3DModel'), {
    ssr: false,
    loading: () => <div className="w-full h-full animate-pulse bg-emerald-900/10 rounded-3xl" />
})

// --- Advanced Animation Components ---

interface ParallaxTextProps {
    children: string;
    baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxTextProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const directionFactor = useRef<number>(1);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, { threshold: 0.01 });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useAnimationFrame((t, delta) => {
        if (!isInView) return;

        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();
        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div ref={containerRef} className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
            <motion.div className="font-[1000] uppercase text-[12vw] leading-[0.85] tracking-tighter text-white/5 whitespace-nowrap flex flex-nowrap" style={{ x }}>
                <span className="block mr-12">{children} </span>
                <span className="block mr-12">{children} </span>
                <span className="block mr-12">{children} </span>
                <span className="block mr-12">{children} </span>
            </motion.div>
        </div>
    );
}

const RevealText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
    return (
        <span className="inline-block overflow-hidden">
            <motion.span
                initial={{ y: "100%", rotate: 10 }}
                whileInView={{ y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                    duration: 1,
                    ease: [0.2, 0.65, 0.3, 0.9],
                    delay: delay
                }}
                className="inline-block origin-top-left"
            >
                {text}
            </motion.span>
        </span>
    )
}

const StaggerTitle = ({ title, subtitle }: { title: string, subtitle?: string }) => {
    return (
        <div className="mb-10 space-y-2 text-center md:text-left relative z-10">
            {subtitle && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 justify-center md:justify-start"
                >
                    <span className="w-12 h-[2px] bg-emerald-500"></span>
                    <span className="text-emerald-400 font-bold tracking-[0.3em] uppercase text-xs font-[family-name:var(--font-inter)]">
                        {subtitle}
                    </span>
                </motion.div>
            )}
            <h2 className="text-4xl md:text-6xl font-[900] text-white uppercase tracking-tighter leading-none font-[family-name:var(--font-poppins)] overflow-hidden">
                {title.split(" ").map((word, i) => (
                    <span key={i} className="inline-block mr-4">
                        <RevealText text={word} delay={i * 0.1} />
                    </span>
                ))}
            </h2>
        </div>
    )
}

// --- UI Components ---

// --- Sci-Fi Components ---

const RadarChart = () => {
    return (
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] hidden lg:flex items-center justify-center z-30 pointer-events-none">
            {/* Radar Background */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#10b981" strokeWidth="0.5" />
                <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="#10b981" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="50" y2="10" stroke="#10b981" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="90" y2="30" stroke="#10b981" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="90" y2="70" stroke="#10b981" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="50" y2="90" stroke="#10b981" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="10" y2="70" stroke="#10b981" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="10" y2="30" stroke="#10b981" strokeWidth="0.5" />
            </svg>

            {/* Animated Stats Polygon */}
            <motion.svg viewBox="0 0 100 100" className="absolute w-full h-full overflow-visible">
                <motion.polygon
                    initial={{ points: "50,50 50,50 50,50 50,50 50,50 50,50" }}
                    animate={{ points: "50,10 90,30 90,70 50,90 10,70 10,30" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    fill="rgba(16, 185, 129, 0.3)"
                    stroke="#10b981"
                    strokeWidth="2"
                />
            </motion.svg>

            {/* Stat Labels */}
            {['ENERGY', 'VOCALS', 'HYPE', 'STYLE', 'RHYTHM', 'AURA'].map((stat, i) => (
                <motion.div
                    key={stat}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + (i * 0.1) }}
                    className="absolute text-[10px] font-bold text-emerald-400 bg-black/80 px-2 py-0.5 border border-emerald-500/30 backdrop-blur-sm"
                    style={{
                        top: `${50 + 45 * Math.sin(i * Math.PI / 3 - Math.PI / 2)}%`,
                        left: `${50 + 45 * Math.cos(i * Math.PI / 3 - Math.PI / 2)}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {stat}: SSS
                </motion.div>
            ))}
        </div>
    )
}

const VolumetricImage = () => {
    return (
        <div className="relative w-full h-full">
            {/* Wireframe / Grid Layer - Appears first */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1, delay: 1 }} // Fades out revealing color
                className="absolute inset-0 bg-[url('/img/tarana_group.png')] bg-contain bg-center bg-no-repeat opacity-20 z-20 pointer-events-none"
            >
                {/* Grid Overlay on top of wireframe */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />
            </motion.div>

            {/* Scanning Lasers */}
            <motion.div
                className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_50px_#10b981,0_0_100px_#10b981] z-30"
                initial={{ bottom: "0%" }}
                animate={{ bottom: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
            />

            {/* Full Color Image - Revealed by scan */}
            {/* Full Color Image - Revealed by scan */}
            <motion.div
                className="relative w-full h-full z-10 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
            >
                <Image
                    src="/img/tarana_group.png"
                    alt="Tarana Group"
                    fill
                    className="object-contain p-[2.5%]"
                    sizes="100vw"
                    priority
                />
            </motion.div>

            {/* Tech Decoration Circles */}
            <div className="absolute top-10 left-10 w-20 h-20 border border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite] border-t-emerald-500 border-r-transparent" />
            <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse] border-b-emerald-500 border-l-transparent" />
        </div>
    )
}

const ParallaxBackground = () => {
    const { scrollYProgress } = useScroll();
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    const y = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "0%"] : ["0%", "50%"]);

    return (
        <motion.div
            style={{ y }}
            className="absolute inset-0 z-0 pointer-events-none opacity-30"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#020202] to-[#020202]"></div>
            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px]" />
        </motion.div>
    );
};

// --- Animation Wrappers ---

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-50 shadow-[0_0_15px_#10b981]"
            style={{ scaleX: scrollYProgress }}
        />
    )
}

const RevealOnScroll = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.98 }}
        viewport={{ once: false, amount: 0.2, margin: "-100px" }} // Smoother trigger margin
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
)


// --- Helper for Lively Border ---
const LivelyBorder = () => (
    <div className="absolute inset-[-2px] -z-10 rounded-[inherit] overflow-hidden">
        <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_4s_linear_infinite] opacity-40" />
    </div>
)

const ButtonPrimary = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative px-6 py-4 md:px-10 md:py-5 bg-emerald-600 text-white font-extrabold text-xs md:text-sm tracking-[0.2em] uppercase rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:scale-105 transition-all duration-300 border border-emerald-400/50"
    >
        <span className="relative z-20 flex items-center gap-2 md:gap-3 font-[family-name:var(--font-poppins)]">
            {children} <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
        </span>
    </motion.button>
)

const ButtonSecondary = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative px-8 py-4 bg-black border border-white/10 text-white font-bold text-sm tracking-widest uppercase rounded-full transition-all hover:bg-white/5 hover:border-emerald-500/30 isolate"
    >
        <div className="absolute inset-[-2px] -z-10 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#10b981_360deg)] animate-[spin_4s_linear_infinite]" />
        </div>
        <div className="absolute inset-[1px] bg-black rounded-full -z-5" />
        <span className="relative z-10 flex items-center gap-2 font-[family-name:var(--font-poppins)]">
            {children}
        </span>
    </motion.button>
)

// --- Ancient Hero Overlay Component ---
// --- Realistic Ancient Background Component ---
// --- Realistic Ancient Background Component ---
const RealisticAncientBackground = () => {
    // FIX: Hydration Mismatch. Move random generation to useEffect.
    const [dustParticles, setDustParticles] = useState<Array<{
        width: number,
        height: number,
        left: number,
        top: number,
        duration: number,
        delay: number,
        initialX: number,
        initialY: number,
        travelX: number
    }>>([])

    useEffect(() => {
        // Generate random particles ONLY on client-side to avoid mismatch
        const particles = [...Array(6)].map(() => ({
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 15 + Math.random() * 10,
            delay: Math.random() * 5,
            initialX: Math.random() * 100,
            initialY: Math.random() * 100,
            travelX: Math.random() * 50 - 25
        }))
        setDustParticles(particles)
    }, [])

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {/* 1. REALISTIC RUINS TEXTURE (Blended) */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-soft-light md:opacity-30">
                <Image
                    src="/img/ancient_ruins_dark.png"
                    alt="Ancient Ruins Atmosphere"
                    fill
                    className="object-cover object-center"
                    priority
                />
                {/* Gradient Fade to merge with black bg */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202]" />
            </div>

            {/* 2. CINEMATIC DUST / SPORES (Replaces cartoon stones) */}
            <div className="absolute inset-0 z-10 overflow-hidden">
                {dustParticles.map((p, i) => (
                    <motion.div
                        key={`dust-${i}`}
                        initial={{ y: p.initialY, x: p.initialX, opacity: 0 }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, p.travelX, 0],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: p.delay
                        }}
                        className="absolute rounded-full bg-emerald-100/20 blur-[1px]"
                        style={{
                            width: p.width + 'px',
                            height: p.height + 'px',
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                        }}
                    />
                ))}
            </div>

            {/* 3. SUBTLE MIST LAYERS (Atmosphere) */}
            <div className="absolute bottom-0 w-full h-[40vh] bg-gradient-to-t from-[#020202] to-transparent z-10" />
        </div>
    )
}

// --- Sections ---

const HeroSection = ({ shouldRender3D }: { shouldRender3D: boolean }) => {
    const router = useRouter()
    const { scrollY } = useScroll()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])

    const yHero = useTransform(scrollY, [0, 500], isMobile ? [0, 0] : [0, -150])
    const opacityHero = useTransform(scrollY, [0, 1200], [1, 0])

    return (
        <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#020202] gpu-accel">
            {/* God Level Parallax BG */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                {/* Glowing Orbs for Liveliness - Hidden on Mobile */}
                {!isMobile && (
                    <>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px]"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]"
                        />
                    </>
                )}
            </div>

            {/* ANCIENT ATMOSPHERE OVERLAY - REALISTIC */}
            <RealisticAncientBackground />

            <div className="container max-w-[1800px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-20 pt-20">
                {/* Hero Text */}
                <motion.div style={{ y: yHero, opacity: opacityHero }} className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <motion.div
                        initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md mb-8"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-400 text-[10px] md:text-xs font-[800] tracking-[0.2em] uppercase">
                            March 11–14 • 2026
                        </span>
                    </motion.div>

                    <div className="relative w-full max-w-full overflow-visible py-10 pb-20">
                        {/* Adjusted Clamp to prevent cutoff and added padding */}
                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`${orbitron.className} text-hero font-[900] tracking-tighter uppercase leading-[1.1] whitespace-normal text-white drop-shadow-lg`}
                        >
                            VARNOTHSAVA <br className="block md:hidden" /> 2K26
                        </motion.h1>
                    </div>

                    <motion.p
                        initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mt-6 leading-relaxed"
                    >
                        The ultimate national-level techno-cultural phenomenon. <br className="hidden md:block" />
                        Where <span className="text-emerald-400">Innovation</span> meets <span className="text-purple-400">Celebrate</span>.
                    </motion.p>

                    <motion.div
                        initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="relative z-50 flex flex-wrap gap-4 mt-10 justify-center lg:justify-start pb-24 lg:pb-0"
                    >
                        <ButtonPrimary onClick={() => router.push('/events')}>Explore Events</ButtonPrimary>
                        <ButtonPrimary onClick={() => {
                            const section = document.getElementById('pronite-section');
                            if (section) {
                                const top = section.getBoundingClientRect().top + window.pageYOffset;
                                window.scrollTo({ top, behavior: 'smooth' });
                            }
                        }}>Pro Nite</ButtonPrimary>
                    </motion.div>
                </motion.div>

                {/* 3D Model - SEQUENTIAL LOADING APPLIED HERE */}
                <div className="relative h-[45vh] lg:h-[80vh] w-full order-1 lg:order-2 flex items-center justify-center perspective-1000">
                    <AnimatePresence>
                        {shouldRender3D && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                className="w-full h-full relative z-10"
                            >
                                <Fest3DModel />

                                {/* Interactive Floating Card */}
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute bottom-10 -right-4 md:right-0 p-5 bg-white/5 border border-emerald-500/20 backdrop-blur-xl rounded-2xl z-20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hidden md:block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Prize Pool</div>
                                            <div className="text-2xl font-[900] text-emerald-400">₹ 5,00,000+</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {!isMobile && (
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-30 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em]">Scroll</span>
                    <ChevronDown className="w-5 h-5 text-emerald-500" />
                </motion.div>
            )}

            {/* Velocity Marquee at bottom of Hero */}
            <div className="absolute bottom-0 w-full z-10 opacity-30 mix-blend-overlay pointer-events-none">
                <ParallaxText baseVelocity={5}>VARNOTHSAVA 2K26</ParallaxText>
            </div>
        </section>
    )
}

const WelcomeSection = () => {
    return (
        <section className="py-20 px-4 md:px-12 relative bg-[#020202] gpu-accel">
            <ParallaxBackground />

            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                <RevealOnScroll className="relative group perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                    <motion.div
                        whileHover={{ scale: 1.02, rotateY: 5 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative h-[300px] md:h-[500px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <Image
                            src="/img/6.jpg"
                            alt="Unity in Diversity"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />

                        {/* Overlay Text */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex flex-col justify-end p-10">
                            <h3 className="text-3xl font-bold text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                Unity in Diversity
                            </h3>
                            <p className="text-emerald-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                Celebrating talent across the nation.
                            </p>
                        </div>
                    </motion.div>
                </RevealOnScroll>

                <RevealOnScroll className="space-y-8">
                    <StaggerTitle title="The Phenomenon" subtitle="Welcome to Varnothsava" />
                    <p className="text-lg leading-relaxed text-gray-400 font-light">
                        Varnothsava represents the pinnacle of student creativity. It's not merely an event; it's a <span className="text-white font-bold">living, breathing ecosystem</span> of talent, tech, and art.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: "Colleges", value: "100+", icon: Users },
                            { label: "Events", value: "50+", icon: Trophy },
                            { label: "Artists", value: "25+", icon: Sparkles },
                            { label: "Sponsors", value: "30+", icon: Star },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer group/stat">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/stat:scale-110 transition-transform">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xl font-[900] text-white">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    )
}


const AboutFestSection = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]) // Parallax effect

    return (
        <section ref={sectionRef} className="py-32 px-4 md:px-6 container mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <RevealOnScroll className="order-2 lg:order-1 space-y-8">
                    <StaggerTitle title="About The Fest" subtitle="A Legacy of Excellence" />

                    <div className="space-y-6 text-lg text-gray-400 leading-relaxed font-light">
                        <p>
                            <span className="text-emerald-400 font-bold">Varnothsava</span> is the ultimate cultural and entertainment extravaganza, bringing together students, artists, and performers for an unforgettable experience.
                        </p>
                        <p>
                            With thrilling competitions, live music, dance, and engaging workshops, this fest is a celebration of creativity and unity. Join us for an event filled with energy, enthusiasm, and endless memories!
                        </p>
                        <p className="text-white font-medium italic border-l-4 border-emerald-500 pl-6 py-2 bg-emerald-500/5 rounded-r-xl">
                            "Don't miss out on the excitement of 2K26 – it's going to be bigger and better than ever!"
                        </p>
                    </div>

                    <div className="flex gap-8 pt-8">
                        <div className="text-center">
                            <div className="text-3xl font-[900] text-white">5000+</div>
                            <div className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Footfall</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-[900] text-white">40+</div>
                            <div className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Insts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-[900] text-white">3 Days</div>
                            <div className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Non-Stop</div>
                        </div>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll className="order-1 lg:order-2 relative h-[500px] w-full perspective-1000 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 blur-[100px] -z-10" />
                    <motion.div
                        style={{ y }}
                        initial={{ rotateY: 20 }}
                        whileInView={{ rotateY: 0 }}
                        transition={{ duration: 1.5, type: "spring" }}
                        className="w-full h-full rounded-[3rem] overflow-hidden border border-white/10 relative shadow-2xl"
                    >
                        <Image
                            src="/img/DSC_0012.JPG"
                            alt="Fest Vibes"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                            <div className="text-2xl font-bold text-white mb-2">Unity in Diversity</div>
                            <div className="text-sm text-gray-300">Celebrating talent across the nation.</div>
                        </div>
                    </motion.div>
                </RevealOnScroll>
            </div>
        </section>
    )
}

// --- Horizontal Story Timeline ---

const timelineData = [
    {
        day: "Day 01",
        date: "March 11",
        title: "The Awakening",
        image: "/img/1.jpg",
        events: [
            { time: "09:00 AM", name: "Inauguration Ceremony", type: "Main" },
            { time: "11:00 AM", name: "Algorithm Roulette", type: "Tech" },
            { time: "01:30 PM", name: "Vocal Solo (Prelims)", type: "Cultural" },
            { time: "05:00 PM", name: "Evening Jam", type: "General" }
        ]
    },
    {
        day: "Day 02",
        date: "March 12",
        title: "Tech Zenith",
        image: "/img/3.jpg",
        events: [
            { time: "09:30 AM", name: "Robo Soccer League", type: "Tech" },
            { time: "11:00 AM", name: "Pitch-a-thon", type: "Tech" },
            { time: "01:00 PM", name: "Valorant Clash", type: "Gaming" },
            { time: "05:00 PM", name: "Tech Showdown", type: "Tech" }
        ]
    },
    {
        day: "Day 03",
        date: "March 13",
        title: "Cultural Pulse",
        image: "/img/5.jpg",
        events: [
            { time: "09:00 AM", name: "Classical Dance", type: "Cultural" },
            { time: "12:30 PM", name: "Fashion Show", type: "Cultural" },
            { time: "03:30 PM", name: "Battle of Bands", type: "Cultural" },
            { time: "05:00 PM", name: "Fusion Night", type: "Cultural" }
        ]
    },
    {
        day: "Day 04",
        date: "March 14",
        title: "Final Zenith",
        image: "/img/DSC_0046.JPG",
        events: [
            { time: "11:00 AM", name: "Valedictory Ceremony", type: "Main" },
            { time: "01:00 PM", name: "Mega Concert (Pro Nite)", type: "Main" },
            { time: "04:30 PM", name: "Star Night", type: "Main" },
            { time: "06:00 PM", name: "Closing Fireworks", type: "Main" }
        ]
    }
]

const HorizontalTimeline = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: sectionRef })

    // Dynamic transform to fix gap based on screen width
    const [endValue, setEndValue] = useState("-55%") // Default safe value
    useEffect(() => {
        const updateTarget = () => {
            // Mobile needs ~75-85%, Desktop/Wide needs much less ~35-45%
            setEndValue(window.innerWidth < 768 ? "-85%" : "-40%")
        }
        updateTarget()
        window.addEventListener('resize', updateTarget)
        return () => window.removeEventListener('resize', updateTarget)
    }, [])

    const x = useTransform(scrollYProgress, [0, 1], ["1%", endValue])

    return (
        <section ref={sectionRef} className="relative h-[250vh] bg-[#020202] gpu-accel smooth-scroll-fix">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <div className="absolute top-10 left-8 md:left-20 z-20 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                    <StaggerTitle title="The Saga" subtitle="4 Days. Infinite Memories." />
                </div>

                {/* Animated Gradient Background for Liveliness */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 via-black to-purple-900/10 animate-pulse-slow" />

                <motion.div style={{ x }} className="flex gap-4 md:gap-16 px-4 md:px-[10vw] items-center">
                    {timelineData.map((day, i) => (
                        <div key={i} className="relative w-[85vw] md:w-[600px] h-[65vh] md:h-[75vh] flex-shrink-0 group perspective-1000">
                            {/* 3D Tilt Wrapper */}
                            <motion.div
                                className="w-full h-full relative preserve-3d transition-all duration-500 ease-out"
                                whileHover={{ rotateY: 12, rotateX: -5, scale: 1.02 }}
                            >
                                {/* Card Container with Animated Border */}
                                <div className="w-full h-full bg-[#080808] rounded-[2.5rem] relative shadow-2xl isolate overflow-hidden">

                                    {/* Main Card Animated Border */}
                                    <div className="absolute inset-[-2px] -z-10 rounded-[inherit] overflow-hidden">
                                        <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#10b981_360deg)] animate-[spin_4s_linear_infinite]" />
                                    </div>
                                    <div className="absolute inset-[1px] bg-[#080808] rounded-[2.4rem] -z-5" />

                                    <div className="relative h-full flex flex-col rounded-[2.4rem] overflow-hidden">
                                        {/* Image Section with its own Animated Border */}
                                        <div className="relative w-[full] h-[45%] m-4 mb-0 rounded-[2rem] overflow-hidden isolate">
                                            {/* Image Border Animation */}
                                            <div className="absolute inset-[-2px] -z-10 rounded-[inherit] overflow-hidden">
                                                <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#ffffff_360deg)] animate-[spin_3s_linear_infinite_reverse]" />
                                            </div>
                                            <div className="absolute inset-[2px] bg-[#080808] rounded-[1.9rem] -z-5" />

                                            {/* Actual Image */}
                                            <div className="absolute inset-[2px] rounded-[1.9rem] overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#080808] z-10" />
                                                <Image
                                                    src={day.image}
                                                    alt={day.title}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                                    sizes="(max-width: 768px) 80vw, 400px"
                                                />
                                                <div className="absolute top-6 left-6 z-20">
                                                    <div className="text-[5rem] leading-none font-[1000] text-white/10 select-none font-[family-name:var(--font-poppins)] group-hover:text-emerald-500/20 transition-colors">
                                                        {day.day.split(' ')[1]}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 pt-6 px-8 pb-8 flex flex-col relative z-20">
                                            <h3 className="text-4xl font-[900] text-white uppercase tracking-tighter mb-4 font-[family-name:var(--font-poppins)] group-hover:text-emerald-400 transition-colors">
                                                {day.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-black transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                    {day.date}
                                                </div>
                                                <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-emerald-500/50 transition-colors" />
                                            </div>

                                            {/* Timeline Events List */}
                                            <div className="flex-1 overflow-y-auto custom-scrollbar-hide space-y-0 relative pr-2">
                                                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-white/10 group-hover:bg-emerald-500/20 transition-colors" />

                                                {day.events.map((ev, j) => (
                                                    <div key={j} className="relative pl-8 py-3 group/item transition-colors hover:bg-white/5 rounded-r-xl">
                                                        <div className="absolute left-[3px] top-[22px] w-2.5 h-2.5 rounded-full border-2 border-[#080808] bg-gray-600 group-hover/item:bg-emerald-500 transition-colors z-10 shadow-[0_0_10px_black] group-hover/item:shadow-[0_0_10px_#10b981]" />
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="text-white font-bold text-lg group-hover/item:text-emerald-400 transition-colors">{ev.name}</div>
                                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">{ev.type}</div>
                                                            </div>
                                                            <div className="text-xs font-bold text-emerald-500/80 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 group-hover/item:border-emerald-500 transition-colors">
                                                                {ev.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </motion.div>

                {/* Progress Bar */}
                <div className="absolute bottom-10 left-10 md:left-20 right-10 md:right-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        style={{ width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
                        className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
                    />
                </div>
            </div>
        </section>
    )
}

const SpecialAttractions = () => (
    <section className="py-20 px-4 md:px-6 container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <StaggerTitle title="Highlights" subtitle="Experience The Magic" />
            <p className="text-gray-400 max-w-md text-lg pb-10">Dive into the zones that make Varnothsava unique. From culinary delights to virtual battlegrounds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { title: "Food Fest", icon: Utensils, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", img: "/img/1.jpg" },
                { title: "Gaming Warp", icon: Gamepad2, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", img: "/img/3.jpg" },
                { title: "Inno Bazar", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", img: "/img/5.jpg" },
                { title: "Techno Night", icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", img: "/img/8.jpg" }
            ].map((item, i) => (
                <motion.div
                    key={i}
                    whileHover={{ y: -10, scale: 1.02 }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`group relative h-[450px] rounded-[2.5rem] bg-[#0a0a0a] border border-transparent overflow-hidden p-8 flex flex-col justify-end hover:shadow-2xl transition-all duration-500 cursor-pointer isolate`}
                >
                    {/* Lively Border Effect */}
                    <div className="absolute inset-[-2px] -z-10 rounded-[inherit] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className={`absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,${item.color.replace('text-', '').replace('-400', '') === 'orange' ? '#fb923c' : item.color.replace('text-', '').replace('-400', '') === 'violet' ? '#a78bfa' : item.color.replace('text-', '').replace('-400', '') === 'yellow' ? '#facc15' : '#60a5fa'}_360deg)] animate-[spin_4s_linear_infinite]`} />
                    </div>
                    {/* Inner Background to cover border center */}
                    <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-[2.4rem] -z-5" />

                    {/* Background Image with Zoom Effect */}
                    <div className="absolute inset-[1px] rounded-[2.4rem] overflow-hidden z-0">
                        <Image
                            src={item.img}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110 opacity-50 group-hover:opacity-70"
                            sizes="(max-width: 768px) 100vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </div>

                    <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-xl ${item.bg} ${item.border} flex items-center justify-center border font-bold text-white shadow-lg mb-6 group-hover:scale-110 transition-transform backdrop-blur-md`}>
                            <item.icon className={`w-7 h-7 ${item.color}`} />
                        </div>
                        <h3 className="text-2xl font-[800] text-white uppercase tracking-tight mb-2 font-[family-name:var(--font-poppins)]">{item.title}</h3>
                        <div className="w-12 h-1 bg-white/20 group-hover:w-full transition-all duration-500 rounded-full mb-4" />
                        <div className="flex items-center text-xs text-gray-400 uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                            Explore <ArrowRight className="w-3 h-3 text-emerald-500" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </section>
)

const MarvelTrailerSection = () => {
    // Fast-paced image switching for "Marvel Intro" vibe
    const images = [
        "/img/1 (1).jpg",
        "/img/DSC_0007.JPG",
        "/img/DSC_0018.JPG",
        "/img/DSC_0035.JPG",
        "/img/DSC_0318.JPG",
        "/img/DSC_0762.JPG",
        "/img/IMG_5355.JPG",
        "/img/IMG_5442.JPG"
    ]

    const [isInView, setIsInView] = useState(false)
    const containerRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting)
        }, { threshold: 0.1 })
        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    const imageRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        if (!isInView) return

        let index = 0
        // Ensure first image is visible immediately
        if (imageRefs.current[0]) imageRefs.current[0]!.style.opacity = '1'

        const interval = setInterval(() => {
            const prevIndex = index
            index = (index + 1) % images.length

            // Direct DOM manipulation to avoid React Render Cycle
            if (imageRefs.current[prevIndex]) imageRefs.current[prevIndex]!.style.opacity = '0'
            if (imageRefs.current[index]) imageRefs.current[index]!.style.opacity = '1'
        }, 150)
        return () => clearInterval(interval)
    }, [isInView])

    return (
        <section ref={containerRef} className="relative h-screen w-full bg-black overflow-hidden flex items-center justify-center gpu-accel">
            {/* Rapid Fire Background - Optimized with stable DOM nodes */}
            <div className="absolute inset-0 opacity-40">
                {images.map((img, i) => (
                    <div
                        key={img}
                        ref={el => { imageRefs.current[i] = el }}
                        className="absolute inset-0 transition-opacity duration-75 will-change-[opacity]"
                        style={{ opacity: i === 0 ? 1 : 0 }}
                    >
                        <Image
                            src={img}
                            alt="Montage"
                            fill
                            className="object-cover grayscale contrast-125 brightness-50"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            quality={60}
                            loading={i === 0 ? "eager" : "lazy"}
                            priority={i === 0}
                        />
                    </div>
                ))}

                <div className="absolute inset-0 bg-red-600 mix-blend-multiply opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Letter Masking Effect - "SMVITM" or Similar */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ scale: 2, opacity: 0, filter: "blur(10px)" }}
                    whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-8 will-change-transform"
                >
                    <div className="text-[15vw] leading-none font-[1000] text-red-600 md:text-transparent md:bg-clip-text md:bg-gradient-to-br md:from-white md:via-red-500 md:to-red-900 tracking-tighter drop-shadow-none md:drop-shadow-lg font-[family-name:var(--font-orbitron)]">
                        2K26
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                >
                    <h2 className="text-4xl md:text-6xl font-[900] text-white uppercase tracking-widest font-[family-name:var(--font-orbitron)]">
                        Varnothsava
                    </h2>
                    <div className="h-1 w-32 bg-red-600 mx-auto" />
                    <p className="text-xl md:text-2xl text-gray-300 font-[family-name:var(--font-poppins)] max-w-2xl mx-auto">
                        The Saga Continues. Be The Legacy.
                    </p>

                    <div className="pt-10">
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "#dc2626" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-red-700 text-white font-[900] uppercase tracking-widest text-lg rounded-none border-2 border-transparent hover:border-white shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all font-[family-name:var(--font-orbitron)]"
                        >
                            JOIN THE REVOLUTION
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Cinematic Borders */}
            <div className="absolute top-0 left-0 w-full h-[10vh] bg-black z-20" />
            <div className="absolute bottom-0 left-0 w-full h-[10vh] bg-black z-20" />
        </section>
    )
}

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0)

    // ... existing FAQ data ...
    const faqs = [
        { q: "What is Varnothsava?", a: "Varnothsava is the annual national-level techno-cultural fest of SMVITM." },
        { q: "How do I register?", a: "You can register directly through this website by clicking the 'Register Now' button." },
        { q: "Is there a specific dress code?", a: "Yes, distinct dress codes apply for specific events. Please refer to the event rulebook for details." },
        { q: "Do you provide accommodation?", a: "Yes, accommodation is provided for outstation participants." },
        { q: "Are participation certificates provided?", a: "All participants receive E-participation certificates. Winners receive Merit certificates." }
    ]

    return (
        <section className="py-20 px-4 md:px-6 container mx-auto">
            <div className="max-w-4xl mx-auto">
                <StaggerTitle title="FAQ" subtitle="Common Queries" />
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                aria-expanded={activeIndex === i}
                                aria-controls={`faq-answer-${i}`}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className={`text-lg md:text-xl font-bold font-[family-name:var(--font-inter)] ${activeIndex === i ? 'text-emerald-400' : 'text-white'}`}>
                                    {faq.q}
                                </span>
                                <Plus className={`w-6 h-6 transition-transform duration-300 ${activeIndex === i ? 'rotate-45 text-emerald-500' : 'text-gray-400'}`} />
                            </button>
                            <AnimatePresence>
                                {activeIndex === i && (
                                    <motion.div
                                        id={`faq-answer-${i}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const Footer = () => (
    <footer className="bg-[#020202] border-t border-white/5 pt-24 pb-12 px-4 md:px-6 relative overflow-hidden">
        {/* Giant Footer Text */}
        <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03]">
            <ParallaxText baseVelocity={2}>VARNOTHSAVA</ParallaxText>
        </div>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative z-10">
            <div className="space-y-8">
                <div className="text-3xl font-[900] text-white font-[family-name:var(--font-poppins)] tracking-tighter uppercase">
                    Varnoth<span className="text-emerald-500">sava.</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                    The Ultimate Cultural & Entertainment Fest by SMVITM. Celebrating innovation, art, and tradition.
                </p>
                <div className="flex gap-4">
                    {[
                        { icon: Instagram, label: "Instagram" },
                        { icon: Youtube, label: "Youtube" },
                        { icon: Twitter, label: "Twitter" },
                        { icon: Facebook, label: "Facebook" }
                    ].map((item, i) => (
                        <a key={i} href="#" aria-label={`Visit our ${item.label} page`} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all hover:scale-110 border border-white/10 hover:border-emerald-500">
                            <item.icon className="w-5 h-5" />
                        </a>
                    ))}
                </div>
            </div>

            {/* ... Other Footer Links ... */}
            <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-xs font-[family-name:var(--font-inter)]">Quick Links</h4>
                <ul className="space-y-4 text-sm text-gray-400 font-medium">
                    {['About Us', 'Events', 'Sponsors', 'Contact'].map((link) => (
                        <li key={link}>
                            <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-transform" />
                                {link}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-xs font-[family-name:var(--font-inter)]">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-400 font-medium">
                    {['Privacy Policy', 'Terms', 'Code of Conduct'].map((link) => (
                        <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-xs font-[family-name:var(--font-inter)]">Get in Touch</h4>
                <div className="space-y-4 text-sm text-gray-400 font-medium">
                    <p className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                        Vishwothama Nagar, Bantakal,<br />Udupi, Karnataka
                    </p>
                    <p className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                        +91 99640 27565
                    </p>
                    <p className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                        varnothsava@sode-edu.in
                    </p>
                </div>
            </div>
        </div>

        <div className="container mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-bold uppercase tracking-widest relative z-10">
            <p>&copy; 2026 Varnothsava. All rights reserved.</p>
            <p className="flex items-center gap-2">Built with <span className="text-emerald-500">⚡</span> by SMVITM Tech</p>
        </div>
    </footer>
)

const ViewportLazy = ({ children }: { children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: "800px" }); // Increased to 800px for earlier pre-rendering

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return <div ref={ref} className="w-full content-lazy" style={{ minHeight: '80vh' }}>{isVisible ? children : null}</div>
}

export default function LandingPage() {
    const [shouldRender3D, setShouldRender3D] = useState(false);

    useEffect(() => {
        // Delay 3D model mounting to avoid stutter during initial page entrance
        const timer = setTimeout(() => {
            setShouldRender3D(true);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="bg-[#020202] text-white">
            <ScrollProgress />
            <HeroSection shouldRender3D={shouldRender3D} />
            <ViewportLazy><WelcomeSection /></ViewportLazy>
            <ViewportLazy><AboutFestSection /></ViewportLazy>
            <ViewportLazy><HorizontalTimeline /></ViewportLazy>
            <ViewportLazy><SpecialAttractions /></ViewportLazy>
            <div id="pronite-section" className="relative">
                <ProNiteSection />
                <ViewportLazy><TaranaInPixels /></ViewportLazy>
                <ViewportLazy><OriginalMusic /></ViewportLazy>
            </div>
            <ViewportLazy><MarvelTrailerSection /></ViewportLazy>
            <ViewportLazy><FAQ /></ViewportLazy>
            <Footer />
        </main>
    )
}
