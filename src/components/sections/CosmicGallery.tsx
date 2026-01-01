'use client'

import { motion } from 'framer-motion'
import { Maximize2, Shield, Camera } from 'lucide-react'
import { CosmicBackground } from '@/components/ui/CosmicBackground'

const memories = [
    {
        id: 1,
        title: 'TECHNO_INNOVATION',
        category: 'HACKATHON_FINALS',
        img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
        meta: 'ST_JOSEPH_COLLEGE | 2K25'
    },
    {
        id: 2,
        title: 'STAGE_PROFILES',
        category: 'CULTURAL_SHOWCASE',
        img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
        meta: 'MAIN_AUDITORIUM | LIVE'
    },
    {
        id: 3,
        title: 'CAMPUS_SYNERGY',
        category: 'FEST_CHRONICLES',
        img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200',
        meta: 'QUADRANGLE_ZONE_04'
    },
    {
        id: 4,
        title: 'VALHALLA_FINALS',
        category: 'ESPORTS_ARENA',
        img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
        meta: 'GAMING_HUB_V1.0'
    }
]

export function CosmicGallery() {
    return (
        <section className="relative py-24 px-6 bg-[#050805] overflow-hidden">
            <CosmicBackground />
            <div className="container mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 border-l-2 border-emerald-500 pl-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400 font-mono text-[9px] uppercase tracking-[0.4em] font-black">
                            FEST_HIGHLIGHTS_2025
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                            MEMORIES<br /><span className="text-white/10 not-italic">.2K26_RAW</span>
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {memories.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            className="group relative h-[450px] glass-card overflow-hidden p-0 border-white/10"
                        >
                            <img
                                src={item.img}
                                alt={item.title}
                                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#050805] via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-12">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-mono text-emerald-400 font-black tracking-[0.3em] uppercase">{item.category}</div>
                                            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{item.title}</h3>
                                        </div>
                                        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white/40 group-hover:text-emerald-500 transition-all">
                                            <Maximize2 className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-white/5 pt-6">
                                        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{item.meta}</div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 flex flex-col items-center space-y-8">
                    <button className="btn-primary px-20 py-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        VIEW_FULL_ALBUM
                    </button>
                    <div className="text-[10px] font-mono text-white/10 uppercase tracking-[1em]">OFFICIAL_FEST_ARCHIVE</div>
                </div>
            </div>
        </section>
    )
}
