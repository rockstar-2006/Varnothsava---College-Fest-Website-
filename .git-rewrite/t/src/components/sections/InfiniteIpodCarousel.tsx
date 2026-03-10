'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Optimized Image Dataset with all 15 files
const GALLERY_IMAGES = [
    { src: "/img/1.jpg", title: "MOMENT_01" },
    { src: "/img/3.jpg", title: "MOMENT_02" },
    { src: "/img/5.jpg", title: "MOMENT_03" },
    { src: "/img/10.jpg", title: "MOMENT_04" },
    { src: "/img/DSC_0046.JPG", title: "MOMENT_05" },
    { src: "/img/DSC_0035.JPG", title: "MOMENT_06" },
    { src: "/img/DSC_0318.JPG", title: "MOMENT_07" },
    { src: "/img/DSC_0339.JPG", title: "MOMENT_08" },
    { src: "/img/DSC_0762.JPG", title: "MOMENT_09" },
    { src: "/img/DSC_0489.JPG", title: "MOMENT_10" },
    { src: "/img/DSC_0832.JPG", title: "MOMENT_11" },
    { src: "/img/DSC_0864.JPG", title: "MOMENT_12" },
    { src: "/img/DSC_0841.JPG", title: "MOMENT_13" },
    { src: "/img/feature_parallax.png", title: "MOMENT_14" },
    { src: "/img/IMG_1238.JPG", title: "MOMENT_15" }
];

export function InfiniteIpodCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsMobile(window.innerWidth < 768);
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 w-full h-[100dvh] bg-white overflow-hidden select-none z-[100]">
            {/* 1. HUD OVERLAY (TOP) */}
            <div className="absolute top-10 left-12 z-[100] flex flex-col pointer-events-none">
                <span className="text-black text-[11px] font-black font-mono tracking-[0.5em] uppercase">CODEGRID / EXP. 0493</span>
            </div>
            <div className="absolute top-10 right-12 z-[100] flex flex-col items-end pointer-events-none">
                <span className="text-black text-[11px] font-black font-mono tracking-[0.5em] uppercase leading-tight">VARNOTHSAVA // ARCHIVE</span>
            </div>

            {/* 2. INFINITE CAROUSEL ENGINE */}
            <div className="absolute inset-0 flex items-center justify-center pt-20 pb-80 pointer-events-none">
                <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
                    {GALLERY_IMAGES.map((img, idx) => {
                        const diff = idx - currentIndex;
                        const poolSize = GALLERY_IMAGES.length;
                        let wrappedDiff = diff;
                        if (diff > poolSize / 2) wrappedDiff -= poolSize;
                        if (diff < -poolSize / 2) wrappedDiff += poolSize;

                        // Only render focus range for perf
                        if (Math.abs(wrappedDiff) > 2) return null;

                        const active = idx === currentIndex;

                        return (
                            <motion.div
                                key={idx}
                                initial={false}
                                animate={{
                                    x: wrappedDiff * (isMobile ? 320 : 550),
                                    scale: active ? (isMobile ? 1.0 : 1.4) : (isMobile ? 0.8 : 0.7),
                                    opacity: active ? 1 : (isMobile ? 0.5 : 0.2),
                                    rotateY: isMobile ? 0 : wrappedDiff * -35,
                                    z: isMobile ? 0 : (active ? 300 : -500),
                                }}
                                transition={isMobile ? { duration: 0.3 } : { type: 'spring', stiffness: 80, damping: 20 }}
                                className="absolute pointer-events-auto"
                            >
                                <div
                                    className={cn(
                                        "relative flex flex-col items-center justify-center transition-all bg-white shadow-2xl rounded-2xl overflow-hidden border border-black/5",
                                        active ? "w-[420px] h-[580px]" : "w-[300px] h-[400px]"
                                    )}
                                    onClick={() => !active && (wrappedDiff > 0 ? handleNext() : handlePrev())}
                                >
                                    <Image
                                        src={img.src}
                                        alt={img.title}
                                        fill
                                        className="object-contain p-8"
                                        sizes="(max-width: 768px) 300px, 500px"
                                        quality={isMobile ? 60 : 85}
                                        priority={active || Math.abs(wrappedDiff) <= 1}
                                    />

                                    {active && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute bottom-8 text-center"
                                        >
                                            <span className="text-[10px] font-mono tracking-[0.6em] text-black font-black uppercase opacity-20">VARNOTHSAVA.ARCHIVE</span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 3. CENTER LABEL HUD */}
            <div className="absolute bottom-[440px] left-0 right-0 text-center pointer-events-none z-[50]">
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={currentIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[13px] font-black font-mono tracking-[0.8em] text-black uppercase"
                    >
                        {GALLERY_IMAGES[currentIndex].title}
                    </motion.h2>
                </AnimatePresence>
            </div>

            {/* 4. THE MATTE BLACK IPOD CONTROLLER (FIXED ABOVE NAVBAR) */}
            <div className="fixed bottom-[180px] left-1/2 -translate-x-1/2 z-[10000] pointer-events-auto">
                <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* OUTER WHEEL RING */}
                    <div className="absolute inset-0 bg-[#1a1a1a] rounded-full border-[2px] border-black/20 shadow-[0_40px_100px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(255,255,255,0.05)] flex flex-col items-center justify-between py-10">
                        {/* MENU (TOP) */}
                        <button
                            onClick={handleNext}
                            className="text-[14px] font-black text-white/40 tracking-[0.5em] hover:text-white transition-all transform hover:scale-110 active:scale-90"
                        >
                            MENU
                        </button>

                        {/* NAV CLICKS (SIDES) */}
                        <div className="w-full flex justify-between px-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                className="p-4 text-white/30 hover:text-white transition-all transform hover:scale-150 active:scale-75 cursor-pointer"
                            >
                                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11 18l-6-6 6-6v12zM19 18l-6-6 6-6v12z" />
                                    <rect x="3" y="6" width="2" height="12" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="p-4 text-white/30 hover:text-white transition-all transform hover:scale-150 active:scale-75 cursor-pointer"
                            >
                                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 6l6 6-6 6V6zM13 6l6 6-6 6V6z" />
                                    <rect x="19" y="6" width="2" height="12" />
                                </svg>
                            </button>
                        </div>

                        {/* MULTIMEDIA HUD (BOTTOM) */}
                        <div className="flex gap-2 opacity-10">
                            <Play size={11} fill="currentColor" />
                            <Pause size={11} fill="currentColor" />
                        </div>
                    </div>

                    {/* CENTRAL PHYSICAL BUTTON */}
                    <button
                        onClick={handleNext}
                        className="relative w-44 h-44 bg-[#121212] rounded-full border border-white/5 shadow-inner transition-all active:scale-90 active:bg-black group flex items-center justify-center cursor-pointer"
                    >
                        <div className="w-[110px] h-[110px] rounded-full bg-gradient-to-tr from-white/[0.03] to-transparent pointer-events-none" />
                    </button>
                </div>
            </div>

            {/* Side Branding */}
            <div className="absolute right-12 bottom-12 z-[100]">
                <div className="w-16 h-12 bg-black flex items-center justify-center rounded-sm shadow-xl">
                    <div className="w-8 h-1.5 bg-white" />
                </div>
            </div>

            <style jsx global>{`
                body {
                    background-color: white !important;
                    overflow: hidden !important;
                }
            `}</style>
        </div>
    );
}
