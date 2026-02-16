import React, { Suspense } from "react"
import { EventGrid } from "@/components/sections/EventGrid"
import { missions } from "@/data/missions"

export default function EventsPage() {
    return (
        <main className="min-h-screen relative bg-transparent">
            <Suspense fallback={<div className="min-h-screen" />}>
                <EventGrid missions={missions} />
            </Suspense>
        </main>
    )
}
