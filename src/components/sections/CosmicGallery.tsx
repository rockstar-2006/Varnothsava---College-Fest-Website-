'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Menu, Play, Maximize2, Zap } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Image dataset from public/img
const IMAGE_FILES = [
    "1 (1).jpg", "1.jpg", "10.jpg", "3.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg",
    "DSC_0007.JPG", "DSC_0012.JPG", "DSC_0018.JPG", "DSC_0030.JPG", "DSC_0033.JPG",
    "DSC_0035.JPG", "DSC_0046.JPG", "DSC_0318.JPG", "DSC_0339.JPG", "DSC_0489.JPG",
    "DSC_0762.JPG", "DSC_0832.JPG", "DSC_0841.JPG", "DSC_0864.JPG", "IMG_1238.JPG",
    "IMG_2092.JPG", "IMG_2104.JPG", "IMG_2125.JPG", "IMG_2929.JPG", "IMG_3002.JPG",
    "IMG_3030.JPG", "IMG_4367.JPG", "IMG_4378.JPG", "IMG_4382.JPG", "IMG_4452.JPG",
    "IMG_4488.JPG", "IMG_4496.JPG", "IMG_4523.JPG", "IMG_4528.JPG", "IMG_4532.JPG",
    "IMG_4551.JPG", "IMG_4590.JPG", "IMG_4596.JPG", "IMG_4599.JPG", "IMG_4613.JPG",
    "IMG_4629.JPG", "IMG_4631.JPG", "IMG_4635.JPG", "IMG_4646.JPG", "IMG_4660.JPG",
    "IMG_4666.JPG", "IMG_4686.JPG", "IMG_4694.JPG", "IMG_4707.JPG", "IMG_4711.JPG",
    "IMG_4714.JPG", "IMG_4729.JPG", "IMG_4731.JPG", "IMG_4743.JPG", "IMG_4746.JPG",
    "IMG_5059.JPG", "IMG_5077.JPG", "IMG_5088.JPG", "IMG_5133.JPG", "IMG_5266.JPG",
    "IMG_5355.JPG", "IMG_5357.JPG", "IMG_5361.JPG", "IMG_5373.JPG", "IMG_5382.JPG",
    "IMG_5385.JPG", "IMG_5396.JPG", "IMG_5426.JPG", "IMG_5438.JPG", "IMG_5442.JPG",
    "IMG_5444.JPG", "IMG_5498.JPG"
];

const FULL_POOL = IMAGE_FILES.map((file, i) => ({
    id: i,
    src: `/img/${file}`,
    title: `MOMENT_${i.toString().padStart(3, '0')}`,
    tag: ["CULTURAL", "TECHNICAL", "SPORTS", "RECAP"][i % 4],
    description: "Experience the pulse of Varnothsava 2026. Every shot tells a story of innovation and celebration."
}));

type ViewMode = 'showcase' | 'explorer';

