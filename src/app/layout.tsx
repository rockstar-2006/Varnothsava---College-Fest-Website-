import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { InnovativeNavbar } from "@/components/layout/InnovativeNavbar";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageTransitionBar } from "@/components/layout/PageTransitionBar";
import { SmoothScroll } from "../components/ui/SmoothScroll";

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
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://images.unsplash.com" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
                <meta name="theme-color" content="#050805" />
            </head>
            <body className={`${outfit.className} bg-[#050805] text-white antialiased selection:bg-emerald-500/30`}>
                <AppProvider>
                    <Suspense fallback={null}>
                        <LoadingScreen />
                        <PageTransitionBar />
                    </Suspense>
                    <CustomCursor />


                    <SmoothScroll>
                        <InnovativeNavbar />
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </SmoothScroll>
                </AppProvider>
            </body>
        </html>
    );
}

