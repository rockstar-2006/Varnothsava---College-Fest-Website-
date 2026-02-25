'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'
import {
    Users,
    CreditCard,
    CheckCircle,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Loader2
} from 'lucide-react'
import { getAuthToken } from '@/lib/firebaseClient'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import Link from 'next/link'

interface DashboardStats {
    totalRegistrations: number;
    totalUsers: number;
    totalRevenue: number;
    verifiedPayments: number;
    activeEvents: number;
}

interface RecentReg {
    id: string;
    userName: string;
    userUsn: string;
    eventName: string;
    status: string;
    amount: number;
}

export default function AdminDashboard() {
    const { userData } = useApp()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentRegs, setRecentRegs] = useState<RecentReg[]>([])
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setStats(data.stats)
                setRecentRegs(data.recentRegistrations)
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const statCards = [
        {
            label: 'Total Registrations',
            value: stats?.totalRegistrations.toString() || '0',
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Total Revenue',
            value: `₹${stats?.totalRevenue.toLocaleString() || '0'}`,
            icon: CreditCard,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: 'Verified Payments',
            value: stats?.verifiedPayments.toString() || '0',
            icon: CheckCircle,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: 'Active Events',
            value: stats?.activeEvents.toString() || '0',
            icon: Calendar,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
    ]

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR', 'FINANCE', 'VOLUNTEER']}>
            <div className="space-y-8 pb-10">
                {/* Welcome Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {userData?.name?.split(' ')[0] || 'Admin'}!
                        </h1>
                        <p className="text-gray-400">
                            Here's what's happening with Varnothsava today.
                        </p>
                    </div>
                    <div className="hidden md:block px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Your Role</p>
                        <p className="text-emerald-500 font-mono text-sm font-bold">{userData?.role?.replace('_', ' ')}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-[#111] border border-white/5 animate-pulse" />
                        ))
                    ) : (
                        statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-emerald-500/20 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className="text-emerald-500 bg-emerald-500/10 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <TrendingUp size={10} /> Live
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Recent Registrations</h2>
                            <Link href="/admin/registrations" className="text-sm text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1">
                                View All <ArrowUpRight size={14} />
                            </Link>
                        </div>

                        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Participant</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center">
                                                <Loader2 className="animate-spin text-emerald-500 mx-auto" />
                                            </td>
                                        </tr>
                                    ) : recentRegs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">No recent registrations found</td>
                                        </tr>
                                    ) : recentRegs.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/20">
                                                        {reg.userName[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{reg.userName}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono italic">{reg.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 font-medium">{reg.eventName}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${reg.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        reg.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {reg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white font-mono">₹{reg.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <Link href="/admin/events" className="w-full p-4 rounded-xl bg-emerald-500 text-black font-bold text-center hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                Manage Events
                            </Link>
                            <Link href="/admin/registrations" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-center hover:bg-white/10 transition-all">
                                View Registrations
                            </Link>
                            <Link href="/admin/payments" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-center hover:bg-white/10 transition-all">
                                Verify Payments
                            </Link>
                            <Link href="/admin/attendance" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-center hover:bg-white/10 transition-all">
                                Mark Attendance
                            </Link>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Users size={120} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 italic">Pro Tip</h3>
                            <p className="text-sm text-emerald-50 leading-relaxed mb-4">
                                You can verify bulk payments by checking the transaction ledger in the Payments section.
                            </p>
                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
