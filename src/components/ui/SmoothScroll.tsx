"use client";

import { useEffect, useRef, ReactNode, createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface SmoothScrollProps {
    children: ReactNode;
}

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

export const SmoothScroll = ({ children }: SmoothScrollProps) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const reqIdRef = useRef<number | null>(null);

    const pathname = usePathname();

    useEffect(() => {
        const lenisInstance = new Lenis({
            duration: 1.2, // Slightly longer for more buttery feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.1, // Faster responsiveness
            touchMultiplier: 1.5, // Better mobile feel
            infinite: false,
            lerp: 0.1, // Smoother interpolation
        });

        // SCROLL PERFORMANCE OPTIMIZATION
        // When user scrolls, we add a class to body to disable heavy blurs
        let scrollTimeout: NodeJS.Timeout;
        const handleScrollStarted = () => {
            document.body.classList.add('scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 150); // Remove after 150ms of inactivity
        };

        lenisInstance.on('scroll', handleScrollStarted);

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

        // RESET SCROLL ON ROUTE CHANGE
        lenisInstance.scrollTo(0, { immediate: false, duration: 1.5 });

        return () => {
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
            lenisInstance.off('scroll', handleScrollStarted); // Correctly remove the listener
            lenisInstance.destroy();
            setLenis(null);
            document.body.classList.remove('scrolling');
        };
    }, [pathname]); // Re-run on pathname change to reset scroll or re-init if needed

    return (
        <LenisContext.Provider value={lenis}>
            {children}
        </LenisContext.Provider>
    );
};

export default SmoothScroll;