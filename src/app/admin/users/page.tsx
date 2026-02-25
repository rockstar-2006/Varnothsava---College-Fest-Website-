'use client'

import { useState, useEffect } from 'react'
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
    MoreHorizontal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
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
}

export default function UserManagementPage() {
    const { userData } = useApp()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isUpdating, setIsUpdating] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/all-users?search=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setUsers(data.users)
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers()
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

    const filteredUsers = users.filter(u => u.role !== 'SUPER_ADMIN')

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCE']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Directory</h1>
                    <p className="text-gray-400 text-sm">View and manage all registered users/participants</p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, USN, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-xl"
                    />
                </div>

                {/* Users List */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">User Details</th>
                                    <th className="px-6 py-4">USN / College</th>
                                    <th className="px-6 py-4">Account Status</th>
                                    <th className="px-6 py-4">Registration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center">
                                            <div className="flex justify-center flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-emerald-500" size={24} />
                                                <span className="text-gray-500">Searching directory...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/2 transition-colors group">
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
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-white flex items-center gap-1 font-mono uppercase tracking-tight">
                                                    <Fingerprint size={12} className="text-gray-500" /> {u.usn || 'N/A'}
                                                </p>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <Building2 size={10} /> {u.college || 'Outside College'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-500' :
                                                u.role === 'USER' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {u.role?.replace('_', ' ') || 'USER'}
                                            </span>
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
                </div>
            </div>
        </ProtectedRoute>
    )
}
