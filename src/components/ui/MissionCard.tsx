'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, UserPlus } from 'lucide-react'

export interface Event {
    id: string
    title: string
    type: 'Technical' | 'Cultural' | 'Gaming'
    category?: string
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
    tags: string[]
    videoUrl?: string
    brochureUrl?: string
    minTeamSize: number
    maxTeamSize: number
    teamFormate?: string
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

interface EventCardProps {
    event: Event
    idx: number
    theme: ThemeConfig
    complexClip: string
    isRegistered?: boolean
    isLoggedIn?: boolean
    onRegister: (event: Event) => void
    className?: string
    priority?: boolean
}

import EventCard from '../gaming/EventCard'

export const MissionCard = memo(({
    event,
    idx,
    theme,
    complexClip,
    isRegistered,
    isLoggedIn = false,
    onRegister,
    className = "",
    priority = false
}: EventCardProps) => {
    const router = useRouter()
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    if (event.type === 'Gaming') {
        const content = (
            <EventCard
                gameName={event.category || 'GAMING'}
                eventTitle={event.title}
                date={event.date}
                prizePool={event.prizePool}
                slots="64 TEAMS"
                image={event.visual}
                theme={event.title.toLowerCase().includes('valorant') ? 'valorant' : 'bgmi'}
                onRegister={() => onRegister(event)}
                onDetail={() => router.push(`/events/${event.id}`)}
            />
        )

        return (
            <div className={`event-card-reveal will-change-transform will-change-opacity translate-z-0 ${className}`}>
                {isMobile ? (
                    <div className="w-full h-[520px] gpu-accel">{content}</div>
                ) : (
                    <Tilt
                        tiltMaxAngleX={10}
                        tiltMaxAngleY={10}
                        scale={1.04}
                        perspective={2000}
                        transitionSpeed={2000}
                        className="w-full group h-[520px] gpu-accel"
                    >
                        {content}
                    </Tilt>
                )}
            </div>
        )
    }

    const cardContent = (
        <div className="w-full h-full relative cursor-pointer" onClick={() => router.push(`/events/${event.id}`)}>
            {/* GLOW BACKDROP */}
            <div
                className={`absolute inset-[-20px] transition-all duration-500 opacity-30 group-hover:opacity-100 ${isMobile ? 'blur-[15px]' : 'blur-[40px]'}`}
                style={{
                    background: `${theme.radarColor}`,
                    boxShadow: isMobile ? 'none' : `0 0 100px ${theme.glow}`
                }}
            />

            {/* GEOMETRIC BORDER SYSTEM */}
            <svg
                className={`absolute ${event.type === 'Cultural' ? (isMobile ? 'inset-[-20px] w-[calc(100%+40px)] h-[calc(100%+40px)]' : 'inset-[-45px] w-[calc(100%+90px)] h-[calc(100%+90px)]') : 'inset-0 w-full h-full'} pointer-events-none z-10 overflow-visible`}
                preserveAspectRatio="none"
                viewBox={event.type === 'Cultural' ? (isMobile ? "-20 -20 340 500" : "-45 -45 390 530") : "0 0 300 440"}
            >
                <defs>
                    <filter id={`glow-${event.type}-${idx}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
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

                <path
                    d={event.type === 'Cultural'
                        ? "M 50 0 L 250 0 L 300 50 L 300 390 L 260 440 L 205 440 L 190 415 L 110 415 L 95 440 L 40 440 L 0 400 L 0 50 Z"
                        : "M 30 0 L 300 0 L 300 440 L 210 440 L 195 414 L 105 414 L 90 440 L 0 440 L 0 264 L 14 264 L 14 176 L 0 176 L 0 30 Z"}
                    fill="none"
                    stroke={event.type === 'Cultural' ? "#fbbf24" : "currentColor"}
                    strokeWidth={event.type === 'Cultural' ? "2" : "6"}
                    className={event.type === 'Cultural' ? "opacity-40" : theme.border}
                    style={{ filter: event.type === 'Cultural' ? 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.6))' : `url(#glow-${event.type}-${idx}) drop-shadow(0 0 10px ${theme.glow})` }}
                />

                {event.type === 'Cultural' && (
                    <g>
                        <path
                            d="M 50 0 L 250 0 L 300 50 L 300 390 L 260 440 L 205 440 L 190 415 L 110 415 L 95 440 L 40 440 L 0 400 L 0 50 Z"
                            fill="none"
                            stroke="rgba(245, 158, 11, 0.4)"
                            strokeWidth={isMobile ? "4" : "45"}
                            style={{ filter: isMobile ? 'none' : 'blur(45px)' }}
                        />
                        <g style={{ filter: isMobile ? 'none' : 'drop-shadow(0 12px 25px rgba(0,0,0,0.9))' }}>
                            <g stroke="#5c2d0b" strokeWidth="4" fill="none" transform="translate(2, 2)" opacity={isMobile ? "0.2" : "0.5"}>
                                {[...Array(14)].map((_, i) => (<path key={`sh-l-${i}`} d={`M-18,${25 + i * 28} q-15,14 0,28`} />))}
                                {[...Array(14)].map((_, i) => (<path key={`sh-r-${i}`} d={`M318,${25 + i * 28} q15,14 0,28`} />))}
                            </g>
                            <g stroke={`url(#gold-grad-${idx})`} strokeWidth="3.5" fill="none" strokeLinecap="round">
                                {!isMobile && [...Array(15)].map((_, i) => (
                                    <g key={`l-royal-${i}`} transform={`translate(-22, ${i * 28 + 25})`}>
                                        <path d="M0,0 c-18,5 -18,15 0,20 c-12,-8 -12,-12 0,-20" strokeWidth="2.8" />
                                        <path d="M-8,10 c-5,0 -8,5 -2,5" strokeWidth="1" opacity="0.6" />
                                        <path d="M-2,6 a3,3 0 1,0 0.1,0" fill={`url(#gold-grad-${idx})`} stroke="none" />
                                    </g>
                                ))}
                                {!isMobile && [...Array(15)].map((_, i) => (
                                    <g key={`r-royal-${i}`} transform={`translate(322, ${i * 28 + 25}) scale(-1, 1)`}>
                                        <path d="M0,0 c-18,5 -18,15 0,20 c-12,-8 -12,-12 0,-20" strokeWidth="2.8" />
                                        <path d="M-8,10 c-5,0 -8,5 -2,5" strokeWidth="1" opacity="0.6" />
                                        <path d="M-2,6 a3,3 0 1,0 0.1,0" fill={`url(#gold-grad-${idx})`} stroke="none" />
                                    </g>
                                ))}
                                {[...Array(isMobile ? 5 : 10)].map((_, i) => (
                                    <g key={`t-royal-${i}`} transform={`translate(${i * (isMobile ? 60 : 30) + 15}, -22)`}>
                                        <path d="M0,8 c5,-18 15,-18 20,0 c-8,-12 -12,-12 -20,0" strokeWidth="2.2" />
                                        <circle cx="10" cy="-2" r="1.5" fill="#fff" stroke="none" />
                                    </g>
                                ))}
                                {[...Array(isMobile ? 5 : 10)].map((_, i) => (
                                    <g key={`b-royal-${i}`} transform={`translate(${i * (isMobile ? 60 : 30) + 15}, 462)`}>
                                        <path d="M0,-8 c5,18 15,18 20,0 c-8,12 -12,12 -20,0" strokeWidth="2.2" />
                                        <circle cx="10" cy="2" r="1.5" fill="#fff" stroke="none" />
                                    </g>
                                ))}
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
                                        <circle cx="45" cy="45" r="14" fill={`url(#gold-grad-${idx})`} stroke="#fff" strokeWidth="0.5" />
                                        <circle cx="45" cy="45" r="8" fill="#fff" opacity="0.3" />
                                        <path d="M0,0 l40,40" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" />
                                        <path d="M10,0 l-10,0 l0,10" stroke="#fff" strokeWidth="3" fill="none" />
                                    </g>
                                ))}
                            </g>
                        </g>
                        <g>
                            <path
                                d="M 50 12 L 250 12 L 288 50 L 288 390 L 255 428 L 204 428 L 188 405 L 112 405 L 96 428 L 45 428 L 12 395 L 12 50 Z"
                                fill="none"
                                stroke="#b45309"
                                strokeWidth="8"
                                opacity="0.4"
                                style={{ filter: isMobile ? 'none' : 'blur(10px)' }}
                            />
                            <path
                                d="M 50 12 L 250 12 L 288 50 L 288 390 L 255 428 L 204 428 L 188 405 L 112 405 L 96 428 L 45 428 L 12 395 L 12 50 Z"
                                fill="none"
                                stroke={`url(#gold-grad-${idx})`}
                                strokeWidth="3.2"
                            />
                        </g>
                    </g>
                )}
            </svg>

            {/* INTERACTIVE OVERLAY */}
            <div className="absolute inset-[2px] overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity duration-700" style={{ clipPath: complexClip }}>
                <div className="radar-sweep-line animate-radar-sweep absolute h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* INNER BORDER */}
            <svg className="absolute inset-[8px] w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 280 420">
                <path
                    d={event.type === 'Cultural' ? "M 15 0 L 265 0 L 280 15 L 280 405 L 265 420 L 15 420 L 0 405 L 0 15 Z" : "M 28 0 L 280 0 L 280 420 L 196 420 L 182 394.8 L 98 394.8 L 84 420 L 0 420 L 0 252 L 13 252 L 13 168 L 0 168 L 0 28 Z"}
                    fill="none" stroke="currentColor" strokeWidth={event.type === 'Cultural' ? "1.5" : "3"}
                    className={theme.border.replace('60', '50')}
                    style={{ filter: isMobile ? `drop-shadow(0 0 5px ${theme.glow})` : `drop-shadow(0 0 20px ${theme.glow})` }}
                />
            </svg>

            <div
                className={`absolute inset-[10px] flex flex-col overflow-hidden transition-all duration-700 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] ${event.type === 'Cultural' ? (isMobile ? '' : 'backdrop-blur-3xl border border-white/10') : 'bg-gradient-to-b from-emerald-900/20 via-black to-black'}`}
                style={{
                    clipPath: complexClip,
                    background: event.type === 'Cultural' ? 'linear-gradient(180deg, rgba(10,12,11,0.9) 0%, rgba(0,0,0,1) 100%)' : undefined
                }}
            >
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 blur-[100px] animate-tech-pulse opacity-40 group-hover:opacity-80 transition-opacity" style={{ background: theme.pulse.includes('bg-') ? undefined : theme.glow, backgroundColor: theme.pulse.includes('bg-') ? theme.pulse.split(' ')[0].replace('bg-', '') : undefined }} />
                </div>
                <div className="scanning-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full" />

                <div className="pt-8 px-5 text-center z-20 relative">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className={`text-[9px] font-bold ${theme.text} tracking-[0.2em] transition-colors uppercase`}>EVENT ID: {event.id}</div>
                        <div className={`text-[9px] font-black text-white/50 tracking-[0.1em] px-2 py-0.5 border border-white/10 rounded-full uppercase transition-all`}>{event.type}</div>
                    </div>
                    <h3 className={`${event.type === 'Cultural' ? 'text-[17px] md:text-[18px] italic' : 'text-[15px] md:text-[16px]'} font-bold uppercase text-white tracking-[0.02em] break-words transition-all leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,1)] mb-1 min-h-[3rem] flex items-center justify-center`}>{event.title}</h3>
                </div>

                <div className={`relative overflow-hidden bg-black/40 border transition-all duration-700 z-10 shadow-2xl ${event.type === 'Cultural' ? 'mx-6 mt-0 mb-4 h-32 border-amber-500/30' : 'h-48 mx-5 mt-2 mb-2 border-white/10 group-hover:border-emerald-500/50'}`} style={{ clipPath: event.type === 'Cultural' ? 'polygon(0 28%, 50% 0, 100% 28%, 100% 100%, 0 100%)' : 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                    <Image src={event.visual} alt={event.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" priority={priority} className="object-cover opacity-100 group-hover:scale-110 transition-all duration-[1200ms]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent " />
                </div>

                <div className={`px-6 z-10 w-full mt-auto mb-4 ${event.type === 'Technical' ? 'grid grid-cols-3 gap-2 border-y border-white/5 py-3 bg-white/[0.02]' : 'flex justify-between items-center'}`}>
                    <div className="flex flex-col gap-0.5"><span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">DATE</span><span className="text-[12px] font-extrabold text-white tracking-wide">{event.date}</span></div>
                    <div className="flex flex-col gap-0.5 items-center">
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">
                            GROUP
                        </span>

                        <span className="text-[11px] font-extrabold text-white uppercase truncate w-full text-center tracking-tight">
                            {event.teamFormate}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5"><span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">PRIZE</span><span className="text-[13px] text-white font-black italic tracking-tighter">{event.prizePool}</span></div>
                </div>

                <div className={`px-8 pb-8 z-20 w-full mt-auto`}>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button onClick={(e) => { e.stopPropagation(); onRegister(event); }} className={`relative py-4 md:py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 overflow-hidden group/btn border-2 ${event.type === 'Cultural' ? 'border-amber-500 bg-amber-500 text-black' : 'border-emerald-500 bg-emerald-500 text-black'} shadow-[0_0_20px_rgba(0,0,0,0.4)] active:scale-95 flex items-center justify-center gap-2 touch-manipulation min-h-[48px]`} style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)' }}>
                            <UserPlus className="w-4 h-4" /> {isLoggedIn ? 'REGISTER' : 'LOGIN'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.id}`); }} className={`relative py-4 md:py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 overflow-hidden group/btn border-2 ${event.type === 'Cultural' ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-500'} bg-black/40 active:scale-95 flex items-center justify-center gap-2 touch-manipulation min-h-[48px]`} style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)' }}>
                            DETAILS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className={`event-card-reveal will-change-transform will-change-opacity translate-z-0 ${className}`}>
            {isMobile ? (
                <div className={`w-full group ${event.type === 'Cultural' ? 'h-[460px]' : (event.type === 'Technical' ? 'h-[400px]' : 'h-[400px]')} gpu-accel transition-transform active:scale-[0.98]`}>
                    {cardContent}
                </div>
            ) : (
                <Tilt
                    tiltMaxAngleX={10}
                    tiltMaxAngleY={10}
                    scale={1.04}
                    perspective={2000}
                    transitionSpeed={2000}
                    className={`w-full group ${event.type === 'Cultural' ? 'h-[500px]' : 'h-[440px]'} gpu-accel transition-transform active:scale-[0.98]`}
                >
                    {cardContent}
                </Tilt>
            )}
        </div>
    )
})

MissionCard.displayName = 'MissionCard'
