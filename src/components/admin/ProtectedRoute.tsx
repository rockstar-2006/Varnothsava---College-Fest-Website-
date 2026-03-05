'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { AdminRole } from '@/context/AppContext'

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: AdminRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isLoggedIn, isAdmin, userData, isInitializing } = useApp()
    const router = useRouter()

    useEffect(() => {
        if (isInitializing) return;

        if (!isLoggedIn) {
            router.push('/login?redirect=' + window.location.pathname)
            return;
        }

        if (!isAdmin) {
            router.push('/admin/403')
            return;
        }

        // If we have allowedRoles, we must wait for userData to verify the specific role
        if (allowedRoles && userData) {
            if (userData.role !== 'SUPER_ADMIN' && !allowedRoles.includes(userData.role as AdminRole)) {
                router.push('/admin/403')
            }
        }
    }, [isLoggedIn, isAdmin, userData, isInitializing, router, allowedRoles])

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!isLoggedIn || !isAdmin) {
        return null;
    }

    if (allowedRoles && userData?.role && !allowedRoles.includes(userData.role) && userData.role !== 'SUPER_ADMIN') {
        return null;
    }

    return <>{children}</>
}
