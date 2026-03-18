'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { CertificateModal } from '@/components/modals/CertificateModal'

export function CertificateSurpriseTrigger() {
    const { userData, isInitializing } = useApp()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!isInitializing && userData?.hasPaid && pathname === '/') {
            const hasSeen = localStorage.getItem(`global_cert_home_celebrated_${userData.profileCode}`)
            if (!hasSeen) {
                const timer = setTimeout(() => {
                    setIsOpen(true)
                }, 2000)
                return () => clearTimeout(timer)
            }
        }
    }, [userData, isInitializing, pathname])

    return (
        <CertificateModal 
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            userData={userData}
        />
    )
}
