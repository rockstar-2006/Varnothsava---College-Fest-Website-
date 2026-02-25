'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import {
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    User,
    Mail,
    Phone,
    School,
    Calendar,
    Loader2,
    ArrowUpRight,
    Check,
    X,
    MoreHorizontal,
    Globe,
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

interface Payment {
    id: string;
    user_id: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    userCollege: string;
    amount: number;
    payment_method: string;
    status: string;
    paid_at: string;
    created_at: string;
    notes?: {
        verification_status?: string;
        upi_transaction_id?: string;
        payment_type?: string;
        [key: string]: any;
    };
    payment_method_details?: {
        upi_transaction_id?: string;
        [key: string]: any;
    };
}

interface Event {
    id: string;
    title: string;
}

export default function PaymentsManagementPage() {
    const { userData } = useApp()
    const [payments, setPayments] = useState<Payment[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEventId, setSelectedEventId] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const canVerify = userData?.role === 'SUPER_ADMIN' || userData?.role === 'FINANCE'

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const token = await getAuthToken()
            let url = '/api/admin/payments?'
            if (selectedEventId !== 'all') url += `eventId=${selectedEventId}&`
            if (selectedStatus !== 'all') url += `status=${selectedStatus}`

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setPayments(data.payments)
        } catch (error) {
            console.error("Failed to fetch payments:", error)
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
            if (res.ok) setEvents(data.events)
        } catch (error) {
            console.error("Failed to fetch events:", error)
        }
    }

    useEffect(() => {
        fetchPayments()
        fetchEvents()
    }, [selectedEventId, selectedStatus])

    const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
        setUpdatingId(id)
        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/payments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ verificationStatus: status })
            })

            if (res.ok) {
                setPayments(prev => prev.map(p =>
                    p.id === id ? { ...p, notes: { ...p.notes, verification_status: status } } : p
                ))
            } else {
                const data = await res.json()
                alert(data.message || "Failed to update verification")
            }
        } catch (error) {
            console.error("Error updating verification:", error)
        } finally {
            setUpdatingId(null)
        }
    }

    const filteredPayments = payments.filter(p =>
        p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.notes?.upi_transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.payment_method_details?.upi_transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateStr
        }
    }

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCE', 'COORDINATOR']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Payments Management</h1>
                    <p className="text-gray-400 text-sm">Monitor transactions and verify manual payments</p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111] p-4 rounded-2xl border border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, UTR..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-gray-500" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                        >
                            <option value="all">All Gateway Status</option>
                            <option value="captured">Captured</option>
                            <option value="failed">Failed</option>
                            <option value="authorized">Authorized</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                        >
                            <option value="all">All Participants</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Payment List */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Transaction Details</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method/UTR</th>
                                    <th className="px-6 py-4">Verification</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <span className="text-gray-500 font-medium">Fetching transaction ledger...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                            No transaction signals matching your criteria.
                                        </td>
                                    </tr>
                                ) : filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-mono text-xs text-emerald-500 font-bold">{payment.id}</p>
                                                <div className="flex items-center gap-2 text-gray-400 text-[10px]">
                                                    <Calendar size={12} />
                                                    {formatDate(payment.paid_at || payment.created_at)}
                                                </div>
                                                <div className={cn(
                                                    "w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1",
                                                    payment.status === 'captured' ? "bg-emerald-500 text-black" : "bg-red-500 text-white"
                                                )}>
                                                    {payment.status}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-bold text-white">{payment.userName}</p>
                                                <div className="flex flex-col gap-0.5 text-[10px] text-gray-500 uppercase font-mono">
                                                    <span className="flex items-center gap-1"><School size={10} /> {payment.userCollege}</span>
                                                    <span className="flex items-center gap-1 lowercase text-emerald-500/70"><Mail size={10} /> {payment.userEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-lg font-black text-white">
                                                ₹{(payment.amount / 100).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-white font-medium">
                                                    <CreditCard size={14} className="text-gray-500" />
                                                    <span className="capitalize">{payment.payment_method}</span>
                                                </div>
                                                {(payment.notes?.upi_transaction_id || payment.payment_method_details?.upi_transaction_id) && (
                                                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-emerald-400 w-fit">
                                                        {payment.notes?.upi_transaction_id || payment.payment_method_details?.upi_transaction_id}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "flex items-center gap-2 font-black px-3 py-1 rounded-full w-fit text-[10px] uppercase tracking-tighter",
                                                payment.notes?.verification_status === 'verified' ? "bg-emerald-500/10 text-emerald-500" :
                                                    payment.notes?.verification_status === 'rejected' ? "bg-red-500/10 text-red-500" :
                                                        "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {payment.notes?.verification_status === 'verified' ? <CheckCircle2 size={12} /> :
                                                    payment.notes?.verification_status === 'rejected' ? <XCircle size={12} /> :
                                                        <Clock size={12} />}
                                                {payment.notes?.verification_status?.replace(/_/g, ' ') || (payment.status === 'captured' ? 'Automatic' : 'Pending')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {updatingId === payment.id ? (
                                                    <Loader2 size={24} className="animate-spin text-emerald-500" />
                                                ) : (
                                                    canVerify && payment.notes?.payment_type === 'qr_code' && (
                                                        <>
                                                            {payment.notes?.verification_status !== 'verified' && (
                                                                <button
                                                                    onClick={() => handleVerify(payment.id, 'verified')}
                                                                    className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                                                                    title="Verify Payment"
                                                                >
                                                                    <Check size={16} strokeWidth={3} />
                                                                </button>
                                                            )}
                                                            {payment.notes?.verification_status !== 'rejected' && (
                                                                <button
                                                                    onClick={() => handleVerify(payment.id, 'rejected')}
                                                                    className="p-2 bg-white/5 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                                    title="Reject Payment"
                                                                >
                                                                    <X size={16} strokeWidth={3} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
