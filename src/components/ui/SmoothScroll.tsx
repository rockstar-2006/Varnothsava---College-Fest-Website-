"use client";

import { useEffect, useRef, ReactNode, createContext, useContext, useState } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
    children: ReactNode;
}

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

export const SmoothScroll = ({ children }: SmoothScrollProps) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const reqIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Disable Lenis on simple mobile devices if needed, but keeping it ensures consistency
        // if (typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window)) {
        //     return;
        // }

        const lenisInstance = new Lenis({
            duration: 0.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.2,
            infinite: false,
        });

        setLenis(lenisInstance);

        // Sync GSAP ScrollTrigger
        if (typeof window !== 'undefined') {
            import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                lenisInstance.on('scroll', ScrollTrigger.update)
            });
        }

        const raf = (time: number) => {
            lenisInstance.raf(time);
            reqIdRef.current = requestAnimationFrame(raf);
        };
        reqIdRef.current = requestAnimationFrame(raf);

        return () => {
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
            lenisInstance.destroy();
            setLenis(null);
        };
    }, []);

    return (
        <LenisContext.Provider value={lenis}>
            {children}
        </LenisContext.Provider>
    );
};

export default SmoothScroll;