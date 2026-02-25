'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import {
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    User,
    Users,
    Loader2,
    Check,
    X,
    Calendar,
    QrCode
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

interface Attendee {
    id: string; // registration ID
    teamName: string;
    leaderName: string;
    teamLeader: string; // userId
    membersDetails: { id: string, name: string, usn: string }[];
    attendance: Record<string, boolean>;
}

interface Event {
    id: string;
    title: string;
}

export default function AttendancePage() {
    const { userData } = useApp()
    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const fetchEvents = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setEvents(data.events)
                if (data.events.length > 0) {
                    setSelectedEventId(data.events[0].id)
                }
            }
        } catch (error) {
            console.error("Failed to fetch events:", error)
        }
    }

    const fetchAttendance = async (eventId: string) => {
        if (!eventId) return
        setLoading(true)
        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/attendance?eventId=${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setAttendees(data.attendees)
        } catch (error) {
            console.error("Failed to fetch attendance:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    useEffect(() => {
        if (selectedEventId) fetchAttendance(selectedEventId)
    }, [selectedEventId])

    const handleToggleAttendance = async (regId: string, userId: string, currentStatus: boolean) => {
        setUpdatingId(`${regId}-${userId}`)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/attendance', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ regId, userId, present: !currentStatus })
            })

            if (res.ok) {
                setAttendees(prev => prev.map(a => {
                    if (a.id === regId) {
                        return { ...a, attendance: { ...a.attendance, [userId]: !currentStatus } }
                    }
                    return a
                }))
            }
        } catch (error) {
            console.error("Error updating attendance:", error)
        } finally {
            setUpdatingId(null)
        }
    }

    const filteredAttendees = attendees.filter(a =>
        a.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER']}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
                        <p className="text-gray-400 text-sm">Mark attendance for participants</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                        >
                            <option value="" disabled>Select Event</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#111] p-4 rounded-2xl border border-white/5">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by participant or team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Attendance List */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Participant / Team</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <span className="text-gray-500">Loading attendee records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAttendees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                            {selectedEventId ? 'No approved registrations found' : 'Please select an event'}
                                        </td>
                                    </tr>
                                ) : filteredAttendees.map((attendee) => (
                                    <React.Fragment key={attendee.id}>
                                        {/* Team Leader Row */}
                                        <tr className="hover:bg-white/2 transition-colors border-t border-white/5">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{attendee.leaderName}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono uppercase truncate max-w-[150px]">{attendee.teamName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase text-amber-500 tracking-tighter bg-amber-500/10 px-2 py-0.5 rounded">Leader</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "flex items-center gap-2 font-black px-3 py-1 rounded-full w-fit text-[10px] uppercase",
                                                    attendee.attendance[attendee.teamLeader] ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {attendee.attendance[attendee.teamLeader] ? 'Present' : 'Absent'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleToggleAttendance(attendee.id, attendee.teamLeader, !!attendee.attendance[attendee.teamLeader])}
                                                    disabled={updatingId === `${attendee.id}-${attendee.teamLeader}`}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        attendee.attendance[attendee.teamLeader]
                                                            ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                                            : "bg-emerald-500 text-black hover:bg-emerald-400"
                                                    )}
                                                >
                                                    {updatingId === `${attendee.id}-${attendee.teamLeader}` ? <Loader2 size={16} className="animate-spin" /> :
                                                        attendee.attendance[attendee.teamLeader] ? <X size={16} /> : <Check size={16} strokeWidth={3} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Member Rows */}
                                        {attendee.membersDetails.map(member => (
                                            <tr key={member.id} className="hover:bg-white/2 transition-colors group bg-white/2">
                                                <td className="px-6 py-3 pl-14">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            <User size={12} />
                                                        </div>
                                                        <p className="text-gray-300 font-medium">{member.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">Member</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className={cn(
                                                        "flex items-center gap-2 font-black px-3 py-1 rounded-full w-fit text-[10px] uppercase",
                                                        attendee.attendance[member.id] ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {attendee.attendance[member.id] ? 'Present' : 'Absent'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => handleToggleAttendance(attendee.id, member.id, !!attendee.attendance[member.id])}
                                                        disabled={updatingId === `${attendee.id}-${member.id}`}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all",
                                                            attendee.attendance[member.id]
                                                                ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                                                : "bg-emerald-500 text-black hover:bg-emerald-400"
                                                        )}
                                                    >
                                                        {updatingId === `${attendee.id}-${member.id}` ? <Loader2 size={12} className="animate-spin" /> :
                                                            attendee.attendance[member.id] ? <X size={12} /> : <Check size={12} strokeWidth={3} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

