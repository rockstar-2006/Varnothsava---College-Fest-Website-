'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    UserPlus,
    Calendar,
    Tag,
    Filter,
    X,
    Check,
    Loader2,
    AlertCircle,
    Zap,
    Music,
    Briefcase,
    Gamepad2,
    Users,
    User,
    RefreshCcw,
    FileSpreadsheet
} from 'lucide-react'
import { fetchAndDownload } from '@/lib/exportUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

interface AdminEvent {
    id: string;
    title: string;
    type: string;
    category?: string;
    date: string;
    time?: string;
    coordinators?: string[]; // IDs
    registrationStatus?: 'open' | 'closed' | 'full';
    fee?: number;
    metrics?: {
        total: number;
        internal: number;
        external: number;
        participants: number;
    };
}

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function EventManagementPage() {
    const { userData, isAdmin, adminCache, updateAdminCache } = useApp()
    const [events, setEvents] = useState<AdminEvent[]>(adminCache.events || [])
    const [staff, setStaff] = useState<StaffMember[]>(adminCache.staff || [])
    const [stats, setStats] = useState<any>(adminCache.stats || null)
    const [loading, setLoading] = useState(!adminCache.events)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [syncingId, setSyncingId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<Partial<AdminEvent>>({
        title: '',
        type: 'Technical',
        category: '',
        date: '',
        time: '',
        coordinators: [],
        registrationStatus: 'open',
        fee: 0
    })

    const isSuperAdmin = userData?.role === 'SUPER_ADMIN'

    const fetchStats = async (force = false) => {
        try {
            const token = await getAuthToken()
            const url = force ? '/api/admin/stats?force=1' : '/api/admin/stats'
            const sRes = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const sData = await sRes.json()
            if (sRes.ok && sData?.stats) {
                setStats(sData.stats)
                updateAdminCache('stats', sData.stats)
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error)
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
                updateAdminCache('eventRegMap', {})
            }
        } catch (error) {
            console.error("Failed to fetch events:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSingleEvent = async (id: string) => {
        setSyncingId(id)
        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/events/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setEvents(prev => {
                    const updated = prev.map(e => e.id === id ? { ...e, ...data.event } : e);
                    // Defer cache update to avoid setState-in-render error
                    setTimeout(() => updateAdminCache('events', updated), 0);
                    return updated;
                });
            }
        } catch (error) {
            console.error(`Failed to sync event ${id}:`, error)
        } finally {
            setSyncingId(null)
        }
    }

    const fetchStaff = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setStaff(data.users)
                updateAdminCache('staff', data.users)
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error)
        }
    }

    const isInitialMount = useRef(true)

    // Only fetch automatically if cache is empty
    useEffect(() => {
        if (isInitialMount.current) {
            if (!adminCache.events || adminCache.events.length === 0) {
                fetchEvents()
            }
            if (!adminCache.stats) {
                fetchStats(false)
            }
            if (!adminCache.staff || adminCache.staff.length === 0) {
                fetchStaff()
            }
            isInitialMount.current = false
        }
    }, [])

    const handleOpenModal = (event: AdminEvent | null = null) => {
        if (event) {
            setEditingEvent(event)
            setFormData(event)
        } else {
            setEditingEvent(null)
            setFormData({
                title: '',
                type: 'Technical',
                category: '',
                date: '',
                time: '',
                coordinators: [],
                registrationStatus: 'open',
                fee: 0
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const token = await getAuthToken()
            const url = editingEvent
                ? `/api/admin/events/${editingEvent.id}`
                : '/api/admin/events'
            const method = editingEvent ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ event: formData })
            })

            if (res.ok) {
                setIsModalOpen(false)
                fetchEvents()
            } else {
                const data = await res.json()
                alert(data.message || "Failed to save event")
            }
        } catch (error) {
            console.error("Error saving event:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return
        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) fetchEvents()
        } catch (error) {
            console.error("Error deleting event:", error)
        }
    }

    const toggleCoordinator = (userId: string) => {
        const current = formData.coordinators || []
        if (current.includes(userId)) {
            setFormData({ ...formData, coordinators: current.filter(id => id !== userId) })
        } else {
            setFormData({ ...formData, coordinators: [...current, userId] })
        }
    }

    const [showRegistrations, setShowRegistrations] = useState(false)
    const [selectedEventForReg, setSelectedEventForReg] = useState<AdminEvent | null>(null)
    const [eventRegs, setEventRegs] = useState<any[]>([])
    const [eventRegsTotalCount, setEventRegsTotalCount] = useState(0)
    const [eventRegsHasMore, setEventRegsHasMore] = useState(false)
    const [eventRegsLastId, setEventRegsLastId] = useState<string | null>(null)
    const [loadingRegs, setLoadingRegs] = useState(false)
    const [eventSearchQuery, setEventSearchQuery] = useState('')
    const lastEventModalSearchRef = useRef<string>('')

    const fetchEventRegistrations = async (eventId: string, searchInput?: string, forceRefresh: boolean = false, isLoadMore: boolean = false) => {
        // Cache Check (only for initial load, not load-more)
        if (!forceRefresh && !searchInput && !isLoadMore && adminCache.eventRegMap?.[eventId]) {
            const cached = adminCache.eventRegMap[eventId] as any;
            const cachedRegs = cached.regs || cached;
            setEventRegs(Array.isArray(cachedRegs) ? cachedRegs : []);
            setEventRegsTotalCount(cached.totalCount || cachedRegs.length || 0);
            setEventRegsHasMore(cached.hasMore || false);
            setEventRegsLastId(cached.lastId || null);
            return;
        }

        setLoadingRegs(true)
        try {
            const token = await getAuthToken()
            const currentLastId = isLoadMore ? eventRegsLastId : '';
            let url = `/api/admin/registrations?eventId=${eventId}&limit=50`
            if (currentLastId) url += `&lastId=${currentLastId}`
            if (searchInput) url += `&search=${encodeURIComponent(searchInput)}`
            if (isLoadMore) url += `&skipCounts=1`

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
            })
            const data = await res.json()
            if (res.ok) {
                const newRegs = isLoadMore ? [...eventRegs, ...data.registrations] : data.registrations;
                lastEventModalSearchRef.current = searchInput || ''
                setEventRegs(newRegs)
                if (typeof data.totalCount === 'number') {
                    setEventRegsTotalCount(data.totalCount)
                } else if (!isLoadMore) {
                    setEventRegsTotalCount(newRegs.length)
                }
                setEventRegsHasMore(data.hasMore || false)
                setEventRegsLastId(data.lastId || null)

                // Update Cache if not a search
                if (!searchInput) {
                    const currentMap = (adminCache.eventRegMap || {}) as Record<string, any>;
                    updateAdminCache('eventRegMap', {
                        ...currentMap,
                        [eventId]: {
                            regs: newRegs,
                            totalCount: typeof data.totalCount === 'number' ? data.totalCount : (currentMap[eventId]?.totalCount || newRegs.length),
                            hasMore: data.hasMore,
                            lastId: data.lastId
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch registrations:", error)
        } finally {
            setLoadingRegs(false)
        }
    }

    // Debounced search for event participant modal
    useEffect(() => {
        if (showRegistrations && selectedEventForReg) {
            const normalizedSearch = eventSearchQuery.trim()
            if (lastEventModalSearchRef.current === normalizedSearch) return

            const timer = setTimeout(() => {
                fetchEventRegistrations(selectedEventForReg.id, normalizedSearch)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [eventSearchQuery, showRegistrations])

    const handleViewRegistrations = (event: AdminEvent) => {
        setSelectedEventForReg(event)
        setShowRegistrations(true)
        setEventSearchQuery('')
        lastEventModalSearchRef.current = ''
        setEventRegs([])
        setEventRegsTotalCount(0)
        setEventRegsHasMore(false)
        setEventRegsLastId(null)
        fetchEventRegistrations(event.id, '', false, false)
    }

    const categories = ['All', 'Technical', 'Cultural', 'Business', 'Gaming']
    const [activeTab, setActiveTab] = useState('All')

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeTab === 'All' ||
            event.type?.toLowerCase() === activeTab.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Technical': return <Zap size={18} className="text-blue-400" />;
            case 'Cultural': return <Music size={18} className="text-purple-400" />;
            case 'Business': return <Briefcase size={18} className="text-emerald-400" />;
            case 'Gaming': return <Gamepad2 size={18} className="text-amber-400" />;
            default: return <Tag size={18} className="text-gray-400" />;
        }
    }

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR']}>
            <div className="space-y-8 pb-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter">
                            EVENT <span className="text-emerald-500">DASHBOARD</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {events.length} Total Competitions
                            </p>
                            <p className="text-emerald-500/80 text-xs font-bold uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                {events.reduce((acc, curr) => acc + (curr.metrics?.total || 0), 0)} Total Registrations
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                        <button
                            onClick={() => {
                                setLoading(true)
                                fetchEvents()
                                fetchStaff()
                                fetchStats(false)
                            }}
                            className="bg-[#111] border border-white/10 hover:border-emerald-500/50 text-white px-5 py-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-xl h-11"
                        >
                            <RefreshCcw size={18} className={cn("text-emerald-500 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-none mb-1">Live Feed</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-white leading-none">Sync Events</p>
                            </div>
                        </button>

                        {isSuperAdmin && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase text-[10px] h-11 tracking-widest"
                            >
                                <Plus size={18} />
                                Create Event
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Overview Panel */}
                <AnimatePresence>
                    {stats && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* Category Breakdown */}
                            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" /> Category Breakdown
                                </h3>

                                <div className="space-y-6">
                                    {['technical', 'cultural'].map(cat => {
                                        const catData = stats.categoryBreakdown?.[cat] || { totalParticipants: 0, internal: 0, external: 0 };
                                        const total = catData.totalParticipants || 1;
                                        const intPer = (catData.internal / total) * 100;
                                        const extPer = (catData.external / total) * 100;

                                        return (
                                            <div key={cat} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs font-black uppercase text-white italic">{cat}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">{catData.totalParticipants} People</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${intPer}%` }}
                                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                    />
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${extPer}%` }}
                                                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                                    <span className="text-emerald-500">Internal {Math.round(intPer)}%</span>
                                                    <span className="text-blue-500">External {Math.round(extPer)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* External Participation (Deduplicated) */}
                            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-blue-500" /> Footfall Metrics
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unique External Participants</p>
                                            <h4 className="text-4xl font-black text-white italic leading-none">
                                                {stats.uniqueExternalParticipantsAcrossEvents || 0}
                                                <span className="text-xs not-italic text-blue-500 ml-2 uppercase font-black">Verified Individual Souls</span>
                                            </h4>
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">External Reach</span>
                                                <span className="text-[10px] font-black text-white italic">
                                                    {Math.round(((stats.uniqueExternalParticipantsAcrossEvents || 0) / (stats.totalUsers || 1)) * 100)}% of Database
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${((stats.uniqueExternalParticipantsAcrossEvents || 0) / (stats.totalUsers || 1)) * 100}%` }}
                                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Decorative Element */}
                                <Users size={120} className="absolute -bottom-6 -right-6 text-white/[0.02] -rotate-12 transition-transform group-hover:rotate-0" />
                            </div>

                            {/* College Distribution */}
                            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-500" /> Geographic Spread
                                </h3>

                                <div className="space-y-3 overflow-y-auto max-h-40 no-scrollbar pr-2 custom-scrollbar">
                                    {(stats.collegeDistribution || []).map((col: any, i: number) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-white truncate max-w-[150px]">{col.name}</span>
                                                <span className="font-black text-amber-500">{col.count}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(col.count / (stats.totalParticipants || 1)) * 100}%` }}
                                                    className="h-full bg-amber-500/50"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {(!stats.collegeDistribution || stats.collegeDistribution.length === 0) && (
                                        <div className="text-center py-8 text-gray-600 italic text-[10px]">No geographic data synced</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search & Category Tabs */}
                <div className="space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find event by title or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === cat
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                    : 'bg-[#111] text-gray-500 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {cat === 'All' ? <Zap size={18} className="text-emerald-400" /> : getCategoryIcon(cat)}
                                {cat}
                                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === cat ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-500'
                                    }`}>
                                    {cat === 'All' ? events.length : events.filter(e => e.type === cat).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event Grid View (Categorized) */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="py-20 text-center bg-[#111] rounded-3xl border border-white/5">
                        <Calendar size={48} className="mx-auto text-white/10 mb-4" />
                        <h3 className="text-white font-bold text-lg">No competitions found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto text-sm mt-2">Try adjusting your filters or search terms to find specific events.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEvents.map((event) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={event.id}
                                onClick={() => handleViewRegistrations(event)}
                                className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all group relative overflow-hidden flex flex-col cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => fetchSingleEvent(event.id)}
                                        disabled={syncingId === event.id}
                                        className="p-2 bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 rounded-lg backdrop-blur-md"
                                        title="Sync this event only"
                                    >
                                        <RefreshCcw size={14} className={cn(syncingId === event.id && "animate-spin")} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(event); }} className="p-2 bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 rounded-lg backdrop-blur-md">
                                        <Edit2 size={14} />
                                    </button>
                                    {isSuperAdmin && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }} className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg backdrop-blur-md">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                            event.registrationStatus === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                        )}>
                                            {event.registrationStatus}
                                        </span>
                                        {event.category && (
                                            <span className="bg-white/5 text-[8px] text-gray-500 font-bold uppercase px-2 py-0.5 rounded-full border border-white/5">
                                                {event.category}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-white font-black text-xl leading-tight group-hover:text-emerald-400 transition-colors uppercase italic mb-4">{event.title}</h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/2 p-2 rounded-xl border border-white/5">
                                            <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mb-1">Schedule</p>
                                            <div className="flex items-center gap-1.5 text-[9px] text-gray-300 font-medium">
                                                <Calendar size={10} className="text-emerald-500/50" />
                                                {event.date || 'TBA'}
                                            </div>
                                        </div>
                                        <div className="bg-white/2 p-2 rounded-xl border border-white/5">
                                            <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mb-1">Entry Fee</p>
                                            <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black">
                                                <Tag size={10} className="text-emerald-500/50" />
                                                ₹{event.fee || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Section */}
                                <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Team Composition</span>
                                            <span className="text-2xl font-black text-white italic -mt-1">
                                                {event.metrics?.total || 0} <span className="text-[10px] text-gray-600 not-italic uppercase tracking-tighter">Squads</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest text-emerald-500/50">Total Forces</span>
                                            <span className="text-lg font-black text-emerald-500 italic -mt-1">
                                                {event.metrics?.participants || 0} <span className="text-[10px] text-emerald-900 not-italic uppercase tracking-tighter">People</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/2 p-2 rounded-lg border border-white/5">
                                        <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Demographics</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[9px] font-black text-emerald-400">{event.metrics?.internal || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="text-[9px] font-black text-blue-400">{event.metrics?.external || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((event.metrics?.internal || 0) / (event.metrics?.total || 1)) * 100}%` }}
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                        />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((event.metrics?.external || 0) / (event.metrics?.total || 1)) * 100}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                            >
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">
                                        {editingEvent ? 'Edit Event' : 'Create New Event'}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Event Title</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                                                placeholder="Algorithm Roulette"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                                            >
                                                <option value="Technical">Technical</option>
                                                <option value="Cultural">Cultural</option>
                                                <option value="Gaming">Gaming</option>
                                                <option value="Business">Business</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Category</label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                                                placeholder="AI/ML"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Reg. Fee (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.fee}
                                                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Date</label>
                                            <input
                                                type="text"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                                                placeholder="11-MARCH"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Status</label>
                                            <select
                                                value={formData.registrationStatus}
                                                onChange={(e) => setFormData({ ...formData, registrationStatus: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                                            >
                                                <option value="open">Open</option>
                                                <option value="closed">Closed</option>
                                                <option value="full">Full</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-400 block flex items-center gap-2">
                                            <UserPlus size={16} /> Assign Coordinators
                                        </label>
                                        <div className="max-h-40 overflow-y-auto bg-white/5 rounded-xl border border-white/10 p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {staff.length === 0 ? (
                                                <p className="col-span-2 text-center py-4 text-gray-500 text-xs italic">No eligible staff found</p>
                                            ) : staff.map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => toggleCoordinator(user.id)}
                                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${formData.coordinators?.includes(user.id)
                                                        ? 'bg-emerald-500/20 border-emerald-500/50'
                                                        : 'hover:bg-white/5 border-transparent'
                                                        } border text-xs`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium">{user.name}</span>
                                                        <span className="text-gray-500 text-[10px] uppercase font-mono">{user.role?.replace('_', ' ') || 'USER'}</span>
                                                    </div>
                                                    {formData.coordinators?.includes(user.id) && (
                                                        <Check size={14} className="text-emerald-500" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-6 py-2 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : editingEvent ? 'Update Event' : 'Create Event'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* Participants Detail Modal */}
                <AnimatePresence>
                    {showRegistrations && selectedEventForReg && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowRegistrations(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center bg-gradient-to-r from-emerald-500/5 to-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase tracking-tight">
                                                {selectedEventForReg.title} <span className="text-emerald-500">ROSTER</span>
                                            </h2>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                                {eventRegsTotalCount} Teams Registered • {selectedEventForReg.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-4">
                                        {userData?.role === 'SUPER_ADMIN' && (
                                            <button
                                                onClick={() => fetchAndDownload('registrations', `Roster_${selectedEventForReg.title}`, getAuthToken, { eventId: selectedEventForReg.id })}
                                                className="p-2 md:px-4 md:py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all flex items-center gap-2 group"
                                                title="Download Roster (Excel)"
                                            >
                                                <FileSpreadsheet size={18} className="transition-transform group-hover:scale-110" />
                                                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Export</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => fetchEventRegistrations(selectedEventForReg.id, '', true, false)}
                                            disabled={loadingRegs}
                                            className="p-2 md:px-4 md:py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all flex items-center gap-2 group"
                                            title="Sync Participant Data"
                                        >
                                            <RefreshCcw size={18} className={cn("transition-transform group-hover:rotate-180", loadingRegs && "animate-spin")} />
                                            <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Sync</span>
                                        </button>
                                        <button
                                            onClick={() => setShowRegistrations(false)}
                                            className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Search & Stats */}
                                <div className="px-6 py-4 bg-white/2 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                                    <div className="relative w-full md:max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search teams or leaders..."
                                            value={eventSearchQuery}
                                            onChange={(e) => setEventSearchQuery(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/30"
                                        />
                                        {loadingRegs && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" />}
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center px-4 py-1 border-r border-white/5">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Paid</span>
                                            <span className="text-sm font-black text-emerald-500">{eventRegs.filter(r => r.paymentStatus === 'Paid').length}</span>
                                        </div>
                                        <div className="flex flex-col items-center px-4 py-1 border-r border-white/5">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Internal</span>
                                            <span className="text-sm font-black text-blue-400">{eventRegs.filter(r => r.studentType === 'internal').length}</span>
                                        </div>
                                        <div className="flex flex-col items-center px-4 py-1">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Showing</span>
                                            <span className="text-sm font-black text-white">{eventRegs.length} / {eventRegsTotalCount}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Participants List */}
                                <div className="flex-1 overflow-y-auto p-6 no-scrollbar custom-scrollbar">
                                    {loadingRegs ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="animate-spin text-emerald-500" size={40} />
                                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Accessing Registration Database...</p>
                                        </div>
                                    ) : eventRegs.length === 0 ? (
                                        <div className="text-center py-20 opacity-30">
                                            <Users size={64} className="mx-auto mb-4" />
                                            <p className="font-bold">No participants registered yet</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {eventRegs.map((reg, idx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        key={reg.id}
                                                        className="p-4 bg-white/2 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group reg-card"
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 border border-white/5">
                                                                    {reg.eventType === 'SOLO' ? <User size={20} /> : <Users size={20} />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold leading-none">{reg.teamName || reg.leaderName}</h4>
                                                                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">Leader: {reg.leaderName}</p>
                                                                </div>
                                                            </div>
                                                            <span className={cn(
                                                                "text-[8px] font-black px-2 py-0.5 rounded shadow-sm border",
                                                                reg.studentType === 'internal'
                                                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                            )}>
                                                                {reg.studentType === 'internal' ? 'INTERNAL' : 'EXTERNAL'}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4 mb-4">
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span className="font-medium truncate">{reg.college}</span>
                                                            </div>

                                                            {reg.membersDetails && reg.membersDetails.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest px-2">Squad Members</p>
                                                                    <div className="bg-white/1 rounded-xl p-3 border border-white/5 space-y-2">
                                                                        {reg.membersDetails.map((m: any, i: number) => (
                                                                            <div key={i} className="text-[10px] text-gray-300 flex justify-between items-center bg-white/2 px-2 py-1.5 rounded-md">
                                                                                <span className="font-bold uppercase tracking-tight">{m.name}</span>
                                                                                <span className="font-mono text-emerald-500/40 text-[9px]">{m.usn}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                                            <div className={cn(
                                                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1",
                                                                reg.paymentStatus === 'Paid' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"
                                                            )}>
                                                                {reg.paymentStatus === 'Paid' ? <Check size={10} /> : <X size={10} />}
                                                                {reg.paymentStatus}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[9px] text-gray-600 font-mono">#{reg.id.substring(0, 6)}</p>
                                                                <button className="p-1 hover:text-white text-gray-700 transition-colors">
                                                                    <Edit2 size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            {eventRegsHasMore && (
                                                <div className="flex justify-center mt-6">
                                                    <button
                                                        onClick={() => fetchEventRegistrations(selectedEventForReg!.id, eventSearchQuery || '', false, true)}
                                                        disabled={loadingRegs}
                                                        className="px-6 py-2.5 bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-500 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 hover:border-emerald-500/30 disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {loadingRegs ? <Loader2 className="animate-spin" size={14} /> : <>Load More ({eventRegsTotalCount - eventRegs.length} remaining)</>}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    )
}
