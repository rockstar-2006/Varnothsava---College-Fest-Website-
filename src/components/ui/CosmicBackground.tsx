'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CosmicBackgroundProps {
    variant?: 'emerald' | 'amber'
}

export function CosmicBackground({ variant = 'emerald' }: CosmicBackgroundProps) {
    const color = variant === 'amber' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)';
    const overlayColor = variant === 'amber' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)';
    const beamColor = variant === 'amber' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
    const accentColor = variant === 'amber' ? 'bg-amber-500/15' : 'bg-emerald-500/15';
    const fragmentsBorder = variant === 'amber' ? 'border-amber-500/30' : 'border-emerald-500/30';
    const fragmentsBg = variant === 'amber' ? 'bg-amber-500/10' : 'bg-emerald-500/10';

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* 1. Base Subtle Grid (Dynamic Color) */}
            <div
                className="designer-base-grid opacity-70"
                style={{
                    backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`
                }}
            />

            {/* 2. Rhythmic Pattern Bands (Dynamic Color) */}
            <div
                className="designer-bands opacity-80"
                style={{
                    backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 400px, ${overlayColor} 400px, ${overlayColor} 600px)`
                }}
            />

            {/* 3. Global Scanning Beam Animation (Dynamic Color) */}
            <div
                className="scanning-beam"
                style={{
                    background: `linear-gradient(to bottom, transparent, ${beamColor}, rgba(255, 255, 255, 0.05), ${beamColor}, transparent)`
                }}
            />

            {/* 4. Strategic Light Sources (Enhanced Designer Glows) */}
            <motion.div
                className="absolute top-[10%] left-[5%] w-[60vw] h-[60vw] designer-nebula"
                animate={{
                    opacity: [0.6, 0.8, 0.6],
                    scale: [1, 1.05, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background: `radial-gradient(circle, ${overlayColor.replace('0.08', '0.25')} 0%, transparent 70%)`
                }}
            />
            <motion.div
                className="absolute bottom-[5%] right-[5%] w-[70vw] h-[70vw] designer-nebula"
                animate={{
                    opacity: [0.5, 0.7, 0.5],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: -2 }}
                style={{
                    background: `radial-gradient(circle, ${overlayColor.replace('0.08', '0.25')} 0%, transparent 70%)`
                }}
            />

            {/* 5. Clean Architectural Accents */}
            <div className={`absolute top-0 bottom-0 left-[5%] w-[1.5px] ${accentColor}`} />
            <div className={`absolute top-0 bottom-0 right-[5%] w-[1.5px] ${accentColor}`} />

            {/* 6. Professional Data Fragments (Enhanced Micro-Details) */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={`detail-${i}`}
                    className={`absolute border ${fragmentsBorder} ${fragmentsBg} rounded-sm`}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0.1, 0.4, 0.1],
                        y: [-40, 40, -40],
                        rotate: [0, 180, 0]
                    }}
                    transition={{
                        duration: Math.random() * 15 + 15,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 3
                    }}
                    style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                        width: `${Math.random() * 60 + 30}px`,
                        height: `${Math.random() * 60 + 30}px`,
                    }}
                />
            ))}
        </div>
    )
}
