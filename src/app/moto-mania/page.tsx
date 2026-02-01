"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView, useAnimation, Variants } from "framer-motion";
import { ArrowDown, Calendar, MapPin, Ticket, Star, ChevronRight, Camera, Gauge, Skull, Info, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { Special_Elite, Bebas_Neue, Abril_Fatface, Rye, Cormorant_Garamond, Graduate, Staatliches, Anton } from 'next/font/google';

const specialElite = Special_Elite({ weight: '400', subsets: ['latin'] });
const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'] });
const abrilFatface = Abril_Fatface({ weight: '400', subsets: ['latin'] });
const ryeFont = Rye({ weight: '400', subsets: ['latin'] });
const cormorant = Cormorant_Garamond({ weight: ['400', '600', '700'], subsets: ['latin'], style: ['italic', 'normal'] });
const graduate = Graduate({ weight: '400', subsets: ['latin'] });
const staatliches = Staatliches({ weight: '400', subsets: ['latin'] });
const anton = Anton({ weight: '400', subsets: ['latin'] });

// --- Assets ---
const IMAGES = [
    "/img/DSC_0012.JPG",
    "/img/DSC_0007.JPG",
    "/img/DSC_0018.JPG",
    "/img/DSC_0033.JPG",
    "/img/DSC_0035.JPG",
    "/img/DSC_0046.JPG",
    "/img/DSC_0030.JPG",
    "/img/IMG_4367.JPG",
    "/img/IMG_4378.JPG",
    "/img/IMG_4382.JPG",
    "/img/IMG_4452.JPG",
    "/img/IMG_4496.JPG",
    "/img/IMG_4488.JPG",
    "/img/IMG_4523.JPG",
    "/img/IMG_4528.JPG",
    "/img/IMG_4532.JPG",
    "/img/IMG_4551.JPG",
    "/img/IMG_4590.JPG",
    "/img/IMG_4596.JPG",
    "/img/IMG_4599.JPG",
    "/img/IMG_4613.JPG",
    "/img/IMG_4629.JPG",
    "/img/IMG_4631.JPG",
    "/img/IMG_4635.JPG",
    "/img/IMG_4646.JPG",
    "/img/IMG_4660.JPG",
    "/img/IMG_4666.JPG",
    "/img/IMG_4686.JPG",
    "/img/IMG_4694.JPG",
    "/img/IMG_4707.JPG",
    "/img/IMG_4711.JPG",
    "/img/IMG_4714.JPG",
    "/img/IMG_4729.JPG",
    "/img/IMG_4731.JPG",
    "/img/IMG_4743.JPG",
    "/img/IMG_4746.JPG"
];

// --- Animation Components ---

interface RevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

const Reveal = ({ children, width = "fit-content", className, delay = 0.2, direction = "up" }: RevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    const controls = useAnimation();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    const getVariants = (): Variants => {
        const distance = isMobile ? 20 : 60; // Reduced distance

        let initialObj: any = {
            opacity: 0,
            y: direction === "up" ? distance : direction === "down" ? -distance : 0,
            x: direction === "left" ? distance : direction === "right" ? -distance : 0,
            scale: isMobile ? 1 : 0.98, // Less scale change
        };

        return {
            hidden: initialObj,
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                transition: {
                    duration: isMobile ? 0.4 : 0.8, // Faster durations
                    delay: delay,
                    ease: [0.25, 0.1, 0.25, 1], // Standard power ease
                }
            },
        };
    };

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "visible" }} className={className}>
            <motion.div
                variants={getVariants()}
                initial="hidden"
                animate={controls}
                style={{
                    willChange: isInView ? "auto" : "transform, opacity" // Only will-change when needed
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

const StaggerContainer = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20%" }); // Changed to once: true

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: 0.15, // Slightly faster
                        delayChildren: delay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

const StaggerItem = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    return (
        <motion.div
            variants={{
                hidden: {
                    opacity: 0,
                    y: isMobile ? 30 : 100,
                    rotateX: isMobile ? 0 : 15, // Reduced rotation
                    filter: isMobile ? "blur(0px)" : "blur(3px)" // Reduced blur
                },
                show: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                    transition: {
                        duration: isMobile ? 0.6 : 1.0, // Faster on mobile
                        ease: [0.16, 1, 0.3, 1]
                    }
                }
            }}
            style={{
                transformStyle: isMobile ? "flat" : "preserve-3d",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden"
            }}
        >
            {children}
        </motion.div>
    )
}

const PaperTexture = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

    return (
        <>
            <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.35] md:opacity-[0.45] mix-blend-multiply transition-opacity duration-700"
                style={{
                    backgroundImage: isMobile ? "none" : `url('https://www.transparenttextures.com/patterns/handmade-paper.png')`,
                    backgroundColor: isMobile ? "#f4f1ea" : "transparent"
                }}
            />

            {/* Mechanical Artifacts: Grease spatters, oil stains - Reduced on mobile */}
            <div className="pointer-events-none fixed inset-0 z-[102] opacity-[0.05] md:opacity-[0.08] mix-blend-darken select-none">
                {!isMobile && (
                    <>
                        <div className="absolute top-[15%] right-[10%] w-24 h-24 bg-[#3c2a21] rounded-full blur-3xl opacity-40 translate-x-12" />
                        <div className="absolute top-[60%] left-[5%] w-16 h-4 bg-[#3c2a21] blur-md rotate-45" />
                        <div className="absolute bottom-[30%] left-[20%] w-32 h-32 border-8 border-dashed border-[#3c2a21]/5 rounded-full rotate-45" />
                    </>
                )}
                <div className="absolute top-[5%] left-[50%] font-mono text-[8px] md:text-[10px] text-[#3c2a21]/30 tracking-[1.5em] -translate-x-1/2">TECHNICAL_SPEC_LOG_2K26</div>
            </div>

            {/* Subtle Fold Lines - Disabled on mobile for performance */}
            {!isMobile && (
                <div className="pointer-events-none fixed inset-0 z-[103] mix-blend-overlay opacity-[0.08]">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-black/20 shadow-[0_1px_4px_rgba(0,0,0,0.1)]" />
                    <div className="absolute top-0 left-1/2 w-px h-full bg-black/20 shadow-[1px_0_4px_rgba(0,0,0,0.1)]" />
                </div>
            )}
        </>
    );
};

const GrainOverlay = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Simplified static grain on mobile, animated on desktop
    return (
        <div className="pointer-events-none fixed inset-0 z-[101] mix-blend-overlay opacity-20">
            {isMobile ? (
                // Static grain for mobile
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />
            ) : (
                // Optimized grain for desktop
                <div
                    className="absolute inset-0 animate-grain"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        willChange: "opacity"
                    }}
                />
            )}
        </div>
    );
};

const VintageFrame = () => (
    <div className="pointer-events-none fixed inset-0 z-[90] p-4 md:p-8">
        <div className="relative w-full h-full border-2 border-[#3c2a21]">
            {/* Corners */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#3c2a21]" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#3c2a21]" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#3c2a21]" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#3c2a21]" />

            {/* Decorative Inner Border */}
            <div className="absolute inset-1 border border-[#3c2a21]/30" />

            {/* Ornate Corner Accents (using SVG or simplified CSS) */}
            <div className="absolute top-2 left-2 w-4 h-4 rounded-full border-2 border-[#3c2a21]" />
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-[#3c2a21]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full border-2 border-[#3c2a21]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-[#3c2a21]" />
        </div>
    </div>
);

const SectionHeading = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 className={cn("text-4xl md:text-6xl lg:text-7xl text-[#3c2a21] uppercase tracking-tighter", abrilFatface.className, className)}>
        {children}
    </h2>
);

const Marquee = ({ text, direction = 1 }: { text: string, direction?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref);

    return (
        <div ref={ref} className="relative flex overflow-hidden whitespace-nowrap border-y-2 border-[#3c2a21] bg-[#3c2a21] py-3">
            <motion.div
                className="flex gap-8 font-serif text-lg md:text-xl font-bold uppercase tracking-widest text-[#e3ccb0]"
                style={{ fontFamily: "'Rye', serif" }}
                animate={isInView ? { x: direction > 0 ? ["0%", "-50%"] : ["-50%", "0%"] } : {}}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }} // Slower is often smoother
            >
                {Array(20).fill(text).map((item, i) => (
                    <span key={i} className="flex items-center gap-8">
                        {item} <Star size={18} fill="currentColor" strokeWidth={0} />
                    </span>
                ))}
            </motion.div>
        </div>
    )
}



