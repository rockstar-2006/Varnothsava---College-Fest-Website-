'use client'

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ProEventBackgroundProps {
    theme?: 'emerald' | 'amber' | 'cyan'
}

// --- HIGH-PERFORMANCE GRID ENGINE (FOR TECHNICAL/GAMING SECTORS) ---
function GridBeams() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = canvas.width = window.innerWidth
        let height = canvas.height = window.innerHeight

        // Grid Configuration
        const gridSize = 40
        const gridColor = 'rgba(16, 185, 129, 0.15)'
        const beamColor = 'rgba(16, 185, 129, 0.5)'
        const squareColor = 'rgba(16, 185, 129, 0.25)'

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
        window.addEventListener('mousemove', handleMouseMove)

        // Initialize Particles (Digital Dust)
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                s: Math.random() * 2,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random()
            })
        }

        // Animation Loop
        const render = () => {
            ctx.clearRect(0, 0, width, height)

            // 0. Draw Nebula Pulse (Background Ambience)
            const time = Date.now() * 0.0005
            const pulseX = Math.sin(time) * 300 + width / 2
            const pulseY = Math.cos(time * 0.7) * 200 + height / 2

            const nebula = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 600)
            nebula.addColorStop(0, 'rgba(16, 185, 129, 0.05)')
            nebula.addColorStop(1, 'transparent')
            ctx.fillStyle = nebula
            ctx.fillRect(0, 0, width, height)

            // Mouse Glow
            const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300)
            mouseGlow.addColorStop(0, 'rgba(16, 185, 129, 0.08)')
            mouseGlow.addColorStop(1, 'transparent')
            ctx.fillStyle = mouseGlow
            ctx.fillRect(0, 0, width, height)


            // 1. Draw Static Grid
            ctx.strokeStyle = gridColor
            ctx.lineWidth = 1
            ctx.beginPath()

            for (let x = 0; x <= width; x += gridSize) {
                ctx.moveTo(x, 0); ctx.lineTo(x, height)
            }
            for (let y = 0; y <= height; y += gridSize) {
                ctx.moveTo(0, y); ctx.lineTo(width, y)
            }
            ctx.stroke()

            // 2. Manage & Draw Beams (Shooting Lines) - High Density
            if (Math.random() < 0.1) {
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
                grad.addColorStop(0, `rgba(16, 185, 129, 0)`)
                grad.addColorStop(1, beamColor)

                ctx.strokeStyle = grad
                ctx.lineWidth = 2
                ctx.beginPath()
                if (b.axis === 'x') { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + 150, b.y); b.x += b.speed }
                else { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + 150); b.y += b.speed }
                ctx.stroke()

                if (b.life <= 0 || b.x > width || b.y > height) beams.splice(i, 1)
            }

            // 3. Manage & Draw Active Squares (Flickering Cells) - Hyper Active
            if (Math.random() < 0.25) {
                squares.push({
                    x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
                    y: Math.floor(Math.random() * (height / gridSize)) * gridSize,
                    life: 0
                })
            }

            // Mouse Interaction squares
            if (Math.random() < 0.5) {
                const mx = Math.floor(mouse.x / gridSize) * gridSize
                const my = Math.floor(mouse.y / gridSize) * gridSize
                squares.push({ x: mx, y: my, life: 0 })
            }

            for (let i = squares.length - 1; i >= 0; i--) {
                const s = squares[i]
                s.life += 0.04
                const alpha = Math.sin(s.life * Math.PI) * 0.35

                if (s.life >= 1) { squares.splice(i, 1); continue }

                ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
                ctx.fillRect(s.x + 1, s.y + 1, gridSize - 2, gridSize - 2)
            }

            // 4. Draw Digital Particles
            ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'
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

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const QuantumLattice = () => {
    const { mouse, viewport } = useThree()
    const pointsRef = useRef<THREE.Points>(null!)
    const particleCount = 2500

    // Create initial positions and velocities
    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3)
        const vel = new Float32Array(particleCount * 3)
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 15
            pos[i * 3 + 1] = (Math.random() - 0.5) * 15
            pos[i * 3 + 2] = (Math.random() - 0.5) * 5

            vel[i * 3] = (Math.random() - 0.5) * 0.01
            vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01
        }
        return [pos, vel]
    }, [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const currentPositions = pointsRef.current.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3
            const iy = i * 3 + 1
            const iz = i * 3 + 2

            // Target position based on mouse (Gravity Well)
            const targetX = mouse.x * viewport.width / 2
            const targetY = mouse.y * viewport.height / 2

            // Distance to mouse
            const dx = targetX - currentPositions[ix]
            const dy = targetY - currentPositions[iy]
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Physics influence
            const force = Math.max(0, 1 - dist / 5) * 0.02

            velocities[ix] += dx * force + Math.sin(time + currentPositions[iy]) * 0.001
            velocities[iy] += dy * force + Math.cos(time + currentPositions[ix]) * 0.001

            // Apply air friction
            velocities[ix] *= 0.98
            velocities[iy] *= 0.98

            // Update positions
            currentPositions[ix] += velocities[ix]
            currentPositions[iy] += velocities[iy]

            // Boundary check - wrap around
            if (Math.abs(currentPositions[ix]) > viewport.width) currentPositions[ix] *= -0.9
            if (Math.abs(currentPositions[iy]) > viewport.height) currentPositions[iy] *= -0.9
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true
        pointsRef.current.rotation.z += 0.001
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.035}
                color="#fbbf24"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export default function ProEventBackground({ theme = 'emerald' }: ProEventBackgroundProps) {
    // ... themeColors remains the same ...
    // Premium color configurations - REDESIGNED for luxury
    const themeColors = {
        emerald: {
            primary: 'rgba(16, 185, 129, 0.12)',
            secondary: 'rgba(16, 185, 129, 0.08)',
            accent: 'rgba(16, 185, 129, 0.15)',
            glow: 'rgba(16, 185, 129, 0.3)',
            gridLine: 'rgba(16, 185, 129, 0.15)',
            beamGradient: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.4), transparent)',
            borderColor: '#10b981',
            shadowColor: 'rgba(16, 185, 129, 0.5)'
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
        }
    }

    const colors = themeColors[theme]

    // --- PROCEDURAL MANDALA LOGIC (THE INNOVATION) ---
    const MandalaBase = () => {
        const meshRef = useRef<THREE.Mesh>(null!)

        useFrame((state) => {
            const t = state.clock.getElapsedTime()
            if (meshRef.current) {
                meshRef.current.rotation.z = t * 0.05
                // Pulsing scale
                const s = 1 + Math.sin(t * 0.5) * 0.05
                meshRef.current.scale.set(s, s, s)
            }
        })

        return (
            <mesh ref={meshRef} position={[0, 0, -2]}>
                <planeGeometry args={[15, 15]} />
                <meshBasicMaterial
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                >
                    <canvasTexture
                        attach="map"
                        image={(() => {
                            const canvas = document.createElement('canvas')
                            canvas.width = canvas.height = 1024
                            const ctx = canvas.getContext('2d')!
                            ctx.strokeStyle = '#fbbf24'
                            ctx.lineWidth = 1
                            ctx.shadowBlur = 15
                            ctx.shadowColor = '#fbbf24'

                            // Draw Tech-Mandala
                            ctx.translate(512, 512)
                            for (let i = 0; i < 36; i++) {
                                ctx.rotate((Math.PI * 2) / 18)
                                ctx.beginPath()
                                ctx.moveTo(0, 0)
                                ctx.bezierCurveTo(100, -200, 300, -200, 400, 0)
                                ctx.stroke()

                                // Tech details
                                ctx.rect(350, -10, 20, 20)
                                ctx.stroke()
                            }
                            return canvas
                        })()}
                    />
                </meshBasicMaterial>
            </mesh>
        )
    }

    // Final Render: Dual-Layer System for Smooth Transitions
    return (
        <>
            {/* --- AMBER LAYER (CULTURAL) --- */}
            <motion.div
                className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: theme === 'amber' ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            >
                {/* 1. BASE LAYER: REPEATING TECH TEXTURE */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30 L31 31 M0 0 L1 1 M60 60 L59 59' stroke='%23f59e0b' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                        backgroundSize: '100px 100px'
                    }}
                />

                {/* 2. LOCALIZED SOUL EMBERS */}
                <div className="absolute inset-0 z-0 opacity-30">
                    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                        <ambientLight intensity={0.5} />
                        <QuantumLattice />
                    </Canvas>
                </div>

                <div className="absolute inset-0 z-10 flex items-end justify-center">
                    {/* 3. LAYER: THE LIVE ANIMATED IMAGE */}
                    <motion.div
                        className="relative w-full max-w-[94vw] h-[85vh] flex items-center justify-center mix-blend-screen mx-auto"
                        style={{
                            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
                        }}
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.9, 1, 0.9],
                            filter: [
                                'saturate(1.4) brightness(1.2)',
                                'saturate(1.8) brightness(1.4)',
                                'saturate(1.4) brightness(1.2)'
                            ]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* EXPLOSIVE GLOW CORE - Added to force the "glowing effect" */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-amber-500/30 blur-[120px] rounded-full mix-blend-plus-lighter" />

                        {/* Base Image */}
                        <div
                            className="absolute inset-0 bg-no-repeat bg-center rounded-full"
                            style={{
                                backgroundImage: 'url("/cultural_hero.png")',
                                backgroundSize: 'cover',
                                maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 100%)',
                                filter: 'brightness(1.5) contrast(1.2) drop-shadow(0 0 50px rgba(245, 158, 11, 0.6))'
                            }}
                        />

                        {/* ATMOSPHERIC LIGHT RAYS */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={`aurora-${i}`}
                                    className="absolute top-0 w-32 h-full bg-gradient-to-b from-transparent via-amber-400/20 to-transparent"
                                    animate={{
                                        left: ['-20%', '120%'],
                                        opacity: [0, 0.6, 0]
                                    }}
                                    transition={{
                                        duration: 12 + i * 4,
                                        repeat: Infinity,
                                        ease: "linear",
                                        delay: i * 5
                                    }}
                                    style={{ transform: 'skewX(-25deg)' }}
                                />
                            ))}
                        </div>

                        {/* SHARP SCANNING LASER BEAM */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent w-[30%] h-full skew-x-12"
                            animate={{ left: ['-40%', '140%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        {/* AMBIENT SIGNAL SHIMMER */}
                        <motion.div
                            className="absolute inset-0 bg-amber-400/5 blur-3xl"
                            animate={{ opacity: [0, 0.4, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* VERTICAL SCAN-GRID */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(251, 191, 36, 0.1) 1px, rgba(251, 191, 36, 0.1) 2px)',
                                backgroundSize: '100% 4px'
                            }}
                        />

                        {/* FLOATING DATA EMBERS */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={`ember-${i}`}
                                className="absolute w-1.5 h-1.5 bg-amber-400/40 blur-[1px] rounded-full"
                                animate={{
                                    x: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                                    y: [Math.random() * 300 - 150, Math.random() * 300 - 150],
                                    opacity: [0, 0.8, 0],
                                    scale: [0, 1.4, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 6 + 6,
                                    repeat: Infinity,
                                    delay: i * 0.8
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* 4. LAYER: DEPTH & ANGLE */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(0,0,0,0.85)_100%)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40" />
                    <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-amber-950/20 via-transparent to-transparent" />
                </div>
            </motion.div>

            {/* --- EMERALD/GAMING LAYER (DEFAULT) --- */}
            <motion.div
                className="fixed inset-0 z-0 pointer-events-none bg-[#020403]"
                initial={{ opacity: 1 }}
                animate={{ opacity: theme === 'amber' ? 0 : 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            >
                {/* 1. Deep Space Base */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.05),transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,78,59,0.1),transparent_70%)]" />

                {/* 2. The Animated Beam Grid */}
                <div className="absolute inset-0 opacity-100 mix-blend-screen">
                    <GridBeams />
                </div>

                {/* 3. Global Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_50%,rgba(2,4,3,0.7)_100%)] pointer-events-none" />

                {/* 4. Subtle Noise Texture */}
                <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            </motion.div>
        </>
    )
}
