'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function CosmicBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* 1. Base Subtle Grid (Higher Visibility) */}
            <div className="designer-base-grid opacity-70" />

            {/* 2. Rhythmic Pattern Bands (Periodic Rows) */}
            <div className="designer-bands opacity-80" />

            {/* 3. Global Scanning Beam Animation */}
            <div className="scanning-beam" />

            {/* 4. Strategic Light Sources (Designer Glows) */}
            <div className="absolute top-[10%] left-[5%] w-[50vw] h-[50vw] designer-nebula" />
            <div className="absolute bottom-[5%] right-[5%] w-[60vw] h-[60vw] designer-nebula" style={{ animationDelay: '-8s' }} />

            {/* 5. Clean Architectural Accents */}
            <div className="absolute top-0 bottom-0 left-[5%] w-[1.5px] bg-emerald-500/15" />
            <div className="absolute top-0 bottom-0 right-[5%] w-[1.5px] bg-emerald-500/15" />

            {/* 6. Professional Data Fragments (Enhanced Micro-Details) */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={`detail-${i}`}
                    className="absolute border border-emerald-500/30 bg-emerald-500/10 rounded-sm"
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
