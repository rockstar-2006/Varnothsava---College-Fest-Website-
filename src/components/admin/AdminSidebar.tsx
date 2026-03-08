'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    Calendar,
    CheckSquare,
    ShieldCheck,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useApp, AdminRole } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
    label: string;
    href: string;
    icon: any;
    roles: AdminRole[];
}

const navItems: NavItem[] = [
    {
        label: 'Registrations',
        href: '/admin/registrations',
        icon: Users,
        roles: ['SUPER_ADMIN', 'COORDINATOR']
    },
    {
        label: 'Payments',
        href: '/admin/payments',
        icon: CreditCard,
        roles: ['SUPER_ADMIN', 'FINANCE']
    },
    {
        label: 'Scanner Details',
        href: '/admin/attendance',
        icon: CheckSquare,
        roles: ['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER']
    },
    {
        label: 'Events Management',
        href: '/admin/events',
        icon: Calendar,
        roles: ['SUPER_ADMIN']
    },
    {
        label: 'User Directory',
        href: '/admin/users',
        icon: Users,
        roles: ['SUPER_ADMIN', 'FINANCE']
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        roles: ['SUPER_ADMIN']
    },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const { userData, logout } = useApp()
    const [isOpen, setIsOpen] = useState(false)

    const userRole = userData?.role || 'VOLUNTEER'

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(userRole) || userRole === 'SUPER_ADMIN'
    )

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-500 rounded-lg text-black shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 h-full w-64 bg-[#0d0d0d] border-r border-white/5 z-40 transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full p-6">
                    <div className="mb-10 flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                            Varnothsava Admin
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                    pathname === item.href
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon size={20} className={cn(
                                    "transition-transform group-hover:scale-110",
                                    pathname === item.href ? "text-emerald-500" : "text-gray-500"
                                )} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="mb-6 px-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Logged in as</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
                                    {userData?.name ? userData.name[0].toUpperCase() : 'A'}
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-medium text-white truncate">{userData?.name || 'Admin User'}</p>
                                    <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-tight">{userRole.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Logout Admin</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
