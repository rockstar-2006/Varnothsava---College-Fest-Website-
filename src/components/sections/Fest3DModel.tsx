'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Center, ContactShadows, Html, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import Image from 'next/image'

function Loader() {
    const { progress } = useProgress()
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2" />
                <div className="text-emerald-500 font-bold text-xs tracking-widest">{progress.toFixed(0)}%</div>
            </div>
        </Html>
    )
}

function Model() {
    // Load the GLTF file which references the external .bin and .jpg texture
    const { scene } = useGLTF('/medallion.gltf')

    return <primitive object={scene} scale={4.2} rotation={[0, Math.PI, 0]} />
}

export default function Fest3DModel() {
    // Default to true (Mobile First) to prevent heavy 3D load on phones during hydration
    const [isMobile, setIsMobile] = useState(true)

    useEffect(() => {
        const checkMobile = () => {
            // Defer the check slightly to allow main thread to breathe
            requestAnimationFrame(() => {
                setIsMobile(window.innerWidth < 768)
            })
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div className="w-full h-full relative group flex items-center justify-center">
            {/* Background Image - Keeping as requested */}
            <div className="absolute inset-0 -z-10 opacity-30 mix-blend-screen pointer-events-none">
                <Image
                    src="/img/ancient_ruins_dark.png"
                    alt="Ancient Background"
                    fill
                    className="object-contain scale-150 blur-sm"
                    priority
                />
            </div>

            <Canvas
                dpr={[1, 1.5]} // Limit pixel ratio for performance
                performance={{ min: 0.5 }} // Allow quality degradation on slow devices
                camera={{ position: [0, 0, 8], fov: 40 }}
                gl={{
                    powerPreference: "high-performance",
                    antialias: false, // Disable AA for performance
                    stencil: false,
                    depth: true
                }}
            >
                <Suspense fallback={<Loader />}>
                    {/* Natural Studio Lighting */}
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
                    <directionalLight position={[-5, 5, -5]} intensity={1} color="#ffffff" />

                    <Center>
                        <Model />
                    </Center>

                    {/* Optimize shadows: frames=1 bakes it once (static) */}
                    <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} color="#000000" frames={1} resolution={256} />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={2}
                    enablePan={false}
                />
            </Canvas>
        </div>
    )
}

useGLTF.preload('/medallion.gltf')
