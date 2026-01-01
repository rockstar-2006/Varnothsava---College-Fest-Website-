'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { useRouter } from 'next/navigation'

export interface Mission {
    id: string
    title: string
    type: 'Technical' | 'Cultural' | 'Gaming'
    category?: 'Hobby Club' | 'General' | 'Promotional'
    description: string
    rules: string[]
    regulations?: string[]
    evaluation?: string[]
    prizePool: string
    coordinators: string[]
    coordinatorsContact?: string[]
    fee: number
    visual: string
    date: string
    specs: string[]
    videoUrl?: string
    brochureUrl?: string
}

export interface ThemeConfig {
    primary: string
    secondary: string
    glow: string
    border: string
    borderHover: string
    text: string
    textHover: string
    bg: string
    bgHover: string
    shadow: string
    gradient: string
    pulse: string
    radarColor: string
}

interface MissionCardProps {
    mission: Mission
    idx: number
    theme: ThemeConfig
    complexClip: string
    cart: any[]
    addToCart: (item: any) => void
}

export default function MissionCard({
    mission,
    idx,
    theme,
    complexClip,
    cart,
    addToCart
}: MissionCardProps) {
    const router = useRouter()
    return (
        <div className="event-card-reveal will-change-transform will-change-opacity">
            <Tilt
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                scale={1.04}
                perspective={2000}
                transitionSpeed={2000}
                className="h-[440px] w-full group"
            >
                <div className="w-full h-full relative cursor-pointer" onClick={() => router.push(`/events/${mission.id}`)}>
                    {/* SUPER-GLOW BACKDROP (The "Card Halo") - Dynamic Color */}
                    <div
                        className="absolute inset-[-15px] blur-[60px] transition-all duration-500 opacity-20 group-hover:opacity-100"
                        style={{
                            background: `${theme.radarColor}`,
                            boxShadow: `0 0 70px ${theme.glow}`
                        }}
                    />

                    {/* GEOMETRIC SVG BORDER SYSTEM - Expanded for Cultural Luxury */}
                    <svg
                        className={`absolute ${mission.type === 'Cultural' ? 'inset-[-45px] w-[calc(100%+90px)] h-[calc(100%+90px)]' : 'inset-0 w-full h-full'} pointer-events-none z-10 overflow-visible`}
                        preserveAspectRatio="none"
                        viewBox={mission.type === 'Cultural' ? "-45 -45 390 530" : "0 0 300 440"}
                    >
                        <defs>
                            <filter id={`glow-${mission.type}-${idx}`} x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="8" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>

                            <linearGradient id={`gold-grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#78350f" />
                                <stop offset="30%" stopColor="#fbbf24" />
                                <stop offset="50%" stopColor="#fffbeb" />
                                <stop offset="70%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#b45309" />
                            </linearGradient>
                        </defs>

                        {/* MAIN OUTER FRAME (Geometric Engine) */}
                        <path
                            d={mission.type === 'Cultural'
                                ? "M 50 0 L 250 0 L 300 50 L 300 390 L 260 440 L 205 440 L 190 415 L 110 415 L 95 440 L 40 440 L 0 400 L 0 50 Z"
                                : "M 30 0 L 300 0 L 300 440 L 210 440 L 195 414 L 105 414 L 90 440 L 0 440 L 0 264 L 14 264 L 14 176 L 0 176 L 0 30 Z"
                            }
                            fill="none"
                            stroke={mission.type === 'Cultural' ? "#fbbf24" : "currentColor"}
                            strokeWidth={mission.type === 'Cultural' ? "1.5" : "5"}
                            className={mission.type === 'Cultural' ? "opacity-30" : theme.border}
                            style={{ filter: mission.type === 'Cultural' ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))' : `url(#glow-${mission.type}-${idx})` }}
                        />

                        {/* CULTURAL ONLY: THE EXACT ORNATE "LIFAFA" FRAME SYSTEM */}
                        {mission.type === 'Cultural' && (
                            <g>
                                {/* 1. Underlying Rich Halo Foundation */}
                                <path
                                    d="M 50 0 L 250 0 L 300 50 L 300 390 L 260 440 L 205 440 L 190 415 L 110 415 L 95 440 L 40 440 L 0 400 L 0 50 Z"
                                    fill="none"
                                    stroke="rgba(245, 158, 11, 0.4)"
                                    strokeWidth="45"
                                    style={{ filter: 'blur(45px)' }}
                                />

                                {/* 2. THE SCULPTED GOLD FRAME (MUSEUM GRADE FILIGREE) */}
                                <g style={{ filter: 'drop-shadow(0 12px 25px rgba(0,0,0,0.9))' }}>
                                    {/* Molten Base Shadow Layer */}
                                    <g stroke="#5c2d0b" strokeWidth="4" fill="none" transform="translate(2, 2)" opacity="0.5">
                                        {[...Array(14)].map((_, i) => (
                                            <path key={`sh-l-${i}`} d={`M-18,${25 + i * 28} q-15,14 0,28`} />
                                        ))}
                                        {[...Array(14)].map((_, i) => (
                                            <path key={`sh-r-${i}`} d={`M318,${25 + i * 28} q15,14 0,28`} />
                                        ))}
                                    </g>

                                    {/* Main Carved Gold Pattern (Dense Imperial Filigree) */}
                                    <g stroke={`url(#gold-grad-${idx})`} strokeWidth="3.5" fill="none" strokeLinecap="round">
                                        {/* Dense Acanthus Leaf Scrolls (The "Royal" Border) - Balanced Position */}
                                        {[...Array(15)].map((_, i) => (
                                            <g key={`l-royal-${i}`} transform={`translate(-22, ${i * 28 + 25})`}>
                                                <path d="M0,0 c-18,5 -18,15 0,20 c-12,-8 -12,-12 0,-20" strokeWidth="2.8" />
                                                <path d="M-8,10 c-5,0 -8,5 -2,5" strokeWidth="1" opacity="0.6" />
                                                <path d="M-2,6 a3,3 0 1,0 0.1,0" fill={`url(#gold-grad-${idx})`} stroke="none" />
                                            </g>
                                        ))}
                                        {[...Array(15)].map((_, i) => (
                                            <g key={`r-royal-${i}`} transform={`translate(322, ${i * 28 + 25}) scale(-1, 1)`}>
                                                <path d="M0,0 c-18,5 -18,15 0,20 c-12,-8 -12,-12 0,-20" strokeWidth="2.8" />
                                                <path d="M-8,10 c-5,0 -8,5 -2,5" strokeWidth="1" opacity="0.6" />
                                                <path d="M-2,6 a3,3 0 1,0 0.1,0" fill={`url(#gold-grad-${idx})`} stroke="none" />
                                            </g>
                                        ))}

                                        {/* Detailed Top/Bottom Cresting - Relaxed */}
                                        {[...Array(10)].map((_, i) => (
                                            <g key={`t-royal-${i}`} transform={`translate(${i * 30 + 15}, -22)`}>
                                                <path d="M0,8 c5,-18 15,-18 20,0 c-8,-12 -12,-12 -20,0" strokeWidth="2.2" />
                                                <circle cx="10" cy="-2" r="1.5" fill="#fff" stroke="none" />
                                            </g>
                                        ))}
                                        {[...Array(10)].map((_, i) => (
                                            <g key={`b-royal-${i}`} transform={`translate(${i * 30 + 15}, 462)`}>
                                                <path d="M0,-8 c5,18 15,18 20,0 c-8,12 -12,12 -20,0" strokeWidth="2.2" />
                                                <circle cx="10" cy="2" r="1.5" fill="#fff" stroke="none" />
                                            </g>
                                        ))}

                                        {/* GRAND IMPERIAL CORNERS - Definitive Reference Match */}
                                        {[
                                            { t: "translate(-30, -30)", s: "1, 1" },
                                            { t: "translate(330, -30)", s: "-1, 1" },
                                            { t: "translate(-30, 470)", s: "1, -1" },
                                            { t: "translate(330, 470)", s: "-1, -1" }
                                        ].map((c, i) => (
                                            <g key={`hero-c-${i}`} transform={`${c.t} scale(${c.s})`}>
                                                <path d="M0,100 c0,-70 30,-100 100,-100" strokeWidth="12" strokeOpacity="0.3" />
                                                <path d="M0,100 c0,-70 30,-100 100,-100" strokeWidth="5" />
                                                <path d="M20,80 c0,-50 30,-80 80,-80" strokeWidth="2.5" opacity="0.6" />
                                                {/* Center Jewel */}
                                                <circle cx="45" cy="45" r="14" fill={`url(#gold-grad-${idx})`} stroke="#fff" strokeWidth="0.5" />
                                                <circle cx="45" cy="45" r="8" fill="#fff" opacity="0.3" />
                                                {/* Crosshair Accents */}
                                                <path d="M0,0 l40,40" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" />
                                                <path d="M10,0 l-10,0 l0,10" stroke="#fff" strokeWidth="3" fill="none" />
                                            </g>
                                        ))}
                                    </g>
                                </g>

                                {/* 3. SHARP GEOMETRIC INNER BORDER (Elite Focus) */}
                                <g>
                                    {/* Thick Underlying Gold Shadow */}
                                    <path
                                        d="M 50 12 L 250 12 L 288 50 L 288 390 L 255 428 L 204 428 L 188 405 L 112 405 L 96 428 L 45 428 L 12 395 L 12 50 Z"
                                        fill="none"
                                        stroke="#b45309"
                                        strokeWidth="8"
                                        opacity="0.4"
                                        style={{ filter: 'blur(10px)' }}
                                    />
                                    {/* Primary Sharp Gold Line */}
                                    <path
                                        d="M 50 12 L 250 12 L 288 50 L 288 390 L 255 428 L 204 428 L 188 405 L 112 405 L 96 428 L 45 428 L 12 395 L 12 50 Z"
                                        fill="none"
                                        stroke="url(#gold-grad-)"
                                        strokeWidth="3.2"
                                    />
                                    {/* Ultra Sharp White Highlight Edge */}
                                    <path
                                        d="M 50 12 L 250 12 L 288 50 L 288 390 L 255 428 L 204 428 L 188 405 L 112 405 L 96 428 L 45 428 L 12 395 L 12 50 Z"
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="0.8"
                                        opacity="0.6"
                                    />
                                </g>

                                {/* THIN DIAMOND EDGE (Laser Sharp Highlight) */}
                                <path
                                    d="M 50 0 L 250 0 L 300 50 L 300 390 L 260 440 L 205 440 L 190 415 L 110 415 L 95 440 L 40 440 L 0 400 L 0 50 Z"
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth="1.5"
                                    opacity="0.5"
                                    strokeDasharray="2 10"
                                />
                            </g>
                        )}
                    </svg>

                    {/* RADAR SWEEP SECTOR - Clipped Area */}
                    <div
                        className="absolute inset-[2px] overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity duration-700"
                        style={{ clipPath: complexClip }}
                    >
                        <div className="radar-sweep-line animate-radar-sweep" />
                    </div>

                    {/* INNER BORDER SVG - Dynamic based on theme */}
                    <svg className="absolute inset-[8px] w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 280 420">
                        <path
                            d={mission.type === 'Cultural'
                                ? "M 15 0 L 265 0 L 280 15 L 280 405 L 265 420 L 15 420 L 0 405 L 0 15 Z"
                                : "M 28 0 L 280 0 L 280 420 L 196 420 L 182 394.8 L 98 394.8 L 84 420 L 0 420 L 0 252 L 13 252 L 13 168 L 0 168 L 0 28 Z"
                            }
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={mission.type === 'Cultural' ? "1" : "2.5"}
                            className={theme.border.replace('60', '30')}
                            style={{ filter: `drop-shadow(0 0 12px ${theme.glow})` }}
                        />
                    </svg>

                    <div
                        className={`absolute inset-[10px] flex flex-col overflow-hidden transition-all duration-700 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] ${mission.type === 'Cultural' ? 'backdrop-blur-3xl border border-white/10' : 'bg-gradient-to-b from-emerald-900/20 via-black to-black'}`}
                        style={{
                            clipPath: complexClip,
                            background: mission.type === 'Cultural' ? 'linear-gradient(180deg, rgba(10,12,11,0.9) 0%, rgba(0,0,0,1) 100%)' : undefined
                        }}
                    >
                        {/* Blueprint Grid Texture Overlay - Enhanced for Transparency */}
                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />

                        {/* Internal HUD Tech Pulse - Premium Depth */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                            {/* Gradient Overlay for Premium Depth */}
                            <div
                                className="absolute inset-0"
                                style={{ background: `radial-gradient(circle at 50% 0%, ${theme.radarColor} 0%, transparent 70%)` }}
                            />

                            {/* Brighter Tech Pulse Hearth - Increased intensity */}
                            <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 blur-[100px] animate-tech-pulse opacity-40 group-hover:opacity-80 transition-opacity ${theme.pulse}`} />
                        </div>

                        {/* Scanning Shine Effect (Accelerated on hover) */}
                        <div className="scanning-shine group-hover:animate-[shine_2s_infinite] opacity-50" />

                        {/* Side Technical Decal - Responsive Hidden/Shown */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`absolute top-[35%] bottom-[35%] left-0 w-[16px] flex items-center justify-center ${theme.pulse} transition-colors z-20 border-r ${theme.borderHover.replace('border-', 'border-').replace('/50', '/20')} md:flex hidden`}
                        >
                            <span className={`[writing-mode:vertical-rl] rotate-180 text-[9px] font-black tracking-[0.4em] ${theme.text}/80 uppercase ${theme.textHover} transition-colors`}>
                                EVENT_NO_{idx + 1}
                            </span>
                        </motion.div>

                        {/* HUD Corner Decals */}
                        <div className="absolute top-4 right-4 flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                            <div className={`w-1 h-1 ${theme.bg}`} />
                            <div className={`w-4 h-1 ${theme.bg}`} />
                        </div>

                        <div className="pt-8 px-5 text-center z-20 relative">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className={`text-[9px] font-black ${theme.text} tracking-[0.2em] transition-colors uppercase`}>EVENT_ID__{mission.id}</div>
                                <div className={`text-[9px] font-black text-white/50 tracking-[0.1em] px-2 py-0.5 border border-white/10 rounded-full uppercase ${theme.borderHover.replace('border-', 'group-hover:border-')} transition-all`}>
                                    {mission.type}
                                </div>
                            </div>
                            <h3 className={`${mission.type === 'Cultural' ? 'text-[17px] md:text-[18px] italic' : 'text-[15px] md:text-[16px]'} font-black uppercase text-white tracking-[0.02em] break-words transition-all leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,1)] mb-1 min-h-[3rem] flex items-center justify-center`}>
                                {mission.title}
                            </h3>
                        </div>

                        <div
                            className={`relative overflow-hidden bg-black/40 border transition-all duration-700 z-10 shadow-2xl ${mission.type === 'Cultural' ? 'mx-6 mt-0 mb-4 h-32 border-amber-500/30' : 'h-48 mx-5 mt-2 mb-2 border-white/10 group-hover:border-emerald-500/50'}`}
                            style={{ clipPath: mission.type === 'Cultural' ? 'polygon(0 28%, 50% 0, 100% 28%, 100% 100%, 0 100%)' : 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                        >
                            <img
                                src={mission.visual}
                                alt={mission.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1)"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent " />

                            {/* Scanline Effect */}
                            <div
                                className={`absolute inset-0 bg-[size:100%_4px] pointer-events-none opacity-10`}
                                style={{ backgroundImage: `linear-gradient(transparent 50%, ${mission.type === 'Cultural' ? '#f59e0b' : '#10b981'} 50%)` }}
                            />

                            {/* Targeting Crosshair - On Hover (Technical Only) */}
                            {mission.type !== 'Cultural' && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-emerald-500/30 rounded-full animate-ping" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
                                    <div className="absolute top-4 left-4 text-[9px] font-mono text-emerald-500/80 uppercase tracking-widest bg-black/50 px-2 py-1 rounded">PREVIEW_ACTIVE</div>
                                </div>
                            )}

                            <div className={`absolute inset-x-0 top-0 h-[1px] transition-all ${mission.type === 'Cultural' ? 'bg-amber-500/20' : 'bg-emerald-500/20 group-hover:h-[2px]'}`} />
                        </div>

                        {/* Data Readouts Block - Professional Grid for Technical */}
                        <div className={`px-6 z-10 w-full mt-auto mb-4 ${mission.type === 'Technical' ? 'grid grid-cols-3 gap-2 border-y border-white/5 py-3 bg-white/[0.02]' : 'flex justify-between items-center'}`}>

                            {/* DATE */}
                            <div className={`flex flex-col gap-0.5 ${mission.type === 'Technical' ? 'items-start border-r border-white/5 pr-2' : 'items-start'}`}>
                                <span className={`text-[7px] font-black ${mission.type === 'Cultural' ? 'text-amber-500/80' : 'text-emerald-500/60'} uppercase tracking-widest`}>
                                    {mission.type === 'Cultural' ? 'DATE.' : 'DATE'}
                                </span>
                                <span className={`text-[10px] ${mission.type === 'Cultural' ? 'italic text-white' : 'text-white/90 font-mono'} font-bold`}>
                                    {mission.date}
                                </span>
                            </div>

                            {/* TEAM */}
                            <div className={`flex flex-col gap-0.5 ${mission.type === 'Technical' ? 'items-center border-r border-white/5 px-2' : 'items-center'}`}>
                                <span className={`text-[7px] font-black ${mission.type === 'Cultural' ? 'text-amber-500/80' : 'text-emerald-500/60'} uppercase tracking-widest`}>
                                    {mission.type === 'Cultural' ? 'TYPE.' : 'FORMAT'}
                                </span>
                                <span className={`text-[10px] font-bold text-white/90 uppercase ${mission.type === 'Cultural' ? 'italic' : 'font-mono whitespace-nowrap'}`}>
                                    {(() => {
                                        const original = mission.rules.find(r => r.includes('Team') || r.includes('Solo') || r.includes('Squad'))?.split(' ')[0] || 'OPEN';
                                        // Fix for long text overflow in Technical cards
                                        if (mission.type === 'Technical' && original.length > 8) return 'VARIOUS';
                                        return original;
                                    })()}
                                </span>
                            </div>

                            {/* PRIZES */}
                            <div className={`flex flex-col ${mission.type === 'Technical' ? 'items-end pl-2' : 'items-end gap-0.5'}`}>
                                <span className={`text-[7px] font-black ${mission.type === 'Cultural' ? 'text-amber-500/80' : 'text-emerald-500/60'} uppercase tracking-widest`}>
                                    {mission.type === 'Cultural' ? 'POOL.' : 'WINNINGS'}
                                </span>
                                <span className={`font-bold text-white drop-shadow-sm ${mission.type === 'Cultural' ? 'text-[14px] italic' : 'text-[11px] font-mono text-emerald-400'}`}>
                                    {mission.prizePool}
                                </span>
                            </div>
                        </div>

                        {/* Description Block - Tightened */}
                        <div className="px-6 pb-2 text-center z-20">
                            <p className={`text-[9px] ${mission.type === 'Cultural' ? 'text-white/90 italic' : 'text-white/60'} font-medium font-mono uppercase tracking-tight line-clamp-2 leading-relaxed group-hover:text-white transition-colors`}>
                                "{mission.description}"
                            </p>
                        </div>

                        {/* Spec Tags Block - Symmetrical & Tightened */}
                        <div className={`px-10 pb-2 flex flex-wrap justify-center gap-1.5 ${mission.type === 'Cultural' ? 'opacity-40' : 'opacity-10'} group-hover:opacity-100 transition-opacity`}>
                            {mission.specs.map(spec => (
                                <span key={spec} className={`text-[6.5px] font-black ${theme.text}/100 tracking-widest px-1.5 py-0.5 bg-${theme.primary}/5 border ${theme.borderHover.replace('border-', 'border-').replace('/50', '/20')} uppercase rounded-[2px]`}>
                                    {spec}
                                </span>
                            ))}
                        </div>

                        {/* Footer Buttons - Professional Lifted Positioning */}
                        <div className={`px-6 pb-8 mb-2 z-20 w-full`}>
                            <div className="flex gap-2 w-full items-stretch">
                                {mission.type === 'Technical' || mission.type === 'Cultural' ? (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart({
                                                    id: mission.id,
                                                    title: mission.title,
                                                    type: mission.type,
                                                    price: mission.fee,
                                                    image: mission.visual
                                                });
                                            }}
                                            className={`flex-[2] py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group/btn border ${mission.type === 'Cultural' ? 'border-amber-500' : 'border-emerald-500'} ${cart.find((c: any) => c.id === mission.id)
                                                ? `${mission.type === 'Cultural' ? 'bg-amber-700' : 'bg-emerald-700'} text-white`
                                                : `${mission.type === 'Cultural' ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-black`
                                                }`}
                                            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)' }}
                                        >
                                            {cart.find((c: any) => c.id === mission.id) ? 'ADDED' : 'ADD TO CART'}
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/events/${mission.id}`);
                                            }}
                                            className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest border ${mission.type === 'Cultural' ? 'border-amber-500/40 hover:border-amber-500 text-amber-500 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' : 'border-emerald-500/40 hover:border-emerald-500 text-emerald-500 hover:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'} transition-all`}
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                                        >
                                            DETAILS
                                        </button>

                                        <div
                                            className="flex-[0.8] py-2.5 flex items-center justify-center bg-black/60 border border-white/10"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                                        >
                                            <span className="text-[12px] font-bold text-white">₹{mission.fee}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Fallback for Gaming/Other Types (Original Design) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart({
                                                    id: mission.id,
                                                    title: mission.title,
                                                    type: mission.type,
                                                    price: mission.fee,
                                                    image: mission.visual
                                                });
                                            }}
                                            className={`flex-[3] py-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 relative overflow-hidden group/btn ${cart.find((c: any) => c.id === mission.id)
                                                ? `${theme.bg} text-black ${theme.shadow}`
                                                : `bg-white/5 backdrop-blur-xl border border-${theme.primary}/40 ${theme.text} hover:bg-${theme.primary} hover:text-white shadow-lg`
                                                }`}
                                            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)' }}
                                        >
                                            {cart.find((c: any) => c.id === mission.id) ? 'REGISTERED' : 'REGISTER'}
                                        </button>

                                        <div
                                            className={`flex-1 py-3 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 group-hover:border-${theme.primary}/50 transition-colors shadow-xl`}
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                                        >
                                            <span className="text-[13px] font-black text-white tracking-tighter">₹{mission.fee}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Professional Bottom Data Rail (Stable) */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 items-center opacity-30 transition-all duration-500 group-hover:opacity-60">
                            <div className={`w-[3px] h-[3px] ${theme.bg}/80 rotate-45`} />
                            <div className={`w-12 h-[1px] ${theme.bg}`} />
                            <div className={`w-[3px] h-[3px] ${theme.bg}/80 rotate-45`} />
                        </div>
                    </div>
                </div>
            </Tilt>
        </div>
    )
}