export function CosmicGallery() {
    const [viewMode, setViewMode] = useState<ViewMode>('showcase');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const activeItem = FULL_POOL[currentIndex];

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % FULL_POOL.length);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + FULL_POOL.length) % FULL_POOL.length);
    }, []);

    const toggleView = () => {
        setViewMode((prev) => (prev === 'showcase' ? 'explorer' : 'showcase'));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 30;
        const y = (clientY / window.innerHeight - 0.5) * 30;
        setMousePos({ x, y });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape' && viewMode === 'showcase') setViewMode('explorer');
            if (e.key === 'Enter' && viewMode === 'explorer') setViewMode('showcase');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, viewMode]);

    return (
        <main
            onMouseMove={handleMouseMove}
            className="relative h-screen w-full bg-[#050805] overflow-hidden font-sans selection:bg-emerald-500/30"
        >
            {/* 1. KINETIC BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={`bg-${currentIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={activeItem.src}
                            alt="Background"
                            fill
                            className="object-cover blur-[60px] brightness-[0.2] saturate-[1.2]"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050805]" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>

            {/* 2. MAIN HUD ELEMENTS */}
            <div className="absolute top-12 left-12 z-50 pointer-events-none">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-white font-black italic text-4xl tracking-tighter leading-none mb-2">
                        ARCHIVE // <span className="text-emerald-500">2K26</span>
                    </h2>
                    <p className="text-emerald-500/40 font-mono text-[9px] tracking-[0.6em] uppercase">Visual Memory Terminal</p>
                </motion.div>
            </div>

            {/* 3. CONTENT STAGE */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-10 pb-64">
                <AnimatePresence mode="wait">
                    {viewMode === 'showcase' ? (
                        /* MODE A: THE SHOWCASE (Elevated to avoid navbar overlap) */
                        <motion.div
                            key="showcase"
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: -40, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-12 px-8 no-jank"
                        >
                            {/* SHARP IMAGE CARD */}
                            <motion.div
                                className="relative w-full aspect-[3/4] md:w-[480px] md:h-[640px] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 bg-neutral-900 group no-jank"
                                layoutId="gallery-card"
                            >
                                <motion.div
                                    key={activeItem.src}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={activeItem.src}
                                        alt={activeItem.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        priority
                                    />
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                            </motion.div>

                            {/* TEXT BOX */}
                            <div className="flex-1 text-center md:text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                        {activeItem.tag}
                                    </div>
                                    <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-6 italic leading-none">
                                        {activeItem.title.split('_')[0]}<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                            {activeItem.title.split('_')[1]}
                                        </span>
                                    </h1>
                                    <p className="text-white/40 text-lg md:text-xl max-w-md font-light leading-relaxed mb-10">
                                        {activeItem.description}
                                    </p>

                                    <div className="flex items-center gap-6 justify-center md:justify-start">
                                        <button className="flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-black text-xs hover:scale-105 transition-transform active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                                            <Play size={16} fill="black" /> ENTER ARCHIVE
                                        </button>
                                        <button className="p-5 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all">
                                            <Maximize2 size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        /* MODE B: 3D ORBITAL EXPLORER */
                        <motion.div
                            key="explorer"
                            className="relative w-full h-full flex items-center justify-center pt-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="relative w-full flex items-center justify-center perspective-3000">
                                {FULL_POOL.map((item, idx) => {
                                    const diff = idx - currentIndex;
                                    const isActive = idx === currentIndex;

                                    let wrappedDiff = diff;
                                    const poolHalf = FULL_POOL.length / 2;
                                    if (diff > poolHalf) wrappedDiff -= FULL_POOL.length;
                                    if (diff < -poolHalf) wrappedDiff += FULL_POOL.length;

                                    if (Math.abs(wrappedDiff) > 4) return null;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layoutId={isActive ? "gallery-card" : undefined}
                                            animate={{
                                                x: wrappedDiff * 420 + (wrappedDiff !== 0 ? Math.sign(wrappedDiff) * 80 : 0),
                                                z: isActive ? 400 : -600,
                                                rotateY: wrappedDiff * -35,
                                                opacity: isActive ? 1 : 0.25,
                                                scale: isActive ? 1.05 : 0.8,
                                                filter: isActive ? 'blur(0px)' : 'blur(2px)'
                                            }}
                                            transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.6 }}
                                            className="absolute w-[300px] h-[450px] md:w-[420px] md:h-[600px] cursor-pointer no-jank"
                                            onClick={() => {
                                                if (isActive) setViewMode('showcase');
                                                else setCurrentIndex(idx);
                                            }}
                                        >
                                            <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl relative bg-neutral-900 group">
                                                <Image src={item.src} alt={item.title} fill className="object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="absolute bottom-8 left-8">
                                                        <p className="text-emerald-400 font-mono text-[10px] tracking-widest mb-1">{item.tag}</p>
                                                        <h3 className="text-white text-3xl font-black italic tracking-tighter">{item.title}</h3>
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <div className="absolute inset-0 border-[6px] border-emerald-500/30 rounded-[3rem] pointer-events-none" />
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 4. HIGH-ELEVATION CONTROLLER (z-index 2000 to be on top of everything) */}
            <div className="fixed bottom-40 left-0 right-0 z-[2000] flex justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                    {viewMode === 'showcase' ? (
                        /* SLICK MINI CONTROLLER */
                        <motion.div
                            key="showcase-ctrl"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-black/80 backdrop-blur-3xl border border-white/20 rounded-full h-24 px-8 flex items-center gap-10 shadow-[0_40px_100px_rgba(0,0,0,1)] pointer-events-auto"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all transform hover:scale-125"
                            >
                                <ChevronLeft size={36} />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleView(); }}
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500 text-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                            >
                                <X size={32} className="transform hover:rotate-90 transition-transform" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all transform hover:scale-125"
                            >
                                <ChevronRight size={36} />
                            </button>
                        </motion.div>
                    ) : (
                        /* CLASSIC IPOD WHEEL CONTROLLER (ELEVATED) */
                        <motion.div
                            key="explorer-ctrl"
                            initial={{ y: 150, rotate: -30, opacity: 0 }}
                            animate={{ y: 0, rotate: 0, opacity: 1 }}
                            exit={{ y: 150, rotate: 30, opacity: 0 }}
                            className="relative w-80 h-80 flex items-center justify-center pointer-events-auto"
                        >
                            <motion.div
                                animate={{ rotate: currentIndex * 45 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="absolute inset-0 bg-[#0a0a0a] rounded-full border-[12px] border-[#050505] shadow-[inset_0_4px_10px_rgba(255,255,255,0.05),0_40px_100px_rgba(0,0,0,1)] flex flex-col items-center justify-between py-10"
                            >
                                <div className="text-[11px] font-black text-white/30 tracking-[0.5em] uppercase">INDEX</div>
                                <div className="w-full flex justify-between px-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                        className="text-white/30 hover:text-emerald-500 transition-all transform hover:scale-150 active:scale-90"
                                    >
                                        <ChevronLeft size={48} strokeWidth={3} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                        className="text-white/30 hover:text-emerald-500 transition-all transform hover:scale-150 active:scale-90"
                                    >
                                        <ChevronRight size={48} strokeWidth={3} />
                                    </button>
                                </div>
                                <div className="text-[11px] font-black text-white/30 tracking-[0.5em] uppercase italic">MEMORY</div>
                            </motion.div>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleView(); }}
                                className="relative w-40 h-40 bg-[#151515] rounded-full border border-white/10 shadow-2xl active:scale-90 transition-all flex items-center justify-center group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent group-hover:opacity-100 opacity-0 transition-opacity" />
                                <Zap className="w-16 h-16 text-white/10 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.9)] transition-all" fill="currentColor" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 5. DATA LABELS */}
            <div className="absolute bottom-12 left-12 z-50 pointer-events-none opacity-40 hidden md:block">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-white font-mono text-[10px] tracking-[0.4em] uppercase">LINK_ACTIVE // PHOTO_{currentIndex.toString().padStart(3, '0')}</span>
                </div>
            </div>

            <div className="absolute bottom-12 right-12 z-50 pointer-events-none opacity-40 hidden md:block">
                <p className="text-white font-mono text-[10px] tracking-[0.4em] uppercase">ARCHIVE_VOLUME // {currentIndex + 1} OF {FULL_POOL.length}</p>
            </div>
        </main>
    );
}
