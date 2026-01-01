'use client'

import { motion } from 'framer-motion'
import { Trophy, Activity, Shield, Zap } from 'lucide-react'
import { CosmicBackground } from '@/components/ui/CosmicBackground'

const ranks = [
    { rank: 1, name: 'S. KULKARNI', missions: 12, pts: 2850, origin: 'BLR_SEC_01', status: 'COMMANDER' },
    { rank: 2, name: 'A. DESHMUKH', missions: 10, pts: 2640, origin: 'PUN_SEC_04', status: 'ELITE' },
    { rank: 3, name: 'R. HEGDE', missions: 9, pts: 2420, origin: 'MUB_SEC_02', status: 'ELITE' },
    { rank: 4, name: 'V. SHETTY', missions: 8, pts: 2100, origin: 'DEL_SEC_09', status: 'PILOT' },
    { rank: 5, name: 'M. BHAT', missions: 7, pts: 1850, origin: 'HYD_SEC_07', status: 'PILOT' },
]

export function Leaderboard() {
    return (
        <section className="relative py-24 px-6 bg-[#050805] overflow-hidden">
            <CosmicBackground />
            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Header - Green Sync Theme */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 border-l-2 border-emerald-500 pl-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400 font-mono text-[9px] uppercase tracking-[0.5em] font-black">
                            LIVE_STUDENT_RANKINGS
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                            FEST<br /><span className="text-emerald-500/30 not-italic">LEADERBOARD_</span>
                        </h2>
                    </div>
                </div>

                {/* Professional Table - Green Theme */}
                <div className="glass-card overflow-hidden">
                    <div className="bg-white/5 border-b border-white/10 grid grid-cols-5 p-10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                        <div className="col-span-1">RANK</div>
                        <div className="col-span-2 md:col-span-1 text-emerald-400">PARTICIPANT</div>
                        <div className="hidden md:block">CATEGORY</div>
                        <div className="text-center">EVENTS</div>
                        <div className="text-right">TOTAL_SCORE</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {ranks.map((entry, i) => (
                            <motion.div
                                key={entry.rank}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="grid grid-cols-5 p-10 items-center group hover:bg-white/[0.03] transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <span className={`text-4xl font-black italic tracking-tighter ${i < 3 ? 'text-white' : 'text-white/10'}`}>
                                        #0{entry.rank}
                                    </span>
                                    {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                </div>

                                <div className="col-span-2 md:col-span-1 space-y-1">
                                    <div className="font-black text-white text-xl group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">
                                        {entry.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                        ID_{entry.origin}
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                        <Shield className="w-4 h-4 text-emerald-400" />
                                        <span className="text-[9px] font-black text-white/40 tracking-[0.2em]">{entry.status}</span>
                                    </div>
                                </div>

                                <div className="text-center font-black text-white/80 text-xl">{entry.missions}</div>

                                <div className="text-right text-3xl font-black text-white italic tracking-tighter italic">
                                    {entry.pts.toLocaleString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-white/[0.04] p-12 flex flex-col md:flex-row items-center justify-between gap-10 border-t border-white/20">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                <Zap className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-white font-black text-lg uppercase italic tracking-tighter">LEADERBOARD_LIVE</div>
                                <div className="text-white/20 text-[9px] font-mono uppercase tracking-widest">LAST_UPDATED: 0x82...BA45</div>
                            </div>
                        </div>
                        <button className="btn-outline px-12">
                            CHECK_MY_RANK
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
