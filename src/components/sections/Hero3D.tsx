'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Float, Environment, MeshTransmissionMaterial, Torus, Stars } from '@react-three/drei'
import { useRef, Suspense, useState, useEffect } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { ChevronDown, Users, Activity, Globe } from 'lucide-react'
import Link from 'next/link'

function SpaceScene({ isMobile }: { isMobile: boolean }) {
    const group = useRef<THREE.Group>(null!)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        group.current.rotation.y = t * 0.1
    })

    return (
        <group ref={group} position={[0, 0, 0]}>
            {/* The Planet - Emerald Core */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sphere args={[4.2, isMobile ? 32 : 64, isMobile ? 32 : 64]}>
                    {isMobile ? (
                        <meshStandardMaterial
                            color="#10b981"
                            roughness={0.2}
                            metalness={0.8}
                            emissive="#10b981"
                            emissiveIntensity={0.2}
                        />
                    ) : (
                        <MeshTransmissionMaterial
                            color="#10b981"
                            thickness={1}
                            roughness={0.1}
                            transmission={0.9}
                            ior={1.2}
                            chromaticAberration={0.04}
                            backside
                        />
                    )}
                </Sphere>
            </Float>

            {/* Subtle Green Rings */}
            <Float speed={1.5}>
                <Torus args={[5.4, 0.015, 16, isMobile ? 60 : 120]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} transparent opacity={0.4} />
                </Torus>
            </Float>
        </group>
    )
}

export function Hero3D() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div className="relative min-h-screen w-full bg-[#050805] overflow-hidden pt-20">
            {/* Professional 3D Sector - Lowered Alignment and Depth */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ duration: 2, delay: 0.5 }}
                className="absolute right-[-5%] lg:right-[-5%] top-[15%] md:top-24 w-full lg:w-3/5 h-[60%] md:h-[calc(100%-96px)] z-0 pointer-events-none"
            >
                <Canvas
                    camera={{ position: [0, 0, 14.5], fov: 40 }}
                    gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
                >
                    <Suspense fallback={null}>
                        <ambientLight intensity={1} />
                        <pointLight position={[10, 10, 10]} intensity={3} color="#10b981" />
                        <Environment preset="night" />
                        <Stars radius={100} depth={50} count={isMobile ? 150 : 3000} factor={4} saturation={0} fade speed={1} />
                        <SpaceScene isMobile={isMobile} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </motion.div>

            {/* Clean Hero Content - Green Accents */}
            <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col justify-center h-full">
                <div className="max-w-3xl space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-[1px] bg-emerald-500" />
                            <span className="text-emerald-400 font-mono text-[9px] uppercase tracking-[0.6em] font-black italic">
                                ACADEMIC_SYNERGY_2K26
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.85] text-white uppercase italic">
                            VARNOTH<br />
                            <span className="text-emerald-500 not-italic">SAVA.2K26</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/50 font-medium max-w-xl leading-relaxed">
                            Architecting the intersection of <span className="text-white">Cultural Heritage</span> and <span className="text-emerald-400">Future-Tech Innovations</span>.
                        </p>

                        <div className="flex flex-wrap gap-6 pt-4">
                            <Link href='/register' className="px-10 py-4 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                                REGISTER_NOW
                            </Link>
                            <Link href='/events' className="px-10 py-4 border border-white/20 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}>
                                EXPLORE_EVENTS
                            </Link>
                        </div>
                    </motion.div>

                    {/* Minimal Metrics - Green Theme */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 pt-16 mb-10 border-t border-white/5 max-w-xl">
                        {[
                            { label: 'PARTICIPANTS', value: '2500+', icon: Users },
                            { label: 'COLLEGES', value: '50+', icon: Globe },
                            { label: 'STATUS', value: 'REG_OPEN', icon: Activity }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400/40">
                                    <stat.icon className="w-3 h-3" />
                                    <span className="text-[8px] uppercase tracking-widest font-black leading-none">{stat.label}</span>
                                </div>
                                <div className="text-2xl font-black text-white italic tracking-tight">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Link */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
            >
                <div className="text-[8px] uppercase font-bold tracking-[0.5em] text-emerald-400">DESCEND</div>
                <ChevronDown className="w-5 h-5 text-emerald-400" />
            </motion.div>
        </div >
    )
}
