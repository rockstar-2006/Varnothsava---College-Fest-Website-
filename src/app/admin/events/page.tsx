'use client'

import { useState, useEffect } from 'react'
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
    AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
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
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function EventManagementPage() {
    const { userData, isAdmin } = useApp()
    const [events, setEvents] = useState<AdminEvent[]>([])
    const [staff, setStaff] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const fetchEvents = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setEvents(data.events)
        } catch (error) {
            console.error("Failed to fetch events:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStaff = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setStaff(data.users)
        } catch (error) {
            console.error("Failed to fetch staff:", error)
        }
    }

    useEffect(() => {
        fetchEvents()
        fetchStaff()
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

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR']}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Event Management</h1>
                        <p className="text-gray-400 text-sm">Create, edit and manage fest events</p>
                    </div>

                    {isSuperAdmin && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all"
                        >
                            <Plus size={20} />
                            Add Event
                        </button>
                    )}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#111] p-4 rounded-2xl border border-white/5">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search events by title or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50">
                            <option value="all">All Types</option>
                            <option value="Technical">Technical</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>
                </div>

                {/* Event List */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Event Details</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Coordinators</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center">
                                            <div className="flex justify-center flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-emerald-500" size={24} />
                                                <span className="text-gray-500">Loading events...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            No events found
                                        </td>
                                    </tr>
                                ) : filteredEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-white">{event.title}</p>
                                                <p className="text-xs text-emerald-500/70 font-mono">{event.type}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-300">{event.category || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="text-white flex items-center gap-1">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    {event.date}
                                                </p>
                                                <p className="text-gray-400 text-xs ml-5">{event.time || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${event.registrationStatus === 'open' ? 'bg-emerald-500/10 text-emerald-500' :
                                                event.registrationStatus === 'closed' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {event.registrationStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2">
                                                {event.coordinators && event.coordinators.length > 0 ? (
                                                    event.coordinators.map(coordId => {
                                                        const u = staff.find(s => s.id === coordId)
                                                        return (
                                                            <div key={coordId} title={u?.name || 'Unknown'} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#111] flex items-center justify-center text-[10px] text-white">
                                                                {u?.name ? u.name[0].toUpperCase() : '?'}
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <span className="text-xs text-gray-600 italic">None assigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(event)}
                                                    className="p-2 bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(event.id)}
                                                        className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
            </div>
        </ProtectedRoute>
    )
}
