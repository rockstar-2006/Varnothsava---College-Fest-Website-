'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, Zap, Trophy, Camera, User, ShoppingCart, Rocket, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Magnetic } from '@/components/ui/Magnetic'
import { cn } from '@/lib/utils'

const MotorcycleIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        <path d="M12 18h5.5v-5a3.5 3.5 0 0 0-3.5-3.5h-1l-2-3-3-2" />
        <path d="M9 18H5.5" />
        <path d="M13 11l2-5h3" />
    </svg>
)

const NAV_LINKS = [
    { name: 'HOME', href: '/', icon: LayoutGrid },
    { name: 'EVENTS', href: '/events', icon: Zap },
    { name: 'RIDERS', href: '/leaderboard', icon: MotorcycleIcon },
    { name: 'GALLERY', href: '/gallery', icon: Camera },
]

export function InnovativeNavbar() {
    const pathname = usePathname()
    const { isLoggedIn, cart, pageTheme } = useApp()

    const [isMobile, setIsMobile] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768 || 'ontouchstart' in window);
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Dynamic Theme Logic - Use Context
    const themeRgb = pageTheme.rgb

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        '--theme-rgb': themeRgb
                    } as any}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="fixed z-[5000] bottom-0 left-0 right-0 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-8 px-4 md:px-8 pointer-events-none translate-gpu"
                >
                    {/* THE CYBER-DOCK [OBSIDIAN NEON] */}
                    <motion.div
                        className="relative w-full max-w-[700px] h-[70px] md:h-[80px] flex items-center pointer-events-auto group/nav"
                        style={{ translateZ: 0 }}
                    >
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-[6000] pointer-events-none">
                            <div className={cn("absolute left-1/2 -translate-x-1/2", isMobile ? "-top-14" : "-top-20")}>
                                <Link href="/events" className="pointer-events-auto cursor-pointer" prefetch={true}>
                                    <div className={cn("relative", isMobile ? "w-[70px] h-[70px]" : "w-[92px] h-[92px]")}>
                                        {/* Ambient Energy Ripples */}
                                        <div className="absolute inset-0 bg-[rgba(var(--theme-rgb),0.2)] rounded-full blur-xl pointer-events-none animate-pulse" />

                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-[70px] h-[70px] md:w-[92px] md:h-[92px] bg-gradient-to-br from-[rgb(var(--theme-rgb))] to-black rounded-full border-[6px] md:border-[8px] border-[#0a120a] shadow-[0_20px_50px_rgba(var(--theme-rgb),0.5)] flex items-center justify-center group relative overflow-hidden"
                                        >
                                            <Zap size={isMobile ? 28 : 36} className="text-black group-hover:scale-125 transition-transform" />
                                        </motion.div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="absolute inset-0 -z-10 overflow-visible">
                            <svg width="100%" height="80" viewBox="0 0 700 80" preserveAspectRatio="none" fill="none" className="absolute inset-0 z-0 drop-shadow-[0_-10px_40px_rgba(0,0,0,0.5)] translate-gpu">
                                <path
                                    d="M0 40C0 17.9086 17.9086 0 40 0H270C285 0 290 5 300 18C315 35 385 35 400 18C410 5 415 0 430 0H660C682.091 0 700 17.9086 700 40V80H0V40Z"
                                    fill="rgba(5, 8, 5, 0.95)"
                                />
                                <path
                                    d="M1 40C1 18.5 18.5 1 40 1H270C285 1 290 6 300 19C315 36 385 36 400 19C410 6 415 1 430 1H660C681 1 699 18.5 699 40"
                                    stroke="rgba(var(--theme-rgb), 0.5)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    className="translate-gpu"
                                />
                            </svg>
                            <div className={cn("absolute inset-0 bg-white/[0.02] rounded-[2.5rem] -z-20 pointer-events-none translate-gpu", isMobile ? "backdrop-blur-md" : "backdrop-blur-3xl")} style={{ clipPath: 'polygon(0% 20%, 100% 20%, 100% 100%, 0% 100%)' }} />
                        </div>

                        <div className="flex-1 flex justify-around items-center px-1 xs:px-2 md:px-4 h-full">
                            <Link href="/" onTouchStart={(e) => e.currentTarget.click()} prefetch={true} className="group h-full flex flex-col items-center justify-center gap-1 flex-1 min-w-0 md:min-w-[80px] cursor-pointer touch-manipulation pointer-events-auto">
                                <div className={cn("relative p-2.5 xs:p-3.5 rounded-2xl transition-all duration-300", pathname === '/' ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                    <LayoutGrid size={isMobile ? 22 : 24} />
                                </div>
                                <span className={cn("text-[8px] xs:text-[9px] md:text-[11px] tracking-[0.1em] xs:tracking-[0.2em] font-bold uppercase transition-all duration-300", pathname === '/' ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--theme-rgb),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>HOME</span>
                            </Link>
                            <Link href="/leaderboard" onTouchStart={(e) => e.currentTarget.click()} prefetch={true} className="group h-full flex flex-col items-center justify-center gap-1 flex-1 min-w-0 md:min-w-[80px] cursor-pointer touch-manipulation pointer-events-auto">
                                <div className={cn("relative p-2.5 xs:p-3.5 rounded-2xl transition-all duration-300", pathname === '/leaderboard' ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                    <MotorcycleIcon size={isMobile ? 22 : 24} />
                                </div>
                                <span className={cn("text-[8px] xs:text-[9px] md:text-[11px] tracking-[0.1em] xs:tracking-[0.2em] font-bold uppercase transition-all duration-300", pathname === '/leaderboard' ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--theme-rgb),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>RIDERS</span>
                            </Link>
                        </div>

                        {/* Central Spacer for action button */}
                        <div className="w-16 xs:w-20 md:w-32 flex-shrink-0 h-full" />

                        <div className="flex-1 flex justify-around items-center px-1 xs:px-2 md:px-4 h-full">
                            <Link href="/gallery" onTouchStart={(e) => e.currentTarget.click()} prefetch={true} className="group h-full flex flex-col items-center justify-center gap-1 flex-1 min-w-0 md:min-w-[80px] cursor-pointer touch-manipulation pointer-events-auto">
                                <div className={cn("relative p-2.5 xs:p-3.5 rounded-2xl transition-all duration-300", pathname === '/gallery' ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                    <Camera size={isMobile ? 22 : 24} />
                                </div>
                                <span className={cn("text-[8px] xs:text-[9px] md:text-[11px] tracking-[0.1em] xs:tracking-[0.2em] font-bold uppercase transition-all duration-300", pathname === '/gallery' ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--theme-rgb),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>GALLERY</span>
                            </Link>
                            <Link href={isLoggedIn ? "/profile" : "/login"} onTouchStart={(e) => e.currentTarget.click()} prefetch={true} className="group h-full flex flex-col items-center justify-center gap-1 flex-1 min-w-0 md:min-w-[80px] cursor-pointer touch-manipulation pointer-events-auto">
                                <div className={cn("relative p-2.5 xs:p-3.5 rounded-2xl transition-all duration-300", (pathname === '/profile' || pathname === '/login') ? "theme-nav-bg theme-nav-accent theme-nav-glow" : "text-white/80 group-hover:theme-nav-accent md:group-hover:bg-white/10")}>
                                    <User size={isMobile ? 22 : 24} />
                                </div>
                                <span className={cn("text-[8px] xs:text-[9px] md:text-[11px] tracking-[0.1em] xs:tracking-[0.2em] font-bold uppercase transition-all duration-300", (pathname === '/profile' || pathname === '/login') ? "theme-nav-accent drop-shadow-[0_0_8px_rgba(var(--theme-rgb),0.8)] scale-110" : "text-white/95 md:group-hover:theme-nav-accent")}>{isLoggedIn ? 'PROFILE' : 'LOGIN'}</span>
                            </Link>
                        </div>

                        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-[rgba(var(--theme-rgb),0.4)] rounded-tl-[2.5rem] shadow-[-5px_-5px_15px_rgba(var(--theme-rgb),0.1)]" />
                        <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-[rgba(var(--theme-rgb),0.4)] rounded-tr-[2.5rem] shadow-[5px_-5px_15px_rgba(var(--theme-rgb),0.1)]" />

                        {/* Cart Button - Responsive Position: Stacked on Mobile, Side on Desktop */}
                        <div className="absolute right-0 bottom-[90px] md:bottom-0 md:right-[-100px] flex flex-col items-center gap-4 pointer-events-auto z-40">
                            <Link href="/checkout" className="block relative group" aria-label="View Cart" prefetch={true}>
                                <motion.div whileHover={{ scale: 1.1, x: 10 }} className="p-4 md:p-5 bg-black/60 backdrop-blur-3xl border border-[rgba(var(--theme-rgb),0.3)] rounded-[1.5rem] shadow-2xl overflow-hidden">
                                    <ShoppingCart size={isMobile ? 20 : 22} className="text-[rgb(var(--theme-rgb))]" />
                                    {cart.length > 0 && (
                                        <span className="absolute top-2 right-2 w-5 h-5 bg-[rgb(var(--theme-rgb))] text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050805]">
                                            {cart.length}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 lg:hidden"
                    >
                        <button onClick={() => setIsMenuOpen(false)} aria-label="Close Menu" className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                            <X size={24} />
                        </button>
                        <div className="flex flex-col gap-8 text-center">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div key={link.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter hover:text-[rgb(var(--theme-rgb))] transition-colors" prefetch={true}>
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
