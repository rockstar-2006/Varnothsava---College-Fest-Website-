'use client'

import { EventGrid } from "../../components/sections/EventGrid"
import { SmoothScroll } from "../../components/ui/SmoothScroll"

export default function EventsPage() {
    return (
        <SmoothScroll>
            <main className="min-h-screen">
                <EventGrid />
            </main>
        </SmoothScroll>
    )
}
