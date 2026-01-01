'use client'

import { motion } from 'framer-motion'
import {
    User as UserIcon, QrCode, ShieldCheck, MapPin,
    Settings, LogOut, Grid, Inbox, History, LayoutDashboard,
    ExternalLink, Zap, Activity, Code, Terminal, Cpu, HardDrive
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { CosmicBackground } from '@/components/ui/CosmicBackground'

export function UserDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const { cart, logout } = useApp()

    const tabs = [
        { id: 'overview', icon: Terminal, label: '~/dashboard' },
        { id: 'pass', icon: QrCode, label: './id_card.pem' },
        { id: 'dimensions', icon: HardDrive, label: '/events' },
    ]

    return (
        <div className="relative min-h-screen py-32 px-6 lg:px-20 overflow-hidden bg-[#050805]">
            <CosmicBackground />

            <div className="max-w-screen-2xl mx-auto relative z-10">
                <div className="flex flex-col xl:flex-row gap-8">

                    {/* Sidebar - Tactical Explorer Style */}
                    <div className="w-full xl:w-72 flex flex-col gap-4">
                        <div className="bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-sm overflow-hidden">
                            <div className="bg-emerald-500/10 px-4 py-2 border-b border-emerald-500/20">
                                <span className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-widest font-black">STUDENT_PROFILE</span>
                            </div>

                            <div className="p-4 space-y-6">
                                {/* Profile Snippet */}
                                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-full border border-emerald-500/30 p-0.5">
                                        <img
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=varnothsava"
                                            className="w-full h-full rounded-full bg-emerald-500/5 grayscale group-hover:grayscale-0 transition-all"
                                            alt="Pfp"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white font-mono uppercase tracking-tighter">STUDENT_ID_8891</span>
                                        <span className="text-[9px] text-emerald-400 font-mono animate-pulse">●_ONLINE</span>
                                    </div>
                                </div>

                                {/* Nav Links */}
                                <nav className="flex flex-col gap-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-3 py-2.5 rounded-sm flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === tab.id
                                                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                                }`}
                                            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)' }}
                                        >
                                            <tab.icon className="w-3.5 h-3.5" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-4 border-t border-white/5">
                                <button
                                    onClick={logout}
                                    className="w-full px-3 py-2.5 rounded-sm flex items-center gap-3 text-[10px] font-mono text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all uppercase tracking-widest"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    LOGOUT()
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Tactical Interface */}
                    <div className="flex-1 bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-sm min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
                        {/* Decorative Corner Accents */}
                        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20">
                            <div className="absolute top-4 right-4 w-4 h-[1px] bg-emerald-500" />
                            <div className="absolute top-4 right-4 w-[1px] h-4 bg-emerald-500" />
                        </div>

                        <div className="px-6 py-3 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-500/5">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/10 border border-emerald-500/30" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/5 border border-emerald-500/20" />
                                </div>
                                <div className="h-4 w-[1px] bg-emerald-500/20 mx-2" />
                                <span className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-widest font-black">
                                    {activeTab === 'overview' ? 'DASHBOARD.EXE' : activeTab === 'pass' ? 'DIGITAL_ID.PEM' : 'ACTIVITY_LOG.JSON'}
                                </span>
                            </div>
                            <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-black">SECURE</span>
                            </div>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar font-mono">

                            {activeTab === 'overview' && (
                                <div className="space-y-12">
                                    <div className="relative">
                                        <div className="absolute -left-10 top-0 bottom-0 w-1 bg-emerald-500/40" />
                                        <span className="text-emerald-500/40 mb-2 block text-[10px] uppercase tracking-widest font-black">//_OVERVIEW</span>
                                        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">
                                            STUDENT <span className="text-emerald-500">DASHBOARD_</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Stat Card 1 */}
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 relative group hover:bg-emerald-500/10 transition-all">
                                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/40" />
                                            <div className="text-[10px] text-emerald-400/40 uppercase tracking-[0.3em] mb-4 font-black">EVENTS_REGISTERED</div>
                                            <div className="text-5xl font-black text-white italic tracking-tighter flex items-end gap-2 group-hover:text-emerald-400 transition-colors">
                                                {cart.length.toString().padStart(2, '0')}
                                                <span className="text-[10px] text-emerald-500 font-mono mb-2 uppercase tracking-widest"> [ACTIVE]</span>
                                            </div>
                                            <div className="mt-6 h-[2px] w-full bg-white/5 overflow-hidden">
                                                <motion.div
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: '0%' }}
                                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                    style={{ width: `${Math.min(cart.length * 10, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stat Card 2 */}
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 relative group hover:bg-emerald-500/10 transition-all">
                                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/40" />
                                            <div className="text-[10px] text-emerald-400/40 uppercase tracking-[0.3em] mb-4 font-black">FEST_POINTS</div>
                                            <div className="text-5xl font-black text-white italic tracking-tighter flex items-end gap-2 group-hover:text-emerald-400 transition-colors">
                                                1,250
                                                <span className="text-[10px] text-emerald-500 font-mono mb-2 uppercase tracking-widest"> PTS</span>
                                            </div>
                                            <div className="mt-6 flex gap-1.5">
                                                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                                    <div key={i} className={`h-1 flex-1 ${i <= 5 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-white/5'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/60 border border-emerald-500/10 p-6 font-mono text-[11px] text-emerald-400/60 leading-relaxed italic">
                                        <p><span className="text-emerald-500">await</span> <span className="text-white">load_data</span>(<span className="text-emerald-400/80">"VARNOTHSAVA_2K26"</span>);</p>
                                        <p className="mt-2"><span className="text-emerald-500">if</span> (system_ready) <span className="text-white">start_fest</span>();</p>
                                        <p className="mt-3 text-white/20 uppercase tracking-[0.2em] not-italic">// SYSTEM_READY // CONNECTION_ESTABLISHED</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'pass' && (
                                <div className="flex flex-col lg:flex-row items-start gap-16 h-full">
                                    <div className="w-full max-w-sm bg-black/40 border border-emerald-500/30 relative overflow-hidden p-10 flex flex-col items-center text-center">
                                        <div className="absolute top-0 inset-x-0 h-[2px] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" />

                                        <div className="w-full flex justify-between items-start mb-10 text-[8px] font-mono text-emerald-400/40 uppercase tracking-[0.3em] font-black">
                                            <span>STUDENT_VERIFIED</span>
                                            <span>OFFICIAL_ID</span>
                                        </div>

                                        <div className="p-6 bg-white rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-8 grayscale hover:grayscale-0 transition-all duration-700 cursor-none">
                                            <QrCode className="w-36 h-36 text-black" />
                                        </div>

                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">STUDENT PASS</h3>
                                        <div className="font-mono text-[10px] bg-emerald-500 text-black px-4 py-1.5 font-black uppercase tracking-widest mb-8">
                                            REG_ID: 8891-XK-09
                                        </div>

                                        <div className="w-full pt-8 border-t border-white/5 flex flex-col gap-3">
                                            <div className="flex justify-between text-[10px] font-mono text-emerald-400/40 font-black uppercase tracking-widest">
                                                <span>STATUS</span>
                                                <span className="text-emerald-400">ACTIVE</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-mono text-emerald-400/40 font-black uppercase tracking-widest">
                                                <span>VALID_TILL</span>
                                                <span className="text-white">NOV_2026</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-8">
                                        <div className="font-mono text-[10px] leading-relaxed">
                                            <span className="text-emerald-500 font-black uppercase tracking-[0.5em]">-----BEGIN_ID_DATA-----</span>
                                            <p className="text-white/20 my-4 break-all leading-relaxed italic">
                                                MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw...
                                                7n9Xp2m9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v...
                                                5z5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5...
                                                8891_STUDENT_ACCESS_GRANTED_X...
                                            </p>
                                            <span className="text-emerald-500 font-black uppercase tracking-[0.5em]">-----END_ID_DATA-----</span>
                                        </div>

                                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-sm text-[11px] text-emerald-400 font-mono flex items-start gap-4 italic leading-relaxed">
                                            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
                                            <p>THIS DIGITAL SIGNATURE GRANTS PHYSICAL ACCESS TO ALL FEST EVENTS. UNAUTHORIZED SHARING WILL TRIGGER SESSION TERMINATION.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
