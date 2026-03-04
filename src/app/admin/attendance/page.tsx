'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import {
    Search,
    Filter,
    CheckCircle2,
    Calendar,
    Loader2,
    RefreshCcw,
    Zap,
    Users,
    UserCheck,
    QrCode,
    ChevronDown,
    X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

interface Attendee {
    id: string; // registrationId
    teamName: string;
    teamLeader: string;
    leaderName: string;
    members: string[];
    attendance: { [userId: string]: boolean };
    membersDetails: {
        id: string;
        name: string;
        usn: string;
    }[];
}

interface Event {
    id: string;
    title: string;
}

export default function AttendancePage() {
    const { userData, adminCache, updateAdminCache } = useApp()
    const [selectedEventId, setSelectedEventId] = useState<string>(
        (userData?.role === 'COORDINATOR' && userData?.eventId && userData.eventId !== 'all') ? userData.eventId : ''
    )
    const [attendees, setAttendees] = useState<Attendee[]>(() => {
        if (selectedEventId && adminCache.eventAttendanceMap && adminCache.eventAttendanceMap[selectedEventId]) {
            return adminCache.eventAttendanceMap[selectedEventId]
        }
        return []
    })
    const [events, setEvents] = useState<Event[]>(adminCache.events || [])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
    const [stats, setStats] = useState({ total: 0, present: 0 })

    const fetchAttendees = async (eventId: string) => {
        if (!eventId) return
        setLoading(true)
        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/attendance?eventId=${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setAttendees(data.attendees)
                calculateStats(data.attendees)

                // Update cache
                const newMap = { ...(adminCache.eventAttendanceMap || {}), [eventId]: data.attendees }
                updateAdminCache('eventAttendanceMap', newMap)
            }
        } catch (error) {
            console.error("Failed to fetch attendees:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEvents = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setEvents(data.events)
                updateAdminCache('events', data.events)

                // If it's a super admin and no event is selected, pick the first one
                if (!selectedEventId && data.events.length > 0 && userData?.role === 'SUPER_ADMIN') {
                    setSelectedEventId(data.events[0].id)
                }
            }
        } catch (error) {
            console.error("Failed to fetch events:", error)
        }
    }

    const calculateStats = (list: Attendee[]) => {
        let total = 0
        let present = 0
        list.forEach(reg => {
            // Team Leader
            total++
            if (reg.attendance[reg.teamLeader]) present++

            // Members
            reg.members.forEach(mId => {
                total++
                if (reg.attendance[mId]) present++
            })
        })
        setStats({ total, present })
    }

    const toggleAttendance = async (regId: string, userId: string, currentStatus: boolean) => {
        setUpdatingUserId(userId)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/attendance', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    regId,
                    userId,
                    present: !currentStatus
                })
            })

            if (res.ok) {
                setAttendees(prev => prev.map(reg => {
                    if (reg.id === regId) {
                        return {
                            ...reg,
                            attendance: {
                                ...reg.attendance,
                                [userId]: !currentStatus
                            }
                        }
                    }
                    return reg
                }))
                // Update local stats
                setStats(prev => ({
                    ...prev,
                    present: currentStatus ? prev.present - 1 : prev.present + 1
                }))
            }
        } catch (error) {
            console.error("Error updating attendance:", error)
        } finally {
            setUpdatingUserId(null)
        }
    }

    useEffect(() => {
        if (events.length === 0) fetchEvents()
        else if (!selectedEventId && userData?.role === 'SUPER_ADMIN' && events.length > 0) {
            setSelectedEventId(events[0].id)
        }
    }, [])

    useEffect(() => {
        if (selectedEventId) {
            fetchAttendees(selectedEventId)
        }
    }, [selectedEventId])

    const filteredAttendees = attendees.filter(reg =>
        reg.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.membersDetails.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.usn.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER']}>
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tighter italic">ATTENDANCE CONTROL</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <UserCheck size={14} className="text-emerald-500/50" />
                            Manage live attendance for confirmed participants
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-[#111] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Total</p>
                                <p className="text-lg font-black text-white italic">{stats.total}</p>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Present</p>
                                <p className="text-lg font-black text-emerald-400 italic">{stats.present}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => fetchAttendees(selectedEventId)}
                            className="ml-auto bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-500 px-4 py-2 rounded-xl transition-all flex items-center gap-2 active:scale-95 group"
                        >
                            <RefreshCcw size={16} className={cn("transition-transform group-hover:rotate-180", loading && "animate-spin")} />
                            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Selection & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                disabled={Boolean(userData?.role === 'COORDINATOR' && userData?.eventId && userData.eventId !== 'all' && userData.eventId !== '')}
                                className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm appearance-none disabled:opacity-60"
                            >
                                <option value="" disabled>-- Select Event --</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>{event.title}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search name, team, or USN..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {loading && attendees.length === 0 ? (
                        <div className="bg-[#111] rounded-2xl p-8 flex flex-col items-center gap-3 border border-white/5">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading...</p>
                        </div>
                    ) : filteredAttendees.length === 0 ? (
                        <div className="bg-[#111] rounded-2xl p-8 text-center border border-white/5">
                            <div className="flex flex-col items-center gap-2 opacity-20">
                                <Zap size={36} />
                                <p className="text-sm font-bold uppercase tracking-widest">No matches</p>
                            </div>
                        </div>
                    ) : filteredAttendees.map((reg) => {
                        const members: { id: string; name: string; usn: string; isLeader?: boolean }[] = [
                            { id: reg.teamLeader, name: reg.leaderName, usn: 'Leader', isLeader: true },
                            ...(reg.membersDetails || [])
                        ]
                        return (
                            <div key={reg.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/10">
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{reg.teamName}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">REG-{reg.id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {members.map((member) => (
                                        <div key={member.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0",
                                                    member.isLeader ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-gray-400"
                                                )}>
                                                    {member.name[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{member.name}</p>
                                                    <p className="text-[10px] font-mono text-gray-500">{member.usn}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleAttendance(reg.id, member.id, reg.attendance[member.id] || false)}
                                                disabled={updatingUserId === member.id}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 flex-shrink-0",
                                                    reg.attendance[member.id]
                                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                                        : "bg-red-500/5 border-red-500/20 text-red-400"
                                                )}
                                            >
                                                {updatingUserId === member.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : reg.attendance[member.id] ? (
                                                    <CheckCircle2 size={12} />
                                                ) : (
                                                    <X size={12} />
                                                )}
                                                {reg.attendance[member.id] ? 'Present' : 'Absent'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-emerald-500/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">Unit ID / Team</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">Node / Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">USN Logic</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center">Protocol Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && attendees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Syncing encrypted data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAttendees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Zap size={48} />
                                                <p className="text-sm font-bold uppercase tracking-[0.3em]">No signals matched criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendees.map((reg) => {
                                        const members: { id: string; name: string; usn: string; isLeader?: boolean }[] = [
                                            { id: reg.teamLeader, name: reg.leaderName, usn: 'Leader', isLeader: true },
                                            ...(reg.membersDetails || [])
                                        ]

                                        return (
                                            <React.Fragment key={reg.id}>
                                                {members.map((member, mIdx) => (
                                                    <tr key={`${reg.id}-${member.id}`} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            {mIdx === 0 ? (
                                                                <div>
                                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{reg.teamName}</p>
                                                                    <p className="text-[10px] text-gray-500 font-mono">REG-{reg.id.slice(-6).toUpperCase()}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="ml-4 border-l border-white/10 pl-4 h-full py-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                                                                    member.isLeader ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-gray-400"
                                                                )}>
                                                                    {member.name[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white tracking-tight">{member.name}</p>
                                                                    {member.isLeader && <p className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest italic">Unit Commander</p>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-mono text-xs text-gray-400">
                                                                {member.usn}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center">
                                                                <button
                                                                    onClick={() => toggleAttendance(reg.id, member.id, reg.attendance[member.id] || false)}
                                                                    disabled={updatingUserId === member.id}
                                                                    className={cn(
                                                                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2",
                                                                        reg.attendance[member.id]
                                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                                            : "bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10"
                                                                    )}
                                                                >
                                                                    {updatingUserId === member.id ? (
                                                                        <Loader2 size={12} className="animate-spin" />
                                                                    ) : reg.attendance[member.id] ? (
                                                                        <CheckCircle2 size={12} />
                                                                    ) : (
                                                                        <X size={12} />
                                                                    )}
                                                                    {reg.attendance[member.id] ? 'PRESENT' : 'ABSENT'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center py-4">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.5em] italic">Varnothsava Operational Protocol // Active Session</p>
                </div>
            </div>
        </ProtectedRoute>
    )
}
