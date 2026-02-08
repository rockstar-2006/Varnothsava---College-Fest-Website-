'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Orbitron, Inter } from 'next/font/google'
import Image from 'next/image'
import {
    Instagram,
    Phone,
    Zap,
    Search,
    Cpu,
    Network,
    Layers,
    Compass,
    Sparkles,
    Star,
    ShieldCheck,
    Radio,
    Trophy,
    Target,
    ZapOff,
    Terminal,
    Maximize2,
    Activity,
    Wifi
} from 'lucide-react'

const orbitron = Orbitron({
    subsets: ['latin'],
    variable: '--font-orbitron'
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter'
})

// --- Scramble Text Component ---
const ScrambleText = ({ text, className }: { text: string; className?: string }) => {
    const [display, setDisplay] = useState(text || "");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    useEffect(() => {
        if (!text) return;
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text]);

    return <span className={className}>{display}</span>;
};

// --- Council Data ---
const councilMembers = [
    {
        name: "Pranith P Shetty",
        role: "President",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.25 PM (2).jpeg",
        phone: "+91 81057 17513",
        instagram: "https://www.instagram.com/pranithshetty_1?igsh=MW9ibXFpbGZ2aGRrdA==",
        tag: "EXECUTIVE_CHIEF",
        color: "#10b981",
        rank: "CORE_LEADER",
        department: "CENTRAL_COUNCIL",
        theme: "from-emerald-500/40 via-emerald-500/5 to-transparent"
    },
    {
        name: "Pratham P Marakala",
        role: "Vice President",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.26 PM.jpeg",
        phone: "+91 99800 41888",
        instagram: "https://www.instagram.com/__pratham_7760?igsh=dzg1dnR1bHA0M3M5",
        tag: "STRATEGIC_DIRECTOR",
        color: "#06b6d4",
        rank: "SENIOR_OFFICER",
        department: "OPERATIONS",
        theme: "from-cyan-500/40 via-cyan-500/5 to-transparent"
    },
    {
        name: "Veerendra Nayari",
        role: "General Secretary",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.23 PM.jpeg",
        phone: "+91 82961 48038",
        instagram: null,
        tag: "ADMIN_CHIEF",
        color: "#3b82f6",
        rank: "GENERAL_COMMAND",
        department: "ADMINISTRATION",
        theme: "from-blue-500/40 via-blue-500/5 to-transparent"
    },
    {
        name: "Chaithanya S Maiya",
        role: "Cultural Coordinator",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.26 PM (1).jpeg",
        phone: "+91 93530 93769",
        instagram: "https://www.instagram.com/chaithanya_maiya?igsh=MXFzcDJ3anEwZXp2eg==",
        tag: "CREATIVE_HEAD",
        color: "#a855f7",
        rank: "CULTURAL_LEAD",
        department: "EVENT_COORDINATION",
        theme: "from-purple-500/40 via-purple-500/5 to-transparent"
    },
    {
        name: "Ramya R Poojary",
        role: "Cultural Coordinator",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.24 PM (2).jpeg",
        phone: "+91 81052 20835",
        instagram: "https://www.instagram.com/the_r.rp_2?igsh=YzRsZ3N4Zmxtc3Bs",
        tag: "CREATIVE_HEAD",
        color: "#ec4899",
        rank: "CULTURAL_LEAD",
        department: "EVENT_COORDINATION",
        theme: "from-pink-500/40 via-pink-500/5 to-transparent"
    },
    {
        name: "K Nagendra Pai",
        role: "Technical Coordinator",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.24 PM (1).jpeg",
        phone: "+91 99805 54781",
        instagram: null,
        tag: "TECH_DIRECTOR",
        color: "#6366f1",
        rank: "TECH_LEAD",
        department: "TECHNICAL_ARENA",
        theme: "from-indigo-500/40 via-indigo-500/5 to-transparent"
    },
    {
        name: "Natasha Chrissane Lobo",
        role: "Technical Coordinator",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.25 PM.jpeg",
        phone: "+91 97310 84329",
        instagram: "https://www.instagram.com/_natashalobo_?igsh=ZWVyN2RkNng4dG1r",
        tag: "INNOVATION_HEAD",
        color: "#8b5cf6",
        rank: "TECH_LEAD",
        department: "TECHNICAL_ARENA",
        theme: "from-violet-500/40 via-violet-500/5 to-transparent"
    },
    {
        name: "Anish K",
        role: "Sports Coordinator",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.24 PM.jpeg",
        phone: "+91 96068 57964",
        instagram: "https://www.instagram.com/anish_k_05?igsh=OHJ1bnplNmswZmpo",
        tag: "SPORTS_DIRECTOR",
        color: "#f97316",
        rank: "CHAMPION_ELITE",
        department: "SPORTS_COMMITTEE",
        theme: "from-orange-500/40 via-orange-500/5 to-transparent"
    },
    {
        name: "Ananya Bhat",
        role: "Sports Coordinator",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.52.25 PM (1).jpeg",
        phone: "+91 94831 46270",
        instagram: "https://www.instagram.com/anu_bhat._.10?igsh=aWRpMG9hMmRvY3R5",
        tag: "SPORTS_DIRECTOR",
        color: "#ef4444",
        rank: "CHAMPION_ELITE",
        department: "SPORTS_COMMITTEE",
        theme: "from-red-500/40 via-red-500/5 to-transparent"
    },
    {
        name: "Chethan V Kotian",
        role: "Promotional Coordinator",
        institute: "SMVITM, Bantakal",
        image: "/council/WhatsApp Image 2026-02-07 at 12.53.27 PM.jpeg",
        phone: "+91 8123936830",
        instagram: "https://www.instagram.com/_.mr.__.kotian._?igsh=empxZWQ4aThnYXBo",
        tag: "PUBLICITY_HEAD",
        color: "#84cc16",
        rank: "MEDIA_LEAD",
        department: "OUTREACH",
        theme: "from-lime-500/40 via-lime-500/5 to-transparent"
    },
];

