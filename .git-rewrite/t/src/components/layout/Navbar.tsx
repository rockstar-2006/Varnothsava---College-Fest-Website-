'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ShoppingCart, User, X, Rocket, LayoutGrid, Trophy, Camera, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useState, useEffect } from 'react'

export function Navbar() {
    const pathname = usePathname()
    const { isLoggedIn, isInitializing, cart } = useApp()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const navLinks = [
        { name: 'HOME', href: '/', icon: LayoutGrid },
        { name: 'MISSIONS', href: '/events', icon: Zap },
        { name: 'LEADERBOARD', href: '/leaderboard', icon: Trophy },
        { name: 'ARCHIVE', href: '/gallery', icon: Camera },
    ]

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 inset-x-0 z-[500] transition-all duration-500 ${pathname === '/gallery' || pathname === '/profile'
                ? 'bg-black/20 backdrop-blur-sm border-b border-white/5'
                : `bg-[#050805]/80 ${isMobile ? '' : 'backdrop-blur-md'} border-b border-emerald-500/10`
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo - Green Theme */}
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 border border-emerald-500/40 flex items-center justify-center transition-all group-hover:border-emerald-400">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col border-l border-white/20 pl-4">
                        <span className="text-lg font-black tracking-tighter text-white uppercase leading-none italic">
                            VARNOTH<span className="text-emerald-500 not-italic">SAVA</span>
                        </span>
                        <span className="text-[7px] font-mono tracking-[0.5em] text-emerald-400/40 font-bold mt-1 uppercase">
                            STATION_COORD_2K26
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation - Themed Accents */}
                <div className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        const isProfile = pathname === '/profile'
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative px-4 py-2 text-[9px] font-black tracking-widest transition-all flex items-center gap-2 ${isActive
                                    ? 'text-emerald-400'
                                    : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-3 h-3" />
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        style={{ backgroundColor: isProfile ? '#8b7355' : '#10b981' }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/checkout"
                        className={`relative p-2.5 transition-colors ${pathname === '/profile' ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-white/40 hover:text-emerald-400'
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {cart.length > 0 && (
                            <span className={`absolute -top-1 -right-1 w-4 h-4 text-black text-[8px] font-black flex items-center justify-center rounded-full ${pathname === '/profile' ? 'bg-emerald-500' : 'bg-emerald-500'
                                }`}>
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {/* Auth Status */}
                    {!isInitializing && (
                        <Link
                            href={isLoggedIn ? "/profile" : "/login"}
                            className="hidden sm:flex items-center gap-3 px-6 py-2 border border-emerald-500/20 text-white font-black text-[9px] hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-[0.2em] rounded-sm group/auth"
                        >
                            <User className={`w-3 h-3 ${isLoggedIn ? 'text-emerald-500 group-hover/auth:text-black' : ''}`} />
                            {isLoggedIn ? 'IDENTITY_SYNCED' : 'AUTHORIZE_ACCESS'}
                        </Link>
                    )}

                    {isInitializing && (
                        <div className="w-32 h-8 bg-emerald-500/5 animate-pulse border border-emerald-500/10" />
                    )}

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-white/40 hover:text-emerald-400"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-[#050805] border-b border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col gap-1 p-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-3 text-[10px] font-black text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-sm flex items-center gap-4 transition-all tracking-widest"
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.name}
                                </Link>
                            ))}

                            {/* Mobile-only Action Buttons */}
                            <div className="h-[1px] bg-white/5 my-2 mx-4" />

                            <Link
                                href="/checkout"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3 text-[10px] font-black text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-sm flex items-center justify-between transition-all tracking-widest"
                            >
                                <div className="flex items-center gap-4">
                                    <ShoppingCart className="w-4 h-4" />
                                    CART
                                </div>
                                {cart.length > 0 && (
                                    <span className="bg-emerald-500 text-black px-1.5 py-0.5 rounded-full text-[8px] font-black">
                                        {cart.length}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href={isLoggedIn ? "/profile" : "/login"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3 text-[10px] font-black text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-sm flex items-center gap-4 transition-all tracking-widest"
                            >
                                <User className="w-4 h-4" />
                                {isLoggedIn ? 'IDENTITY' : 'AUTHORIZE'}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
