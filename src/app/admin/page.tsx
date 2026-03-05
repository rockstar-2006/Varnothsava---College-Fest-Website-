'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

export default function AdminDashboardRedirect() {
    const router = useRouter()
    const { userData } = useApp()

    useEffect(() => {
        if (!userData) return

        if (userData.role === 'COORDINATOR') {
            router.replace('/admin/registrations')
        } else if (userData.role === 'FINANCE') {
            router.replace('/admin/payments')
        } else {
            router.replace('/admin/payments')
        }
    }, [router, userData])

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR', 'FINANCE', 'VOLUNTEER']}>
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        </ProtectedRoute>
    )
}
