'use client'

import { useState, useEffect } from 'react'
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
    RefreshCcw
} from 'lucide-react'
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
    college: string;
    paymentStatus: 'Paid' | 'Unpaid';
    status: 'approved' | 'rejected' | 'pending';
    registeredAt: string;
    eventType: 'SOLO' | 'GROUP';
    membersDetails: { name: string, usn: string }[];
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
    const [selectedEventId, setSelectedEventId] = useState<string>('all')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [totalRegCount, setTotalRegCount] = useState(adminCache.totalRegCount || 0)
    const [totalInternalRegs, setTotalInternalRegs] = useState(adminCache.totalInternalRegs || 0)
    const [totalExternalRegs, setTotalExternalRegs] = useState(adminCache.totalExternalRegs || 0)
    const [lastId, setLastId] = useState<string | null>(null)

    const fetchRegistrations = async (eventId?: string, isLoadMore = false) => {
        setLoading(true)
        try {
            const token = await getAuthToken()
            const currentLastId = isLoadMore ? lastId : '';
            const targetEventId = eventId || selectedEventId;

            let url = `/api/admin/registrations?lastId=${currentLastId}&limit=20`
            if (targetEventId && targetEventId !== 'all') url += `&eventId=${targetEventId}`

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                const newRegs = isLoadMore ? [...registrations, ...data.registrations] : data.registrations;
                setRegistrations(newRegs)
                setHasMore(data.hasMore)
                setLastId(data.lastId)
                setTotalRegCount(data.totalCount)
                setTotalInternalRegs(data.internalCount || 0)
                setTotalExternalRegs(data.externalCount || 0)
                updateAdminCache('registrations', newRegs)
                updateAdminCache('totalRegCount', data.totalCount)
                updateAdminCache('totalInternalRegs', data.internalCount || 0)
                updateAdminCache('totalExternalRegs', data.externalCount || 0)
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

    // No automatic fetching on page load
    useEffect(() => {
        // fetchRegistrations(selectedEventId) and fetchEvents() are now manual
    }, [])

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
                setRegistrations(prev => prev.map(reg =>
                    reg.id === id ? { ...reg, status } : reg
                ))
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

    const filteredRegs = registrations.filter(reg =>
        reg.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.college.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter italic">REGISTRATIONS</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} className="text-emerald-500/50" />
                            {selectedEventId === 'all' ? `Global database contains ${totalRegCount} registration records` : `Accessing registration signals for selected sector`}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                                <p className="text-[8px] font-black uppercase tracking-tighter text-emerald-500 leading-none mb-1 text-center">Internal</p>
                                <p className="text-sm font-black text-white italic text-center">{totalInternalRegs}</p>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">
                                <p className="text-[8px] font-black uppercase tracking-tighter text-blue-500 leading-none mb-1 text-center">External</p>
                                <p className="text-sm font-black text-white italic text-center">{totalExternalRegs}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => fetchRegistrations(selectedEventId, false)}
                            className="bg-[#111] border border-white/10 hover:border-emerald-500/50 text-white px-5 py-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-xl"
                        >
                            <RefreshCcw size={18} className={cn("text-emerald-500 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-none mb-1">Live Feed</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-white leading-none">Sync Signals</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#111] p-4 rounded-2xl border border-white/5">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by participant, team, or college..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                        >
                            <option value="all">All Assigned Events</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 text-[8px]">Database Total</p>
                        <p className="text-2xl font-black text-white italic">{totalRegCount}</p>
                    </div>
                    <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Pending</p>
                        <p className="text-2xl font-bold text-amber-500">{registrations.filter(r => r.status === 'pending' || !r.status).length}</p>
                    </div>
                    <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Approved</p>
                        <p className="text-2xl font-bold text-emerald-500">{registrations.filter(r => r.status === 'approved').length}</p>
                    </div>
                    <div className="bg-[#111] p-4 rounded-2xl border border-white/5 border-l-amber-500">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Unpaid</p>
                        <p className="text-2xl font-bold text-red-500">{registrations.filter(r => r.paymentStatus === 'Unpaid').length}</p>
                    </div>
                </div>

                {/* Participants Table */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Participant & Team</th>
                                    <th className="px-6 py-4">Institution</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Reg. Date</th>
                                    <th className="px-6 py-4">Approval</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <span className="text-gray-500 font-medium">Synchronizing participant records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredRegs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                            No local cache found. Click "Sync Signals" to fetch registration data.
                                        </td>
                                    </tr>
                                ) : filteredRegs.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 font-bold border border-white/10 group-hover:border-emerald-500/30 transition-all">
                                                    {reg.eventType === 'SOLO' ? <User size={20} /> : <Users size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-base">{reg.leaderName}</p>
                                                    <p className="text-xs text-emerald-500 font-mono flex items-center gap-1">
                                                        <Tag size={10} className="opacity-70" /> {reg.teamName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <School size={16} className="text-gray-600" />
                                                <span className="truncate max-w-[200px]" title={reg.college}>{reg.college}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "flex items-center gap-2 font-bold px-3 py-1 rounded-full w-fit text-[10px] uppercase",
                                                reg.paymentStatus === 'Paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                <CreditCard size={12} />
                                                {reg.paymentStatus}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar size={16} className="text-gray-600" />
                                                <span>{formatDate(reg.registeredAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "flex items-center gap-2 font-black px-3 py-1 rounded-full w-fit text-[10px] uppercase tracking-tighter",
                                                reg.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                                                    reg.status === 'rejected' ? "bg-red-500/10 text-red-500" :
                                                        "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {reg.status === 'approved' ? <CheckCircle2 size={12} /> :
                                                    reg.status === 'rejected' ? <XCircle size={12} /> :
                                                        <Clock size={12} />}
                                                {reg.status || 'pending'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {updatingId === reg.id ? (
                                                    <Loader2 size={24} className="animate-spin text-emerald-500" />
                                                ) : (
                                                    <>
                                                        {reg.status !== 'approved' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(reg.id, 'approved')}
                                                                className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                                                                title="Approve"
                                                            >
                                                                <Check size={16} strokeWidth={3} />
                                                            </button>
                                                        )}
                                                        {reg.status !== 'rejected' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                                                className="p-2 bg-white/5 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                                title="Reject"
                                                            >
                                                                <X size={16} strokeWidth={3} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {hasMore && (
                        <div className="p-4 border-t border-white/5 flex justify-center mt-6">
                            <button
                                onClick={() => fetchRegistrations(selectedEventId, true)}
                                disabled={loading}
                                className="px-8 py-2.5 bg-[#111] hover:bg-emerald-500/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all border border-white/10 hover:border-emerald-500/50 disabled:opacity-50 flex items-center gap-3 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin text-emerald-500" size={16} />
                                ) : (
                                    <>
                                        <span>Load Sector {totalRegCount - registrations.length}</span>
                                        <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform text-emerald-500" />
                                    </>
                                )}
                            </button>
                        </div>
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
