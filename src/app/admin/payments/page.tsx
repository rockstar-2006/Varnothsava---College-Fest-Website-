'use client'

import { useState, useEffect, useRef } from 'react'
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
    Zap,
    Building2,
    Trash2,
    RefreshCcw,
    FileSpreadsheet
} from 'lucide-react'
import { fetchAndDownload } from '@/lib/exportUtils'
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
    studentType?: 'internal' | 'external';
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
    const { userData, adminCache, updateAdminCache } = useApp()
    const [payments, setPayments] = useState<Payment[]>(adminCache.payments || [])
    const [events, setEvents] = useState<Event[]>(adminCache.events || [])
    const [loading, setLoading] = useState(!adminCache.payments)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [selectedEventId, setSelectedEventId] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedType, setSelectedType] = useState<'all' | 'internal' | 'external'>('all')
    const [isDeleting, setIsDeleting] = useState(false)
    const [visibleCount, setVisibleCount] = useState(20)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [totalPaidPeople, setTotalPaidPeople] = useState<number | null>(adminCache.totalVerifiedPayments || null)
    const [loadingTotal, setLoadingTotal] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [totalPaymentsCount, setTotalPaymentsCount] = useState(adminCache.totalPaymentsCount || 0)
    const [totalRevenue, setTotalRevenue] = useState<number | null>(adminCache.totalRevenue || null)
    const [lastId, setLastId] = useState<string | null>(null)

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const toggleSelectAll = (filteredPayments: Payment[]) => {
        if (selectedIds.length === filteredPayments.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredPayments.map(p => p.id))
        }
    }

    const canVerify = userData?.role === 'SUPER_ADMIN' || userData?.role === 'FINANCE'

    const fetchPayments = async (isLoadMore = false) => {
        setLoading(true)
        try {
            const token = await getAuthToken()
            const currentLastId = isLoadMore ? lastId : '';
            let url = `/api/admin/payments?lastId=${currentLastId}&limit=20&search=${encodeURIComponent(searchQuery)}&_t=${Date.now()}`
            if (selectedEventId !== 'all') url += `&eventId=${selectedEventId}`
            if (selectedStatus !== 'all') url += `&status=${selectedStatus}`

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            })
            const data = await res.json()
            if (res.ok) {
                const newPayments = isLoadMore ? [...payments, ...data.payments] : data.payments;
                setPayments(newPayments)
                setHasMore(data.hasMore)
                setLastId(data.lastId)
                setTotalPaymentsCount(data.totalCount)
                updateAdminCache('payments', newPayments)
                updateAdminCache('totalPaymentsCount', data.totalCount)
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchTotalAmount = async () => {
        setLoadingTotal(true)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/payments/total', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setTotalPaidPeople(data.totalPayments)
                setTotalRevenue(data.totalAmount)
                setTotalPaymentsCount(data.transactionCount)

                updateAdminCache('totalVerifiedPayments', data.totalPayments)
                updateAdminCache('totalRevenue', data.totalAmount)
                updateAdminCache('totalPaymentsCount', data.transactionCount)
            }
        } catch (error) {
            console.error("Failed to fetch total amount:", error)
        } finally {
            setLoadingTotal(false)
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

    // Fetch on filter change
    useEffect(() => {
        if (payments.length === 0 || selectedStatus !== 'all' || selectedEventId !== 'all') {
            fetchPayments(false)
        }
    }, [selectedStatus, selectedEventId, selectedType])

    // Fetch on search with debounce
    useEffect(() => {
        if (!searchQuery && payments.length > 0) return;
        const timer = setTimeout(() => {
            fetchPayments(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

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
    const handleDeletePayment = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payment record? It will reset the user's paid status in the database.")) {
            return;
        }

        setUpdatingId(id)
        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/payments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                setPayments(prev => prev.filter(p => p.id !== id))
            } else {
                const data = await res.json()
                alert(data.message || "Failed to delete payment")
            }
        } catch (error) {
            console.error("Error deleting payment:", error)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} payments? This will reset the daily status for these users.`)) return;

        setLoading(true)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/payments', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ paymentIds: selectedIds })
            })
            if (res.ok) {
                setPayments(prev => prev.filter(p => !selectedIds.includes(p.id)))
                setSelectedIds([])
            } else {
                const data = await res.json()
                alert(data.message || "Bulk delete failed")
            }
        } catch (error) {
            console.error("Bulk delete error:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.notes?.upi_transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.payment_method_details?.upi_transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType === 'all' || p.studentType === selectedType;

        return matchesSearch && matchesType;
    })

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

    const validPayments = payments.filter(p => p.status === 'captured' || p.notes?.verification_status === 'verified')
    const uniquePaidUsers = Array.from(new Set(validPayments.map(p => p.user_id)))

    const stats = {
        totalRevenue: validPayments.reduce((acc, p) => acc + (p.amount / 100), 0),

        // Accurate counts based on unique Users, not Transactions
        totalInternal: Array.from(new Set(validPayments.filter(p => p.studentType === 'internal').map(p => p.user_id))).length,
        totalExternal: Array.from(new Set(validPayments.filter(p => p.studentType === 'external').map(p => p.user_id))).length,

        internalRevenue: validPayments.filter(p => p.studentType === 'internal').reduce((acc, p) => acc + (p.amount / 100), 0),
        externalRevenue: validPayments.filter(p => p.studentType === 'external').reduce((acc, p) => acc + (p.amount / 100), 0),
    }

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCE', 'COORDINATOR']}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Payments Management</h1>
                        <p className="text-gray-400 text-sm">Monitor {totalPaymentsCount} captured payment logs and verify manual transactions</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <AnimatePresence>
                            {selectedIds.length > 0 && userData?.role === 'SUPER_ADMIN' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full"
                                >
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedIds.length} Payments Selected</span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full hover:bg-red-600 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={10} /> Delete Selected
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3">
                            <AnimatePresence>
                                {totalPaidPeople !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-4"
                                    >
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-tighter text-blue-500 leading-none mb-1">Total Revenue</p>
                                            <p className="text-sm font-black text-white italic">₹{totalRevenue?.toLocaleString()}</p>
                                        </div>
                                        <div className="border-l border-white/10 pl-4">
                                            <p className="text-[8px] font-black uppercase tracking-tighter text-blue-500 leading-none mb-1">Participants</p>
                                            <p className="text-sm font-black text-white italic">{totalPaidPeople}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {(userData?.role === 'SUPER_ADMIN' || userData?.role === 'FINANCE') && (
                                <button
                                    onClick={fetchTotalAmount}
                                    disabled={loadingTotal}
                                    className="bg-[#111] border border-white/10 hover:border-blue-500/50 text-white px-5 py-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-xl h-[46px]"
                                >
                                    <CreditCard size={18} className={cn("text-blue-500 transition-transform group-hover:scale-110", loadingTotal && "animate-spin")} />
                                    <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-none mb-1">Financial Check</p>
                                        <p className="text-xs font-bold uppercase tracking-widest text-white leading-none">Check Total</p>
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => fetchPayments(false)}
                                className="bg-[#111] border border-white/10 hover:border-emerald-500/50 text-white px-5 py-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-xl h-[46px]"
                            >
                                <RefreshCcw size={18} className={cn("text-emerald-500 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-none mb-1">Live Ledger</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white leading-none">Sync Payments</p>
                                </div>
                            </button>

                            {userData?.role === 'SUPER_ADMIN' && (
                                <button
                                    onClick={() => fetchAndDownload('payments', `Payments_${selectedStatus}_${selectedEventId}`, getAuthToken, { eventId: selectedEventId, status: selectedStatus })}
                                    className="bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 text-blue-500 px-5 py-2.5 rounded-xl transition-all group flex items-center gap-3 shadow-xl h-[46px]"
                                    title="Download Filtered Report (Excel)"
                                >
                                    <FileSpreadsheet size={18} className="transition-transform group-hover:scale-110" />
                                    <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-blue-500/50 leading-none mb-1">Reports</p>
                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-500 leading-none font-mono">EXPORT</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#111] p-4 rounded-2xl border border-white/5">
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
                        <School size={18} className="text-gray-500" />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as any)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm font-semibold"
                        >
                            <option value="all">All Participants</option>
                            <option value="internal" className="text-blue-400">Internal (SMVITM)</option>
                            <option value="external" className="text-purple-400">External Students</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                        >
                            <option value="all">All Events</option>
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
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredPayments.length && filteredPayments.length > 0}
                                            onChange={() => toggleSelectAll(filteredPayments)}
                                            className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </th>
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
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-500" size={24} />
                                                <span className="text-gray-500 font-medium">Fetching transaction ledger...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                            No transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : filteredPayments.slice(0, payments.length).map((payment) => (
                                    <tr key={payment.id} className={cn(
                                        "hover:bg-white/2 transition-colors group",
                                        selectedIds.includes(payment.id) && "bg-white/5"
                                    )}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(payment.id)}
                                                onChange={() => toggleSelect(payment.id)}
                                                className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                            />
                                        </td>
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

                                                {/* Super Admin Delete Option */}
                                                {userData?.role === 'SUPER_ADMIN' && updatingId !== payment.id && (
                                                    <button
                                                        onClick={() => handleDeletePayment(payment.id)}
                                                        className="p-2 text-gray-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-transparent hover:border-red-500"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {(hasMore || filteredPayments.length < totalPaymentsCount) && (
                        <div className="p-4 border-t border-white/5 flex justify-center">
                            <button
                                onClick={() => fetchPayments(true)}
                                disabled={loading}
                                className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10 hover:border-emerald-500/50 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin text-emerald-500" size={16} /> : `Show More Payments (${totalPaymentsCount - payments.length} remaining)`}
                            </button>
                        </div>
                    )}
                </div>
            </div >
        </ProtectedRoute >
    )
}
