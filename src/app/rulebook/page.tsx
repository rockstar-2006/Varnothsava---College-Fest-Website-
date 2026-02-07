'use client';

import React, { useEffect, useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import Book from '@/components/Book';
import './rulebook.css';



const ParticleLayer = () => {
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const newParticles = [...Array(20)].map(() => ({
            i: Math.random(),
            tx: `${Math.random() * 200 - 100}px`,
            ty: `${Math.random() * 200 - 100}px`
        }));
        setParticles(newParticles);
    }, []);

    if (!mounted) return null;

    return (
        <div className="particles" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            {particles.map((p, i) => (
                <span key={i} className="particle" style={{
                    '--i': p.i,
                    '--tx': p.tx,
                    '--ty': p.ty
                } as React.CSSProperties}></span>
            ))}
        </div>
    );
};

export default function RuleBookPage() {
    const [pageMounted, setPageMounted] = useState(false);
    const { setIsSiteLoaded } = useApp();

    const [imagesPreloaded, setImagesPreloaded] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setPageMounted(true);
        // Clean up body styles if any global ones are interfering
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#000';

        // Preload first 5 images for smooth mobile data experience
        const preloadImages = async () => {
            const imagesToLoad = Array.from({ length: 5 }, (_, i) =>
                `/rulebook/${encodeURIComponent(`VARNOTHSAVA Brochure 2026-images-${i}.jpg`)}`
            );

            let loadedCount = 0;
            const total = imagesToLoad.length;

            const promises = imagesToLoad.map(src => {
                return new Promise((resolve) => {
                    const img = new window.Image();
                    img.src = src;
                    img.onload = () => {
                        loadedCount++;
                        setProgress(Math.round((loadedCount / total) * 100));
                        resolve(true);
                    };
                    img.onerror = () => resolve(false); // Resolve even on error to prevent hanging
                });
            });

            await Promise.all(promises);
            // Add a small artificial delay for the 'premium' feel
            setTimeout(() => setImagesPreloaded(true), 800);
        };

        preloadImages();

        return () => {
            document.body.style.overflow = '';
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div
            className="rulebook-page-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100dvh',
                minHeight: '-webkit-fill-available',
                zIndex: 1000,
                backgroundColor: '#0a0a0a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                pointerEvents: 'auto'
            }}
        >
            {/* Optimized Background Image - Fully Visible */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/rulebook_bg.jpg"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <Link
                href="/"
                className="back-btn"
                onClick={() => setIsSiteLoaded(true)}
            >
                <div className="download-btn-inner">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-bold tracking-wider text-[10px] md:text-sm">BACK HOME</span>
                </div>
                <div className="pulse-ring"></div>
            </Link>

            {/* Pulsing Download Button */}
            <a
                href="/VARNOTHSAVA Brochure 2026.pdf"
                download
                className="download-brochure-btn"
            >
                <div className="download-btn-inner">
                    <Download className="w-5 h-5" />
                    <span className="font-bold tracking-wider text-[10px] md:text-sm">DOWNLOAD BROCHURE</span>
                </div>

                <div className="pulse-ring"></div>
            </a>

            <ParticleLayer />
            {/* Premium Cinematic Readiness Overlay */}
            <AnimatePresence>
                {!imagesPreloaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[50000] bg-[#010202] flex flex-col items-center justify-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 blur-xl bg-emerald-500/10 animate-pulse rounded-full" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] md:text-xs font-black tracking-[0.5em] text-emerald-500/60 animate-pulse uppercase">INITIALIZING_ARCHIVES</span>
                            <span className="text-[9px] font-mono text-emerald-500/40">{progress}% BUFFERED</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Book />
            </motion.div>
        </div>
    );
}

