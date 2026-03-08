'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import {
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Users,
    School,
    CreditCard,
    Calendar,
    Loader2,
    ChevronDown,
    MoreVertical,
    Check,
    X,
    FileText,
    Tag,
    RefreshCcw,
    Zap,
    Download,
    FileSpreadsheet
} from 'lucide-react'
import { fetchAndDownload } from '@/lib/exportUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

interface Registration {
    id: string;
    eventId: string;
    teamName: string;
    teamLeader: string;
    leaderName: string;
    phone?: string;
    college: string;
    paymentStatus: 'Paid' | 'Unpaid';
    status: 'approved' | 'rejected' | 'pending';
    registeredAt: string;
    eventType: 'SOLO' | 'GROUP';
    eventTitle?: string;
    membersDetails: { name: string, usn: string, phone?: string }[];
}

interface Event {
    id: string;
    title: string;
    type: string;
}

export default function ParticipantsManagementPage() {
    const { userData, adminCache, updateAdminCache } = useApp()
    const [registrations, setRegistrations] = useState<Registration[]>(adminCache.registrations || [])
    const [events, setEvents] = useState<Event[]>(adminCache.events || [])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEventId, setSelectedEventId] = useState<string>(
        (userData?.role === 'COORDINATOR' && userData?.eventId && userData.eventId !== 'all') ? userData.eventId : 'all'
    )
    const [studentType, setStudentType] = useState<string>('all') // 'all', 'internal', 'external'
    const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'new'>('all')
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [totalRegCount, setTotalRegCount] = useState(adminCache.totalRegCount || 0)
    const [totalInternalRegs, setTotalInternalRegs] = useState(adminCache.totalInternalRegs || 0)
    const [totalExternalRegs, setTotalExternalRegs] = useState(adminCache.totalExternalRegs || 0)
    const [totalParticipants, setTotalParticipants] = useState(adminCache.totalParticipants || 0)
    const [lastId, setLastId] = useState<string | null>(null)
    const [isInitialMount, setIsInitialMount] = useState(true)

    const fetchRegistrations = async (eventId?: string, isLoadMore = false) => {
        setLoading(true)
        try {
            const token = await getAuthToken()
            const currentLastId = isLoadMore ? lastId : '';
            // If it's a coordinator, they might be restricted to certain eventId
            let targetEventId = eventId || selectedEventId;
            if (userData?.role === 'COORDINATOR' && userData?.eventId && userData.eventId !== 'all') {
                targetEventId = userData.eventId;
            }

            let url = `/api/admin/registrations?lastId=${currentLastId}&limit=20`
            if (targetEventId && targetEventId !== 'all') url += `&eventId=${targetEventId}`
            if (studentType !== 'all') url += `&studentType=${studentType}`
            if (selectedDateFilter !== 'all') url += `&dateFilter=${selectedDateFilter}`
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
            if (isLoadMore) url += `&skipCounts=1`

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            })
            const data = await res.json()
            if (res.ok) {
                const newRegs = isLoadMore ? [...registrations, ...data.registrations] : data.registrations;
                setRegistrations(newRegs)
                setHasMore(data.hasMore)
                setLastId(data.lastId)
                if (typeof data.totalCount === 'number') setTotalRegCount(data.totalCount)
                if (typeof data.internalCount === 'number') setTotalInternalRegs(data.internalCount)
                if (typeof data.externalCount === 'number') setTotalExternalRegs(data.externalCount)
                if (typeof data.totalParticipants === 'number') setTotalParticipants(data.totalParticipants)

                // If it's just a sync (not load more), update cache
                if (!isLoadMore) {
                    updateAdminCache('registrations', newRegs)
                    if (typeof data.totalCount === 'number') updateAdminCache('totalRegCount', data.totalCount)
                    if (typeof data.internalCount === 'number') updateAdminCache('totalInternalRegs', data.internalCount)
                    if (typeof data.externalCount === 'number') updateAdminCache('totalExternalRegs', data.externalCount)
                    if (typeof data.totalParticipants === 'number') updateAdminCache('totalParticipants', data.totalParticipants)
                }
            }
        } catch (error) {
            console.error("Failed to fetch registrations:", error)
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
            }
        } catch (error) {
            console.error("Failed to fetch events:", error)
        }
    }

    // Toggle expanded mapping
    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    }

    const isFirstMountFilter = useRef(true)
    const isFirstMountSearch = useRef(true)

    // Initial fetch only if no cache
    useEffect(() => {
        if (isFirstMountFilter.current) {
            isFirstMountFilter.current = false;
            if (events.length === 0 && !adminCache.events) fetchEvents()

            // Only fetch if cache doesn't exist
            if (!adminCache.registrations) {
                fetchRegistrations(selectedEventId, false)
            }
        }
        // Deliberately no dependencies to prevent auto-fetch on filter change
    }, [])

    // Global Search with debounce
    useEffect(() => {
        if (isFirstMountSearch.current) {
            isFirstMountSearch.current = false;
            return;
        }
        const timer = setTimeout(() => {
            fetchRegistrations(selectedEventId, false)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        setUpdatingId(id)
        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/registrations/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (res.ok) {
                setRegistrations(prev => {
                    const newRegs = prev.map(reg =>
                        reg.id === id ? { ...reg, status } : reg
                    );
                    updateAdminCache('registrations', newRegs);
                    return newRegs;
                })
            } else {
                const data = await res.json()
                alert(data.message || "Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error)
        } finally {
            setUpdatingId(null)
        }
    }

    const filteredRegs = registrations.filter(reg => {
        // Server side filtering handled the query, 
        // local filtering remains for Super Admins if needed but mostly for consistency
        return true;
    })

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR']}>
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tighter italic">REGISTRATIONS</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} className="text-emerald-500/50" />
                            {selectedEventId === 'all'
                                ? `${totalRegCount} Total Teams · ${totalParticipants} Participants`
                                : `${totalRegCount} Registered Teams · ${totalParticipants} Participants`}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setStudentType('internal')}
                            className={cn(
                                "px-3 py-1.5 rounded-xl transition-all border flex flex-col items-center min-w-[55px]",
                                studentType === 'internal' ? "bg-emerald-500/20 border-emerald-500/50" : "bg-white/5 border-white/10 hover:border-emerald-500/30"
                            )}
                        >
                            <p className="text-[8px] font-black uppercase tracking-tighter text-emerald-500 leading-none mb-1">Internal</p>
                            <p className="text-sm font-black text-white italic">{totalInternalRegs}</p>
                        </button>
                        <button
                            onClick={() => setStudentType('external')}
                            className={cn(
                                "px-3 py-1.5 rounded-xl transition-all border flex flex-col items-center min-w-[55px]",
                                studentType === 'external' ? "bg-blue-500/20 border-blue-500/50" : "bg-white/5 border-white/10 hover:border-blue-500/30"
                            )}
                        >
                            <p className="text-[8px] font-black uppercase tracking-tighter text-blue-500 leading-none mb-1">External</p>
                            <p className="text-sm font-black text-white italic">{totalExternalRegs}</p>
                        </button>
                        {studentType !== 'all' && (
                            <button
                                onClick={() => setStudentType('all')}
                                className="p-1 px-2 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setLastId(null)
                                    fetchRegistrations(selectedEventId, false)
                                }}
                                className="bg-[#111] border border-white/10 hover:border-emerald-500/50 text-white px-3 md:px-5 py-2 rounded-xl transition-all group flex items-center gap-2 shadow-xl"
                            >
                                <RefreshCcw size={16} className={cn("text-emerald-500 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
                                <span className="text-xs font-bold uppercase tracking-widest text-white hidden sm:block">Sync</span>
                            </button>

                            {userData?.role === 'SUPER_ADMIN' && (
                                <button
                                    onClick={() => fetchAndDownload('registrations', `Registrations_${selectedEventId}`, getAuthToken, { eventId: selectedEventId })}
                                    className="bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-500 px-3 md:px-5 py-2 rounded-xl transition-all group flex items-center gap-2 shadow-xl"
                                    title="Export"
                                >
                                    <FileSpreadsheet size={16} className="transition-transform group-hover:scale-110" />
                                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Export</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 bg-[#111] p-3 md:p-4 rounded-2xl border border-white/5">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by participant, team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500 flex-shrink-0" />
                        <select
                            value={selectedDateFilter}
                            onChange={(e) => setSelectedDateFilter(e.target.value as any)}
                            className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-emerald-500 focus:outline-none focus:border-emerald-500/80 text-sm font-bold tracking-tight"
                        >
                            <option value="all">All Dates</option>
                            <option value="new">From March 11 (New)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500 flex-shrink-0" />
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                        >
                            <option value="all">All Assigned Events</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#111] p-3 md:p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><Users size={40} /></div>
                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-1">Teams Registered</p>
                        <p className="text-xl md:text-2xl font-black text-white italic">{totalRegCount}</p>
                    </div>
                    <div className="bg-[#111] p-3 md:p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><User size={40} /></div>
                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-1">Total Participants</p>
                        <p className="text-xl md:text-2xl font-black text-emerald-500 italic">{totalParticipants}</p>
                    </div>
                    <div className="bg-[#111] p-3 md:p-4 rounded-2xl border border-white/5">
                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-1">Pending Approval</p>
                        <p className="text-xl md:text-2xl font-bold text-amber-500 italic">{registrations.filter(r => r.status === 'pending' || !r.status).length}</p>
                    </div>
                    <div className="bg-[#111] p-3 md:p-4 rounded-2xl border border-white/5 border-l-amber-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><CreditCard size={40} /></div>
                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-1">Unpaid Teams</p>
                        <p className="text-xl md:text-2xl font-bold text-red-500 italic">{registrations.filter(r => r.paymentStatus === 'Unpaid').length}</p>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {loading && registrations.length === 0 ? (
                        <div className="bg-[#111] rounded-2xl p-8 flex flex-col items-center gap-3 border border-white/5">
                            <Loader2 className="animate-spin text-emerald-500" size={28} />
                            <span className="text-gray-500 font-medium text-sm">Syncing records...</span>
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="bg-[#111] rounded-2xl p-8 text-center text-gray-500 font-medium italic text-sm border border-white/5">
                            No data. Click Sync to fetch.
                        </div>
                    ) : registrations.map((reg) => (
                        <div key={reg.id} className="bg-[#111] border border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-bold text-white text-base">{reg.leaderName}</p>
                                    <p className="text-xs text-emerald-500 font-mono">{reg.teamName}</p>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 font-black px-2 py-1 rounded-lg text-[9px] uppercase tracking-widest border flex-shrink-0",
                                    reg.paymentStatus === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>
                                    {reg.paymentStatus === 'Paid' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                    {reg.paymentStatus}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/5 rounded-xl p-2">
                                    <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Event</p>
                                    <p className="text-white font-bold truncate">{reg.eventTitle || reg.eventId}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-2">
                                    <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Phone</p>
                                    <p className="text-white font-bold">{reg.phone || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-2 col-span-2">
                                    <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">College</p>
                                    <p className="text-white font-bold truncate">{reg.college}</p>
                                </div>
                            </div>
                            {reg.eventType === 'GROUP' && reg.membersDetails && reg.membersDetails.length > 0 && (
                                <div>
                                    <button
                                        onClick={() => toggleExpand(reg.id)}
                                        className={cn(
                                            "w-full px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2",
                                            expandedIds.has(reg.id) ? "bg-emerald-500 text-black border-emerald-500" : "border-white/10 text-gray-400 hover:border-emerald-500/50"
                                        )}
                                    >
                                        <Users size={12} />
                                        {expandedIds.has(reg.id) ? 'Hide' : `${reg.membersDetails.length} Members`}
                                    </button>
                                    {expandedIds.has(reg.id) && (
                                        <div className="mt-2 space-y-2">
                                            {reg.membersDetails.map((m, i) => (
                                                <div key={i} className="bg-white/5 rounded-xl p-2 text-xs flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400 flex-shrink-0">
                                                        {m.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{m.name}</p>
                                                        <p className="text-gray-500 font-mono">{m.usn}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Participant & Team</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Participated Event</th>
                                    <th className="px-6 py-4">Institution</th>
                                    <th className="px-6 py-4 text-center">Payment</th>
                                    <th className="px-6 py-4">Reg. Date</th>
                                    <th className="px-6 py-4 text-right">Members</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading && registrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <span className="text-gray-500 font-medium">Synchronizing participant records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : registrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                            No local cache found. Click "Sync Signals" to fetch registration data.
                                        </td>
                                    </tr>
                                ) : registrations.map((reg) => (
                                    <React.Fragment key={reg.id}>
                                        <tr className="hover:bg-white/2 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 font-bold border border-white/10 group-hover:border-emerald-500/30 transition-all">
                                                        {reg.eventType === 'SOLO' ? <User size={20} /> : <Users size={20} />}
                                                    </div>
                                                    <div
                                                        onClick={() => toggleExpand(reg.id)}
                                                        className="cursor-pointer group-hover:translate-x-1 transition-transform"
                                                    >
                                                        <p className="font-bold text-white text-base hover:text-emerald-500 transition-colors">{reg.leaderName}</p>
                                                        <p className="text-xs text-emerald-500 font-mono flex items-center gap-1 group/team">
                                                            <TagIcon size={10} className="opacity-70" />
                                                            <span className="group-hover/team:underline decoration-emerald-500/30">{reg.teamName}</span>
                                                            <ChevronDown size={10} className={cn("transition-transform", expandedIds.has(reg.id) && "rotate-180")} />
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                                                        <CreditCard size={12} className="text-emerald-500/50" />
                                                        {reg.phone || 'N/A'}
                                                    </p>
                                                    {reg.eventType === 'GROUP' && (
                                                        <p className="text-[10px] text-gray-500 font-medium">Team Leader Contact</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                                        <Zap size={14} />
                                                    </div>
                                                    <span className="font-bold text-white uppercase tracking-tighter text-xs">
                                                        {reg.eventTitle || reg.eventId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <School size={16} className="text-gray-600" />
                                                    <span className="truncate max-w-[150px] text-xs font-medium" title={reg.college}>{reg.college}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 font-black px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest border",
                                                    reg.paymentStatus === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    {reg.paymentStatus === 'Paid' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                    {reg.paymentStatus}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-white font-bold tracking-tight">{formatDate(reg.registeredAt)}</span>
                                                    <span className="text-[8px] text-gray-600 font-mono mt-0.5 uppercase">Signal Received</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {reg.eventType === 'GROUP' ? (
                                                    <button
                                                        onClick={() => toggleExpand(reg.id)}
                                                        className={cn(
                                                            "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter transition-all",
                                                            expandedIds.has(reg.id) ? "bg-emerald-500 text-black border-emerald-500" : "border-white/10 text-gray-400 hover:border-emerald-500/50"
                                                        )}
                                                    >
                                                        {expandedIds.has(reg.id) ? 'Hide Members' : `${reg.membersDetails?.length || 0} Members`}
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-600 uppercase italic">Solo Entry</span>
                                                )}
                                            </td>
                                        </tr>
                                        {expandedIds.has(reg.id) && reg.membersDetails && (
                                            <AnimatePresence>
                                                <motion.tr
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-[#050505] border-l-4 border-emerald-500"
                                                >
                                                    <td colSpan={7} className="px-12 py-8">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                                <FileText size={16} className="text-emerald-500" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">TEAM_DATA_FOLDER: {reg.teamName}</h3>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Authorized personnel only // Signal analysis active</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            {/* Team Leader always included as M1 or specifically noted */}
                                                            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20 relative overflow-hidden group/member">
                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/member:opacity-30 transition-opacity">
                                                                    <User size={40} />
                                                                </div>
                                                                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">TEAM_LEADER</p>
                                                                <p className="text-sm font-bold text-white mb-0.5">{reg.leaderName}</p>
                                                                <p className="text-[10px] text-gray-500 font-mono mb-2">{reg.phone || 'N/A'}</p>
                                                            </div>
                                                            {reg.membersDetails?.filter(m => m.name !== reg.leaderName).map((member, idx) => (
                                                                <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all relative overflow-hidden group/member">
                                                                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/member:opacity-20 transition-opacity">
                                                                        <Users size={40} />
                                                                    </div>
                                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">MEMBER_{idx + 2}</p>
                                                                    <p className="text-sm font-bold text-white mb-0.5">{member.name}</p>
                                                                    <p className="text-[10px] text-gray-500 font-mono mb-2">{member.usn}</p>
                                                                    {member.phone && member.phone !== 'N/A' && (
                                                                        <div className="flex items-center gap-1 text-[9px] text-emerald-500/70 font-bold uppercase italic">
                                                                            <CreditCard size={10} /> {member.phone}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            </AnimatePresence>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.01]">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Showing <span className="text-white">{registrations.length}</span> / <span className="text-white">{totalRegCount}</span> Sector Signals
                        </div>

                        {hasMore && (
                            <button
                                onClick={() => fetchRegistrations(selectedEventId, true)}
                                disabled={loading}
                                className="px-8 py-3 bg-[#111] hover:bg-emerald-500 text-white hover:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/10 hover:border-emerald-500 disabled:opacity-50 flex items-center gap-3 group shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        <span>Load Next Data Stream</span>
                                        <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        )}

                        {!hasMore && registrations.length > 0 && (
                            <div className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest border border-emerald-500/10 px-4 py-2 rounded-full">
                                End of Database Reached
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Pagination */}
                <div className="md:hidden">
                    {hasMore && (
                        <button
                            onClick={() => fetchRegistrations(selectedEventId, true)}
                            disabled={loading}
                            className="w-full py-3 bg-[#111] hover:bg-emerald-500 text-white hover:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/10 hover:border-emerald-500 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Load More'}
                        </button>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}

function TagIcon({ size, className }: { size: number, className: string }) {
    return (
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
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
            <path d="M7 7h.01" />
        </svg>
    )
}
