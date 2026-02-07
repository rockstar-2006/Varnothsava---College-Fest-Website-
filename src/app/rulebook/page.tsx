'use client';

import React, { useEffect, useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
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

    useEffect(() => {
        setPageMounted(true);
        // Clean up body styles if any global ones are interfering
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#000';
        return () => {
            document.body.style.overflow = '';
            document.body.style.backgroundColor = '';
        };
    }, []);

    if (!pageMounted) return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            Loading Rulebook...
        </div>
    );

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
            {/* Back Button */}
            <Link
                href="/"
                className="back-btn"
                onClick={() => setIsSiteLoaded(true)}
                style={{
                    position: 'fixed',
                    top: '30px',
                    left: '30px',
                    zIndex: 2000,
                    textDecoration: 'none'
                }}
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
                style={{
                    position: 'fixed',
                    top: '30px',
                    right: '30px',
                    zIndex: 2000,
                    textDecoration: 'none'
                }}
            >
                <div className="download-btn-inner">
                    <Download className="w-5 h-5" />
                    <span className="font-bold tracking-wider text-[10px] md:text-sm">DOWNLOAD BROCHURE</span>
                </div>

                <div className="pulse-ring"></div>
            </a>

            <ParticleLayer />
            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Book />
            </div>
        </div>
    );
}

