"use client";

import { useEffect, useRef, ReactNode, createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface SmoothScrollProps {
    children: ReactNode;
}

interface LenisContextType {
    lenis: Lenis | null;
    pause: () => void;
    resume: () => void;
}

const LenisContext = createContext<LenisContextType | null>(null);

export const useLenis = () => {
    const context = useContext(LenisContext);
    return context?.lenis || null;
};

export const useLenisControl = () => {
    const context = useContext(LenisContext);
    return {
        pause: context?.pause || (() => {}),
        resume: context?.resume || (() => {}),
    };
};

export const SmoothScroll = ({ children }: SmoothScrollProps) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const reqIdRef = useRef<number | null>(null);
    const isLenisPausedRef = useRef(false);

    const pathname = usePathname();

    const pauseLenis = () => {
        if (lenis && !isLenisPausedRef.current) {
            lenis.stop();
            isLenisPausedRef.current = true;
        }
    };

    const resumeLenis = () => {
        if (lenis && isLenisPausedRef.current) {
            lenis.start();
            isLenisPausedRef.current = false;
        }
    };

    useEffect(() => {
        const lenisInstance = new Lenis({
            duration: 1.5, // Smoother glide
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.8, // More controlled scroll speed
            touchMultiplier: 1.5, // Natural touch feel
            infinite: false,
        });

        // SCROLL PERFORMANCE OPTIMIZATION
        let scrollTimeout: NodeJS.Timeout;
        const handleScrollStarted = () => {
            document.body.classList.add('scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 150);
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
            lenisInstance.off('scroll', handleScrollStarted);
            lenisInstance.destroy();
            setLenis(null);
            document.body.classList.remove('scrolling');
        };
    }, [pathname]);

    return (
        <LenisContext.Provider value={{ lenis, pause: pauseLenis, resume: resumeLenis }}>
            {children}
        </LenisContext.Provider>
    );
};

export default SmoothScroll;