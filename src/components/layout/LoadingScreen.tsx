'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Rocket, Shield, Activity, ChevronRight, Zap, Target, Terminal, ArrowRight } from 'lucide-react'

export function LoadingScreen() {
    const [step, setStep] = useState<'SYNCING' | 'READY' | 'COUNTDOWN' | 'MESSAGE' | 'LAUNCH'>('SYNCING')
    const [progress, setProgress] = useState(0)
    const [countdown, setCountdown] = useState(3)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        if (step === 'SYNCING') {
            const timer = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(timer)
                        setTimeout(() => setStep('READY'), 500)
                        return 100
                    }
                    return p + 2
                })
            }, 30)
            return () => clearInterval(timer)
        }
    }, [step])

    useEffect(() => {
        if (step === 'COUNTDOWN') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
                return () => clearTimeout(timer)
            } else {
                setStep('MESSAGE')
            }
        }
    }, [step, countdown])

    useEffect(() => {
        if (step === 'MESSAGE') {
            const timer = setTimeout(() => {
                setStep('LAUNCH')
                setTimeout(() => setVisible(false), 800)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [step])

    const startMission = () => {
        setStep('COUNTDOWN')
    }

    const cockpitClip = `polygon(
        50px 0, calc(100% - 50px) 0, 100% 50px, 
        100% calc(100% - 50px), calc(100% - 50px) 100%, 
        50px 100%, 0 calc(100% - 50px), 0 50px
    )`

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[11000] bg-[#020402] flex items-center justify-center p-6 md:p-12 overflow-hidden select-none"
                    initial={{ opacity: 1 }}
                    exit={{
                        scale: 1.1,
                        opacity: 0,
                        filter: 'blur(100px)',
                        transition: { duration: 1.5, ease: [0.7, 0, 0.3, 1] }
                    }}
                >
                    {/* Atmospheric Nebula Background */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_60%)] animate-pulse" />
                    </div>

                    {/* THE SPACESHIP COCKPIT FRAME */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center"
                    >
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-emerald-500/40 via-white/30 to-emerald-500/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                            style={{ clipPath: cockpitClip }}
                        />
                        <div
                            className="absolute inset-[4px] bg-[#020402]"
                            style={{ clipPath: cockpitClip }}
                        />

                        {/* Corner HUD Metrics */}
                        <div className="absolute top-12 left-16 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-emerald-400 font-black text-[8px] tracking-widest uppercase mb-1">
                                <Terminal className="w-3 h-3" /> SYSTEM_STATUS
                            </div>
                            <div className="text-white/20 text-[7px] font-mono tracking-widest uppercase">STATUS: ONLINE</div>
                            <div className="text-white/20 text-[7px] font-mono tracking-widest uppercase">UPTIME: 00:00:24</div>
                        </div>

                        <div className="absolute top-12 right-16 text-right flex flex-col gap-2">
                            <div className="flex items-center justify-end gap-2 text-emerald-400 font-black text-[8px] tracking-widest uppercase mb-1">
                                COORDINATES <Target className="w-3 h-3" />
                            </div>
                            <div className="text-white/20 text-[7px] font-mono tracking-widest uppercase">13.33° N / 74.74° E</div>
                            <div className="text-white/20 text-[7px] font-mono tracking-widest uppercase">VARNOTHSAVA_26</div>
                        </div>

                        {/* CENTER CONTENT */}
                        <div className="relative z-10 w-full max-w-2xl text-center space-y-16 px-10">
                            <AnimatePresence mode="wait">
                                {step === 'SYNCING' && (
                                    <motion.div
                                        key="syncing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="space-y-12"
                                    >
                                        <div className="space-y-8 bg-emerald-500/5 p-12 lg:p-16 rounded-[2rem] border border-emerald-500/10 backdrop-blur-3xl">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">LOADING_FEST_DATA</span>
                                                    <span className="text-white/20 text-[8px] font-mono uppercase tracking-widest">VERIFYING_CREDENTIALS...</span>
                                                </div>
                                                <span className="text-5xl font-black text-white italic tracking-tighter">{progress}%</span>
                                            </div>

                                            <div className="h-[6px] w-full bg-white/5 relative overflow-hidden rounded-full border border-white/5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className="absolute inset-y-0 left-0 bg-emerald-500 shadow-[0_0_30px_#10b981,0_0_10px_#10b981]"
                                                />
                                            </div>

                                            <div className="flex justify-center gap-12 pt-4 opacity-40">
                                                <Terminal className="w-4 h-4 text-emerald-400" />
                                                <div className="w-12 h-[1px] bg-emerald-500/20 my-auto" />
                                                <Shield className="w-4 h-4 text-emerald-400" />
                                                <div className="w-12 h-[1px] bg-emerald-500/20 my-auto" />
                                                <Rocket className="w-4 h-4 text-emerald-400" />
                                            </div>
                                        </div>

                                        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-[0.05em] uppercase leading-none opacity-40">
                                            VARNOTHSAVA<br /><span className="text-white/10 not-italic">2K26_</span>
                                        </h1>
                                    </motion.div>
                                )}

                                {step === 'READY' && (
                                    <motion.div
                                        key="ready"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-12"
                                    >
                                        <div className="p-16 border border-emerald-500/20 bg-emerald-500/[0.03] backdrop-blur-xl rounded-[3rem]">
                                            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                                <Rocket className="w-12 h-12 text-emerald-500 animate-bounce" />
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">WELCOME</h2>
                                            <p className="text-emerald-400/40 text-[10px] uppercase tracking-[0.3em] font-black mb-12">WELCOME TO VARNOTHSAVA. PRESS ENTER TO START.</p>

                                            <button
                                                onClick={startMission}
                                                className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                                                style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
                                            >
                                                ENTER_FEST
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'COUNTDOWN' && (
                                    <motion.div
                                        key="countdown"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 2 }}
                                        className="text-center"
                                    >
                                        <motion.div
                                            key={countdown}
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1.2, opacity: 1 }}
                                            className="text-[12rem] font-black text-white italic tracking-tighter leading-none text-glow-emerald"
                                        >
                                            {countdown}
                                        </motion.div>
                                        <div className="mt-8 text-emerald-400 font-black text-[10px] tracking-[1.5em] uppercase opacity-40">STARTING_SOON</div>
                                    </motion.div>
                                )}

                                {step === 'MESSAGE' && (
                                    <motion.div
                                        key="message"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, filter: 'blur(20px)' }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-16 h-[2px] bg-emerald-500 animate-pulse" />
                                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase italic">WELCOME_TO_SMVITM</h2>
                                            <div className="flex items-center gap-4 text-emerald-400/40 font-mono text-[10px] tracking-[0.5em] uppercase">
                                                CONNECTED_TO_SERVER
                                            </div>
                                            <div className="w-16 h-[2px] bg-emerald-500 animate-pulse" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bottom HUD metrics */}
                        <div className="absolute bottom-12 inset-x-0 flex items-center justify-center gap-20">
                            <div className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-emerald-500/40" />
                                <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">CONNECTION_STABLE</span>
                            </div>
                            <div className="w-12 h-0.5 bg-emerald-500/20" />
                            <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">SECURE_CONNECTION</span>
                                <Shield className="w-4 h-4 text-emerald-500/40" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Outer Camera Recording Indicator */}
                    <div className="rec-indicator opacity-80 z-[12000]">
                        <div className="rec-dot" />
                        <span className="text-white">VARNOTHSAVA // LIVE</span>
                    </div>

                    <div className="cam-hud z-[12000]">
                        <div className="cam-bracket bracket-tl border-emerald-500/40" />
                        <div className="cam-bracket bracket-tr border-emerald-500/40" />
                        <div className="cam-bracket bracket-bl border-emerald-500/40" />
                        <div className="cam-bracket bracket-br border-emerald-500/40" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
