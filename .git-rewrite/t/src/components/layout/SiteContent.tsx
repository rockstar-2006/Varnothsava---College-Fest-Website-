'use client'

import React from 'react'
import { useApp } from '@/context/AppContext'
import { SmoothScroll } from '@/components/ui/SmoothScroll'
import { InnovativeNavbar } from '@/components/layout/InnovativeNavbar'
import { PageTransition } from '@/components/layout/PageTransition'

export function SiteContent({ children }: { children: React.ReactNode }) {
    const { isSiteLoaded } = useApp()

    return (
        <SmoothScroll>
            {isSiteLoaded && <InnovativeNavbar />}
            <PageTransition>
                <main className="gpu-accel">
                    {children}
                </main>
            </PageTransition>
        </SmoothScroll>
    )
}
