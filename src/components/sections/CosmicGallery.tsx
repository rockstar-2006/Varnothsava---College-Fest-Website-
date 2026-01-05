'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ShieldCheck } from 'lucide-react';
import DomeGallery from '@/components/ui/DomeGallery';
import { ArchiveBackground } from '@/components/ui/ArchiveBackground';

// High-quality, reliable cultural/festival image links
const memories = [
    { src: 'https://images.unsplash.com/photo-1514525253361-bee873800932?w=1200', alt: 'Dance Performance' },
    { src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200', alt: 'Musical Concert' },
    { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200', alt: 'Event Crowd' },
    { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200', alt: 'Stage Light' },
    { src: 'https://images.unsplash.com/photo-1459749411177-042180ce6742?w=1200', alt: 'Traditional Arts' },
    { src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200', alt: 'Night Celebration' },
    { src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200', alt: 'DJ Night' },
    { src: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200', alt: 'Cultural Vibes' },
    { src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200', alt: 'Traditional Performance' },
    { src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200', alt: 'Festival Lighting' },
    { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200', alt: 'Music Festival' },
    { src: 'https://images.unsplash.com/photo-1563841930606-67e2b6c307bb?w=1200', alt: 'Cultural Dance' },
    { src: 'https://images.unsplash.com/photo-1504173010664-32509aeebb62?w=1200', alt: 'Live Expression' },
    { src: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200', alt: 'Jazz Night' },
];

export function CosmicGallery() {
    return (
        <section className="fixed inset-0 w-full h-full bg-[#020402] overflow-hidden flex flex-col">
            <ArchiveBackground />

            <div className="relative pt-32 pb-0 px-12 z-20 pointer-events-none flex flex-col items-center text-center gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 text-emerald-400/60 font-black text-[10px] uppercase tracking-[0.6em] border border-emerald-500/20 px-6 py-2 rounded-full backdrop-blur-3xl"
                >
                    <Camera className="w-3 h-3" />
                    Archive Directory // Auth: 0x92f
                </motion.div>

                <div className="space-y-4">
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.8] drop-shadow-2xl">
                        EVENT <span className="text-emerald-500/40 not-italic">GALLERY</span>
                    </h2>
                    <div className="flex items-center justify-center gap-6 opacity-20">
                        <div className="h-[2px] w-20 bg-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.8em] text-emerald-400">Memories Encrypted</span>
                        <div className="h-[2px] w-20 bg-emerald-500" />
                    </div>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/40 max-w-xl leading-relaxed">
                    Scroll or drag to sweep the holographic archives.<br />
                    System synchronized with Emerald Vault security protocols.
                </p>
            </div>

            <div className="flex-1 relative z-10 w-full">
                <DomeGallery
                    images={memories}
                    grayscale={false}
                    overlayBlurColor="transparent"
                    imageBorderRadius="12px"
                    openedImageBorderRadius="12px"
                    fit={2.2}
                />
            </div>

            <div className="relative pb-10 px-12 z-20 pointer-events-none flex items-center justify-between opacity-30">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">System: Functional</span>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400">Security.Verified</span>
                </div>
            </div>
        </section>
    );
}
