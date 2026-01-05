'use client'

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import { OrbitControls, PerspectiveCamera, Float, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'

function AvatarPlane({ url, onNext, onPrev }: { url: string, onNext: () => void, onPrev: () => void }) {
    const mesh = useRef<THREE.Mesh>(null)
    const texture = useLoader(TextureLoader, url)

    useFrame((state) => {
        if (!mesh.current) return
        mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
        mesh.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.05
    })

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={mesh}>
                    <planeGeometry args={[3, 3]} />
                    <meshBasicMaterial map={texture} transparent opacity={0.9} side={THREE.DoubleSide} />
                </mesh>

                {/* Holographic rim - Emerald Green */}
                <mesh position={[0, 0, -0.1]}>
                    <planeGeometry args={[3.2, 3.2]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.2} />
                </mesh>
            </Float>

            {/* Controls in 3D space - Emerald Green */}
            <Html position={[2.5, 0, 0]} transform>
                <button
                    onClick={onNext}
                    className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-white hover:bg-emerald-500 hover:scale-110 transition-all backdrop-blur-md group"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-black transition-colors">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </Html>

            <Html position={[-2.5, 0, 0]} transform>
                <button
                    onClick={onPrev}
                    className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-white hover:bg-emerald-500 hover:scale-110 transition-all backdrop-blur-md group"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-black transition-colors">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
            </Html>
        </group>
    )
}

function ScanLines() {
    const mesh = useRef<THREE.Mesh>(null)
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.position.y = Math.sin(state.clock.elapsedTime) * 1.5
        }
    })
    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
            <planeGeometry args={[4, 0.05]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
        </mesh>
    )
}

const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        let currentIndex = 0
        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayedText(text.substring(0, currentIndex))
                currentIndex++
            } else {
                // Optional: loop animation
                setTimeout(() => { currentIndex = 0 }, 5000)
            }
        }, 100)
        return () => clearInterval(interval)
    }, [text])

    return (
        <span className="font-mono">{displayedText}<span className="animate-pulse">_</span></span>
    )
}

export default function HolographicAvatar({ currentSeed, onUpdate }: { currentSeed: string, onUpdate: (seed: string) => void }) {
    // Generates a random seed for next/prev
    const rotateAvatar = (dir: 'next' | 'prev') => {
        const newSeed = Math.random().toString(36).substring(7)
        onUpdate(newSeed)
    }

    const url = `https://api.dicebear.com/7.x/avataaars/png?seed=${currentSeed}&backgroundColor=transparent`

    return (
        <div className="w-full h-[400px] relative rounded-[2rem] overflow-hidden bg-[#050905] border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <div className="absolute top-4 left-6 z-10 w-full pr-12">
                <div className="flex justify-between items-center w-full">
                    <h3 className="text-emerald-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <TypewriterText text="HOLO-PROJECTOR ACTIVE" />
                    </h3>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1 h-3 bg-emerald-500/50 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} />
                <ambientLight intensity={2} />
                <pointLight position={[10, 10, 10]} />
                <React.Suspense fallback={null}>
                    <AvatarPlane
                        url={url}
                        onNext={() => rotateAvatar('next')}
                        onPrev={() => rotateAvatar('prev')}
                    />
                    <ScanLines />
                </React.Suspense>
                <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
            </Canvas>

            <div className="absolute bottom-4 w-full text-center pointer-events-none">
                <p className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">
                    ID_SEED: {currentSeed}
                </p>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-[2rem]" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-[2rem]" />
        </div>
    )
}
