'use client'

import { useState, useEffect } from 'react'
import { useApp, AdminRole } from '@/context/AppContext'
import {
    Search,
    ShieldCheck,
    User,
    Loader2,
    Check,
    ShieldAlert,
    MoreVertical,
    Mail,
    School
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthToken } from '@/lib/firebaseClient'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    usn?: string;
    collegeName?: string;
}

export default function RoleManagementPage() {
    const { userData } = useApp()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const roles: { value: AdminRole | 'USER', label: string, color: string }[] = [
        { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'text-purple-500 bg-purple-500/10' },
        { value: 'COORDINATOR', label: 'Coordinator', color: 'text-emerald-500 bg-emerald-500/10' },
        { value: 'FINANCE', label: 'Finance', color: 'text-blue-500 bg-blue-500/10' },
        { value: 'VOLUNTEER', label: 'Volunteer', color: 'text-amber-500 bg-amber-500/10' },
        { value: 'USER', label: 'Regular User', color: 'text-gray-500 bg-gray-500/10' },
    ]

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/users', {
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
        fetchUsers()
    }, [])

    const handleUpdateRole = async (userId: string, newRole: string) => {
        setUpdatingId(userId)
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, role: newRole })
            })

            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
            } else {
                const data = await res.json()
                alert(data.message || "Failed to update role")
            }
        } catch (error) {
            console.error("Error updating role:", error)
        } finally {
            setUpdatingId(null)
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.usn || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" />
                        Role Management
                    </h1>
                    <p className="text-gray-400 text-sm">Assign administrative privileges to users</p>
                </div>

                {/* Search */}
                <div className="bg-[#111] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email or USN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Current Role</th>
                                    <th className="px-6 py-4 text-right">Assign Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <span className="text-gray-500 font-medium">Synchronizing user registry...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                            No users matching the query found.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-500 font-bold border border-white/10 group-hover:border-emerald-500/30 transition-all">
                                                    {user.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-base">{user.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                                        <Mail size={10} /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5 text-xs text-gray-400">
                                                <p className="flex items-center gap-1 uppercase font-mono"><span className="text-gray-600">USN:</span> {user.usn || 'N/A'}</p>
                                                <p className="flex items-center gap-1 truncate max-w-[150px]"><School size={10} className="text-gray-600" /> {user.collegeName || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block",
                                                roles.find(r => r.value === user.role)?.color || 'text-gray-500 bg-gray-500/10'
                                            )}>
                                                {user.role?.replace('_', ' ') || 'USER'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {updatingId === user.id ? (
                                                    <Loader2 size={24} className="animate-spin text-emerald-500" />
                                                ) : user.role === 'SUPER_ADMIN' ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-500 font-bold text-[10px] uppercase">
                                                        <ShieldCheck size={12} />
                                                        Protected
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={user.role || 'USER'}
                                                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-emerald-500/50"
                                                    >
                                                        {roles.filter(r => r.value !== 'SUPER_ADMIN').map(role => (
                                                            <option key={role.value} value={role.value} className="bg-[#111]">{role.label}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
                    <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                    <div className="text-sm">
                        <p className="text-amber-500 font-bold mb-1">Security Disclaimer</p>
                        <p className="text-gray-500 leading-relaxed">
                            Granting <strong>Super Admin</strong> or <strong>Finance</strong> privileges provides full access to sensitive financial data and system configuration.
                            Use caution when assigning these roles. All role modifications are logged for security audits.
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
