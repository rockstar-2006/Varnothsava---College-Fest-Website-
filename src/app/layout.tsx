import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Outfit, Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { SiteContent } from "@/components/layout/SiteContent";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const poppins = Poppins({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ["latin"],
    variable: "--font-poppins"
});
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter"
});

export const metadata: Metadata = {
    title: "Varnothsava 2026 | National Level Techno-Cultural Fest",
    description: "Experience the ultimate fusion of technology and culture at Varnothsava 2026. Join the celebration of innovation and art.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#050805",
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
                <meta name="theme-color" content="#050805" />
            </head>
            <body className={`${outfit.variable} ${poppins.variable} ${inter.variable} font-sans bg-[#050805] text-white antialiased selection:bg-emerald-500/30`}>
                <AppProvider>
                    <Suspense fallback={<div className="fixed inset-0 bg-[#020604] z-[12000]" />}>
                        <LoadingScreen />
                    </Suspense>
                    <CustomCursor />


                    <SiteContent children={children} />
                </AppProvider>
            </body>
        </html>
    );
}


