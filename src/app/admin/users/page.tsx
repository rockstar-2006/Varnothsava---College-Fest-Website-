'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/context/AppContext'
import {
    Search,
    User,
    Mail,
    Fingerprint,
    Building2,
    CheckCircle,
    XCircle,
    Ban,
    Loader2,
    Shield,
    MoreHorizontal,
    Trash2,
    RefreshCcw,
    CreditCard,
    FileSpreadsheet,
    Phone
} from 'lucide-react'
import { fetchAndDownload } from '@/lib/exportUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

interface UserData {
    id: string;
    name: string;
    email: string;
    usn?: string;
    college?: string;
    phone?: string;
    role: string;
    hasPaid?: boolean;
    isBlocked?: boolean;
    studentType?: 'internal' | 'external';
}

export default function UserManagementPage() {
    const { userData, adminCache, updateAdminCache } = useApp()
    const [users, setUsers] = useState<UserData[]>(adminCache.users || [])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [loading, setLoading] = useState(!adminCache.users)
    const [searchQuery, setSearchQuery] = useState('')
    const [updatingField, setUpdatingField] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [visibleCount, setVisibleCount] = useState(20)
    const [totalPaidCount, setTotalPaidCount] = useState<number | null>(adminCache.totalVerifiedPayments || null)
    const [loadingTotal, setLoadingTotal] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [totalUsersCount, setTotalUsersCount] = useState(adminCache.totalUsersCount || 0)
    const [paidUsersCount, setPaidUsersCount] = useState(adminCache.paidUsersCount || 0)
    const [unpaidUsersCount, setUnpaidUsersCount] = useState(adminCache.unpaidUsersCount || 0)
    const [internalUsersCount, setInternalUsersCount] = useState(adminCache.internalUsersCount || 0)
    const [externalUsersCount, setExternalUsersCount] = useState(adminCache.externalUsersCount || 0)
    const [lastId, setLastId] = useState<string | null>(null)

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const toggleSelectAll = (filteredUsers: any[]) => {
        if (selectedIds.length === filteredUsers.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredUsers.map(u => u.id))
        }
    }
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid' | 'internal' | 'external'>('all')

    const fetchUsers = async (isLoadMore = false) => {
        try {
            setLoading(true)
            const token = await getAuthToken()

            const currentLastId = isLoadMore ? lastId : '';
            const res = await fetch(`/api/admin/all-users?search=${searchQuery}&lastId=${currentLastId}&limit=20&status=${paymentFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                const newUsers = isLoadMore ? [...users, ...data.users] : data.users;
                setUsers(newUsers)
                setHasMore(data.hasMore)
                setLastId(data.lastId)
                setTotalUsersCount(data.totalCount)
                setPaidUsersCount(data.paidCount)
                setUnpaidUsersCount(data.unpaidCount)
                setInternalUsersCount(data.internalCount)
                setExternalUsersCount(data.externalCount)
                updateAdminCache('users', newUsers)
                updateAdminCache('totalUsersCount', data.totalCount)
                updateAdminCache('paidUsersCount', data.paidCount)
                updateAdminCache('unpaidUsersCount', data.unpaidCount)
                updateAdminCache('internalUsersCount', data.internalCount)
                updateAdminCache('externalUsersCount', data.externalCount)

                // Refresh global stats too
                const sRes = await fetch(`/api/admin/stats?_t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (sRes.ok) {
                    const sData = await sRes.json();
                    updateAdminCache('stats', sData.stats);
                }
            }
        } catch (error) {
            console.error("Failed to fetch users:", error)
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
                setTotalPaidCount(data.totalPayments)
                updateAdminCache('totalVerifiedPayments', data.totalPayments)
            }
        } catch (error) {
            console.error("Failed to fetch total amount:", error)
        } finally {
            setLoadingTotal(false)
        }
    }

    const isInitialMount = useRef(true)

    // Sync button is now the only trigger for fresh directory data
    // Fetch on filter change
    useEffect(() => {
        // Skip initial fetch if cache is already present
        if (isInitialMount.current && adminCache.users) {
            isInitialMount.current = false;
            return;
        }
        fetchUsers(false)
        isInitialMount.current = false;
    }, [paymentFilter])

    // Fetch on search with debounce
    useEffect(() => {
        if (isInitialMount.current) return;
        const timer = setTimeout(() => {
            fetchUsers(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])



    const handleUpdateField = async (userId: string, field: string, value: any) => {
        setIsUpdating(`${userId}-${field}`)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/all-users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, updates: { [field]: value } })
            })
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u))
            }
        } catch (error) {
            console.error(`Update ${field} failed:`, error)
        } finally {
            setIsUpdating(null)
        }
    }
    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you absolutely sure you want to delete ${userName}? This will remove their registration and payment records permanently.`)) {
            return;
        }

        setIsUpdating(userId)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/all-users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            })
            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId))
            } else {
                const data = await res.json()
                alert(data.message || "Failed to delete user")
            }
        } catch (error) {
            console.error("Delete user failed:", error)
        } finally {
            setIsUpdating(null)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} users permanently?`)) return;

        setLoading(true)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/all-users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userIds: selectedIds })
            })
            if (res.ok) {
                setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)))
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

    const filteredUsers = users.filter(u => {
        if (u.role === 'SUPER_ADMIN') return false;
        return true;
    })

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCE']}>
            <div className="space-y-6">
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
                            USER <span className="text-emerald-500">DIRECTORY</span>
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint size={14} className="text-emerald-500/50" />
                            {paymentFilter === 'all' && `${totalUsersCount} registered users`}
                            {paymentFilter === 'paid' && `${paidUsersCount} verified paid`}
                            {paymentFilter === 'unpaid' && `${unpaidUsersCount} pending`}
                            {paymentFilter === 'internal' && `Internal SODE students`}
                            {paymentFilter === 'external' && `External participants`}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <AnimatePresence>
                            {totalPaidCount !== null && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl"
                                >
                                    <p className="text-[8px] font-black uppercase tracking-tighter text-blue-500 leading-none mb-0.5">People Paid</p>
                                    <p className="text-sm font-black text-white italic">{totalPaidCount}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="ml-auto flex items-center gap-2 flex-wrap">
                            <AnimatePresence>
                                {selectedIds.length > 0 && userData?.role === 'SUPER_ADMIN' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedIds.length} Selected</span>
                                        <button onClick={handleBulkDelete}
                                            className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase italic shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button onClick={fetchTotalAmount} disabled={loadingTotal}
                                className="bg-[#111] border border-white/10 hover:border-blue-500/50 text-white px-3 py-2 rounded-xl transition-all group flex items-center gap-2 h-10 shadow-xl"
                            >
                                <CreditCard size={16} className={cn("text-blue-500", loadingTotal && "animate-spin")} />
                                <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Paid?</span>
                            </button>

                            <button onClick={() => {
                                setLastId(null)
                                fetchUsers(false)
                            }}
                                className="bg-[#111] border border-white/10 hover:border-emerald-500/50 text-white px-3 py-2 rounded-xl transition-all group flex items-center gap-2 h-10 shadow-xl"
                            >
                                <RefreshCcw size={16} className={cn("text-emerald-500 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
                                <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Sync</span>
                            </button>

                            {userData?.role === 'SUPER_ADMIN' && (
                                <button onClick={() => fetchAndDownload('users', `Users_${paymentFilter}`, getAuthToken, { status: paymentFilter })}
                                    className="bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-500 px-3 py-2 rounded-xl transition-all group flex items-center gap-2 h-10 shadow-xl"
                                >
                                    <FileSpreadsheet size={16} className="transition-transform group-hover:scale-110" />
                                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Export</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, USN, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium shadow-xl text-sm"
                        />
                    </div>

                    <div className="flex bg-[#111] p-1 rounded-2xl border border-white/5 h-12 items-center overflow-x-auto">
                        {[
                            { key: 'all', label: 'All', count: totalUsersCount, color: 'white' },
                            { key: 'paid', label: 'Paid', count: paidUsersCount, color: 'emerald' },
                            { key: 'unpaid', label: 'Unpaid', count: null, color: 'red' },
                            { key: 'internal', label: 'Int', count: internalUsersCount, color: 'blue' },
                            { key: 'external', label: 'Ext', count: externalUsersCount, color: 'purple' },
                        ].map(({ key, label, count, color }) => (
                            <button key={key}
                                onClick={() => setPaymentFilter(key as any)}
                                className={cn(
                                    "flex-shrink-0 px-3 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                                    paymentFilter === key
                                        ? `bg-${color}-500/10 text-${color}-${color === 'white' ? '200' : '400'} shadow-lg`
                                        : 'text-gray-500 hover:text-gray-300'
                                )}
                            >
                                {label}
                                {count !== null && <span className="text-[9px] opacity-70">{count}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {loading && users.length === 0 ? (
                        <div className="bg-[#111] rounded-2xl p-8 flex flex-col items-center gap-2 border border-white/5">
                            <Loader2 className="animate-spin text-emerald-500" size={24} />
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading...</span>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="bg-[#111] rounded-2xl p-8 text-center text-gray-500 italic text-sm border border-white/5">
                            No users found.
                        </div>
                    ) : filteredUsers.map((u) => (
                        <div key={u.id} className={cn(
                            "bg-[#111] border rounded-2xl p-4 space-y-3",
                            selectedIds.includes(u.id) ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5"
                        )}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-white/5 border ${u.isBlocked ? 'border-red-500/50' : 'border-white/10'} flex items-center justify-center ${u.isBlocked ? 'text-red-500' : 'text-emerald-500'} font-bold flex-shrink-0`}>
                                        {u.isBlocked ? <Shield size={16} /> : (u.name?.[0]?.toUpperCase() || 'U')}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-semibold ${u.isBlocked ? 'text-red-400' : 'text-white'} text-sm`}>
                                            {u.name}
                                            {u.isBlocked && <span className="text-[9px] bg-red-500/10 px-1.5 py-0.5 rounded text-red-500 font-bold ml-1 uppercase">Blocked</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${u.hasPaid ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                                        u.studentType === 'internal'
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            : "bg-white/5 text-gray-500 border-white/10"
                                    )}>
                                        {u.studentType === 'internal' ? 'Int' : 'Ext'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 font-mono">{u.usn || 'No USN'} · {u.college || 'N/A'}</div>
                            {(!u.role || u.role === 'USER') && (
                                <div className="flex gap-2">
                                    <button
                                        title={u.hasPaid ? "Mark Unpaid" : "Mark Paid"}
                                        disabled={isUpdating === `${u.id}-hasPaid`}
                                        onClick={() => handleUpdateField(u.id, 'hasPaid', !u.hasPaid)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${u.hasPaid
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-white/5 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        {isUpdating === `${u.id}-hasPaid` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                        {u.hasPaid ? 'Paid' : 'Unpaid'}
                                    </button>
                                    {(userData?.role === 'SUPER_ADMIN' || userData?.role === 'FINANCE') && (
                                        <button
                                            title={u.isBlocked ? "Unblock" : "Block"}
                                            disabled={isUpdating === `${u.id}-isBlocked`}
                                            onClick={() => { if (u.isBlocked || confirm(`Block ${u.name}?`)) { handleUpdateField(u.id, 'isBlocked', !u.isBlocked) } }}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${u.isBlocked
                                                ? 'bg-red-500 text-white'
                                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}
                                        >
                                            {isUpdating === `${u.id}-isBlocked` ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                                        </button>
                                    )}
                                    {userData?.role === 'SUPER_ADMIN' && (
                                        <button
                                            title="Delete"
                                            disabled={isUpdating === u.id}
                                            onClick={() => handleDeleteUser(u.id, u.name)}
                                            className="px-4 py-2 bg-white/5 text-gray-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-white/5"
                                        >
                                            {isUpdating === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {hasMore && (
                        <button onClick={() => fetchUsers(true)} disabled={loading}
                            className="w-full py-3 bg-[#111] hover:bg-white/5 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all border border-white/10 hover:border-emerald-500/50 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin text-emerald-500 mx-auto" size={16} /> : 'Load More'}
                        </button>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={() => toggleSelectAll(filteredUsers)}
                                            className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </th>
                                    <th className="px-6 py-4">User Details</th>
                                    <th className="px-6 py-4">USN / College</th>
                                    <th className="px-6 py-4">Account Status</th>
                                    <th className="px-6 py-4">Registration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center">
                                            <div className="flex justify-center flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-emerald-500" size={24} />
                                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Database...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className={cn(
                                        "hover:bg-white/2 transition-colors group",
                                        selectedIds.includes(u.id) && "bg-white/5"
                                    )}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(u.id)}
                                                onChange={() => toggleSelect(u.id)}
                                                className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-white/5 border ${u.isBlocked ? 'border-red-500/50' : 'border-white/10'} flex items-center justify-center ${u.isBlocked ? 'text-red-500' : 'text-emerald-500'} font-bold overflow-hidden`}>
                                                    {u.isBlocked ? <Shield size={18} /> : (u.name?.[0]?.toUpperCase() || 'U')}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${u.isBlocked ? 'text-red-400' : 'text-white'} flex items-center gap-1`}>
                                                        {u.name}
                                                        {u.isBlocked && <span className="text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded text-red-500 font-bold ml-1 uppercase">Blocked</span>}
                                                        {u.role && u.role !== 'USER' && (
                                                            <span title={u.role}>
                                                                <Shield size={12} className="text-amber-500" />
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 uppercase">
                                                        <Mail size={10} /> {u.email}
                                                    </p>
                                                    {u.phone && (
                                                        <p className="text-[10px] text-gray-600 flex items-center gap-1 uppercase mt-0.5">
                                                            <Phone size={10} /> {u.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-white flex items-center gap-1 font-mono font-bold uppercase tracking-tight">
                                                    <Fingerprint size={12} className="text-gray-500" /> {u.usn || 'N/A'}
                                                </p>
                                                <p className={cn(
                                                    "text-[10px] flex items-center gap-1 font-medium",
                                                    u.studentType === 'internal' ? "text-emerald-500" : "text-gray-500"
                                                )}>
                                                    <Building2 size={10} /> {u.college || 'Outside College'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${u.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    u.role === 'USER' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                    {u.role?.replace('_', ' ') || 'USER'}
                                                </span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border shadow-sm",
                                                    u.studentType === 'internal'
                                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10"
                                                        : "bg-white/5 text-gray-500 border-white/10"
                                                )}>
                                                    {u.studentType === 'internal' ? 'SODE-EDU' : 'EXTERNAL'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${u.hasPaid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                                    <span className="text-xs text-gray-300 font-medium">
                                                        {u.hasPaid ? 'Paid Entry' : 'Unpaid'}
                                                    </span>
                                                </div>
                                                {u.isBlocked && (
                                                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                                        <Shield size={8} /> Access Denied
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(!u.role || u.role === 'USER') ? (
                                                <div className="flex justify-end gap-2">
                                                    {/* Payment Toggle */}
                                                    <button
                                                        title={u.hasPaid ? "Mark as Unpaid" : "Mark as Paid"}
                                                        disabled={isUpdating === `${u.id}-hasPaid`}
                                                        onClick={() => handleUpdateField(u.id, 'hasPaid', !u.hasPaid)}
                                                        className={`p-2 rounded-lg transition-all ${u.hasPaid
                                                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {isUpdating === `${u.id}-hasPaid` ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : <CheckCircle size={16} />}
                                                    </button>

                                                    {/* Block Toggle - For Directory Admins */}
                                                    {(userData?.role === 'SUPER_ADMIN' || userData?.role === 'FINANCE') && (
                                                        <button
                                                            title={u.isBlocked ? "Unblock User" : "Block User"}
                                                            disabled={isUpdating === `${u.id}-isBlocked`}
                                                            onClick={() => {
                                                                if (u.isBlocked || confirm(`Are you sure you want to block ${u.name}? They will lose all access to the portal.`)) {
                                                                    handleUpdateField(u.id, 'isBlocked', !u.isBlocked)
                                                                }
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${u.isBlocked
                                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                                }`}
                                                        >
                                                            {isUpdating === `${u.id}-isBlocked` ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : <Ban size={16} />}
                                                        </button>
                                                    )}

                                                    {/* Delete User - Super Admin Only */}
                                                    {userData?.role === 'SUPER_ADMIN' && (
                                                        <button
                                                            title="Delete User Permanently"
                                                            disabled={isUpdating === u.id}
                                                            onClick={() => handleDeleteUser(u.id, u.name)}
                                                            className="p-2 bg-white/5 text-gray-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-white/5"
                                                        >
                                                            {isUpdating === u.id ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : <Trash2 size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-600 font-bold uppercase italic px-2">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && (
                        <div className="p-4 border-t border-white/5 flex justify-center">
                            <button
                                onClick={() => fetchUsers(true)}
                                disabled={loading}
                                className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10 hover:border-emerald-500/50 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin text-emerald-500" size={16} /> : `Show More Users (${(paymentFilter === 'paid' ? paidUsersCount : paymentFilter === 'unpaid' ? unpaidUsersCount : totalUsersCount) - users.length} remaining)`}
                            </button>
                        </div>
                    )}
                </div>
            </div >
        </ProtectedRoute >
    )
}
