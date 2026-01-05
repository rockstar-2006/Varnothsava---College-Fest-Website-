'use client'

import { motion } from 'framer-motion'
import { Trophy, Activity, Shield, Zap, Search, ChevronRight, Star } from 'lucide-react'
import ProEventBackground from '@/components/ui/ProEventBackground'

const ranks = [
    { rank: 1, name: 'S. KULKARNI', events: 12, pts: 2850, origin: 'STUDENT_001', status: 'CHAMPION' },
    { rank: 2, name: 'A. DESHMUKH', events: 10, pts: 2640, origin: 'STUDENT_042', status: 'ELITE' },
    { rank: 3, name: 'R. HEGDE', events: 9, pts: 2420, origin: 'STUDENT_082', status: 'ELITE' },
    { rank: 4, name: 'V. SHETTY', events: 8, pts: 2100, origin: 'STUDENT_019', status: 'PRO' },
    { rank: 5, name: 'M. BHAT', events: 7, pts: 1850, origin: 'STUDENT_057', status: 'ACTIVE' },
]

export function Leaderboard() {
    return (
        <section className="relative min-h-screen py-32 px-6 bg-[#020603] overflow-hidden">
            <ProEventBackground theme="emerald" />

            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-full h-[60vh] bg-[radial-gradient(circle,rgba(16,185,129,0.05),transparent_70%)]" />
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-20">
                    <div className="space-y-6 text-center xl:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-center xl:justify-start gap-4 text-emerald-500 font-black text-[10px] uppercase tracking-[0.5em] italic"
                        >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                            Live Participant Rankings
                        </motion.div>
                        <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] drop-shadow-2xl">
                            HALL OF <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 not-italic">FAME</span>
                        </h2>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <div className={`bg-white/5 border border-white/10 p-8 rounded-[2.5rem] ${typeof window !== 'undefined' && window.innerWidth < 768 ? '' : 'backdrop-blur-3xl'} flex flex-col items-center gap-2 group hover:border-emerald-500/30 transition-all`}>
                            <Star className="w-6 h-6 text-emerald-500 mb-2" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Top Score</span>
                            <span className="text-4xl font-black text-white italic tracking-tighter">2,850</span>
                        </div>
                        <div className={`bg-white/5 border border-white/10 p-8 rounded-[2.5rem] ${typeof window !== 'undefined' && window.innerWidth < 768 ? '' : 'backdrop-blur-3xl'} flex flex-col items-center gap-2 group hover:border-emerald-500/30 transition-all`}>
                            <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Participants</span>
                            <span className="text-4xl font-black text-white italic tracking-tighter">1.2K</span>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white/[0.02] ${typeof window !== 'undefined' && window.innerWidth < 768 ? '' : 'backdrop-blur-3xl'} border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl will-change-gpu`}
                >
                    {/* Header */}
                    <div className="bg-emerald-500 px-10 py-8 grid grid-cols-5 text-[11px] font-black text-black uppercase tracking-[0.3em] italic">
                        <div className="col-span-1">RANK</div>
                        <div className="col-span-2 md:col-span-1">STUDENT NAME</div>
                        <div className="hidden md:block">STATUS</div>
                        <div className="text-center">EVENTS</div>
                        <div className="text-right">TOTAL POINTS</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/5">
                        {ranks.map((entry, i) => (
                            <motion.div
                                key={entry.rank}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="grid grid-cols-5 p-10 items-center group hover:bg-white/[0.04] transition-all will-change-gpu"
                            >
                                <div className="flex items-center gap-8">
                                    <span className={`text-5xl font-black italic tracking-tighter ${i < 3 ? 'text-white' : 'text-white/10'}`}>
                                        #{(i + 1).toString().padStart(2, '0')}
                                    </span>
                                    {i === 0 && <Trophy className="w-8 h-8 text-emerald-500 animate-bounce" />}
                                </div>

                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <div className="font-black text-white text-2xl group-hover:text-emerald-500 transition-all uppercase italic tracking-tighter group-hover:translate-x-2">
                                        {entry.name}
                                    </div>
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest transition-colors group-hover:text-emerald-500/50">
                                        ID: {entry.origin}
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full group-hover:border-emerald-500/50 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black text-white/40 tracking-[0.2em]">{entry.status}</span>
                                    </div>
                                </div>

                                <div className="text-center font-black text-white/60 text-2xl font-mono">{entry.events}</div>

                                <div className="text-right text-4xl font-black text-white italic tracking-tighter drop-shadow-xl group-hover:scale-110 transition-transform">
                                    {entry.pts.toLocaleString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="bg-white/[0.04] p-12 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-white/10">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-emerald-500 text-black rounded-3xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                                <Zap className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <div className="text-white font-black text-xl uppercase italic tracking-tighter">Leaderboard Status: Active</div>
                                <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">Updating with latest festival results...</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 hover:text-white hover:border-emerald-500 transition-all uppercase tracking-[0.3em]">
                                Explore Categories
                            </button>
                            <button className="px-10 py-5 bg-emerald-500 text-black rounded-2xl text-[10px] font-black hover:bg-white transition-all uppercase tracking-[0.3em] italic shadow-xl">
                                Check My Rank <ChevronRight className="w-4 h-4 inline ml-2" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
