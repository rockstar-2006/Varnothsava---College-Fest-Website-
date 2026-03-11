'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function NetworkPoints() {
    const count = 60
    const meshRef = useRef<THREE.Points>(null)
    const lineRef = useRef<THREE.LineSegments>(null)
    const { mouse } = useThree()

    // 1. Create unique points in 3D space
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15

            velocities[i * 3] = (Math.random() - 0.5) * 0.02
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
        }
        return { positions, velocities }
    }, [count])

    // 2. Animate points and draw connections
    useFrame((state) => {
        if (!meshRef.current || !lineRef.current) return

        const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute
        const linePosAttr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute
        let lineIdx = 0

        for (let i = 0; i < count; i++) {
            // Update positions based on velocity
            posAttr.setXYZ(
                i,
                posAttr.getX(i) + particles.velocities[i * 3] + mouse.x * 0.005,
                posAttr.getY(i) + particles.velocities[i * 3 + 1] + mouse.y * 0.005,
                posAttr.getZ(i) + particles.velocities[i * 3 + 2]
            )

            // Boundary checks
            if (Math.abs(posAttr.getX(i)) > 10) particles.velocities[i * 3] *= -1
            if (Math.abs(posAttr.getY(i)) > 10) particles.velocities[i * 3 + 1] *= -1
            if (Math.abs(posAttr.getZ(i)) > 10) particles.velocities[i * 3 + 2] *= -1

            // Connect nearby points
            for (let j = i + 1; j < count; j++) {
                const dist = Math.sqrt(
                    Math.pow(posAttr.getX(i) - posAttr.getX(j), 2) +
                    Math.pow(posAttr.getY(i) - posAttr.getY(j), 2)
                )

                if (dist < 4 && lineIdx < 3000) {
                    linePosAttr.setXYZ(lineIdx++, posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
                    linePosAttr.setXYZ(lineIdx++, posAttr.getX(j), posAttr.getY(j), posAttr.getZ(j))
                }
            }
        }

        posAttr.needsUpdate = true
        linePosAttr.needsUpdate = true
        // Important: hide remaining segments
        lineRef.current.geometry.setDrawRange(0, lineIdx)
    })

    return (
        <group>
            {/* The Points (Nodes) */}
            <points ref={meshRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particles.positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.2}
                    color="#10b981"
                    transparent
                    opacity={1.0}
                    sizeAttenuation
                />
            </points>

            {/* The Lines (Edges) */}
            <lineSegments ref={lineRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array(2000 * 3), 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#10b981"
                    transparent
                    opacity={0.5}
                    linewidth={1}
                />
            </lineSegments>
        </group>
    )
}

export default function NeuralNetworkBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <NetworkPoints />
            </Canvas>
        </div>
    )
}
