'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProEventBackgroundProps {
    theme?: 'emerald' | 'amber' | 'cyan' | 'indigo'
    scrollProgress?: number
    isDetailed?: boolean
}

// --- HIGH-PERFORMANCE GRID ENGINE (FOR TECHNICAL/GAMING SECTORS) ---
function GridBeams({ theme = 'emerald' }: { theme?: 'emerald' | 'amber' | 'cyan' | 'indigo' }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const rgb = theme === 'amber' ? '251, 191, 36' : (theme === 'cyan' ? '6, 182, 212' : (theme === 'indigo' ? '99, 102, 241' : '16, 185, 129'))
    const isEmerald = theme === 'emerald'

    const [isMobile, setIsMobile] = React.useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { alpha: false }) // Optimization: Disable alpha if not needed, but we do need it for the grid. Actually, let's keep alpha true but optimize drawing.
        if (!ctx) return

        // Resolution Downscaling for mobile performance
        const dpr = window.devicePixelRatio || 1
        const scaleFactor = isMobile ? 0.6 : 1 // Render at 60% resolution on mobile

        let width = canvas.width = window.innerWidth * scaleFactor
        let height = canvas.height = window.innerHeight * scaleFactor
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        const rgb = theme === 'amber' ? '251, 191, 36' : (theme === 'cyan' ? '6, 182, 212' : '16, 185, 129')
        const isEmerald = theme === 'emerald'

        // Grid Configuration - Larger grid on mobile for performance
        const gridSize = isMobile ? 60 : 40
        const gridColor = `rgba(${rgb}, ${isEmerald ? 0.3 : 0.2})`
        const beamColor = `rgba(${rgb}, ${isEmerald ? 0.8 : 0.6})`
        const squareColor = `rgba(${rgb}, ${isEmerald ? 0.45 : 0.35})`

        // State
        const beams: { x: number, y: number, axis: 'x' | 'y', life: number, speed: number }[] = []
        const squares: { x: number, y: number, life: number }[] = []
        const particles: { x: number, y: number, s: number, vy: number, life: number }[] = []
        const mouse = { x: -1000, y: -1000 }

        const handleResize = () => {
            width = canvas.width = window.innerWidth
            height = canvas.height = window.innerHeight
        }
        window.addEventListener('resize', handleResize)

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        }
        if (!isMobile) window.addEventListener('mousemove', handleMouseMove)

        // Initialize Particles (Digital Dust) - Fewer particles on mobile
        const particleCount = isMobile ? 30 : 80
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                s: Math.random() * (isMobile ? 1.5 : 2),
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random()
            })
        }

        // Animation Loop
        const render = () => {
            ctx.clearRect(0, 0, width, height)

            // 0. Draw Nebula Pulse (Background Ambience) - Simplified for mobile
            const time = Date.now() * 0.0005
            const pulseX = Math.sin(time) * (isMobile ? 150 : 300) + width / 2
            const pulseY = Math.cos(time * 0.7) * (isMobile ? 100 : 200) + height / 2

            const nebulaRadius = isMobile ? 400 : 600
            const nebula = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, nebulaRadius)
            nebula.addColorStop(0, `rgba(${rgb}, ${isEmerald ? 0.2 : 0.1})`)
            nebula.addColorStop(1, 'transparent')
            ctx.fillStyle = nebula
            ctx.fillRect(0, 0, width, height)

            // Mouse Glow - Desktop Only
            if (!isMobile) {
                const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400)
                mouseGlow.addColorStop(0, `rgba(${rgb}, ${isEmerald ? 0.2 : 0.1})`)
                mouseGlow.addColorStop(1, 'transparent')
                ctx.fillStyle = mouseGlow
                ctx.fillRect(0, 0, width, height)
            }


            // 1. Draw Static Grid - "Square Wise" Design
            const pulse = (Math.sin(time * 1.5) + 1) / 2 // 0 to 1
            const breathingOpacity = isEmerald ? (0.2 + pulse * 0.1) : (0.15 + pulse * 0.05)

            ctx.strokeStyle = `rgba(${rgb}, ${breathingOpacity})`
            ctx.lineWidth = isMobile ? 0.8 : 1

            // Optimized single path for the entire grid
            ctx.beginPath()

            // Vertical lines
            for (let x = 0; x <= width; x += gridSize) {
                ctx.moveTo(x, 0)
                ctx.lineTo(x, height)
            }

            // Horizontal lines
            for (let y = 0; y <= height; y += gridSize) {
                ctx.moveTo(0, y)
                ctx.lineTo(width, y)
            }
            ctx.stroke()

            // "Technical" markings - Dot intersections (Square wise markers)
            if (!isMobile) {
                ctx.fillStyle = `rgba(${rgb}, 0.3)`
                for (let x = 0; x <= width; x += gridSize * 2) {
                    for (let y = 0; y <= height; y += gridSize * 2) {
                        ctx.fillRect(x - 1, y - 1, 2, 2)
                    }
                }
            }
            ctx.shadowBlur = 0

            // 2. Manage & Draw Beams (Shooting Lines) - Lower density on mobile
            const beamSpawnRate = isMobile ? 0.04 : 0.1
            if (Math.random() < beamSpawnRate) {
                const axis = Math.random() > 0.5 ? 'x' : 'y'
                beams.push({
                    x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
                    y: Math.floor(Math.random() * (height / gridSize)) * gridSize,
                    axis,
                    life: 1.0,
                    speed: 4 + Math.random() * 6
                })
            }

            for (let i = beams.length - 1; i >= 0; i--) {
                const b = beams[i]
                b.life -= 0.02

                const grad = ctx.createLinearGradient(
                    b.x, b.y,
                    b.axis === 'x' ? b.x + 150 : b.x,
                    b.axis === 'y' ? b.y + 150 : b.y
                )
                grad.addColorStop(0, `rgba(${rgb}, 0)`)
                grad.addColorStop(1, beamColor)

                ctx.strokeStyle = grad
                ctx.lineWidth = isEmerald ? 2 : 1.5
                // REMOVED: Expensive shadowBlur
                ctx.beginPath()
                if (b.axis === 'x') { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + 150, b.y); b.x += b.speed }
                else { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + 150); b.y += b.speed }
                ctx.stroke()

                if (b.life <= 0 || b.x > width || b.y > height) beams.splice(i, 1)
            }

            // 3. Manage & Draw Active Squares (Flickering Cells)
            const squareSpawnRate = isMobile ? 0.1 : 0.25
            if (Math.random() < squareSpawnRate) {
                squares.push({
                    x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
                    y: Math.floor(Math.random() * (height / gridSize)) * gridSize,
                    life: 0
                })
            }

            // Mouse Interaction squares - Desktop Only
            if (!isMobile && Math.random() < 0.5) {
                const mx = Math.floor(mouse.x / gridSize) * gridSize
                const my = Math.floor(mouse.y / gridSize) * gridSize
                squares.push({ x: mx, y: my, life: 0 })
            }

            for (let i = squares.length - 1; i >= 0; i--) {
                const s = squares[i]
                s.life += 0.04
                const alpha = Math.sin(s.life * Math.PI) * 0.35

                if (s.life >= 1) { squares.splice(i, 1); continue }

                ctx.fillStyle = `rgba(${rgb}, ${alpha})`
                ctx.fillRect(s.x + 1, s.y + 1, gridSize - 2, gridSize - 2)
            }

            // 4. Draw Digital Particles - Enhanced for emerald
            ctx.fillStyle = `rgba(${rgb}, ${isEmerald ? 0.6 : 0.4})`
            ctx.shadowBlur = isEmerald ? 3 : 0
            ctx.shadowColor = isEmerald ? `rgba(${rgb}, 0.8)` : 'transparent'
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                p.y -= p.vy
                if (p.y < 0) p.y = height
                if (p.y > height) p.y = 0

                // Mouse repulsion/attraction subtle
                const dx = p.x - mouse.x
                const dy = p.y - mouse.y
                const d = Math.sqrt(dx * dx + dy * dy)
                if (d < 100) {
                    p.x += dx * 0.01
                    p.y += dy * 0.01
                }

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
                ctx.fill()
            }

            requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    if (isMobile) {
        return (
            <div className={`absolute inset-0 z-0 pointer-events-none opacity-30`}>
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(${rgb}, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(${rgb}, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
                {/* Subtle digital dust as CSS pulses instead of canvas particles */}
                <div className="absolute inset-0 opacity-20">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`
                        }} />
                    ))}
                </div>
            </div>
        )
    }

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}


export default function ProEventBackground({ theme = 'emerald', scrollProgress, isDetailed = false }: ProEventBackgroundProps) {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])
    // ... themeColors remains the same ...
    // Premium color configurations - REDESIGNED for luxury
    const themeColors = {
        emerald: {
            primary: 'rgba(16, 185, 129, 0.15)',
            secondary: 'rgba(16, 185, 129, 0.1)',
            accent: 'rgba(16, 185, 129, 0.25)',
            glow: 'rgba(16, 185, 129, 0.8)',
            gridLine: 'rgba(16, 185, 129, 0.3)',
            beamGradient: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.8), transparent)',
            borderColor: '#10b981',
            shadowColor: 'rgba(16, 185, 129, 0.8)'
        },
        amber: {
            // LUXURY AMBER PALETTE - Brighter, more sophisticated
            primary: 'rgba(251, 191, 36, 0.15)',      // amber-400 (brighter!)
            secondary: 'rgba(245, 158, 11, 0.12)',    // amber-500
            accent: 'rgba(251, 191, 36, 0.18)',       // Increased brightness
            glow: 'rgba(251, 191, 36, 0.4)',          // Stronger glow
            gridLine: 'rgba(251, 191, 36, 0.2)',      // More visible grid
            beamGradient: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent)',
            borderColor: '#fbbf24',                   // Bright amber-400
            shadowColor: 'rgba(251, 191, 36, 0.6)',   // Vibrant shadow
            // Additional luxury colors
            highlight: 'rgba(252, 211, 77, 0.25)',    // amber-300 for highlights
            warmGlow: 'rgba(217, 119, 6, 0.1)'        // amber-600 for depth
        },
        cyan: {
            primary: 'rgba(6, 182, 212, 0.12)',
            secondary: 'rgba(6, 182, 212, 0.08)',
            accent: 'rgba(6, 182, 212, 0.15)',
            glow: 'rgba(6, 182, 212, 0.3)',
            gridLine: 'rgba(6, 182, 212, 0.15)',
            beamGradient: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent)',
            borderColor: '#06b6d4',
            shadowColor: 'rgba(6, 182, 212, 0.5)'
        },
        indigo: {
            // COSMIC INDIGO PALETTE
            primary: 'rgba(99, 102, 241, 0.15)',
            secondary: 'rgba(99, 102, 241, 0.1)',
            accent: 'rgba(167, 139, 250, 0.2)',
            glow: 'rgba(99, 102, 241, 0.8)',
            gridLine: 'rgba(99, 102, 241, 0.3)',
            beamGradient: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.8), transparent)',
            borderColor: '#6366f1',
            shadowColor: 'rgba(99, 102, 241, 0.8)'
        }
    }

    const colors = themeColors[theme]

    // --- PROCEDURAL MANDALA LOGIC (THE INNOVATION) ---

    // Final Render: Dual-Layer System with AnimatePresence for Smooth Cross-Fading
    return (
        <AnimatePresence mode="popLayout">
            {/* --- AMBER LAYER (CULTURAL) --- */}
            {theme === 'amber' && (
                <motion.div
                    key="amber-layer"
                    className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    {/* 1. CUSTOM CULTURAL IMAGE BACKGROUND - Only shown in Grid, not Detailed Page */}
                    {!isDetailed && (
                        <div className="absolute inset-0 z-0 flex items-start justify-center bg-black overflow-hidden">
                            {/* Blurred Backdrop version to fill gap for any aspect ratio */}
                            <img
                                src="/cultural-bg.png"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110"
                            />
                            {/* Main Image - Pinned to TOP for a professional "Hero" look */}
                            <img
                                src="/cultural-bg.png"
                                alt="Cultural Background"
                                className="relative transition-all duration-1000 z-10 w-full md:h-auto h-full object-cover md:object-contain opacity-100"
                                loading="eager"
                                style={{
                                    filter: isMobile ? 'brightness(0.6) contrast(1.2)' : 'brightness(0.9) contrast(1.05)',
                                    transformOrigin: 'top'
                                }}
                            />
                            {/* 2. OVERLAY FOR TEXT READABILITY & DEPTH */}
                            <div className="absolute inset-0 z-20 transition-opacity duration-1000 bg-gradient-to-b from-black/40 via-transparent to-black/80 md:to-black/60" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(0,0,0,0.6)_100%)] z-20" />
                        </div>
                    )}

                    {/* Fallback for Detailed Page - Clean Dark Aesthetic */}
                    {isDetailed && (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]" />
                    )}

                    {/* 3. BASE LAYER: REPEATING TECH TEXTURE (Subtle atop image) */}
                    <div className="absolute inset-0 opacity-[0.05] z-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30 L31 31 M0 0 L1 1 M60 60 L59 59' stroke='%23f59e0b' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                            backgroundSize: '100px 100px'
                        }}
                    />
                </motion.div>
            )}

            {/* --- EMERALD/GAMING LAYER (DEFAULT) --- */}
            {theme === 'emerald' && (
                <motion.div
                    key="emerald-layer"
                    className="fixed inset-0 z-0 pointer-events-none bg-[#020403] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    {/* 1. Deep Space Base */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.05),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,78,59,0.1),transparent_70%)]" />

                    {/* 2. The Animated Beam Grid */}
                    <div className="absolute inset-0 opacity-100 mix-blend-screen">
                        <GridBeams theme={theme} />
                    </div>

                    {/* 3. Global Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_50%,rgba(2,4,3,0.7)_100%)] pointer-events-none" />

                    {/* 4. Subtle Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                </motion.div>
            )}
            {/* --- CYAN/GAMING LAYER --- */}
            {theme === 'cyan' && (
                <motion.div
                    key="cyan-layer"
                    className="fixed inset-0 z-0 pointer-events-none bg-[#010405] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    {/* 1. Cyber Pulse Base */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.08),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(8,145,178,0.1),transparent_70%)]" />

                    {/* 2. The Animated Beam Grid (Cyan) */}
                    <div className="absolute inset-0 opacity-100 mix-blend-screen">
                        <GridBeams theme="cyan" />
                    </div>

                    {/* 3. Global Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_50%,rgba(1,4,5,0.8)_100%)] pointer-events-none" />

                    {/* 4. Subtle Digital Noise */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                </motion.div>
            )}
            {/* --- INDIGO/COSMIC LAYER --- */}
            {theme === 'indigo' && (
                <motion.div
                    key="indigo-layer"
                    className="fixed inset-0 z-0 pointer-events-none bg-[#020308] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    {/* 1. Nebula Pulse Base */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.12),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(79,70,229,0.15),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(67,56,202,0.15),transparent_60%)]" />

                    {/* 2. The Animated Beam Grid (Indigo) */}
                    <div className="absolute inset-0 opacity-100 mix-blend-screen">
                        <GridBeams theme="indigo" />
                    </div>

                    {/* 3. Global Cosmic Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(2,3,8,0.85)_100%)] pointer-events-none" />

                    {/* 4. Subtle Cosmic Noise */}
                    <div className="absolute inset-0 opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
