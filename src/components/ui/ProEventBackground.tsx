'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface ProEventBackgroundProps {
    theme?: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'gaming'
    scrollProgress?: number
    isDetailed?: boolean
}

// --- EPIC LIVELY GAMING BACKGROUND (CHARACTERS & ARENA) ---
const GamingPulse = React.memo(({ scrollProgress = 0 }: { scrollProgress?: number }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base Lively Gaming Image Layer (Parallax) */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/gaming-bg.png"
                    alt=""
                    fill
                    className="absolute inset-0 w-full h-full object-cover blur-[2px] opacity-40 scale-110"
                />
                <motion.img
                    src="/gaming-bg.png"
                    alt="Gaming Vibe"
                    className="relative z-10 w-full h-full object-cover opacity-60"
                    style={{
                        y: scrollProgress * 50,
                        scale: 1 + scrollProgress * 0.05
                    }}
                />
                {/* Overlay Vignette for readability */}
                <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
            </div>

            {/* Kinetic Energy Overlays */}
            <div className="absolute inset-0 z-30">
                {/* Rapid 'Speed Lanes' */}
                <div className="absolute inset-0 opacity-10">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={`lane-${i}`}
                            className="absolute w-[1px] h-[300%] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
                            style={{
                                left: `${20 + i * 20}%`,
                                top: '-100%',
                                rotate: '15deg',
                                willChange: 'transform'
                            }}
                            animate={{ y: ['-30%', '30%'] }}
                            transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
                        />
                    ))}
                </div>

                {/* Stadium Light Sweeps */}
                <motion.div
                    className="absolute top-0 left-0 w-[300px] h-[200%] bg-cyan-500/10 blur-[150px]"
                    animate={{ rotate: [-8, 8, -8], x: ['-5%', '5%', '-5%'] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: 'top center', willChange: 'transform' }}
                />
                <motion.div
                    className="absolute top-0 right-0 w-[300px] h-[200%] bg-violet-600/10 blur-[150px]"
                    animate={{ rotate: [8, -8, 8], x: ['5%', '-5%', '5%'] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: 'top center', willChange: 'transform' }}
                />

                {/* Energy Sparks */}
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={`spark-${i}`}
                        className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full shadow-[0_0_10px_white]"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, willChange: 'opacity, transform' }}
                        animate={{ opacity: [0, 0.6, 0], scale: [0, 1.2, 0] }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }}
                    />
                ))}
            </div>

            {/* Prismatic Horizon */}
            <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_10%,rgba(0,0,5,0.7)_100%)]" />
        </div>
    )
})

// --- HIGH-PERFORMANCE GRID ENGINE ---
const GridBeams = React.memo(({ theme = 'emerald' }: { theme?: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'gaming' }) => {
    // ... existing useEffect with added gaming logic ...
    const canvasRef = useRef<HTMLCanvasElement>(null)
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
        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) return

        const scaleFactor = isMobile ? 0.5 : 1
        let width = canvas.width = window.innerWidth * scaleFactor
        let height = canvas.height = window.innerHeight * scaleFactor
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        const getRGB = () => {
            if (theme === 'gaming') return '139, 92, 246' // Violet-500
            if (theme === 'amber') return '251, 191, 36'
            if (theme === 'cyan') return '6, 182, 212'
            if (theme === 'indigo') return '99, 102, 241'
            return '16, 185, 129'
        }
        const rgb = getRGB()
        const isEmerald = theme === 'emerald'
        const isGaming = theme === 'gaming'

        const gridSize = isMobile ? 80 : (isGaming ? 40 : 50)
        const gridColor = `rgba(${rgb}, ${isEmerald ? 0.15 : (isGaming ? 0.12 : 0.08)})`
        // ... existing render logic simplified for brevity but needs to be complete ...
        const beams: { x: number; y: number; axis: 'x' | 'y'; life: number; speed: number }[] = []
        const squares: { x: number; y: number; life: number }[] = []
        const particles: { x: number; y: number; s: number; vy: number }[] = []

        const particleCount = isMobile ? 15 : 40
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                s: Math.random() * (isMobile ? 1.2 : 2),
                vy: (Math.random() - 0.5) * 0.4
            })
        }

        let rafId: number
        const render = () => {
            ctx.clearRect(0, 0, width, height)
            ctx.strokeStyle = gridColor
            ctx.lineWidth = 1
            ctx.beginPath()
            for (let x = 0; x <= width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, height) }
            for (let y = 0; y <= height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(width, y) }
            ctx.stroke()

            if (Math.random() < (isMobile ? 0.01 : 0.03)) {
                const axis = Math.random() > 0.5 ? 'x' : 'y'
                beams.push({
                    x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
                    y: Math.floor(Math.random() * (height / gridSize)) * gridSize,
                    axis, life: 1.0, speed: 2 + Math.random() * 3
                })
            }

            for (let i = beams.length - 1; i >= 0; i--) {
                const b = beams[i]; b.life -= 0.02
                if (b.life <= 0) { beams.splice(i, 1); continue }
                const grad = ctx.createLinearGradient(b.x, b.y, b.axis === 'x' ? b.x + 80 : b.x, b.axis === 'y' ? b.y + 80 : b.y)
                grad.addColorStop(0, 'transparent'); grad.addColorStop(1, `rgba(${rgb}, ${b.life * 0.5})`)
                ctx.strokeStyle = grad; ctx.lineWidth = 1.2; ctx.beginPath()
                if (b.axis === 'x') { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + 80, b.y); b.x += b.speed }
                else { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + 80); b.y += b.speed }
                ctx.stroke()
            }

            if (Math.random() < 0.05) squares.push({ x: Math.floor(Math.random() * (width / gridSize)) * gridSize, y: Math.floor(Math.random() * (height / gridSize)) * gridSize, life: 0 })
            for (let i = squares.length - 1; i >= 0; i--) {
                const s = squares[i]; s.life += 0.02
                if (s.life >= 1) { squares.splice(i, 1); continue }
                ctx.fillStyle = `rgba(${rgb}, ${Math.sin(s.life * Math.PI) * 0.15})`; ctx.fillRect(s.x + 1, s.y + 1, gridSize - 2, gridSize - 2)
            }

            ctx.fillStyle = `rgba(${rgb}, 0.3)`
            for (let p of particles) {
                p.y -= p.vy; if (p.y < 0) p.y = height; if (p.y > height) p.y = 0
                ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill()
            }
            rafId = requestAnimationFrame(render)
        }
        render()
        return () => cancelAnimationFrame(rafId)
    }, [isMobile, theme])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
})