const ViewportLazy = ({ children }: { children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true)
                observer.disconnect()
            }
        }, { rootMargin: "600px" })

        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={containerRef} className="w-full h-[680px] md:h-[720px] relative">
            <AnimatePresence mode="wait">
                {isVisible ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full transform-gpu"
                        style={{ willChange: 'opacity, transform' }}
                    >
                        {children}
                    </motion.div>
                ) : (
                    <motion.div
                        key="placeholder"
                        exit={{ opacity: 0 }}
                        className="w-full h-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center transform-gpu"
                    >
                        {/* Aspect Ratio Matcher */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 animate-pulse" />
                        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// --- Continuous Ambient Background (Canvas Optimized) ---
const LivingBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: any[] = [];
        const particleCount = isMobile ? 40 : 100;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Grid
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
            ctx.lineWidth = 1;
            const gridSize = 40;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Update & Draw Particles
            ctx.fillStyle = '#10b981';
            particles.forEach(p => {
                p.x = (p.x + p.vx + canvas.width) % canvas.width;
                p.y = (p.y + p.vy + canvas.height) % canvas.height;
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isMobile]);

    return (
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-[#010202]">
            <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#010202]/50 to-[#010202]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]" />
        </div>
    )
}

const HolographicCard = ({ member, index }: { member: any, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const rotateX = useMotionValue(0)
    const rotateY = useMotionValue(0)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])

    const springConfig = { damping: 25, stiffness: 120 }
    const springRotateX = useSpring(rotateX, springConfig)
    const springRotateY = useSpring(rotateY, springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isMobile) return
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        rotateX.set((e.clientY - centerY) / 6)
        rotateY.set((centerX - e.clientX) / 6)
    }

    const activeHover = isMobile ? false : isHovered

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: isMobile ? "200px" : "100px" }}
            animate={isMobile ? { opacity: 1, y: 0 } : {
                y: [0, -15, 0],
                rotateZ: [0, 0.5, 0, -0.5, 0]
            }}
            transition={isMobile ? { duration: 0.2 } : {
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
                rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
                opacity: { duration: 0.8, delay: index * 0.05, type: "spring" }
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setIsHovered(false); rotateX.set(0); rotateY.set(0); }}
            onMouseEnter={() => { if (!isMobile) setIsHovered(true); }}
            style={{
                rotateX: isMobile ? 0 : springRotateX,
                rotateY: isMobile ? 0 : springRotateY,
                transformStyle: isMobile ? 'flat' : 'preserve-3d',
                zIndex: activeHover ? 50 : 1,
                willChange: 'transform, opacity'
            }}
            className={`group relative w-full overflow-hidden rounded-[2.5rem] bg-[#020504]/90 border-2 border-white/10 ${isMobile ? 'h-auto min-h-[600px] flex flex-col' : 'h-[720px] md:h-[800px] perspective-1000'} transform-gpu shadow-xl`}
        >
            {/* Pulsing Aura Border - Desktop Only for Performance */}
            {!isMobile && (
                <motion.div
                    animate={{
                        opacity: activeHover ? 1 : [0.1, 0.3, 0.1],
                        scale: activeHover ? 1.05 : 1
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`absolute -inset-4 bg-gradient-to-bl ${member.theme} rounded-[3.5rem] blur-3xl`}
                />
            )}

            <div className={`relative h-full w-full rounded-[2.5rem] bg-[#020504]/90 backdrop-blur-3xl border-2 border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-colors duration-500 ${activeHover ? 'border-emerald-500/40' : ''} flex flex-col`}>

                {/* Continuous Light Sweep Layer */}
                <motion.div
                    animate={{ left: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-10 pointer-events-none"
                />

                <div style={isMobile ? {} : { transform: 'translateZ(60px)' }} className="h-full w-full flex flex-col relative z-20">

                    {/* Image Area */}
                    <div className={`relative w-full overflow-hidden ${isMobile ? 'h-[350px] shrink-0' : 'h-[58%]'}`}>
                        <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className={`object-cover object-center transition-transform duration-1000 grayscale-[0.3] transform-gpu ${isMobile ? '' : 'group-hover:scale-110 group-hover:grayscale-0'}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index < 4}
                            loading={index < 4 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020504] via-transparent to-transparent opacity-90" />

                        {/* Animated Badge Corner */}
                        <div className="absolute top-6 right-6 z-40">
                            <div className="px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full flex items-center gap-2">
                                <Wifi className="w-3 h-3 text-emerald-400" />
                                <span className="text-[9px] font-black tracking-widest text-white uppercase">{member.rank}</span>
                            </div>
                        </div>

                        {/* Role Indicator on Image */}
                        <div className="absolute bottom-6 left-8 z-40">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-white/50 tracking-[0.4em] uppercase">{member.department}</span>
                                <h4 className={`${orbitron.className} text-xl md:text-2xl font-black text-white italic tracking-widest uppercase highlight-text shadow-black drop-shadow-md`} style={{ color: activeHover ? member.color : 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                                    {member.role}
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden bg-[#020504]">
                        {/* Static Grid Background */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[size:10px_10px]" />

                        <div className="relative z-10 flex flex-col gap-2 mb-4">
                            <div className="flex items-center gap-3 opacity-60">
                                <span className={`text-[10px] font-black tracking-[0.2em] uppercase font-mono text-emerald-400`}>
                                    {member.tag}
                                </span>
                            </div>

                            <h3 className={`${orbitron.className} text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mt-1`}>
                                {member.name}
                            </h3>
                        </div>

                        {/* Contact Actions Footer */}
                        <div className="pt-6 border-t border-white/10 flex items-center justify-between relative z-[60] mt-auto">
                            <div className="flex gap-3">
                                <a
                                    href={`tel:${member.phone}`}
                                    className="p-4 bg-white/10 rounded-xl border border-white/20 active:scale-95 transition-transform relative z-[60] cursor-pointer pointer-events-auto touch-manipulation"
                                    aria-label={`Call ${member.name}`}
                                >
                                    <Phone className="w-6 h-6 text-emerald-400" />
                                </a>
                                {member.instagram && (
                                    <a
                                        href={member.instagram}
                                        target="_blank"
                                        className="p-4 bg-white/10 rounded-xl border border-white/20 active:scale-95 transition-transform relative z-[60] cursor-pointer pointer-events-auto touch-manipulation"
                                        aria-label={`${member.name} Instagram`}
                                    >
                                        <Instagram className="w-6 h-6 text-pink-400" />
                                    </a>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-1 opacity-60">
                                <div className="p-2 border border-white/10 rounded-full">
                                    <Compass className="w-5 h-5 text-white/50" />
                                </div>
                                <span className="text-[7px] font-mono font-bold tracking-[0.2em] text-white/60">SYNCED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

const DigitalClock = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [time, setTime] = useState({ h: '00', m: '00', s: '00' })

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
        const update = () => {
            const now = new Date()
            setTime({
                h: now.getHours().toString().padStart(2, '0'),
                m: now.getMinutes().toString().padStart(2, '0'),
                s: now.getSeconds().toString().padStart(2, '0')
            })
        }
        update()
        const id = setInterval(update, 1000)
        return () => clearInterval(id)
    }, [])

    if (isMobile) {
        return <span className="font-mono text-emerald-400 tracking-[0.2em]">{time.h}:{time.m}:{time.s}</span>
    }

    const Digit = ({ value }: { value: string }) => (
        <div className="relative overflow-hidden h-[1.2em] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="inline-block"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    )

    return (
        <div className="flex items-center gap-1 font-mono text-emerald-400 tracking-[0.4em]">
            <Digit value={time.h} />
            <span className="animate-pulse">:</span>
            <Digit value={time.m} />
            <span className="animate-pulse">:</span>
            <Digit value={time.s} />
        </div>
    )
}

export default function CouncilPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredMembers = councilMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`min-h-screen ${inter.className} text-white selection:bg-emerald-500/30 overflow-x-hidden relative pb-60`}
        >
            <LivingBackground />

            {/* Visual HUD Scanner Overlays - STATIC & REDUCED OPACITY */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.01]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,0,0.08),rgba(0,0,0,0),rgba(0,255,0,0.08))] bg-[size:100%_3px,4px_100%]" />
            </div>

            {/* Header with Continuous Visual Dynamics */}
            <section className="relative pt-48 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full flex justify-center opacity-5 select-none pointer-events-none z-0">
                    <motion.h2
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className={`${orbitron.className} text-[25vw] font-black text-white stroke-text leading-none`}
                    >
                        ELITE
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-6 relative z-10 w-full"
                >
                    <div className="flex flex-col items-center gap-2 px-8 py-4 bg-[#050807]/80 border border-emerald-500/30 rounded-2xl backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center w-full max-w-2xl mx-auto">
                        <span className={`${orbitron.className} text-[7px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.5em] text-white/60 uppercase mb-1`}>
                            <ScrambleText text="SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY & MANAGEMENT" />
                        </span>
                        <div className="flex items-center justify-center gap-4 w-full">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className={`${orbitron.className} text-[8px] md:text-[10px] font-bold text-emerald-400 tracking-widest uppercase`}>
                                    <ScrambleText text="SYSTEM_ONLINE" />
                                </span>
                            </div>
                            <DigitalClock />
                        </div>
                    </div>

                    <h1 className={`${orbitron.className} text-4xl md:text-[120px] font-black text-center uppercase leading-none tracking-tighter text-white relative mt-10`}>
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                            className="text-white/40 block text-2xl md:text-5xl mb-2 tracking-[0.2em]"
                        >
                            CONNECT WITH
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] block"
                        >
                            VARNOTHSAVA
                        </motion.span>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col items-center gap-6 mt-8 w-full max-w-4xl px-6"
                    >
                        <p className={`${inter.className} text-sm md:text-xl font-medium text-white/70 tracking-wide text-center max-w-2xl leading-relaxed`}>
                            For any <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs md:text-base underline decoration-emerald-500/30 underline-offset-8">Clarifications, Queries, or Support</span>, feel free to reach out to our dedicated Student Council members listed below.
                        </p>
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                        <div className="flex flex-col items-center gap-2">
                            <span className={`${orbitron.className} text-[9px] md:text-xs font-black text-emerald-500/60 tracking-[0.5em] uppercase`}>Official Liaison Registry</span>
                            <p className="text-[10px] text-white/30 font-mono italic tracking-tight">Scroll down to view individual contact profiles</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Alive Search Console */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.8 }}
                    className="relative w-full max-w-2xl mt-24 group z-10"
                >
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -inset-4 bg-emerald-500 rounded-3xl blur-3xl"
                    />
                    <div className="relative bg-[#020504]/80 backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] overflow-hidden p-2 group-focus-within:border-emerald-500/60 transition-all duration-500">
                        <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                        <input
                            type="text"
                            placeholder="SEARCH ENCRYPTED DOSSIER..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent py-8 pl-24 pr-12 uppercase font-black tracking-widest text-sm focus:outline-none placeholder:text-white/20 text-white"
                        />
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-3 opacity-20">
                            <Activity className="w-5 h-5" />
                            <span className="text-[10px] font-mono tracking-tighter">DATA_FETCHING</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Continuous Animated Grid */}
            <section className="max-w-[1600px] mx-auto px-10 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
                    {filteredMembers.map((member, idx) => (
                        <HolographicCard key={member.name} member={member} index={idx} />
                    ))}
                </div>

                {filteredMembers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-60 flex flex-col items-center gap-10"
                    >
                        <ZapOff className="w-24 h-24 text-emerald-500/20 animate-pulse" />
                        <h3 className={`${orbitron.className} text-4xl font-black text-white/10 tracking-[1em] uppercase`}>NULL_VECTOR</h3>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-12 py-5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full text-emerald-500 font-black tracking-widest hover:bg-emerald-500/20 transition-all uppercase"
                        >
                            Reset Registry Sync
                        </button>
                    </motion.div>
                )}
            </section>

            {/* Cyber Utility Footer Section */}
            <section className="relative mt-80 py-40 bg-black/40 backdrop-blur-xl border-t border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-20">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Trophy className="w-8 h-8 text-emerald-500" />
                            <h5 className={`${orbitron.className} text-2xl font-black text-white tracking-[0.2em] uppercase`}>Elite_Dossier</h5>
                        </div>
                        <p className="text-white/20 font-mono text-sm max-w-sm">Global authentication verified for SMVITM Varnothsava 2026 executive command members.</p>
                    </div>

                    <div className="flex items-center gap-20">
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Security_Key</span>
                            <span className="font-mono text-emerald-400 text-lg">0X7F4B23-A</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Latency_Sync</span>
                            <span className="font-mono text-white text-lg">14MS</span>
                        </div>
                    </div>
                </div>

                {/* Matrix Deco Rain behind footer */}
                <div className="absolute inset-0 z-0 opacity-5">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute h-full w-[1px] bg-emerald-500" style={{ left: `${i * 5}%`, top: 0 }} />
                    ))}
                </div>
            </section>

            <style jsx global>{`
                .stroke-text {
                    -webkit-text-stroke: 2px rgba(255, 255, 255, 0.4);
                    color: transparent;
                }
                @keyframes gradient-text {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-text {
                    background-size: 200% auto;
                    animation: gradient-text 5s linear infinite;
                }
            `}</style>
        </motion.main>
    )
}
