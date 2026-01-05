import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CustomCursor } from "@/components/layout/CustomCursor";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Varnothsava 2026 | National Level Techno-Cultural Fest",
    description: "Experience the ultimate fusion of technology and culture at Varnothsava 2026. Join the celebration of innovation and art.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.className} bg-[#050805] text-white antialiased`}>
                <AppProvider>
                    <LoadingScreen />
                    <CustomCursor />

                    {/* Global Framework HUD */}
                    <div className="cam-hud">
                        <div className="cam-bracket bracket-tl" />
                        <div className="cam-bracket bracket-tr" />
                        <div className="cam-bracket bracket-bl" />
                        <div className="cam-bracket bracket-br" />
                    </div>

                    <div className="rec-indicator">
                        <div className="rec-dot" />
                        <span>Varnothsava // Live Now</span>
                    </div>

                    <SmoothScroll>
                        <Navbar />
                        {children}
                    </SmoothScroll>
                </AppProvider>
            </body>
        </html>
    );
}
