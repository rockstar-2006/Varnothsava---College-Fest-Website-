'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import {
    Settings,
    Bell,
    Lock,
    Globe,
    Palette,
    Save,
    Loader2
} from 'lucide-react'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

export default function AdminSettingsPage() {
    const { userData } = useApp()
    const [saving, setSaving] = useState(false)

    const handleSave = () => {
        setSaving(true)
        setTimeout(() => setSaving(false), 1500)
    }

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="text-emerald-500" />
                        System Settings
                    </h1>
                    <p className="text-gray-400 text-sm">Configure global platform parameters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div className="bg-[#111] p-4 rounded-xl border border-emerald-500/20 text-emerald-500 flex items-center gap-3">
                            < Bell size={20} />
                            <span className="font-semibold">General</span>
                        </div>
                        <div className="bg-[#111] p-4 rounded-xl border border-white/5 text-gray-500 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-all">
                            <Lock size={20} />
                            <span>Security</span>
                        </div>
                        <div className="bg-[#111] p-4 rounded-xl border border-white/5 text-gray-500 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-all">
                            <Palette size={20} />
                            <span>Appearance</span>
                        </div>
                        <div className="bg-[#111] p-4 rounded-xl border border-white/5 text-gray-500 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-all">
                            <Globe size={20} />
                            <span>SEO</span>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-6">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4">Fest Configuration</h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Fest Year</label>
                                    <input type="text" defaultValue="2026" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Main Event Date</label>
                                    <input type="text" defaultValue="March 11-12, 2026" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-white font-bold">Public Registrations</p>
                                        <p className="text-xs text-gray-500">Allow users to register for events</p>
                                    </div>
                                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-white font-bold">Maintenance Mode</p>
                                        <p className="text-xs text-gray-500">Restrict access to certain parts of the site</p>
                                    </div>
                                    <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
