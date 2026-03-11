import { EventGrid } from "@/components/sections/EventGrid"
import { missions } from "@/data/missions"

export default function EventsPage() {
    return (
        <main className="min-h-screen relative bg-transparent">
            <EventGrid missions={missions} />
        </main>
    )
}
