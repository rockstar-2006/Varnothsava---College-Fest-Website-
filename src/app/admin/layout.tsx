'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <AdminSidebar />
                <div className="lg:pl-64 flex flex-col min-h-screen">
                    <AdminTopbar />
                    <main className="flex-1 p-6 mt-16 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