// --- New "Wow" Components ---

const Tachometer = () => {
    const { scrollYProgress } = useScroll();
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

    const rotationRaw = useTransform(scrollYProgress, [0, 1], [-120, 120]); // Needle sweep
    const rotation = useSpring(rotationRaw, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            className={cn(
                "fixed z-50 flex flex-col items-center gap-2 transition-all duration-700 pointer-events-none",
                isMobile ? "bottom-4 right-4" : "bottom-8 left-8"
            )}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
        >
            <div className={cn(
                "relative bg-[#e3ccb0] rounded-full border-4 border-[#3c2a21] shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden transition-all duration-500",
                isMobile ? "w-16 h-16 border-2" : "w-32 h-32"
            )}>
                {/* Gauge Face */}
                <div className="absolute inset-2 rounded-full border border-[#3c2a21]/10" />

                {/* Ticks */}
                {[...Array(9)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-3 bg-[#3c2a21]/50 top-2"
                        style={{
                            transform: `rotate(${(i * 30) - 120}deg)`,
                            transformOrigin: "center 56px"
                        }}
                    />
                ))}

                {/* Redline Zone */}
                <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-[#cd5c09]/50 border-r-[#cd5c09]/50 rotate-[45deg]" style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%)" }} />

                {/* Needle */}
                <motion.div
                    className="absolute w-1 h-14 bg-[#cd5c09] origin-bottom rounded-full"
                    style={{
                        rotate: rotation,
                        bottom: "50%"
                    }}
                />

                {/* Center Cap */}
                <div className={cn("absolute bg-[#3c2a21] rounded-full z-10 border-2 border-[#e3ccb0]", isMobile ? "w-2 h-2" : "w-4 h-4")} />

                {/* RPM Label */}
                <div className={cn("absolute font-mono text-[#3c2a21]/50", isMobile ? "bottom-4 text-[6px]" : "bottom-8 text-[10px]")}>RPM x1000</div>
            </div>
            {!isMobile && <span className="font-mono text-xs text-[#cd5c09] tracking-widest uppercase">Scroll Boost</span>}
        </motion.div>
    );
};

const FloatingDust = () => {
    const [dust, setDust] = useState<{ x: number, y: number, size: number, duration: number, delay: number }[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);

        // Only create dust particles on desktop
        if (window.innerWidth >= 768) {
            setDust([...Array(15)].map(() => ({ // Reduced from 30 to 15
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 3 + 1,
                duration: Math.random() * 20 + 10,
                delay: Math.random() * 10
            })));
        }
    }, []);

    // Don't render on mobile for performance
    if (isMobile || dust.length === 0) {
        return null;
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {dust.map((d, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-[#f2e8cf]/40 blur-[1px]"
                    style={{
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        width: d.size,
                        height: d.size,
                        willChange: "transform, opacity"
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, 50, 0],
                        opacity: [0, 0.6, 0]
                    }}
                    transition={{
                        duration: d.duration,
                        repeat: Infinity,
                        delay: d.delay,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

const FilmScratches = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Don't render on mobile for performance
    if (isMobile) {
        return null;
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-10">
            <motion.div
                className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] mix-blend-overlay"
                animate={{
                    x: ["-1%", "1%", "0%"],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 0.1, repeat: Infinity }}
                style={{ willChange: "transform, opacity" }}
            />
            <motion.div
                className="absolute top-0 bottom-0 w-px bg-white/20"
                style={{ left: "20%", willChange: "transform" }}
                animate={{ x: ["0%", "50%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
};

const FlipNumber = ({ value }: { value: number }) => {
    const formatted = String(value).padStart(2, '0');

    return (
        <div className="flex gap-2">
            {formatted.split('').map((digit, i) => (
                <div key={i} className="relative w-[40px] h-[60px] md:w-[60px] md:h-[90px] perspective-[1000px]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={digit}
                            initial={{ rotateX: 90, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            exit={{ rotateX: -90, opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.4, 0, 0.2, 1], // Smooth mechanical timing
                                opacity: { duration: 0.3 }
                            }}
                            style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
                            className="absolute inset-0 bg-[#3c2a21] border-2 border-[#cd5c09]/40 rounded-lg flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            {/* Mechanical Split Line */}
                            <div className="absolute inset-x-0 top-[calc(50%-1px)] h-[2px] bg-black/80 z-30 shadow-sm" />

                            {/* Rivets at the hinge */}
                            <div className="absolute top-[calc(50%-3px)] left-1 w-1.5 h-1.5 bg-[#cd5c09]/60 rounded-full z-40 border border-black/20" />
                            <div className="absolute top-[calc(50%-3px)] right-1 w-1.5 h-1.5 bg-[#cd5c09]/60 rounded-full z-40 border border-black/20" />

                            <span className={cn("relative z-20 text-3xl md:text-5xl text-[#f2e8cf] font-black leading-none drop-shadow-md", bebasNeue.className)}>
                                {digit}
                            </span>

                            {/* Lighting and Texture */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />
                            <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        </motion.div>
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const RaceCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date("2026-03-14T09:00:00").getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const TimeUnit = ({ value, label }: { value: number, label: string }) => (
        <div className="relative group flex flex-col items-center">
            <FlipNumber value={value} />
            <span className={cn("mt-4 text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#cd5c09] font-black italic drop-shadow-sm", specialElite.className)}>{label}</span>

            {/* Connecting Hardware */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full flex justify-between px-2">
                <div className="w-2 h-2 bg-[#cd5c09] rounded-full border border-black/40" />
                <div className="w-2 h-2 bg-[#cd5c09] rounded-full border border-black/40" />
            </div>
        </div>
    );

    return (
        <div className="flex justify-center gap-6 md:gap-12 mt-20 z-20">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
    );
};

// --- Sections ---

const Hero = () => {
    const { scrollY } = useScroll();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Weighted parallax for buttery smoothness
    const y1Raw = useTransform(scrollY, [0, 500], [0, isMobile ? 50 : 100]);
    const y1 = useSpring(y1Raw, { stiffness: 100, damping: 30, mass: 0.5 });

    const scaleRaw = useTransform(scrollY, [0, 1000], [1, isMobile ? 1.05 : 1.15]);
    const scale = useSpring(scaleRaw, { stiffness: 100, damping: 30, mass: 0.5 });

    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-transparent text-[#3c2a21]">
            <motion.div
                style={{ y: y1, scale, opacity, willChange: "transform, opacity" }}
                className="absolute inset-0 z-0"
            >
                <Image
                    src={IMAGES[0]}
                    alt="Hero Background"
                    fill
                    className={cn(
                        "object-cover object-center saturate-[0.1] contrast-[1.5] brightness-[0.7] sepia-[0.6] grayscale-[0.3]",
                        isMobile ? "" : "blur-[1px]" // Remove blur on mobile
                    )}
                    priority
                    decoding="async"
                />
                {/* Vintage Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-20 mix-blend-multiply pointer-events-none" />
                <div className="absolute inset-0 bg-[#3c2a21]/20 mix-blend-color pointer-events-none" />

                {/* Vintage Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#e3ccb0]" />
                <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.6)]" />

                {/* Dynamic Light Leak Effect - Desktop only */}
                {!isMobile && (
                    <div
                        className="absolute inset-0 bg-gradient-to-tr from-[#cd5c09]/10 via-transparent to-transparent mix-blend-screen opacity-30 pointer-events-none"
                    />
                )}

                <FloatingDust />
                <FilmScratches />
            </motion.div>

            {/* Official Postage Stamp Accessory */}
            <motion.div
                className="absolute top-24 right-12 z-20 w-32 h-32 opacity-80 rotate-12 hidden md:block"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 12 }}
                transition={{ type: "spring", delay: 1.5 }}
            >
                <div className="relative w-full h-full border-[6px] border-dashed border-[#3c2a21]/40 flex items-center justify-center p-4">
                    <div className="text-center font-bold uppercase tracking-tighter text-[#3c2a21]/60 leading-none">
                        <div className="text-[10px]">SMVITM</div>
                        <div className="text-xl">APPROVED</div>
                        <div className="text-[8px] border-t border-[#3c2a21]/40 mt-1 pt-1">EXHIBIT #2K26</div>
                    </div>
                </div>
            </motion.div>



            <div className="relative z-10 flex h-full flex-col items-center justify-center p-4">
                <motion.div
                    style={{ opacity }}
                    className="text-center space-y-4 flex flex-col items-center"
                >
                    <Reveal direction="down" delay={0.5}>
                        <div className="flex flex-col items-center gap-2">
                            <span className={cn("text-sm md:text-base text-[#3c2a21]/80 tracking-[0.4em] uppercase border-b border-[#cd5c09] pb-1 italic font-semibold", cormorant.className)}>
                                SMVITM Campus Presents
                            </span>
                            <div className="inline-flex items-center gap-4 py-2 mt-2">
                                <div className="h-px w-8 bg-[#cd5c09]" />
                                <span className={cn("text-xs md:text-sm uppercase tracking-[0.3em] text-[#3c2a21] font-black", bebasNeue.className)}>
                                    Official Exhibition Archive
                                </span>
                                <div className="h-px w-8 bg-[#cd5c09]" />
                            </div>
                        </div>
                    </Reveal>

                    <StaggerContainer delay={0.6}>
                        <StaggerItem>
                            <motion.div className="relative group flex flex-col items-center">
                                {/* Curved MOTOMANIA Heading */}
                                <div className="relative w-screen max-w-[1400px] h-[30vw] md:h-[280px] flex items-center justify-center -mb-12 md:-mb-16 scale-110 md:scale-100">
                                    <svg viewBox="0 0 1000 350" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" preserveAspectRatio="xMidYMid meet">
                                        <path id="curve-header" d="M 50,280 Q 500,20 950,280" fill="transparent" />
                                        <text width="1000" className={cn("fill-[#f2e8cf] uppercase", ryeFont.className)} style={{ WebkitTextStroke: '2px #3c2a21' }}>
                                            <textPath href="#curve-header" startOffset="50%" textAnchor="middle" className="text-[100px] md:text-[120px] tracking-[0.05em]">
                                                MOTOMANIA
                                            </textPath>
                                        </text>
                                    </svg>
                                </div>

                                {/* 2K26 Sub-branding - Tight Gap */}
                                <motion.div
                                    className={cn("relative z-30 text-[10vw] md:text-9xl leading-none text-[#f2e8cf] uppercase drop-shadow-[5px_5px_0px_#3c2a21] -mt-4 md:-mt-8", abrilFatface.className)}
                                    style={{ WebkitTextStroke: '1px #3c2a21' }}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                >
                                    2K26
                                </motion.div>

                                {/* Decorative Vintage Divider */}
                                <div className="relative w-32 h-1 md:w-64 bg-[#cd5c09] mt-4 md:mt-6 before:absolute before:inset-0 before:bg-[#3c2a21] before:-translate-y-2 before:h-0.5 after:absolute after:inset-0 after:bg-[#3c2a21] after:translate-y-2 after:h-0.5" />
                            </motion.div>
                        </StaggerItem>

                        <StaggerItem>
                            <RaceCountdown />
                        </StaggerItem>

                        <StaggerItem>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                                <div className="group relative">
                                    <div className="absolute inset-0 bg-[#3c2a21] translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                                    <div className="relative bg-[#cd5c09] text-[#e3ccb0] px-8 py-3 font-bold font-serif text-2xl uppercase border-2 border-[#3c2a21]">
                                        Auto Expo 2k26
                                    </div>
                                </div>
                                <div className="group relative">
                                    <div className="absolute inset-0 bg-[#cd5c09] translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                                    <div className="relative bg-[#3c2a21] text-[#e3ccb0] px-8 py-3 font-mono text-base uppercase border-2 border-[#cd5c09]">
                                        March 14, 2026
                                    </div>
                                </div>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </motion.div>
            </div>

            {/* Scroll Indicator with Vintage Flavour */}
            <motion.div
                style={{ opacity }}
                className="absolute bottom-12 right-12 z-20 flex flex-col items-center gap-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <span className={cn("text-[10px] uppercase tracking-[0.3em] font-bold text-[#3c2a21]/50 rotate-90 mb-8", bebasNeue.className)}>Scroll Down</span>
                <div className="bg-[#cd5c09] p-3 rounded-full text-[#f2e8cf] shadow-xl border-2 border-[#3c2a21]">
                    <ArrowDown className="h-6 w-6" />
                </div>
            </motion.div>
        </section >
    );
};

const AboutSection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    return (
        <section className="relative py-32 px-4 bg-transparent text-[#3c2a21] overflow-hidden">

            {/* Decorative Background Text */}
            <div className="absolute top-0 left-0 w-full overflow-hidden opacity-10 pointer-events-none">
                <Reveal direction="right" delay={0.2} width="100%">
                    <h3 className="text-[20vw] font-serif leading-none whitespace-nowrap text-[#3c2a21]">LEGACY SPEED POWER</h3>
                </Reveal>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-6">
                    <Reveal direction="left" delay={0.2}>
                        <div className={cn("inline-flex items-center gap-2 text-[#cd5c09] tracking-[0.2em] text-sm font-bold uppercase", bebasNeue.className)}>
                            <Gauge size={18} />
                            <span>Dispatch Log #0934</span>
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={0.3}>
                        <h2 className={cn("text-5xl md:text-6xl leading-[0.9] text-[#3c2a21]", abrilFatface.className)}>
                            HISTORY IN THE <br />
                            <span className="text-[#cd5c09] italic underline decoration-wavy decoration-[#3c2a21]/20">MAKING</span>
                        </h2>
                    </Reveal>

                    <Reveal direction="left" delay={0.4}>
                        <p className={cn("text-base md:text-lg leading-relaxed text-[#3c2a21]/80 text-justify border-l-4 border-[#cd5c09] pl-6", specialElite.className)}>
                            Every piston firing is a heartbeat recorded in time. This isn't just an expo—it's a sanctuary for the machines that built the modern world. Join us for a day of chrome, rubber, and pure adrenaline.
                        </p>
                    </Reveal>

                    <StaggerContainer className="grid grid-cols-2 gap-4 pt-4">
                        <StaggerItem>
                            <div className="bg-[#3c2a21] text-[#e3ccb0] p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#cd5c09] transition-colors shadow-lg">
                                <Calendar className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold font-serif uppercase text-lg">Mar 14</span>
                                <span className="text-xs font-mono opacity-60">2026</span>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="bg-[#3c2a21] text-[#e3ccb0] p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#cd5c09] transition-colors shadow-lg">
                                <MapPin className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold font-serif uppercase text-lg">Campus</span>
                                <span className="text-xs font-mono opacity-60">Venue</span>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>

                <motion.div
                    className="relative h-[400px] md:h-[500px] w-full p-4 bg-[#f2e8cf] shadow-[20px_20px_0px_#3c2a21] rotate-2 border-4 border-[#3c2a21]"
                    initial={{ opacity: 0, rotate: 10, scale: 0.8 }}
                    whileInView={{ opacity: 1, rotate: 2, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    whileHover={{ rotate: 0, scale: 1.02 }}
                    viewport={{ once: true }}
                >
                    <Image src={IMAGES[1]} alt="About Image" fill className="object-cover contrast-[1.1] brightness-[1.1] border-2 border-[#3c2a21]" />

                    {/* Floating Badge - Optimized for Mobile */}
                    <motion.div
                        className="absolute -top-6 -right-6 bg-[#cd5c09] text-white w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center font-bold text-center text-xs uppercase border-4 border-white shadow-lg z-20"
                        animate={isMobile ? {} : { rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            {!isMobile && (
                                <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-white fill-current">
                                    <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                                    <text width="500">
                                        <textPath href="#curve" className="text-[10px] tracking-[0.15em] font-mono">
                                            • VINTAGE • CLASSIC • LEGEND •
                                        </textPath>
                                    </text>
                                </svg>
                            )}
                            <Skull size={isMobile ? 32 : 24} />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

const SpeedLines = () => {
    const [lines, setLines] = useState<{ top: string, duration: number, delay: number }[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "20%" });

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth >= 768) {
            setLines([...Array(8)].map(() => ({ // Reduced from 10 to 8
                top: `${Math.random() * 100}%`,
                duration: Math.random() * 0.5 + 0.2,
                delay: Math.random() * 2
            })));
        }
    }, []);

    if (isMobile || lines.length === 0) return null;

    return (
        <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-30">
            {isInView && lines.map((l, i) => (
                <motion.div
                    key={i}
                    className="absolute h-px bg-white/50 w-full"
                    style={{
                        top: l.top,
                        left: 0,
                        transform: "translateZ(0)",
                        willChange: "transform, opacity"
                    }}
                    animate={{
                        x: ["-100%", "100%"],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: l.duration,
                        repeat: Infinity,
                        repeatDelay: l.delay,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

const DriftingFog = () => {
    const ref = useRef(null);
    const isInView = useInView(ref);

    return (
        <div ref={ref} className="absolute inset-x-0 bottom-0 h-48 pointer-events-none z-20 overflow-hidden">
            {isInView && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-[#e8e0d5]/20 to-transparent blur-xl"
                    animate={{ x: ["-10%", "10%"] }}
                    transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                    style={{ transform: "translateZ(0)" }}
                />
            )}
        </div>
    );
};

// --- Text Animation Component ---
const ScrambleText = ({ text, className, style }: { text: string, className?: string, style?: any }) => {
    const [display, setDisplay] = useState(text);
    const [trigger, setTrigger] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-10%" });

    useEffect(() => {
        if (isInView) {
            let iterations = 0;
            const interval = setInterval(() => {
                setDisplay(text.split("")
                    .map((letter, index) => {
                        if (index < iterations) return text[index];
                        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)];
                    })
                    .join("")
                );
                if (iterations >= text.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isInView, text, trigger]);

    return <span ref={ref} className={className} style={style}>{display}</span>;
};

const VintageCard = ({ src, index, title }: { src: string, index: number, title?: string }) => {
    const ref = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Use simplified scroll progress for card animations
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Weighted spring for smooth damping on cards
    const yRaw = useTransform(scrollYProgress, [0, 1], isMobile ? [15, -15] : [40, -40]);
    const y = useSpring(yRaw, { stiffness: 60, damping: 25, mass: 0.5 });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <motion.div
            ref={ref}
            style={{
                opacity,
                y,
                transform: "translateZ(0)",
                willChange: "transform, opacity"
            }}
            className="relative w-full max-w-4xl mx-auto z-10"
        >
            <motion.div
                whileHover={isMobile ? {} : { scale: 1.02, rotate: index % 2 === 0 ? -1 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                    "relative p-4 md:p-6 bg-[#f4f1ea] shadow-[8px_8px_0px_#3c2a21] transition-shadow duration-500 border-2 border-[#3c2a21]",
                    index % 2 === 0 ? "rotate-1" : "-rotate-1"
                )}
            >
                {/* Tape Effect - No backdrop-blur on mobile */}
                <div className={cn(
                    "absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#cd5c09]/80 rotate-2 shadow-lg z-20 flex items-center justify-center opacity-90 border-2 border-[#3c2a21]/20",
                    isMobile ? "" : "backdrop-blur-sm"
                )}>
                    <span className="font-mono font-bold text-[#e3ccb0] tracking-[0.2em] text-xs uppercase">Restricted Access</span>
                </div>

                {/* Main Image Container */}
                <div className="relative aspect-video w-full overflow-hidden border-[8px] border-[#3c2a21] bg-[#3c2a21] transition-transform shadow-2xl">
                    <motion.div
                        className="relative w-full h-full overflow-hidden group"
                        initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
                        whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{
                            duration: isMobile ? 0.6 : 1.2, // Faster on mobile
                            ease: "easeOut"
                        }}
                    >
                        <Image
                            src={src}
                            alt={title || "Auto Expo Memory"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                            priority={index < 2} // Prioritize first 2 images
                            quality={isMobile ? 60 : 85} // Reduced quality for mobile performance
                            decoding="async"
                            className={cn(
                                "object-cover transition-transform duration-1000 ease-out saturate-[1.1] contrast-[1.05]",
                                isMobile ? "" : "group-hover:scale-110"
                            )}
                            loading={index < 2 ? "eager" : "lazy"}
                        />

                        {/* Professional Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
                    </motion.div>
                </div>

                {/* Meta Data Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <span className={cn("text-xs text-white uppercase tracking-[0.2em] font-bold", bebasNeue.className)}>Live Exhibit_0{index + 1}</span>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 z-10">
                    <h3 className={cn("text-2xl md:text-3xl text-white tracking-widest uppercase drop-shadow-2xl", cormorant.className)}>
                        {title || "HIGH OCTANE"}
                    </h3>
                </div>
            </motion.div>

            {/* Footer Metadata */}
            <div className="mt-6 flex justify-between items-center border-t border-[#3c2a21]/20 pt-4 px-2">
                <div className={cn("flex gap-6 text-[10px] uppercase font-bold text-[#3c2a21]/60 tracking-widest", specialElite.className)}>
                    <span>Log: 2K26_MM</span>
                    <span className="hidden md:inline">Loc: SMVITM Campus</span>
                    <div className="flex gap-2 opacity-40">
                        <span>ISO 400</span>
                        <span>f/2.8</span>
                    </div>
                </div>
                <div className={cn("text-xs font-bold text-[#cd5c09] flex items-center gap-2", cormorant.className)}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cd5c09]" />
                    #MOTO_MANIA_PREMIUM
                </div>
            </div>
        </motion.div>
    );
};

const RoadGallery = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    // The "Road" Line - Glowing and pulsing
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    // Always call these hooks at the top level to follow Rules of Hooks
    const bgY = useTransform(scrollYProgress, [0, 1], [-100, 100]);
    const bgOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 0.15, 0.15, 0]);

    const carY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const carOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.1, 0.1, 0]);

    // Specific images for Asphalt Chronicles
    const ASPHALT_EXHIBITS = [
        { src: "/img/DSC_0018.JPG", title: "Vintage Classic" },
        { src: "/img/IMG_4528.JPG", title: "Retro Racer" },
        { src: "/img/DSC_0033.JPG", title: "Timeless Beauty" },
        { src: "/img/IMG_4523.JPG", title: "The Cruiser" },
        { src: "/img/IMG_4378.JPG", title: "Old School Cool" },
        { src: "/img/IMG_4382.JPG", title: "Legacy Machine" },
        { src: "/img/IMG_4452.JPG", title: "Speed Demon" },
        { src: "/img/IMG_4488.JPG", title: "Chrome Legend" },
        { src: "/img/IMG_4596.JPG", title: "Asphalt King" },
        { src: "/img/IMG_4646.JPG", title: "Urban Rider" },
        { src: "/img/IMG_4666.JPG", title: "Heritage Softail" },
        { src: "/img/IMG_4743.JPG", title: "Iron Horse" },
        { src: "/img/IMG_4731.JPG", title: "Road Warrior" }
    ];

    return (
        <section ref={containerRef} className="relative py-4 bg-transparent overflow-hidden perspecrive-[2000px]">
            {/* Live Atmosphere Effects */}
            <SpeedLines />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 mix-blend-multiply pointer-events-none" />

            <Marquee text="REGISTER NOW FOR 2K26" direction={1} />

            {/* Refined Background Watermark Image - Desktop only or simplified on mobile */}
            {!isMobile && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div
                        style={{
                            y: bgY,
                            opacity: bgOpacity,
                            scale: 1.2,
                            willChange: "transform, opacity"
                        }}
                        className="absolute inset-0 flex items-center justify-center mix-blend-multiply"
                    >
                        <Image
                            src="/img/asphalt_bg.png"
                            alt="Background Watermark"
                            width={1200}
                            height={600}
                            className="object-contain grayscale contrast-110"
                            loading="lazy"
                        />
                    </motion.div>
                </div>
            )}

            {/* Cinematic Background Parallax Car - Desktop only, no blur on mobile */}
            {!isMobile && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div
                        style={{
                            y: carY,
                            opacity: carOpacity,
                            willChange: "transform, opacity"
                        }}
                        className="absolute top-[10%] -left-[10%] w-[120%] h-[120%] grayscale brightness-50 mix-blend-multiply opacity-30"
                    >
                        <Image
                            src="/img/car_blur_bg.png"
                            alt="Background Car"
                            fill
                            className="object-contain"
                            loading="lazy"
                        />
                    </motion.div>
                </div>
            )}

            {/* The Road Line - Starts AFTER the title */}
            <div className="absolute left-1/2 top-[22rem] bottom-0 w-4 -translate-x-1/2 bg-[#3c2a21] border-x border-[#cd5c09]/30 z-0">
                <motion.div
                    style={{ height: lineHeight, willChange: "height" }}
                    className="w-full bg-gradient-to-b from-[#3c2a21] via-[#cd5c09] to-[#3c2a21] shadow-[0_0_20px_rgba(205,92,9,0.3)]"
                />
            </div>

            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 mt-6">
                <div className="text-center mb-6 relative">
                    <Reveal direction="none" width="100%">
                        <div className="flex flex-col items-center">
                            <div className="relative inline-block py-6 px-12 border-4 border-[#3c2a21] bg-[#e3ccb0] shadow-[10px_10px_0px_#3c2a21]">
                                <span className={cn("text-[#cd5c09] tracking-[0.8em] uppercase text-xs font-black mb-2 block", bebasNeue.className)}>Verified Exhibition</span>
                                <h2 className={cn("text-6xl md:text-8xl text-[#3c2a21] tracking-tighter uppercase leading-[0.8] mb-2", staatliches.className)}>
                                    Asphalt <br />
                                    <span className={cn("text-[#cd5c09]", ryeFont.className)}>Chronicles</span>
                                </h2>
                                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#cd5c09]" />
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#cd5c09]" />
                            </div>
                            {/* Skid Mark Detail - Simplified on mobile */}
                            {!isMobile && (
                                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[120vw] h-40 opacity-10 pointer-events-none mix-blend-multiply rotate-[-2deg]"
                                    style={{
                                        backgroundImage: `url('https://www.transparenttextures.com/patterns/black-linen.png')`,
                                        backgroundRepeat: 'repeat',
                                        maskImage: 'radial-gradient(ellipse, black, transparent 70%)'
                                    }}
                                />
                            )}
                            <div className={cn("mt-16 text-[#3c2a21]/60 uppercase tracking-[0.8em] text-[10px] font-black", bebasNeue.className)}>
                                SMVITM • Heritage Racing Archive
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="flex flex-col gap-8 relative"> {/* Tightened gap */}
                    {ASPHALT_EXHIBITS.map((item, i) => (
                        <div key={i} className={cn("flex w-full items-center relative", i % 2 === 0 ? "justify-start md:justify-start" : "justify-end md:justify-end")}>

                            {/* Center Dot on Road */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#f2e8cf] border-4 border-[#3c2a21] rounded-full z-10 hidden md:block shadow-xl" />

                            <motion.div
                                className={cn("w-full md:w-[70%] relative px-4 md:px-0", i % 2 === 0 ? "md:pr-12" : "md:pl-12")}
                                whileTap={{ scale: 0.98, rotate: i % 2 === 0 ? -0.5 : 0.5 }}
                            >
                                <VintageCard src={item.src} index={i} title={item.title} />
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// SkidTrail removed for performance optimization as per user request for Amazon-like smoothness

const FingerprintAccess = ({ onUnlock }: { onUnlock: () => void }) => {
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (progress >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            // innovative fix for "Cannot update component while rendering": defer the callback
            setTimeout(() => {
                onUnlock();
            }, 0);
        }
    }, [progress, onUnlock]);

    const startScan = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setProgress(p => {
                if (p >= 100) return 100;
                return p + 2;
            });
        }, 20);
    };

    const stopScan = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(0);
    };

    return (
        <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500"
            onMouseDown={startScan}
            onMouseUp={stopScan}
            onTouchStart={startScan}
            onTouchEnd={stopScan}
        >
            <div className="relative cursor-pointer group scale-125">
                <svg className="w-24 h-24 text-[#cd5c09] opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8c0-1.66 1.34-3 3-3h0c1.66 0 3 1.34 3 3v8h3c1.66 0 3-1.34 3-3V10a9 9 0 0 0-9-9z" />
                    <path d="M12 21v-8" />
                    <path d="M12 13a2 2 0 0 0-2 2v2" />
                    <path d="M12 13a2 2 0 0 1 2 2v2" />
                </svg>

                {/* Progress Ring */}
                <svg className="absolute inset-0 w-24 h-24 -rotate-90 pointer-events-none">
                    <circle cx="48" cy="48" r="46" stroke="#cd5c09" strokeWidth="2" fill="none" strokeDasharray="300" strokeDashoffset={300 - (progress * 3)} className="transition-all duration-100 ease-linear" />
                </svg>

                {/* Scan Line */}
                <motion.div
                    className="absolute inset-x-0 h-1 bg-[#d4af37] shadow-[0_0_10px_#d4af37]"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <p className="mt-4 font-mono text-[#d4af37] tracking-[0.5em] text-xs animate-pulse">HOLD TO ACCESS</p>
        </div>
    );
};

const HorizontalArchive = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });

    // Ultra-Smooth Spring Physics - Optimized for performance
    const xRaw = useTransform(scrollYProgress, [0, 1], [0, -75]);
    const xSpring = useSpring(xRaw, {
        stiffness: 45,
        damping: 40,
        mass: 0.5,
        restDelta: 0.001,
        restSpeed: 0.001
    });
    const x = useTransform(xSpring, (v) => `${v}%`);

    // Always call hooks at top level
    const vaultTitleX = useTransform(scrollYProgress, [0, 1], [50, -50]); // Reduced range

    const [isUnlocked, setIsUnlocked] = useState(false);

    const archiveImages = IMAGES.slice(12, 28);

    return (
        <section className="bg-transparent relative z-10 py-0 overflow-hidden">
            {/* --- Mobile View: Native Horizontal Scroll (Smooth & Touch Friendly) --- */}
            <div className="md:hidden relative py-10">
                <div className="px-4 mb-4">
                    <div className="relative bg-[#3c2a21] text-[#e3ccb0] p-4 shadow-[5px_5px_0px_#cd5c09] border-2 border-[#cd5c09] -rotate-2 w-fit">
                        <span className={cn("text-[8px] uppercase tracking-[0.3em] block mb-1 text-[#cd5c09]", bebasNeue.className)}>Archive Access Only</span>
                        <h3 className={cn("text-3xl uppercase tracking-tighter", ryeFont.className)}>The Vault</h3>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 border-2 border-red-900/40 rounded-full flex items-center justify-center rotate-12 bg-transparent pointer-events-none">
                            <span className="text-[6px] text-red-900/60 font-black text-center leading-none">SECURE</span>
                        </div>
                    </div>
                </div>
                <div className="flex overflow-x-auto gap-4 px-4 pb-8 pt-12 snap-x snap-mandatory no-scrollbar">
                    {archiveImages.map((src, i) => (
                        <div key={i} className="snap-center shrink-0">
                            <motion.div
                                className="relative w-[70vw] h-[40vh] border-[8px] border-[#f4f1ea] bg-[#f4f1ea] shadow-xl rotate-1 overflow-hidden"
                                whileInView={{ rotate: 0 }}
                                transition={{ type: "spring", stiffness: 50 }}
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#cd5c09] rounded-full z-20 shadow-sm" />
                                <motion.div
                                    className="relative w-full h-full overflow-hidden"
                                    initial={{ scale: 1.1, x: -10 }}
                                    whileInView={{ scale: 1, x: 0 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                >
                                    <Image
                                        src={src}
                                        alt={`Archive ${i}`}
                                        fill
                                        className="object-cover saturate-[1.1] contrast-[1.1] brightness-[1.05]"
                                        sizes="(max-width: 768px) 70vw, 400px"
                                        priority={i < 2}
                                        quality={60}
                                        decoding="async"
                                    />
                                </motion.div>
                                <div className="absolute bottom-2 right-2 font-mono text-[10px] bg-[#3c2a21] text-[#e3ccb0] px-2 py-0.5 z-10">
                                    #{i + 500}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Desktop View: Cinematic 'Inspector' Desk --- */}
            <div ref={targetRef} className="hidden md:block relative h-[100vh] mb-0 pb-0">
                <div className="sticky top-0 flex h-screen items-center bg-transparent overflow-hidden">
                    {/* Scientific Drawing/Technical Background Detail */}
                    <div className="absolute inset-x-0 top-0 h-full opacity-[0.03] pointer-events-none mix-blend-multiply flex items-center justify-center">
                        <div className="w-[100vw] h-[100vw] border-[100px] border-[#3c2a21] rounded-full flex items-center justify-center">
                            <div className="w-[60%] h-[60%] border-[50px] border-dashed border-[#cd5c09]" />
                        </div>
                    </div>

                    {!isUnlocked && <FingerprintAccess onUnlock={() => setIsUnlocked(true)} />}

                    <div className={cn("absolute inset-0 transition-opacity duration-700", !isUnlocked ? "opacity-0 invisible" : "opacity-100 visible")}>

                        {/* Large Floating Background Title */}
                        <motion.div
                            style={{ x: vaultTitleX }}
                            className="absolute top-1/2 -translate-y-1/2 left-0 z-0 w-full transition-opacity duration-700"
                        >
                            <h3 className={cn("text-[25vw] leading-none text-[#3c2a21]/5 whitespace-nowrap uppercase font-black", staatliches.className)}>
                                HISTORIC VAULT 2K26
                            </h3>
                        </motion.div>

                        {/* Title Sticker */}
                        <div className="absolute top-20 left-20 z-40">
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                className="relative bg-[#3c2a21] text-[#e3ccb0] p-6 shadow-[10px_10px_0px_#cd5c09] border-2 border-[#cd5c09] -rotate-3"
                            >
                                <span className={cn("text-xs uppercase tracking-[0.5em] block mb-2 text-[#cd5c09]", bebasNeue.className)}>Entry Restrictions Apply</span>
                                <h3 className={cn("text-5xl uppercase tracking-tighter", ryeFont.className)}>The Vault</h3>
                                {/* Archive Stamp Overlay */}
                                <div className="absolute -bottom-4 -right-4 w-16 h-16 border-4 border-red-900/40 rounded-full flex items-center justify-center rotate-12 bg-transparent pointer-events-none">
                                    <span className="text-[10px] text-red-900/60 font-black text-center leading-none">SECURE<br />ACCESS</span>
                                </div>
                            </motion.div>
                        </div>

                        <div className="relative z-10 py-10 h-full flex items-center">
                            <motion.div style={{ x }} className="flex gap-24 px-[20vw] items-center w-fit">
                                {archiveImages.map((src, i) => {
                                    // Use deterministic values based on index to avoid hydration mismatch
                                    const rotations = [3, -2, 1.5, 2.5, -1.5, 2, -2.5, 1, -1, 2];
                                    const yOffsets = [40, -30, 20, -40, 35, -25, 30, -35, 25, -20];
                                    const randomRot = rotations[i % rotations.length];
                                    const randomY = yOffsets[i % yOffsets.length];

                                    return (
                                        <motion.div
                                            key={i}
                                            className="relative w-[450px] h-[60vh] shrink-0 group perspective-[2000px]"
                                            style={{ rotate: randomRot, y: randomY, willChange: "transform" }}
                                            whileHover={{
                                                rotate: 0,
                                                y: randomY - 20,
                                                scale: 1.05,
                                                zIndex: 50,
                                                transition: { type: "spring", stiffness: 200, damping: 30 }
                                            }}
                                        >
                                            {/* Tactile Polaroid Body */}
                                            <div className="relative w-full h-full bg-[#f4f1ea] p-4 pb-16 shadow-[20px_20px_60px_rgba(0,0,0,0.3)] border border-[#3c2a21]/10">
                                                {/* 3D Headpin */}
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#cd5c09] via-[#3c2a21] to-black shadow-lg border border-white/20" />
                                                    <div className="w-1 h-8 bg-[#3c2a21]/20 -mt-1 mx-auto blur-[1px]" />
                                                </div>

                                                {/* Confidential Clip */}
                                                {i % 4 === 0 && (
                                                    <div className="absolute -top-2 left-6 w-12 h-6 bg-zinc-400/80 -rotate-12 rounded-sm border-x border-[#3c2a21]/40 z-20 shadow-sm" />
                                                )}

                                                <div className="relative w-full h-full overflow-hidden border-2 border-[#3c2a21]/5">
                                                    <Image
                                                        src={src}
                                                        alt={`Archive ${i}`}
                                                        fill
                                                        className="object-cover saturate-[1.2] contrast-[1.1] transition-transform duration-700 group-hover:scale-110"
                                                        sizes="450px"
                                                        quality={80}
                                                    />
                                                    {/* Film Grain Mesh */}
                                                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
                                                </div>

                                                {/* Backside Label Details */}
                                                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className={cn("text-[10px] text-[#3c2a21]/40 uppercase tracking-widest", specialElite.className)}>Entry Serial:</span>
                                                        <span className={cn("text-lg text-[#3c2a21] font-black tracking-tighter", bebasNeue.className)}>MM_ARC_2K26_{i + 500}</span>
                                                    </div>
                                                    <div className="h-8 w-px bg-[#3c2a21]/10 mx-2" />
                                                    <div className="flex flex-col text-right">
                                                        <span className={cn("text-[9px] text-[#cd5c09] font-black uppercase", graduate.className)}>Exhibition Ready</span>
                                                        <span className={cn("text-[10px] text-[#3c2a21]/60 italic", cormorant.className)}>Authenticity Verified</span>
                                                    </div>
                                                </div>

                                                {/* Scribbled Note (Randomly) */}
                                                {i % 5 === 2 && (
                                                    <div className="absolute top-[80%] -right-12 rotate-[-15deg] bg-white/40 backdrop-blur-sm p-2 border border-blue-900/10 text-blue-900/50 font-serif text-[10px] italic z-40 max-w-[120px]">
                                                        "Condition looks pristine. Recommended for main hall display."
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SectionDivider = () => (
    <div className="relative w-full h-8 flex items-center justify-center overflow-hidden pointer-events-none my-0 py-0">
        <div className="w-full h-px border-t-2 border-dashed border-[#3c2a21]/20" />
        <div className="absolute left-1/2 -translate-x-1/2 bg-[#e3ccb0] px-8 py-2 border-2 border-[#3c2a21]/10 rounded-full flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[#cd5c09] animate-pulse" />
            <span className={cn("text-[10px] uppercase tracking-[0.4em] font-black text-[#3c2a21]/40", bebasNeue.className)}>
                Next Logistic Phase
            </span>
            <div className="w-2 h-2 rounded-full bg-[#cd5c09] animate-pulse" />
        </div>
    </div>
);

const ScheduleSection = () => {
    return (
        <section className="relative py-0 px-4 bg-transparent overflow-hidden">
            <PaperTexture />
            <div className="max-w-6xl mx-auto py-8">
                <Reveal direction="up" delay={0.1}>
                    <div className="relative border-[12px] border-double border-[#3c2a21]/20 bg-[#e3ccb0] shadow-2xl rounded-sm overflow-hidden p-8 md:p-12">
                        {/* Old Paper Texture */}
                        <div className="absolute inset-0 opacity-10 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />

                        <div className="relative z-10 grid md:grid-cols-[1fr_2fr] gap-12">
                            {/* Left Side: Major Heading */}
                            <div className="flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-[#3c2a21]/10 pb-8 md:pb-0 md:pr-12">
                                <div className="space-y-4">
                                    <div className={cn("text-[#cd5c09] text-sm uppercase tracking-[0.5em] font-black", bebasNeue.className)}>Verified Logistics</div>
                                    <h2 className={cn("text-6xl md:text-8xl text-[#3c2a21] uppercase leading-[0.85] tracking-tighter drop-shadow-sm", abrilFatface.className)}>
                                        OFFICIAL <br />
                                        <span className="text-[#cd5c09] italic">SCHEDULE</span>
                                    </h2>
                                    <div className="w-20 h-2 bg-[#3c2a21] mt-4" />
                                </div>

                                <div className="mt-8 md:mt-0 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full border-2 border-[#3c2a21] flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-[#cd5c09]" />
                                        </div>
                                        <span className={cn("text-lg font-bold text-[#3c2a21]", specialElite.className)}>MARCH 14, 2026</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full border-2 border-[#3c2a21] flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-[#cd5c09]" />
                                        </div>
                                        <span className={cn("text-base font-bold text-[#3c2a21]", specialElite.className)}>SMVITM CAMPUS, BANTAKAL</span>
                                    </div>
                                </div>

                                <div className="relative hidden md:block h-32 w-full mt-8">
                                    <Image
                                        src="/img/vintage_car.png"
                                        alt="Vintage Car"
                                        fill
                                        className="object-contain object-left mix-blend-multiply opacity-30 grayscale"
                                    />
                                </div>
                            </div>

                            {/* Right Side: Program Flow */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-6 mb-8 group">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#3c2a21]/20" />
                                    <span className={cn("text-2xl md:text-3xl uppercase tracking-[0.3em] font-bold text-[#3c2a21]", ryeFont.className)}>• PROGRAM FLOW •</span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#3c2a21]/20" />
                                </div>

                                <StaggerContainer className="space-y-8 relative">
                                    {[
                                        { id: "01", title: "Assembly Point", detail: "Sudhanva Enterprises Bantakal, Udupi" },
                                        { id: "02", title: "Assembly Time", detail: "10:00 AM Sharp" },
                                        { id: "03", title: "Expo Venue", detail: "College Ground, SMVITM, Bantakal" },
                                        { id: "04", title: "Light Refreshments", detail: "11:00 AM - 12:00 PM" },
                                        { id: "05", title: "Grand Departure", detail: "12:30 PM Onwards" }
                                    ].map((item, idx) => (
                                        <StaggerItem key={item.id}>
                                            <motion.div
                                                className="flex items-start gap-8 group cursor-pointer"
                                                whileTap={{ scale: 0.98, x: 5 }}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className={cn("text-4xl text-[#cd5c09] font-black leading-none", graduate.className)}>{item.id}</span>
                                                    <div className="w-px h-12 bg-gradient-to-b from-[#3c2a21]/20 to-transparent mt-2" />
                                                </div>
                                                <div className="flex-1 pb-4 border-b border-[#3c2a21]/10 group-hover:border-[#cd5c09]/40 transition-all">
                                                    <h3 className={cn("text-xl md:text-2xl font-black uppercase tracking-widest text-[#3c2a21] mb-1", specialElite.className)}>
                                                        {item.title}
                                                    </h3>
                                                    <p className={cn("text-lg md:text-xl text-[#3c2a21]/70 font-medium italic", cormorant.className)}>
                                                        {item.detail}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>

                                {/* Location QR / Verification */}
                                <div className="pt-8 flex flex-col md:flex-row items-center gap-8 border-t border-[#3c2a21]/10">
                                    <div className="relative w-32 h-32 border-4 border-[#3c2a21] p-2 bg-white rotate-2 shadow-lg">
                                        <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMVITM-MOTOMANIA')] bg-cover opacity-90 grayscale" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className={cn("block text-xs uppercase tracking-[0.4em] font-black text-[#cd5c09]", bebasNeue.className)}>Identity Verification :</span>
                                        <p className={cn("text-[11px] leading-relaxed opacity-60 uppercase tracking-widest mt-2", specialElite.className)}>
                                            Official Paddock Pass required for <br />
                                            access to Restricted Areas. <br />
                                            ©SMVITM ARCHIVE DIV. 2026
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Elements */}
                        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#3c2a21]/20" />
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#3c2a21]/20" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

const RegistrationCTA = () => {
    return (
        <section className="relative py-16 bg-transparent text-[#3c2a21] overflow-hidden flex items-center justify-center min-h-[60vh]">

            {/* Animated Background Rings - Optimized with InView */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute border border-[#cd5c09]/20 rounded-full"
                        style={{ width: `${i * 30}vw`, height: `${i * 30}vw` }}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                        transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-4">
                <Reveal direction="up" delay={0.2} width="100%">
                    <div className="group relative bg-[#e3ccb0] text-[#3c2a21] p-8 md:p-12 shadow-[0_0_50px_rgba(205,92,9,0.1)] border-4 border-[#3c2a21] overflow-hidden">

                        {/* Scanner Light Effect */}
                        <motion.div
                            className="absolute inset-0 w-full h-[20%] bg-gradient-to-b from-transparent via-[#3c2a21]/10 to-transparent z-20 pointer-events-none mix-blend-multiply"
                            animate={{ top: ["-20%", "120%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                        />

                        <div className="text-center space-y-8 relative z-30">
                            <div className="flex flex-col items-center">
                                <span className={cn("text-[#cd5c09] tracking-[0.4em] uppercase text-sm font-bold", bebasNeue.className)}>Entry Clearance Required</span>
                                <h1 className={cn("text-5xl md:text-8xl leading-none mt-2", abrilFatface.className)}>
                                    JOIN THE <br />
                                    <span className={cn("text-[#cd5c09]", ryeFont.className)}>LEGACY</span>
                                </h1>
                            </div>

                            <p className={cn("text-base md:text-lg text-[#3c2a21]/80 max-w-md mx-auto leading-relaxed", specialElite.className)}>
                                Secure your place in the archives. Only the most prestigious machines will be logged in this ledger of steel and history.
                            </p>

                            <div className="flex justify-between items-center text-xs font-mono uppercase opacity-60 pt-4 border-t border-[#3c2a21]/20">
                                <span>Limited Slots Available</span>
                                <span>SMVITM Campus</span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

const SponsorSection = () => {
    const sponsors = [
        "Castrol Racing", "Dunlop Tires", "Shell V-Power", "Brembo", "NGK Spares", "Akrapovič"
    ];

    return (
        <section className="relative py-16 bg-[#3c2a21] text-[#f2e8cf] overflow-hidden border-y-8 border-[#cd5c09]/20">
            {/* Background Kinetic Text */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full opacity-5 select-none pointer-events-none">
                <h3 className={cn("text-[25vw] whitespace-nowrap leading-none", staatliches.className)}>
                    OFFICIAL PARTNERS • OFFICIAL PARTNERS
                </h3>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <Reveal direction="up">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <span className={cn("text-[#cd5c09] tracking-[0.5em] uppercase text-sm font-black", bebasNeue.className)}>Strategic Alliance</span>
                        <h2 className={cn("text-6xl md:text-8xl mt-4 leading-none", staatliches.className)}>THE PADDOCK</h2>
                    </div>
                </Reveal>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
                    {sponsors.map((name, i) => (
                        <Reveal key={i} direction="up" delay={i * 0.05}>
                            <div
                                className="group relative aspect-square bg-[#f2e8cf]/5 border border-[#f2e8cf]/10 flex flex-col items-center justify-center p-4 transition-all duration-300 hover:bg-[#cd5c09]/10"
                            >
                                <Star className="mb-4 text-[#cd5c09] opacity-40 group-hover:opacity-100" />
                                <span className={cn("text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase", graduate.className)}>
                                    {name}
                                </span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CinematicReveal = ({ isRevealed }: { isRevealed: boolean }) => (
    <motion.div
        initial={{ clipPath: "inset(0 0 0 0)" }}
        animate={isRevealed ? { clipPath: "inset(50% 0 50% 0)" } : { clipPath: "inset(0 0 0 0)" }}
        transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
        className="fixed inset-0 z-[999] bg-[#3c2a21] pointer-events-none"
        style={{ transform: "translateZ(0)", willChange: "clip-path" }}
    >
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={isRevealed ? { opacity: 0, scale: 1.2 } : { opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn("text-[#e3ccb0] text-3xl tracking-[1em] uppercase", staatliches.className)}
            >
                Initializing Archive...
            </motion.div>
        </div>
    </motion.div>
);

const TechnicalOverlay = ({ isRevealed }: { isRevealed: boolean }) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

    return (
        <motion.div
            animate={{ opacity: isRevealed ? 1 : 0 }}
            className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
        >
            {/* Viewport Brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#cd5c09]/20" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#cd5c09]/20" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[#cd5c09]/20" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#cd5c09]/20" />

            {/* Breathing Vignette - Simplified for Mobile */}
            <motion.div
                animate={isMobile ? { opacity: 0.3 } : { opacity: [0.3, 0.5, 0.3] }}
                transition={isMobile ? {} : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.4)]"
                style={{ willChange: "opacity" }}
            />

            {/* Dynamic Scan Info */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-8 opacity-20">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2 rotate-90 origin-right">
                        <div className="w-1 h-1 bg-[#cd5c09] rounded-full" />
                        <span className={cn("text-[8px] uppercase tracking-[0.4em] text-[#3c2a21]", bebasNeue.className)}>
                            SENS_NODE_00{i} // 2K26_MM
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default function MotomaniaPage() {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { setPageTheme } = useApp()

    useEffect(() => {
        setIsMounted(true);

        setPageTheme({
            name: 'MOTO',
            rgb: '205, 92, 9',
            primary: '#cd5c09'
        })

        // Wait for high priority assets and smooth start
        const timer = setTimeout(() => {
            setIsRevealed(true);
        }, 800);

        // Sync with browser "fully loaded" event for extra smoothness
        const handleLoad = () => setIsRevealed(true);
        window.addEventListener('load', handleLoad);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    if (!isMounted) return null;

    return (
        <main className="relative min-h-screen bg-[#e3ccb0] text-[#3c2a21] selection:bg-[#cd5c09] selection:text-white overflow-x-hidden">
            <CinematicReveal isRevealed={isRevealed} />
            <TechnicalOverlay isRevealed={isRevealed} />
            {isMounted && (
                <>
                    <PaperTexture />
                    <GrainOverlay />
                    <VintageFrame />
                </>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    pointerEvents: isRevealed ? "auto" : "none",
                    visibility: isRevealed ? "visible" : "hidden" // Allows pre-fetching but hides from view
                }}
            >
                <Hero />
                <Marquee text="REGISTER NOW FOR 2K26" direction={1} />
                <AboutSection />
                <SectionDivider />
                <RoadGallery />
                <SectionDivider />
                <HorizontalArchive />
                <SectionDivider />
                <ScheduleSection />
                <SectionDivider />
                <RegistrationCTA />
                <SectionDivider />
                <SponsorSection />

                <footer className="relative py-16 bg-[#3c2a21] text-[#f2e8cf]/60 border-t border-[#f2e8cf]/5 text-center px-4 overflow-hidden">
                    <div
                        className={cn("text-[15vw] leading-none opacity-5 font-black uppercase pointer-events-none select-none", staatliches.className)}
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', whiteSpace: 'nowrap' }}
                    >
                        MOTO MANIA 2K26 • PERFORMANCE HERITAGE
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-1 bg-[#cd5c09] mb-8" />
                            <h2 className={cn("text-5xl md:text-7xl text-[#f2e8cf] tracking-tighter", staatliches.className)}>THE ARCHIVE IS OPEN</h2>
                            <div className="w-16 h-1 bg-[#cd5c09] mt-8" />
                        </div>

                        <p className={cn("text-xs md:text-sm tracking-[0.6em] uppercase font-bold text-[#cd5c09]", bebasNeue.className)}>
                            © 2026 Moto Mania Auto Expo • SMVITM Campus • All Rights Reserved
                        </p>

                        <div className="flex justify-center items-center gap-12 mt-16">
                            <div className="flex gap-4">
                                <Star className="w-4 h-4 opacity-30" />
                                <Star className="w-4 h-4 text-[#cd5c09]" />
                                <Star className="w-4 h-4 opacity-30" />
                            </div>
                            <div className="h-px w-24 bg-[#f2e8cf]/10" />
                            <span className={cn("text-[10px] uppercase tracking-[0.3em] opacity-40", specialElite.className)}>Verified by SMVITM Archive Division</span>
                        </div>
                    </div>
                </footer>
            </motion.div>
        </main>
    );
}
