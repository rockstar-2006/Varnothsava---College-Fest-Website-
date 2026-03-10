'use client'

import React, { Suspense, useEffect, useState } from "react"
import { EventGrid } from "@/components/sections/EventGrid"
import { missions, Event } from "@/data/missions"

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>(missions)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events', {
                    next: { revalidate: 60 } // Cache for 60 seconds
                })
                if (res.ok) {
                    const data = await res.json()
                    setEvents(data.events || missions)
                } else {
                    setEvents(missions)
                }
            } catch (error) {
                console.error('Failed to fetch events:', error)
                setEvents(missions)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])

    return (
        <main className="min-h-screen relative bg-transparent">
            <Suspense fallback={<div className="min-h-screen" />}>
                <EventGrid missions={events} />
            </Suspense>
        </main>
    )
}
