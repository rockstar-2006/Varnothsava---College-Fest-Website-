'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Octahedron, Sphere, Box, Torus, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Scene() {
    const groupRef = useRef<THREE.Group>(null)
    const coreRef = useRef<THREE.Mesh>(null)
    const ring1Ref = useRef<THREE.Mesh>(null)
    const ring2Ref = useRef<THREE.Mesh>(null)
    const shardsRef = useRef<THREE.Group>(null)

    // Create complex shards for a "Broken Monolith" look
    const shards = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            ] as [number, number, number],
            scale: 0.1 + Math.random() * 0.4,
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
            speed: 0.2 + Math.random() * 0.5
        }))
    }, [])

    const particles = useMemo(() => {
        return Array.from({ length: 100 }).map(() => ({
            position: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12] as [number, number, number],
            size: 0.01 + Math.random() * 0.02
        }))
    }, [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.1
        }
        if (coreRef.current) {
            coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1)
            coreRef.current.rotation.x = time * 0.5
        }
        if (ring1Ref.current) {
            ring1Ref.current.rotation.x = time * 0.3
            ring1Ref.current.rotation.y = time * 0.2
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.z = time * 0.4
            ring2Ref.current.rotation.y = -time * 0.3
        }
        if (shardsRef.current) {
            shardsRef.current.children.forEach((shard, i) => {
                shard.position.y += Math.sin(time + i) * 0.002
                shard.rotation.x += 0.005
            })
        }
    })

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={2.5} color="#10b981" />
            <spotLight position={[-10, 10, 10]} angle={0.25} penumbra={1} intensity={2.5} color="#10b981" />
            <pointLight position={[0, -5, 0]} intensity={1.5} color="#064e3b" />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <group ref={groupRef}>
                    {/* The Core Eternal Heart */}
                    <Sphere args={[0.6, 32, 32]} ref={coreRef}>
                        <meshStandardMaterial
                            color="#10b981"
                            emissive="#10b981"
                            emissiveIntensity={15}
                            roughness={0}
                            metalness={1}
                        />
                    </Sphere>

                    {/* Outer Crystal Cage */}
                    <Octahedron args={[1.5, 0]}>
                        <meshStandardMaterial
                            color="#34d399"
                            wireframe
                            transparent
                            opacity={0.2}
                            emissive="#10b981"
                            emissiveIntensity={1}
                        />
                    </Octahedron>

                    {/* Orbital Rings */}
                    <Torus args={[2.2, 0.02, 16, 100]} ref={ring1Ref}>
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={5} transparent opacity={0.6} />
                    </Torus>
                    <Torus args={[2.6, 0.015, 16, 100]} ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
                        <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={3} transparent opacity={0.4} />
                    </Torus>

                    {/* Levitating Monolith Shards */}
                    <group ref={shardsRef}>
                        {shards.map((s, i) => (
                            <mesh key={i} position={s.position} rotation={s.rotation} scale={s.scale}>
                                <Box args={[1, 1, 1]}>
                                    <meshStandardMaterial
                                        color={i % 2 === 0 ? "#064e3b" : "#1e293b"}
                                        roughness={0.8}
                                        metalness={0.2}
                                    />
                                </Box>
                                {/* Inner shard glow */}
                                <mesh scale={0.4}>
                                    <sphereGeometry args={[1, 16, 16]} />
                                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={10} />
                                </mesh>
                            </mesh>
                        ))}
                    </group>
                </group>

                {/* Ambient Magic Dust */}
                {particles.map((p, i) => (
                    <mesh key={i} position={p.position}>
                        <sphereGeometry args={[p.size]} />
                        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={6} />
                    </mesh>
                ))}
            </Float>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </>
    )
}

export default function AncientForestModel() {
    return (
        <div className="w-full h-full relative">
            <Canvas
                camera={{ position: [0, 0, 7], fov: 45 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: true
                }}
                style={{ background: 'transparent' }}
            >
                <Scene />
            </Canvas>
        </div>
    )
}
