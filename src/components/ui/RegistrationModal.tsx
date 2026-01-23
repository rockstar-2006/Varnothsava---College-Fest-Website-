'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, ShieldCheck, Zap, AlertCircle, CheckCircle2, Loader2, Plus, Trash2, Hash } from 'lucide-react'
import Image from 'next/image'
import { Event } from '@/data/missions'
import { UserData } from '@/context/AppContext'

interface RegistrationModalProps {
    isOpen: boolean
    onClose: () => void
    event: Event | null
    userData: UserData
    onConfirm: (data: { teamName: string, members: string[] }) => Promise<void>
}

export function RegistrationModal({ isOpen, onClose, event, userData, onConfirm }: RegistrationModalProps) {
    const [teamName, setTeamName] = useState('')
    const [memberIds, setMemberIds] = useState<string[]>([])
    const [newMemberId, setNewMemberId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!event) return null

    const isTeamEvent = event.maxTeamSize > 1
    const currentTotalMembers = 1 + memberIds.length // User + extra members

    const handleAddMember = () => {
        if (!newMemberId.trim()) return
        if (memberIds.includes(newMemberId.trim())) {
            setError('This ID is already added.')
            return
        }
        if (newMemberId.trim() === userData.profileCode) {
            setError('You are already included as the leader.')
            return
        }
        if (currentTotalMembers >= event.maxTeamSize) {
            setError(`Maximum team size for this event is ${event.maxTeamSize}.`)
            return
        }
        setMemberIds([...memberIds, newMemberId.trim().toUpperCase()])
        setNewMemberId('')
        setError(null)
    }

    const handleRemoveMember = (id: string) => {
        setMemberIds(memberIds.filter(m => m !== id))
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

        if (currentTotalMembers < event.minTeamSize) {
            setError(`This event requires at least ${event.minTeamSize} members. Please add ${event.minTeamSize - currentTotalMembers} more.`)
            setIsLoading(false)
            return
        }

        try {
            await onConfirm({
                teamName: isTeamEvent ? teamName : 'Solo',
                members: [userData.profileCode, ...memberIds]
            })
            onClose()
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#050905] border border-emerald-500/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]"
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
                            <div className="absolute bottom-4 left-8">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                                    <Zap size={12} /> Mission_Initialization
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{event.title}</h3>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            {/* Mission Config */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <label className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest block mb-1">Entry_Fee</label>
                                    <div className="text-white font-bold text-sm">₹{event.fee}</div>
                                </div>
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <label className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest block mb-1">Team_Capacity</label>
                                    <div className="text-white font-bold text-sm">{event.minTeamSize === event.maxTeamSize ? event.maxTeamSize : `${event.minTeamSize}-${event.maxTeamSize}`} Units</div>
                                </div>
                            </div>

                            {isTeamEvent && (
                                <div className="space-y-4">
                                    {/* Team Name */}
                                    <div>
                                        <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest block mb-2 px-1">Squad_Callsign (Team Name)</label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter Squad Name..."
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="w-full bg-emerald-500/5 border border-emerald-500/10 focus:border-emerald-500/40 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-emerald-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Team Members */}
                                    <div>
                                        <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest block mb-2 px-1">Deployment_Units (Member Profile IDs)</label>

                                        {/* Leader (Fixed) */}
                                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black text-xs">01</div>
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SQUAD_LEADER</p>
                                                <p className="text-sm font-bold text-white">{userData.profileCode} (YOU)</p>
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
                                                    <div className="w-8 h-8 rounded-lg bg-white/10 text-white/50 flex items-center justify-center font-black text-xs">{String(idx + 2).padStart(2, '0')}</div>
                                                    <div className="flex-1">
                                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">UNIT_MEMBER</p>
                                                        <p className="text-sm font-bold text-white">{id}</p>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveMember(id)} className="text-white/20 hover:text-red-400 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Add Member Input */}
                                        {currentTotalMembers < event.maxTeamSize && (
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/30" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Profile UID..."
                                                        value={newMemberId}
                                                        onChange={(e) => setNewMemberId(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/40 rounded-xl py-3 pl-11 pr-4 text-white text-sm font-bold placeholder:text-white/10 outline-none transition-all uppercase"
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddMember}
                                                    className="px-4 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all"
                                                >
                                                    <Plus size={20} />
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
                                        This is a solo mission. Your identity profile <span className="text-white">{userData.profileCode}</span> will be recorded as the primary participant.
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
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 border border-white/10 hover:bg-white/5 text-white/50 font-black uppercase text-xs rounded-2xl transition-all active:scale-[0.98]"
                                >
                                    ABORT_MISSION
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] py-4 bg-emerald-500 text-black font-black uppercase text-xs rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    INITIALIZE_REGISTRATION
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
