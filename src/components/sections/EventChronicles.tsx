'use client'

import { motion } from 'framer-motion'
import { Activity, Clock, Target, Shield, Zap, Calendar } from 'lucide-react'
import { CosmicBackground } from '@/components/ui/CosmicBackground'

const events = [
    {
        date: 'FEB 18',
        event: 'FESTIVAL REGISTRATION OPEN',
        desc: 'Registration portal goes live for all student participants across the nation. Join the celebration.',
        status: 'OPEN'
    },
    {
        date: 'MAR 26',
        event: 'VARNOTHSAVA INAUGURATION',
        desc: 'Official commencement of the 2026 festival. Engaging the academic community through innovation and art.',
        status: 'READY'
    },
    {
        date: 'MAR 27',
        event: 'EVENT GRAND FINALE',
        desc: 'The ultimate showcase of talent across technical, cultural, and gaming arenas. Awarding the champions.',
        status: 'UPCOMING'
    }
]

export function EventChronicles() {
    return (
        <section className="relative py-24 px-6 bg-[#050805] overflow-hidden">
            <CosmicBackground />
            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="mb-20 space-y-4 border-l-2 border-emerald-500 pl-8">
                    <div className="flex items-center gap-3 text-emerald-400 font-mono text-[9px] uppercase tracking-[0.4em] font-black">
                        Festival Schedule
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                        EVENT<br /><span className="text-emerald-500/30 not-italic">TIMELINE</span>
                    </h2>
                </div>

                <div className="grid gap-6 md:gap-8">
                    {events.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="glass-card p-6 md:p-10 group"
                        >
                            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
                                <div className="space-y-1 md:space-y-2 md:w-48">
                                    <div className="text-[8px] text-emerald-400 font-black tracking-widest uppercase">Date</div>
                                    <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">{log.date}</div>
                                </div>
                                <div className="flex-1 space-y-3 md:space-y-4 text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{log.event}</h3>
                                        <div className="w-fit px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-white/40 rounded-full uppercase">{log.status}</div>
                                    </div>
                                    <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                                        "{log.desc}"
                                    </p>
                                </div>
                                <div className="hidden lg:block opacity-10 group-hover:opacity-100 group-hover:text-emerald-500 transition-all">
                                    <Calendar className="w-10 h-10" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
