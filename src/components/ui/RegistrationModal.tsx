'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, ShieldCheck, Zap, AlertCircle, CheckCircle2, Loader2, Plus, Trash2, Hash, MessageCircle, Calendar, Info } from 'lucide-react'
import * as QRCode from 'qrcode'
import Image from 'next/image'
import { Event } from '@/data/missions'
import { UserData } from '@/context/AppContext'
import { useLenisControl } from '@/components/ui/SmoothScroll'

interface RegistrationModalProps {
    isOpen: boolean
    onClose: () => void
    event: Event | null
    userData: UserData
    onConfirm: (data: { teamName: string, members: string[] }) => Promise<{ success: boolean, registrationId?: string } | void>
}

const RegistrationManual = ({ isTeam, onClose }: { isTeam: boolean, onClose: () => void }) => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-4">
        {/* Sub-backdrop */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[380px] bg-[#0a100a] border border-blue-500/30 rounded-[1.8rem] md:rounded-[2rem] p-5 md:p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col max-h-[85vh]"
        >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5 md:mb-6 shrink-0">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-[11px] md:text-sm uppercase tracking-[0.2em]">
                    <Info size={16} className="md:w-5 md:h-5" /> How to Register
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-3 md:space-y-4 overflow-y-auto pr-1 custom-scrollbar pb-4">
                {isTeam ? (
                    <>
                        <div className="flex items-start gap-3 md:gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/5 transition-colors group">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-500/20 flex items-center justify-center text-[10px] md:text-xs font-bold text-blue-400 shrink-0 group-hover:scale-110 transition-transform">01</div>
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-50">Team Name</p>
                                <p className="text-xs md:text-sm text-white/80 font-bold leading-tight uppercase">Give your team a unique name above.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/5 transition-colors group">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-500/20 flex items-center justify-center text-[10px] md:text-xs font-bold text-blue-400 shrink-0 group-hover:scale-110 transition-transform">02</div>
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-50">Add Friends</p>
                                <p className="text-xs md:text-sm text-white/80 font-bold leading-tight uppercase">Enter your friend's <span className="text-blue-400">Profile ID</span> (found on their Profile page).</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/5 transition-colors group">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-500/20 flex items-center justify-center text-[10px] md:text-xs font-bold text-blue-400 shrink-0 group-hover:scale-110 transition-transform">03</div>
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-50">Verify Member</p>
                                <p className="text-xs md:text-sm text-white/80 font-bold leading-tight uppercase">Hit the <span className="text-blue-400">+</span> button. Ensure they have already <span className="text-emerald-400">Paid</span>.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/5 transition-colors group">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-500/20 flex items-center justify-center text-[10px] md:text-xs font-bold text-blue-400 shrink-0 group-hover:scale-110 transition-transform">04</div>
                            <div className="space-y-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-50">Finish</p>
                                <p className="text-xs md:text-sm text-white/80 font-bold leading-tight uppercase">Click the green <span className="text-emerald-400">REGISTER</span> button to finish!</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 group">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">01</div>
                            <p className="text-xs md:text-sm text-white/80 font-bold leading-tight uppercase mt-1">Your ID is automatically added as the participant.</p>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 group">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">02</div>
                            <p className="text-xs md:text-sm text-white/80 font-bold leading-tight uppercase mt-1">Just click <span className="text-emerald-400">REGISTER</span> to confirm your spot.</p>
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={onClose}
                className="w-full mt-4 md:mt-8 py-4 bg-blue-500 text-black font-bold uppercase text-[11px] md:text-xs rounded-2xl hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0 active:scale-95"
            >
                Understood
            </button>
        </motion.div>
    </div>
)

export function RegistrationModal({ isOpen, onClose, event, userData, onConfirm }: RegistrationModalProps) {
    const [teamName, setTeamName] = useState('')
    const [memberIds, setMemberIds] = useState<string[]>([])
    const [newMemberId, setNewMemberId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [memberDetails, setMemberDetails] = useState<{ [key: string]: any }>({})
    const [isAddingMember, setIsAddingMember] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [regId, setRegId] = useState<string | null>(null)
    const [qrDataUrl, setQrDataUrl] = useState<string>('')
    const [showManual, setShowManual] = useState(false)
    const lenisControl = useLenisControl()
    const modalRef = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) {
            lenisControl.resume()
            return
        }

        lenisControl.pause()
        const prevBodyOverflow = document.body.style.overflow
        const prevHtmlOverflow = document.documentElement.style.overflow
        document.body.classList.add('modal-open')
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'

        // Prevent scroll propagation on modal
        const handleWheel = (e: WheelEvent) => {
            e.stopPropagation()
        }

        const handleTouchMove = (e: TouchEvent) => {
            e.stopPropagation()
        }

        modalRef.current?.addEventListener('wheel', handleWheel, { passive: true })
        modalRef.current?.addEventListener('touchmove', handleTouchMove, { passive: true })

        return () => {
            modalRef.current?.removeEventListener('wheel', handleWheel)
            modalRef.current?.removeEventListener('touchmove', handleTouchMove)
            document.body.classList.remove('modal-open')
            document.body.style.overflow = prevBodyOverflow
            document.documentElement.style.overflow = prevHtmlOverflow
            lenisControl.resume()
        }
    }, [isOpen, lenisControl])

    useEffect(() => {
        if (isOpen) return

        setTeamName('')
        setMemberIds([])
        setNewMemberId('')
        setIsLoading(false)
        setError(null)
        setMemberDetails({})
        setIsAddingMember(false)
        setIsSuccess(false)
        setRegId(null)
        setQrDataUrl('')
        setShowManual(false)
    }, [isOpen])

    if (!event) return null

    const isTeamEvent = (event.maxTeamSize ?? 1) > 1
    const currentTotalMembers = 1 + memberIds.length // User + extra members

    const handleAddMember = async () => {
        if (!newMemberId.trim()) return
        if (memberIds.includes(newMemberId.trim())) {
            setError('This ID is already added.')
            return
        }
        if (newMemberId.trim() === userData.profileCode) {
            setError('You are already included as the leader.')
            return
        }
        if (event.maxTeamSize && currentTotalMembers >= event.maxTeamSize) {
            setError(`Maximum team size for this event is ${event.maxTeamSize}.`)
            return
        }
        let newUser = await fetch(`/api/user-by-code?code=${newMemberId.trim().toUpperCase()}`);
        if (!newUser.ok) {
            setError('No user found with this Profile ID.')
            return
        }
        const newUserData = await newUser.json();
        if (newUserData.user.hasPaid !== true) {
            setError('This user has not completed payment. Only paid participants can be added.')
            return
        }
        setMemberDetails(prev => ({ ...prev, [newMemberId.trim().toUpperCase()]: newUserData.user }))
        setMemberIds([...memberIds, newMemberId.trim().toUpperCase()])
        setNewMemberId('')
        setError(null)
    }

    const handleRemoveMember = (id: string) => {
        setMemberIds(memberIds.filter(m => m !== id))
        setMemberDetails(prev => {
            const updated = { ...prev }
            delete updated[id]
            return updated
        })
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (isTeamEvent && !teamName.trim()) {
            setError('Please enter a team name.')
            setIsLoading(false)
            return
        }

        if (event.minTeamSize && currentTotalMembers < event.minTeamSize) {
            setError(`This event requires at least ${event.minTeamSize} members. Please add ${event.minTeamSize - currentTotalMembers} more.`)
            setIsLoading(false)
            return
        }

        try {
            const result = await onConfirm({
                teamName: isTeamEvent ? teamName : userData.name,
                members: [userData.profileCode, ...memberIds]
            })

            if (result && result.success && result.registrationId) {
                setRegId(result.registrationId)
                setIsSuccess(true)

                // Generate QR Code
                const whatsappLink = event.whatsappLink || `https://chat.whatsapp.com/community-link`
                QRCode.toDataURL(whatsappLink, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#10b981',
                        light: '#ffffff'
                    }
                }).then(setQrDataUrl)
            } else if (!result || result.success === false) {
                // If it didn't return success object, we assume handled by catch or grid
            } else {
                onClose()
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] pointer-events-auto">
                <div className="flex min-h-screen items-center justify-center p-4 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-[2px] md:backdrop-blur-md pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-[95vw] md:w-full max-w-lg bg-[#050905] border border-emerald-500/20 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] z-10 mx-auto max-h-[90vh] overflow-y-scroll pointer-events-auto"
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        {/* Header Image/Banner */}
                        <div className="h-32 relative overflow-hidden">
                            <Image
                                src={event.visual}
                                alt={event.title}
                                fill
                                className="w-full h-full object-cover opacity-40"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050905] to-transparent" />
                            <div className="absolute top-4 right-4">
                                <button onClick={onClose} className="p-2 bg-black/50 hover:bg-black/80 text-white/50 hover:text-white rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-6 md:left-8 pr-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                                    <Zap size={12} /> Register
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight truncate max-w-full">{event.title}</h3>
                            </div>
                        </div>

                        {!isSuccess ? (
                            <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6">

                                {/* Event Info */}
                                <div className="space-y-4 mb-4">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                        <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest block mb-1">Team Size</label>
                                        <div className="text-white font-bold text-base">{(event.minTeamSize ?? 1) === (event.maxTeamSize ?? 1) ? (event.maxTeamSize ?? 1) : `${event.minTeamSize ?? 1}-${event.maxTeamSize ?? 1}`} Members</div>
                                    </div>
                                </div>

                                {isTeamEvent && (
                                    <div className="space-y-4">
                                        {/* Team Name */}
                                        <div>
                                            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest block mb-2 px-1">Team Name</label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Team Name..."
                                                    value={teamName}
                                                    onChange={(e) => setTeamName(e.target.value)}
                                                    className="w-full bg-emerald-500/5 border border-emerald-500/10 focus:border-emerald-500/40 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-emerald-500/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Team Members */}
                                        <div>
                                            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest block mb-2 px-1">Add Members (Enter Profile IDs)</label>

                                            {/* Leader (Fixed) */}
                                            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">01</div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">TEAM_LEADER</p>
                                                    <p className="text-sm font-bold text-white">{userData.name} (YOU)</p>
                                                </div>
                                                <ShieldCheck size={18} className="text-emerald-400" />
                                            </div>

                                            {/* Extra Members */}
                                            <div className="space-y-2 mb-4">
                                                {memberIds.map((id, idx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={id}
                                                        className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-white/10 text-white/50 flex items-center justify-center font-bold text-xs">{String(idx + 2).padStart(2, '0')}</div>
                                                        <div className="flex-1">
                                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">TEAM_MEMBER</p>
                                                            <p className="text-sm font-bold text-white">{memberDetails[id]?.name || 'Loading...'}</p>
                                                        </div>
                                                        <button type="button" onClick={() => handleRemoveMember(id)} className="text-white/20 hover:text-red-400 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Add Member Input */}
                                            {currentTotalMembers < (event.maxTeamSize ?? 1) && (
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/30" size={16} />
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Profile ID..."
                                                            value={newMemberId}
                                                            onChange={(e) => setNewMemberId(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/40 rounded-xl py-3 pl-11 pr-4 text-white text-sm font-bold placeholder:text-white/10 outline-none transition-all uppercase"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if (isAddingMember) return
                                                                    setIsAddingMember(true)
                                                                    handleAddMember().finally(() => setIsAddingMember(false))
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (isAddingMember) return
                                                            setIsAddingMember(true)
                                                            handleAddMember().finally(() => setIsAddingMember(false))
                                                        }}
                                                        className="px-4 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all"
                                                    >
                                                        {isAddingMember ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Solo Mission Note */}
                                {!isTeamEvent && (
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                                        <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                                        <p className="text-xs text-emerald-500/70 leading-relaxed font-bold uppercase tracking-tight">
                                            This is a solo event. Your profile ID <span className="text-white">{userData.profileCode}</span> will be used for registration.
                                        </p>
                                    </div>
                                )}

                                {/* Error Display */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                                        >
                                            <AlertCircle className="text-red-500" size={18} />
                                            <p className="text-xs text-red-500 font-bold uppercase tracking-tight">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Buttons */}
                                <div className="pt-4 flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-4 border border-white/10 hover:bg-white/5 text-white/50 font-black uppercase text-xs rounded-2xl transition-all active:scale-[0.98]"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-[2] py-4 bg-emerald-500 text-black font-black uppercase text-xs rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            Register
                                        </button>
                                    </div>

                                    {/* Manual Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowManual(true)}
                                        className="w-full py-3 flex items-center justify-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] border border-blue-500/20 rounded-xl hover:bg-blue-500/5 transition-all"
                                    >
                                        <Info size={12} /> How to Register?
                                    </button>

                                    <AnimatePresence>
                                        {showManual && (
                                            <RegistrationManual
                                                isTeam={isTeamEvent}
                                                onClose={() => setShowManual(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 size={40} className="text-emerald-500 animate-bounce" />
                                </div>

                                <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Registration Successful</h2>
                                <p className="text-emerald-500/60 text-sm font-bold uppercase mb-8">Mission_ID: {regId}</p>

                                {/* QR Code Section */}
                                <div className="bg-white p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    {qrDataUrl ? (
                                        <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-48 h-48" />
                                    ) : (
                                        <div className="w-48 h-48 flex items-center justify-center bg-black/5">
                                            <Loader2 size={24} className="text-emerald-500 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-8">
                                    <p className="text-white font-bold uppercase tracking-wide">Scan to join WhatsApp Community</p>
                                    <p className="text-white/40 text-[10px] px-4 font-bold uppercase">Instant access to rules, timings, and peer communications.</p>
                                </div>

                                <div className="flex flex-col w-full gap-3">
                                    <a
                                        href={event.whatsappLink || `https://chat.whatsapp.com/community-link`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <MessageCircle size={18} /> Join via Link
                                    </a>
                                    <button
                                        onClick={onClose}
                                        className="flex items-center justify-center gap-2 py-4 border border-white/10 text-white/60 rounded-2xl font-black uppercase text-xs hover:bg-white/5 transition-all"
                                    >
                                        Return to Base
                                    </button>
                                </div>

                                <p className="mt-8 text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">
                                    Logistical data sent to registered email address.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>,
        document.body
    )
}
