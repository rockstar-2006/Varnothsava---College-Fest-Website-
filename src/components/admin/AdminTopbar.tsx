'use client'

import { Bell, Search, User } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function AdminTopbar() {
    const { userData } = useApp()

    return (
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md fixed top-0 right-0 left-0 lg:left-64 z-30 px-6">
            <div className="h-full flex items-center justify-end">
                <div className="flex items-center gap-2 md:hidden">
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Varnothsava
                    </span>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]"></span>
                    </button>

                    <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{userData?.name || 'Loading...'}</p>
                            <p className="text-[10px] text-gray-500 font-mono tracking-tighter capitalize">{userData?.role?.toLowerCase().replace('_', ' ') || 'Admin'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-emerald-500/30 p-0.5">
                            {userData?.avatar ? (
                                <img
                                    src={userData.avatar}
                                    alt="Admin"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-emerald-500">
                                    <User size={20} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
