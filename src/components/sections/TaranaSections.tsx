
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useVelocity, useSpring, useAnimationFrame } from 'framer-motion';
import Image from 'next/image';
import { Play, Music, ExternalLink, Activity } from 'lucide-react';

const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// --- TARANA IN PIXELS COMPONENT ---
export function TaranaInPixels() {
    const baseVelocity = -2; // Adjust for speed
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
    const directionFactor = useRef<number>(1);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, { threshold: 0.01 });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useAnimationFrame((t, delta) => {
        if (!isInView) return;

        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }
        moveBy += directionFactor.current * moveBy * velocityFactor.get();
        baseX.set(baseX.get() + moveBy);
    });

    const images = [
        "/img/tarana_glimpse_1.png",
        "/img/tarana_glimpse_2.png",
        "/img/tarana_glimpse_3.png",
        "/img/tarana_glimpse_4.png",
        "/img/tarana_glimpse_5.png",
    ];

    // Duplicate images for seamless loop
    const seamlessImages = [...images, ...images, ...images];

    return (
        <section ref={containerRef} className="relative py-24 bg-[#020202] overflow-hidden border-t border-emerald-900/10">
            <div className="container mx-auto px-6 mb-12 text-center">
                <h2 className="text-4xl md:text-6xl font-[900] text-emerald-500 uppercase tracking-tighter mb-4 font-[family-name:var(--font-orbitron)]">
                    TARANA IN PIXELS
                </h2>
                <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full" />
            </div>

            <div className="relative w-full flex overflow-hidden">
                <motion.div className="flex gap-4 md:gap-8" style={{ x }}>
                    {seamlessImages.map((src, i) => (
                        <div
                            key={i}
                            className="relative flex-none w-[280px] h-[350px] md:w-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-emerald-500/20 group hover:opacity-100 transition-all duration-500"
                        >
                            <Image
                                src={src}
                                alt={`Tarana Glimpse ${i}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 280px, 400px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-6 left-6">
                                <Activity className="text-emerald-400 w-6 h-6 mb-2" />
                                <p className="text-white/80 font-mono text-xs tracking-widest uppercase">Memory Block /// {i + 1}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Vignette Overlay for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020202] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020202] to-transparent pointer-events-none z-10" />
        </section>
    );
}

// --- ORIGINAL MUSIC COMPONENT ---
export function OriginalMusic() {
    const musicData = [
        {
            title: "Original Track 01",
            desc: "A soulful fusion masterpiece.",
            link: "https://www.youtube.com/watch?v=J7K67bYwnbE&list=TLGG6j2KW6wXGjMyNjAxMjAyNg",
            thumbnail: "https://img.youtube.com/vi/J7K67bYwnbE/maxresdefault.jpg"
        },
        {
            title: "Original Track 02",
            desc: "High energy rock anthem.",
            link: "https://www.youtube.com/watch?v=kbxuosn4yn4&list=TLGGTzRWb8MHpaIyNjAxMjAyNg",
            thumbnail: "https://img.youtube.com/vi/kbxuosn4yn4/maxresdefault.jpg"
        },
        {
            title: "Original Track 03",
            desc: "The rhythm of tradition.",
            link: "https://www.youtube.com/watch?v=Kfq23vCRoIY&list=TLGGRYuLLw2kNrsyNjAxMjAyNg",
            thumbnail: "https://img.youtube.com/vi/Kfq23vCRoIY/maxresdefault.jpg"
        }
    ];

    return (
        <section className="relative py-24 bg-[#050b06] border-t border-emerald-900/20">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl md:text-6xl font-[900] text-emerald-500 uppercase tracking-tighter font-[family-name:var(--font-orbitron)]">
                            ORIGINAL MUSIC
                        </h2>
                        <p className="text-emerald-500/60 font-mono mt-2 tracking-widest text-sm uppercase">/// Sonic Creations by Tarana ///</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {musicData.map((track, i) => (
                        <motion.a
                            href={track.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative aspect-video rounded-xl overflow-hidden border border-emerald-500/30 bg-black cursor-pointer shadow-lg hover:shadow-emerald-500/20 transition-all"
                        >
                            <Image
                                src={track.thumbnail}
                                alt={track.title}
                                fill
                                unoptimized={true}
                                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                            />

                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 text-black fill-black ml-1" />
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <h3 className="text-white font-bold text-lg font-[family-name:var(--font-orbitron)] group-hover:text-emerald-400 transition-colors">{track.title}</h3>
                                <p className="text-emerald-500/70 text-xs font-mono tracking-wider">{track.desc}</p>
                            </div>

                            <div className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-4 h-4 text-emerald-400" />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
