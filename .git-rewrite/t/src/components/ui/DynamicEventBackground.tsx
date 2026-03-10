'use client'

import React from 'react'
import { motion } from 'framer-motion'

const DynamicEventBackground = ({ theme = 'emerald' }: { theme?: 'emerald' | 'amber' | 'gaming' | 'all' }) => {
    const [isMobile, setIsMobile] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [particles, setParticles] = React.useState<any[]>([])

    React.useEffect(() => {
        setMounted(true)
        const checkMobile = () => window.innerWidth < 768
        const mobile = checkMobile()
        setIsMobile(mobile)

        // Generate particles only on the client to avoid hydration mismatch
        const count = mobile ? 8 : (theme === 'all' ? 20 : 15)
        const newParticles = [...Array(count)].map((_, i) => ({
            id: i,
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            duration: 5 + Math.random() * 5,
            delay: i * 0.2
        }))
        setParticles(newParticles)

        const handleResize = () => setIsMobile(checkMobile())
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [theme])

    const themes = {
        emerald: {
            primary: '#10b981',
            secondary: '#0ea5e9',
            gradient: 'from-emerald-900/20 via-cyan-900/15 to-slate-900',
            gridColor: 'rgba(16, 185, 129, 0.08)',
            scanColor: 'rgba(16, 185, 129, 0.3)',
            particles: 'emerald'
        },
        amber: {
            primary: '#f59e0b',
            secondary: '#fbbf24',
            gradient: 'from-amber-900/10 via-orange-900/5 to-black',
            gridColor: 'rgba(245, 158, 11, 0.1)',
            scanColor: 'rgba(245, 158, 11, 0.4)',
            particles: 'amber'
        },
        gaming: {
            primary: '#8b5cf6',
            secondary: '#ec4899',
            gradient: 'from-purple-900/20 via-pink-900/10 to-black',
            gridColor: 'rgba(139, 92, 246, 0.12)',
            scanColor: 'rgba(236, 72, 153, 0.4)',
            particles: 'purple'
        },
        all: {
            primary: '#10b981',
            secondary: '#0ea5e9',
            gradient: 'from-emerald-900/20 via-slate-900 to-black',
            gridColor: 'rgba(255, 255, 255, 0.05)',
            scanColor: 'rgba(255, 255, 255, 0.1)',
            particles: 'mixed'
        }
    }

    const normalizedTheme = ((theme as any) === 'cyan' || (theme as any) === 'indigo' || (theme as any) === 'technical') ? 'emerald' : theme
    const current = themes[normalizedTheme as keyof typeof themes] || themes.all
    const isAmber = normalizedTheme === 'amber'
    const isGaming = normalizedTheme === 'gaming'

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${current.gradient}`} />

            <div
                className="absolute inset-0 opacity-[0.15] md:opacity-30"
                style={{
                    backgroundImage: `
                        linear-gradient(${current.gridColor} 1px, transparent 1px),
                        linear-gradient(90deg, ${current.gridColor} 1px, transparent 1px)
                    `,
                    backgroundSize: isMobile ? '40px 40px' : '30px 30px',
                    backgroundPosition: 'center center',
                    animation: isMobile ? 'none' : 'gridScroll 60s linear infinite'
                }}
            />

            {!isMobile && (
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(${current.gridColor} 1.5px, transparent 1.5px),
                            linear-gradient(90deg, ${current.gridColor} 1.5px, transparent 1.5px)
                        `,
                        backgroundSize: '150px 150px',
                        backgroundPosition: 'center center',
                        animation: 'gridScroll 60s linear infinite'
                    }}
                />
            )}

            {!isMobile && (
                <div className="absolute inset-0">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-[1px] w-full opacity-40"
                            style={{
                                background: `linear-gradient(90deg, transparent, ${current.scanColor}, transparent)`,
                                top: `${20 + i * 30}%`,
                                animation: `scanLine ${4 + i}s linear infinite`,
                                animationDelay: `${i * 1.5}s`
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="absolute inset-0">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className={`absolute rounded-full ${isAmber ? 'bg-amber-400/30' :
                            isGaming ? 'bg-purple-400/30' :
                                'bg-emerald-400/30'
                            }`}
                        style={{
                            width: p.width,
                            height: p.height,
                            left: p.left,
                            top: p.top
                        }}
                        animate={isMobile ? {
                            opacity: [0.1, 0.3, 0.1]
                        } : {
                            y: [0, -30, 0],
                            x: [0, Math.sin(p.id) * 10, 0],
                            opacity: [0.1, 0.5, 0.1]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay
                        }}
                    />
                ))}
            </div>

            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-current/5 md:from-current/10 to-transparent" style={{ color: current.primary }} />
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-current/5 md:from-current/10 to-transparent" style={{ color: current.primary }} />

            <motion.div
                className={`absolute left-1/4 top-1/3 rounded-full ${isAmber ? 'bg-amber-500/5' :
                    isGaming ? 'bg-purple-500/5' :
                        'bg-emerald-500/5'
                    }`}
                animate={!mounted || isMobile ? { opacity: [0.1, 0.2, 0.1] } : {
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ width: isMobile ? '200px' : '300px', height: isMobile ? '200px' : '300px' }}
            />

            {normalizedTheme === 'amber' && (
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0C60 20 80 30 100 50C80 70 60 80 50 100C40 80 20 70 0 50C20 30 40 20 50 0Z' fill='none' stroke='%23f59e0b' stroke-width='0.3'/%3E%3C/svg%3E")`,
                            backgroundSize: '80px 80px'
                        }}
                    />
                </div>
            )}

            {normalizedTheme === 'gaming' && (
                <div className="absolute inset-0 opacity-15">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50H30M70 50H100M50 0V30M50 70V100M30 30L70 70M70 30L30 70' fill='none' stroke='%238b5cf6' stroke-width='0.8'/%3E%3C/svg%3E")`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default DynamicEventBackground
