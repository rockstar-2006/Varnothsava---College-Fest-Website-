'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ArchiveBackground = () => {
    return (
        <div className="absolute inset-0 z-0 bg-[#020402] overflow-hidden pointer-events-none">
            {/* Base Radial Gradient - Emerald Theme - Brightened */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)] opacity-70" />

            {/* Animated Grid Lines - Primary Emerald - Brightened */}
            <div className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(16, 185, 129, 0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 95%)',
                }}
            />

            {/* Secondary Technical Grid - Brightened */}
            <div className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(16, 185, 129, 0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(16, 185, 129, 0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '15px 15px',
                }}
            />

            {/* Floating Flickering Data Squares */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-emerald-500/10"
                        initial={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`
                        }}
                        animate={{
                            opacity: [0, 0.3, 0],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </div>

            {/* Moving Scanlines */}
            <motion.div
                className="absolute inset-0"
                initial={{ backgroundPosition: '0 0' }}
                animate={{ backgroundPosition: '0 100%' }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                style={{
                    backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(16, 185, 129, 0.01) 50%)',
                    backgroundSize: '100% 6px',
                    opacity: 0.5
                }}
            />

            {/* Technical Scan Beam - Emerald */}
            <motion.div
                className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
                style={{ filter: 'blur(1px)' }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Corner Markers - Reinforced */}
            <div className="absolute top-10 left-10 w-12 h-12 border-t border-l border-emerald-500/20" />
            <div className="absolute top-10 right-10 w-12 h-12 border-t border-r border-emerald-500/20" />
            <div className="absolute bottom-10 left-10 w-12 h-12 border-b border-l border-emerald-500/20" />
            <div className="absolute bottom-10 right-10 w-12 h-12 border-b border-r border-emerald-500/20" />

            {/* Side Labels & Data Streams */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2 -rotate-90 text-[7px] font-mono text-emerald-500/10 tracking-[0.6em] uppercase flex items-center gap-10">
                <span>DEVP_ARCHIVE_CORE_v1.0</span>
                <span className="opacity-50">SYS_AUTH_0x92f</span>
                <span className="animate-pulse">REC_LIVE</span>
            </div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 rotate-90 text-[7px] font-mono text-emerald-500/10 tracking-[0.6em] uppercase flex items-center gap-10">
                <span>STATION_SYSTEM_IDENTIFIER</span>
                <span className="opacity-50">CORE_LOCK_ENABLED</span>
                <span className="animate-pulse">DATA_SYNC_ACTIVE</span>
            </div>

            {/* Flickering Technical Readouts */}
            <div className="absolute top-32 left-10 pointer-events-none opacity-20 hidden md:block">
                {['00101010', '11011110', '01010101'].map((code, i) => (
                    <motion.div
                        key={i}
                        className="text-[6px] font-mono text-emerald-400 mb-1"
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                    >
                        {code}
                    </motion.div>
                ))}
            </div>

            {/* Circular Technical Compasses */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 border border-emerald-500/10 rounded-full animate-[spin_60s_linear_infinite] opacity-10" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 border border-emerald-500/5 border-dashed rounded-full animate-[spin_40s_linear_infinite_reverse] opacity-10" />

            <div className="absolute -top-20 -right-20 w-80 h-80 border border-emerald-500/10 rounded-full animate-[spin_50s_linear_infinite] opacity-10" />
            <div className="absolute -top-16 -right-16 w-72 h-72 border border-emerald-500/5 border-dashed rounded-full animate-[spin_30s_linear_infinite_reverse] opacity-10" />

            {/* Dynamic ASCII Background Stream */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center select-none overflow-hidden">
                <div className="text-[140px] font-black tracking-tighter text-emerald-400/50 leading-none flex flex-col items-center">
                    <span>VARNOTH</span>
                    <span className="mt-[-40px]">ARCHIVE</span>
                </div>
            </div>
        </div>
    );
};
