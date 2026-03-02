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
                updateAdminCache('users', newUsers)
                updateAdminCache('totalUsersCount', data.totalCount)
                updateAdminCache('paidUsersCount', data.paidCount)
                updateAdminCache('unpaidUsersCount', data.unpaidCount)
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

    // Sync button is now the only trigger for fresh directory data
    // Fetch on filter change
    useEffect(() => {
        // ONLY auto-fetch if we change filters OR if the cache is empty
        if (users.length === 0 || paymentFilter !== 'all') {
            fetchUsers(false)
        }
    }, [paymentFilter])

    // Fetch on search with debounce
    useEffect(() => {
        if (!searchQuery && users.length > 0) return; // Don't fetch on empty search if we have data
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
                            USER <span className="text-emerald-500">DIRECTORY</span>
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint size={14} className="text-emerald-500/50" />
                            {paymentFilter === 'all' && `Access all ${totalUsersCount} registered users`}
                            {paymentFilter === 'paid' && `Access ${paidUsersCount} verified paid participants`}
                            {paymentFilter === 'unpaid' && `View ${unpaidUsersCount} pending enrollment records`}
                            {paymentFilter === 'internal' && `Viewing internal SODE students`}
                            {paymentFilter === 'external' && `Viewing external participants`}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <AnimatePresence>
                            {totalPaidCount !== null && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl"
                                >
                                    <p className="text-[8px] font-black uppercase tracking-tighter text-blue-500 leading-none mb-1">People Paid</p>
                                    <p className="text-sm font-black text-white italic">{totalPaidCount}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={fetchTotalAmount}
                            disabled={loadingTotal}
                            className="bg-[#111] border border-white/10 hover:border-blue-500/50 text-white px-5 py-3 rounded-xl transition-all group flex items-center gap-3 h-12 shadow-xl"
                        >
                            <CreditCard size={18} className={cn("text-blue-500 transition-transform group-hover:scale-110", loadingTotal && "animate-spin")} />
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-none mb-1">Financial Check</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-white leading-none">Check Total</p>
                            </div>
                        </button>

                        <AnimatePresence>
                            {selectedIds.length > 0 && userData?.role === 'SUPER_ADMIN' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedIds.length} Selected</span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase italic shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Bulk Delete
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => fetchUsers(false)}
                            className="bg-[#111] border border-white/10 hover:border-emerald-500/50 text-white px-5 py-3 rounded-xl transition-all group flex items-center gap-3 h-12 shadow-xl"
                        >
                            <RefreshCcw size={18} className={cn("text-emerald-500 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-none mb-1">Live Directory</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-white leading-none">Sync Users</p>
                            </div>
                        </button>

                        {userData?.role === 'SUPER_ADMIN' && (
                            <button
                                onClick={() => fetchAndDownload('users', `Users_${paymentFilter}`, getAuthToken, { status: paymentFilter })}
                                className="bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-500 px-5 py-3 rounded-xl transition-all group flex items-center gap-3 h-12 shadow-xl"
                                title="Download All Users (Excel)"
                            >
                                <FileSpreadsheet size={18} className="transition-transform group-hover:scale-110" />
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-500/50 leading-none mb-1">Directory</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 leading-none font-mono">EXPORT</p>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, USN, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium shadow-xl"
                        />
                    </div>

                    <div className="flex bg-[#111] p-1.5 rounded-2xl border border-white/5 h-14 items-center">
                        <button
                            onClick={() => setPaymentFilter('all')}
                            className={cn(
                                "flex-1 px-4 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2",
                                paymentFilter === 'all'
                                    ? 'bg-white/10 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            All Users
                            <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-md text-gray-400">{totalUsersCount}</span>
                        </button>
                        <button
                            onClick={() => setPaymentFilter('paid')}
                            className={cn(
                                "flex-1 px-4 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2",
                                paymentFilter === 'paid'
                                    ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            <CheckCircle size={14} />
                            Paid
                            <span className="text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded-md text-emerald-500">{paidUsersCount}</span>
                        </button>
                        <button
                            onClick={() => setPaymentFilter('unpaid')}
                            className={cn(
                                "flex-1 px-4 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2",
                                paymentFilter === 'unpaid'
                                    ? 'bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            <XCircle size={14} />
                            Unpaid
                        </button>

                        <button
                            onClick={() => setPaymentFilter('internal')}
                            className={cn(
                                "flex-1 px-4 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 border-l border-white/5",
                                paymentFilter === 'internal'
                                    ? 'bg-blue-500/10 text-blue-400 shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            Internal
                        </button>

                        <button
                            onClick={() => setPaymentFilter('external')}
                            className={cn(
                                "flex-1 px-4 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 border-l border-white/5",
                                paymentFilter === 'external'
                                    ? 'bg-purple-500/10 text-purple-400 shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            External
                        </button>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
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
                                ) : filteredUsers.slice(0, users.length).map((u) => (
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
                                                    {u.isBlocked ? <Shield size={18} /> : u.name[0].toUpperCase()}
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
