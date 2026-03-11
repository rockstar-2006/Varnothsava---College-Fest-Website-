'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { missions, Event } from '@/data/missions'
import { MissionCard } from '@/components/ui/MissionCard'
import ProEventBackground from '@/components/ui/ProEventBackground'
import DynamicEventBackground from '@/components/ui/DynamicEventBackground'
import { ChevronDown, ArrowLeft, TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'
import { RegistrationModal } from '@/components/ui/RegistrationModal'

export default function BusinessCarnivalPage() {
    const { userData, isLoggedIn, setPageTheme, registerMission } = useApp()
    const router = useRouter()
    const { scrollYProgress } = useScroll()
    const [isMounted, setIsMounted] = useState(false)
    const [isRegModalOpen, setIsRegModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    useEffect(() => {
        setIsMounted(true)
        setPageTheme({
            name: 'BUSINESS',
            rgb: '14, 165, 233', // Sky-500
            primary: '#0ea5e9'
        })
    }, [setPageTheme])

    const businessEvents = useMemo(() =>
        missions.filter(m => m.type === 'Business'),
        [])

    const businessTheme = {
        primary: 'sky-500',
        secondary: 'blue-400',
        glow: 'rgba(14, 165, 233, 0.6)',
        border: 'text-sky-500/60 group-hover:text-sky-400',
        borderHover: 'border-sky-500/50',
        text: 'text-sky-400',
        textHover: 'group-hover:text-sky-300',
        bg: 'bg-sky-500',
        bgHover: 'hover:bg-sky-500',
        shadow: 'shadow-[0_0_20px_rgba(14,165,233,0.4)]',
        gradient: 'from-sky-600 via-sky-400 to-blue-300',
        pulse: 'bg-sky-500/5 group-hover:bg-sky-500/20',
        radarColor: 'rgba(14, 165, 233, 0.15)'
    }

    const handleConfirmRegistration = async (data: { teamName: string, members: string[] }) => {
        if (!selectedEvent) return { success: false }
        const result = await registerMission(selectedEvent.id, data.teamName, data.members)
        return result
    }

    const complexClip = "polygon(30px 0, 100% 0, 100% 100%, 70% 100%, 65% 94%, 35% 94%, 30% 100%, 0 100%, 0 60%, 10px 60%, 10px 40%, 0 40%, 0 30px)"

    if (!isMounted) return null

    const handleRegisterClick = (event: Event) => {
        if (!isLoggedIn) {
            router.push('/login')
            return
        }
        if (!userData?.hasPaid) {
            router.push('/notify');
            return
        }
        setSelectedEvent(event)
        setIsRegModalOpen(true)  // Opens modal for team/member details
    }

    return (
        <main className="min-h-screen relative bg-black text-white">
            {/* Background */}
            <div className="fixed inset-0 z-0">

                <ProEventBackground theme="sky" scrollProgress={scrollYProgress} />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10 px-4 md:px-6 pt-24 pb-32">
                {/* Navigation Header */}
                <div className="flex items-center gap-4 mb-12">
                    <Link
                        href="/events"
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-sky-500/50 to-transparent" />
                </div>

                {/* Hero section */}
                <div className="flex flex-col items-center text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-center gap-3 text-sky-400 font-mono text-xs uppercase tracking-[0.4em] font-black">
                            <TrendingUp className="w-4 h-4 animate-bounce" />
                            <span>Varnothsava 2026 // Special Segment</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] drop-shadow-[0_0_50px_rgba(14,165,233,0.4)]">
                            BUSINESS<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-300 to-blue-200 not-italic">
                                CARNIVAL
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-white/60 text-sm md:text-base font-medium tracking-wide mt-6 leading-relaxed">
                            Step into the arena of corporate excellence. From financial mastery to visionary startups,
                            the Carnival is where the future of business is forged.
                        </p>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-12 opacity-50"
                    >
                        <ChevronDown className="w-6 h-6 text-sky-400" />
                    </motion.div>
                </div>

                {/* Event Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                    {businessEvents.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <MissionCard
                                event={event}
                                idx={idx}
                                theme={businessTheme}
                                complexClip={complexClip}
                                isLoggedIn={isLoggedIn}
                                hasPaid={userData?.hasPaid}
                                isRegistered={userData?.registeredEvents?.some(re => re.eventId === event.id)}
                                onRegister={handleRegisterClick}
                                priority={true}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 p-12 rounded-[2rem] bg-sky-500/5 border border-sky-500/10 backdrop-blur-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck className="w-32 h-32 text-sky-500" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Ready to dominate?</h2>
                        <p className="text-white/70 mb-8 font-medium">Join the most prestigious business gathering of the year. Secure your spot in the carnival and showcase your strategic prowess.</p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-bold uppercase tracking-widest">
                                <Zap className="w-4 h-4" />
                                Professional Networking
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-bold uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" />
                                Competitive Prizepool
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {userData && selectedEvent && (
                <RegistrationModal
                    isOpen={isRegModalOpen}
                    onClose={() => setIsRegModalOpen(false)}
                    event={selectedEvent}
                    userData={userData}
                    onConfirm={handleConfirmRegistration}
                />
            )}
        </main>
    )
}