// --- FLOATING ENERGY ORBS ---
const FloatingOrbs = React.memo(({ theme = 'emerald' }: { theme?: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'gaming' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
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
        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) return
        let width = canvas.width = window.innerWidth
        let height = canvas.height = window.innerHeight
        const getRGB = () => {
            if (theme === 'gaming') return '139, 92, 246' // Violet-500
            if (theme === 'amber') return '251, 191, 36'
            if (theme === 'cyan') return '6, 182, 212'
            if (theme === 'indigo') return '99, 102, 241'
            return '16, 185, 129'
        }
        const rgb = getRGB()
        const orbs: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = []
        const count = isMobile ? 3 : 8
        for (let i = 0; i < count; i++) {
            orbs.push({
                x: Math.random() * width, y: Math.random() * height,
                r: Math.random() * (isMobile ? 80 : 180) + 40,
                vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
                alpha: Math.random() * 0.06 + 0.02
            })
        }
        let rafId: number; let lastTime = 0; const interval = 1000 / 30
        const render = (time: number) => {
            if (time - lastTime < interval) { rafId = requestAnimationFrame(render); return }
            lastTime = time; ctx.clearRect(0, 0, width, height)
            for (const orb of orbs) {
                orb.x += orb.vx; orb.y += orb.vy; if (orb.x < -orb.r) orb.x = width + orb.r; if (orb.x > width + orb.r) orb.x = -orb.r; if (orb.y < -orb.r) orb.y = height + orb.r; if (orb.y > height + orb.r) orb.y = -orb.r
                const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
                grad.addColorStop(0, `rgba(${rgb}, ${orb.alpha})`); grad.addColorStop(1, 'transparent')
                ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2); ctx.fill()
            }
            rafId = requestAnimationFrame(render)
        }
        rafId = requestAnimationFrame(render); return () => cancelAnimationFrame(rafId)
    }, [theme, isMobile])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" />
})

export default function ProEventBackground({ theme = 'emerald', scrollProgress = 0, isDetailed = false }: ProEventBackgroundProps) {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <AnimatePresence mode="popLayout">
            {theme === 'gaming' && (
                <motion.div
                    key="gaming-layer"
                    className="fixed inset-0 z-0 pointer-events-none bg-[#03020d] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.15),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.1),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_70%)]" />

                    <div className="absolute inset-0 opacity-100 mix-blend-screen">
                        <GridBeams theme="gaming" />
                    </div>

                    <GamingPulse scrollProgress={scrollProgress} />
                    <FloatingOrbs theme="gaming" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(3,2,13,0.5)_100%)] pointer-events-none" />

                    {/* Noise Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                </motion.div>
            )}

            {theme === 'amber' && (
                <motion.div
                    key="amber-layer"
                    className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0f0901] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_80%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(245,158,11,0.1),transparent_60%)]" />

                    {!isDetailed && (
                        <div className="absolute inset-0 z-0 flex items-start justify-center overflow-hidden">
                            <img src="/cultural-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110" />
                            <motion.img
                                src="/cultural-bg.png" alt="Cultural Background"
                                className="relative z-10 w-full md:h-auto h-full object-cover md:object-contain opacity-100"
                                loading="eager"
                                style={{
                                    filter: isMobile ? 'brightness(0.8) contrast(1.1)' : 'brightness(1.1) contrast(1.05)',
                                    transformOrigin: 'top',
                                    y: scrollProgress * 0.1
                                }}
                            />
                            <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/10 via-transparent to-[#0f0901]/90" />
                        </div>
                    )}

                    <FloatingOrbs theme="amber" />
                </motion.div>
            )}

            {theme === 'emerald' && (
                <motion.div
                    key="emerald-layer"
                    className="fixed inset-0 z-0 pointer-events-none bg-[#010a06] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.18),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(16,185,129,0.08),transparent_50%)]" />
                    <div className="absolute inset-0 opacity-100 mix-blend-screen">
                        <GridBeams theme={theme} />
                    </div>
                    <FloatingOrbs theme="emerald" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(1,10,6,0.5)_100%)] pointer-events-none" />
                </motion.div>
            )}

            {theme === 'cyan' && (
                <motion.div
                    key="cyan-layer"
                    className="fixed inset-0 z-0 pointer-events-none bg-[#00080d] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.18),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(6,182,212,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 opacity-100 mix-blend-screen">
                        <GridBeams theme="cyan" />
                    </div>
                    <FloatingOrbs theme="cyan" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(0,8,13,0.5)_100%)] pointer-events-none" />
                </motion.div>
            )}

            {theme === 'indigo' && (
                <motion.div
                    key="indigo-layer"
                    className="fixed inset-0 z-0 pointer-events-none bg-[#03030f] will-change-opacity"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.18),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 opacity-100 mix-blend-screen">
                        <GridBeams theme="indigo" />
                    </div>
                    <FloatingOrbs theme="indigo" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(3,3,15,0.6)_100%)] pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

