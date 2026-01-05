import { EventGrid } from "@/components/sections/EventGrid"
import { SmoothScroll } from "../../components/ui/SmoothScroll"
import MatterPhysics from "../../components/ui/MatterPhysics"
import { CosmicBackground } from "../../components/ui/CosmicBackground"
import { missions } from "@/data/missions"

export default function EventsPage() {
    return (
        <main className="min-h-screen relative bg-[#020603]">
            <EventGrid missions={missions} />
        </main>
    )
}
