"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useInView, useAnimation, Variants } from "framer-motion";
import { ArrowDown, Calendar, MapPin, Ticket, Star, ChevronRight, Camera, Gauge, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const isInView = useInView(ref, { once: false, margin: "-10%" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        } else {
            controls.start("hidden");
        }
    }, [isInView, controls]);

    const getVariants = (): Variants => {
        const distance = 100;

        // "Auto Expo" Style: Motion Blur + Skew + Snap
        let initialObj: any = {
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)", // Speed effect
        };

        if (direction === "up") { initialObj.y = distance; initialObj.rotateX = 20; }
        if (direction === "down") { initialObj.y = -distance; initialObj.rotateX = -20; }
        if (direction === "left") { initialObj.x = distance; initialObj.skewX = -10; } // Drift entry
        if (direction === "right") { initialObj.x = -distance; initialObj.skewX = 10; }

        return {
            hidden: initialObj,
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotateX: 0,
                skewX: 0,
                filter: "blur(0px)",
                transition: {
                    duration: 1.4, // Slower, more majestic landing
                    delay: delay,
                    ease: [0.19, 1, 0.22, 1], // Custom "Power" ease
                    staggerChildren: 0.1
                }
            },
        };
    };

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "visible", perspective: "1000px" }} className={className}>
            <motion.div
                variants={getVariants()}
                initial="hidden"
                animate={controls}
                style={{ transformStyle: "preserve-3d" }}
            >
                {children}
            </motion.div>
        </div>
    );
};

const StaggerContainer = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-20%" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: 0.2,
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
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 100, rotateX: 30, filter: "blur(5px)" },
                show: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                }
            }}
            style={{ transformStyle: "preserve-3d" }}
        >
            {children}
        </motion.div>
    )
}

const GrainOverlay = () => (
    <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-30">
        <motion.div
            className="absolute inset-0"
            animate={{ x: ["0%", "-10%", "0%"], y: ["0%", "10%", "0%"] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
        />
    </div>
);

const SectionHeading = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 className={cn("font-serif text-4xl md:text-6xl lg:text-7xl text-[#d4af37] uppercase tracking-tighter", className)}>
        {children}
    </h2>
);

const Marquee = ({ text, direction = 1 }: { text: string, direction?: number }) => {
    return (
        <div className="relative flex overflow-hidden whitespace-nowrap border-y-2 border-[#1a1614] bg-[#cd5c09] py-3">
            <motion.div
                className="flex gap-8 font-serif text-lg md:text-xl font-bold uppercase tracking-widest text-[#1a1614]"
                style={{ fontFamily: "'Rye', serif" }}
                animate={{ x: direction > 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
    const rotation = useTransform(scrollYProgress, [0, 1], [-120, 120]); // Needle sweep

    return (
        <motion.div
            className="fixed bottom-8 left-8 z-50 hidden md:flex flex-col items-center gap-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
        >
            <div className="relative w-32 h-32 bg-[#1a1614] rounded-full border-4 border-[#333] shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
                {/* Gauge Face */}
                <div className="absolute inset-2 rounded-full border border-[#ffffff]/10" />

                {/* Ticks */}
                {[...Array(9)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-3 bg-white/50 top-2"
                        style={{
                            transform: `rotate(${(i * 30) - 120}deg)`,
                            transformOrigin: "center 56px"
                        }}
                    />
                ))}

                {/* Redline Zone */}
                <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-red-600/50 border-r-red-600/50 rotate-[45deg]" style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%)" }} />

                {/* Needle */}
                <motion.div
                    className="absolute w-1 h-14 bg-red-500 origin-bottom rounded-full"
                    style={{
                        rotate: rotation,
                        bottom: "50%"
                    }}
                />

                {/* Center Cap */}
                <div className="absolute w-4 h-4 bg-[#cd5c09] rounded-full z-10 border-2 border-[#1a1614]" />

                {/* RPM Label */}
                <div className="absolute bottom-8 font-mono text-[10px] text-white/50">RPM x1000</div>
            </div>
            <span className="font-mono text-xs text-[#cd5c09] tracking-widest uppercase">Scroll Boost</span>
        </motion.div>
    );
};

const RaceCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date("2026-03-14T09:00:00").getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

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
        <div className="flex flex-col items-center bg-[#1a1614]/80 border border-[#cd5c09]/30 p-3 rounded-sm backdrop-blur-md min-w-[80px]">
            <span className="font-mono text-3xl md:text-4xl text-[#e8e0d5] font-bold">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#cd5c09]">{label}</span>
        </div>
    );

    return (
        <div className="flex gap-4 mt-12 z-20">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hrs" />
            <TimeUnit value={timeLeft.minutes} label="Min" />
            <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>
    );
};

// --- Sections ---

const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-[#1a1614] text-[#e8e0d5]">
            <motion.div
                style={{ y: y1 }}
                className="absolute inset-0 z-0 opacity-50"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <Image
                    src={IMAGES[0]}
                    alt="Hero Background"
                    fill
                    className="object-cover object-center grayscale sepia brightness-50 contrast-125"
                />
            </motion.div>



            <div className="relative z-10 flex h-full flex-col items-center justify-center p-4">
                <motion.div
                    style={{ opacity }}
                    className="text-center space-y-4 flex flex-col items-center" // Centered flex column
                >
                    <Reveal direction="down" delay={0.5}>
                        <div className="flex flex-col items-center gap-2">
                            <span className="font-mono text-sm md:text-base text-[#d4af37] tracking-[0.5em] uppercase border-b border-[#cd5c09] pb-1">
                                SMVITM Presents
                            </span>
                            <div className="inline-flex items-center gap-2 border-2 border-[#cd5c09] px-4 py-1 bg-[#1a1614]/80 backdrop-blur-sm mt-2">
                                <Star className="text-[#cd5c09] animate-spin-slow" size={16} />
                                <span className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#e8e0d5]">
                                    Official Event
                                </span>
                                <Star className="text-[#cd5c09] animate-spin-slow" size={16} />
                            </div>
                        </div>
                    </Reveal>

                    <StaggerContainer delay={0.6}>
                        <StaggerItem>
                            <h1 className="text-[15vw] leading-[0.75] tracking-normal relative z-20 flex flex-col items-center" style={{ fontFamily: "'Rye', serif" }}>
                                {/* Chrome Shimmer Effect for MOTO */}
                                <motion.span
                                    className="bg-gradient-to-r from-[#e8e0d5] via-[#ffffff] to-[#e8e0d5] bg-clip-text text-transparent bg-[length:200%_auto] block"
                                    animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                >
                                    MOTO
                                </motion.span>

                                {/* Engine Heartbeat Pulse for MANIA */}
                                <motion.span
                                    className="text-[#cd5c09] stroke-text block"
                                    animate={{
                                        filter: ["brightness(1) drop-shadow(0 0 0px rgba(205,92,9,0))", "brightness(1.3) drop-shadow(0 0 20px rgba(205,92,9,0.5))", "brightness(1) drop-shadow(0 0 0px rgba(205,92,9,0))"],
                                        scale: [1, 1.02, 1]
                                    }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.1 }} // Fast, like an engine rev
                                >
                                    MANIA
                                </motion.span>
                            </h1>
                        </StaggerItem>

                        {/* Integrated Countdown */}
                        <StaggerItem>
                            <RaceCountdown />
                        </StaggerItem>

                        <StaggerItem>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                                <div className="bg-[#cd5c09] text-[#1a1614] px-6 py-2 font-bold font-serif text-xl uppercase -rotate-2 shadow-[4px_4px_0px_white]">
                                    Auto Expo 2k26
                                </div>
                                <div className="bg-[#e8e0d5] text-[#1a1614] px-6 py-2 font-mono text-sm uppercase rotate-2 shadow-[4px_4px_0px_#cd5c09]">
                                    March 14, 2026
                                </div>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </motion.div>
            </div>

            <motion.div
                style={{ opacity }}
                className="absolute bottom-8 right-8 z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div className="bg-[#d4af37] p-2 rounded-full text-[#1a1614]">
                    <ArrowDown className="h-6 w-6" />
                </div>
            </motion.div>


        </section >
    );
};

const AboutSection = () => {
    return (
        <section className="relative py-24 px-4 bg-[#e8e0d5] text-[#1a1614] overflow-hidden">

            {/* Decorative Background Text */}
            <div className="absolute top-0 left-0 w-full overflow-hidden opacity-5 pointer-events-none">
                <Reveal direction="right" delay={0.2} width="100%">
                    <h3 className="text-[20vw] font-serif leading-none whitespace-nowrap">LEGACY SPEED POWER</h3>
                </Reveal>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-6">
                    <Reveal direction="left" delay={0.2}>
                        <div className="inline-flex items-center gap-2 text-[#cd5c09] font-mono tracking-widest text-sm font-bold uppercase">
                            <Gauge size={18} />
                            <span>The Engine Roars</span>
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={0.3}>
                        <h2 className="font-serif text-5xl md:text-6xl leading-[0.9]">
                            HISTORY IN THE <br />
                            <span className="text-[#cd5c09] italic">MAKING</span>
                        </h2>
                    </Reveal>

                    <Reveal direction="left" delay={0.4}>
                        <p className="font-mono text-base md:text-lg leading-relaxed text-[#1a1614]/80 text-justify border-l-4 border-[#cd5c09] pl-6">
                            Every piston firing is a heartbeat. This isn't just an expo—it's a sanctuary for the machines that built the modern world. Join us for a day of chrome, rubber, and pure adrenaline.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Reveal direction="left" delay={0.5}>
                            <div className="bg-[#1a1614] text-[#e8e0d5] p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#cd5c09] transition-colors">
                                <Calendar className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold font-serif uppercase text-lg">Mar 14</span>
                                <span className="text-xs font-mono opacity-60">2026</span>
                            </div>
                        </Reveal>
                        <Reveal direction="right" delay={0.6}>
                            <div className="bg-[#1a1614] text-[#e8e0d5] p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#cd5c09] transition-colors">
                                <MapPin className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold font-serif uppercase text-lg">Campus</span>
                                <span className="text-xs font-mono opacity-60">Venue</span>
                            </div>
                        </Reveal>
                    </div>
                </div>

                <motion.div
                    className="relative h-[400px] md:h-[500px] w-full p-3 bg-white shadow-[15px_15px_0px_#1a1614] rotate-2"
                    initial={{ opacity: 0, rotate: 10, scale: 0.8 }}
                    whileInView={{ opacity: 1, rotate: 2, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    whileHover={{ rotate: 0, scale: 1.02 }}
                    viewport={{ once: true }}
                >
                    <Image src={IMAGES[1]} alt="About Image" fill className="object-cover grayscale contrast-125 border-2 border-[#1a1614]" />

                    {/* Floating Badge */}
                    <motion.div
                        className="absolute -top-6 -right-6 bg-[#cd5c09] text-white w-24 h-24 rounded-full flex items-center justify-center font-bold text-center text-xs uppercase border-4 border-white shadow-lg z-20"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-white fill-current">
                                <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                                <text width="500">
                                    <textPath href="#curve" className="text-[10px] tracking-[0.15em] font-mono">
                                        • VINTAGE • CLASSIC • LEGEND •
                                    </textPath>
                                </text>
                            </svg>
                            <Skull size={24} />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

const SpeedLines = () => {
    const [lines, setLines] = useState<{ top: string, duration: number, delay: number }[]>([]);

    useEffect(() => {
        setLines([...Array(10)].map(() => ({
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 0.5 + 0.2,
            delay: Math.random() * 2
        })));
    }, []);

    if (lines.length === 0) return null; // Prevent server-client mismatch by rendering nothing initially

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-30">
            {lines.map((l, i) => (
                <motion.div
                    key={i}
                    className="absolute h-px bg-white/50 w-full"
                    style={{
                        top: l.top,
                        left: 0,
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

const DriftingFog = () => (
    <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none z-20 overflow-hidden">
        <motion.div
            className="absolute inset-0 bg-gradient-to-t from-[#e8e0d5]/20 to-transparent blur-xl"
            animate={{ x: ["-10%", "10%"] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
    </div>
);

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
    // Use scroll progress for this specific card's container to drive animation
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"] // Continuous animation across full viewport
    });

    // 3D "Drive In" Effect - Continuous Parallax
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]); // Reduced rotation for performance
    const y = useTransform(scrollYProgress, [0, 1], [50, -50]); // Reduced vertical movement
    // Added X transform for the requested "left and right" entrance effect
    const x = useTransform(scrollYProgress, [0, 0.5, 1], [index % 2 === 0 ? -50 : 50, 0, index % 2 === 0 ? 50 : -50]); // Reduced drift

    return (
        <motion.div
            ref={ref}
            style={{
                scale,
                opacity,
                rotateX,
                y,
                x,
                perspective: 1000,
                willChange: "transform" // Hardware acceleration
            }}
            className="relative w-full max-w-4xl mx-auto z-10" // Much wider container
        >
            <motion.div
                whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? -1 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                    "relative p-4 md:p-6 bg-[#f4f1ea] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] transition-shadow duration-500", // Hard shadow for performance and style
                    index % 2 === 0 ? "rotate-1" : "-rotate-1"
                )}
            >
                {/* Tape Effect */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#cd5c09]/90 rotate-2 shadow-lg z-20 flex items-center justify-center opacity-90 backdrop-blur-sm">
                    <span className="font-mono font-bold text-white tracking-[0.2em] text-xs uppercase">Restricted Access</span>
                </div>

                {/* Main Image Container */}
                <div className="relative aspect-video w-full overflow-hidden border-[6px] border-[#1a1a1a] bg-[#1a1a1a] transition-transform will-change-transform">
                    <div className="relative w-full h-full overflow-hidden group">
                        <Image
                            src={src}
                            alt={title || "Auto Expo Memory"}
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            priority={index < 2} // Load first 2 immediately
                            quality={60} // Optimize decoding speed
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />

                        {/* Cinematic Vignette & Grain */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
                    </div>

                    {/* HUD Overlay Elements */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#cd5c09] rounded-full animate-pulse" />
                            <span className="font-mono text-xs text-white/80 uppercase tracking-widest">Cam_0{index + 1} // REC</span>
                        </div>
                        <h3 className="font-serif text-2xl md:text-4xl text-white italic tracking-tighter shadow-black drop-shadow-lg" style={{ fontFamily: "'Rye', serif" }}>
                            <ScrambleText text={title || "HIGH OCTANE"} />
                        </h3>
                    </div>

                    {/* Holographic Sticker */}
                    <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-700">
                        <Star size={24} className="text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 flex justify-between items-center border-t-2 border-[#1a1a1a] pt-3 px-2">
                    <div className="flex gap-4 font-mono text-xs uppercase font-bold text-[#1a1a1a]/60">
                        <span>ISO 400</span>
                        <span>f/2.8</span>
                        <span>1/1000s</span>
                    </div>
                    <div className="font-serif text-xl text-[#cd5c09]">
                        #MM2K26
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const RoadGallery = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // The "Road" Line - Glowing and pulsing
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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
        <section ref={containerRef} className="relative py-24 bg-[#1a1614] overflow-hidden perspecrive-[2000px]">
            {/* Live Atmosphere Effects */}
            <SpeedLines />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-50 mix-blend-overlay pointer-events-none" />

            <Marquee text="REGISTER NOW FOR 2K26" direction={1} />

            {/* The Road Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 bg-[#222] border-x border-[#333] z-0 shadow-inner">
                <motion.div
                    style={{ height: lineHeight }}
                    className="w-full bg-gradient-to-b from-[#d4af37] via-[#cd5c09] to-[#d4af37] shadow-[0_0_50px_rgba(212,175,55,0.4)]"
                />
            </div>

            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 mt-20">
                <div className="text-center mb-32 relative">
                    <Reveal direction="right" width="100%">
                        <div className="flex flex-col items-center">
                            <span className="text-[#cd5c09] font-mono tracking-[1em] uppercase text-sm animate-pulse">Live The Dream</span>
                            <SectionHeading className="text-[#e8e0d5] mt-4 relative z-10 scale-150 transform-gpu shadow-black drop-shadow-2xl">
                                Asphalt <br />Chronicles
                            </SectionHeading>
                        </div>
                    </Reveal>
                </div>

                <div className="flex flex-col gap-24 relative"> {/* Reduced gap for tighter flow */}
                    {ASPHALT_EXHIBITS.map((item, i) => (
                        <div key={i} className={cn("flex w-full items-center relative", i % 2 === 0 ? "justify-start md:justify-start" : "justify-end md:justify-end")}>

                            {/* Animated Connector Line */}
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                whileInView={{ width: "50%", opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className={cn(
                                    "absolute top-1/2 h-1 bg-[#d4af37] shadow-[0_0_10px_#d4af37] z-0 hidden md:block",
                                    i % 2 === 0 ? "left-1/2 origin-left" : "right-1/2 origin-right"
                                )}
                            />

                            {/* Center Dot on Road */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#1a1614] border-2 border-[#d4af37] rounded-full z-10 hidden md:block shadow-[0_0_20px_#d4af37]" />

                            <div className={cn("w-full md:w-[70%] relative px-4 md:px-0", i % 2 === 0 ? "md:pr-12" : "md:pl-12")}>
                                <VintageCard src={item.src} index={i} title={item.title} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fog removed for performance */}
        </section>
    )
}

const SkidTrail = () => {
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

    useEffect(() => {
        let counter = 0;
        const handleMouseMove = (e: MouseEvent) => {
            setTrail(prev => [...prev.slice(-20), { x: e.clientX, y: e.clientY, id: counter++ }]);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <svg className="fixed inset-0 pointer-events-none z-[60] w-full h-full">
            <defs>
                <filter id="blur-trail">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>
            </defs>
            {trail.map((point, i) => i > 0 && (
                <line
                    key={point.id}
                    x1={trail[i - 1].x}
                    y1={trail[i - 1].y}
                    x2={point.x}
                    y2={point.y}
                    stroke="#1a1614"
                    strokeWidth={Math.max(2, (i / trail.length) * 20)}
                    strokeOpacity={(i / trail.length) * 0.3}
                    strokeLinecap="round"
                    filter="url(#blur-trail)"
                />
            ))}
        </svg>
    );
};

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
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const archiveImages = IMAGES.slice(12, 28);

    return (
        <section className="bg-[#1a1614] relative z-10">
            {/* --- Mobile View: Native Horizontal Scroll (Smooth & Touch Friendly) --- */}
            <div className="md:hidden relative py-10">
                <div className="absolute top-0 left-4 z-10">
                    <h3 className="font-serif text-4xl text-[#e8e0d5] bg-black px-4 py-1 -rotate-2 border border-[#cd5c09]" style={{ fontFamily: "'Rye', serif" }}>
                        The Vault
                    </h3>
                </div>
                <div className="flex overflow-x-auto gap-4 px-4 pb-8 pt-12 snap-x snap-mandatory no-scrollbar">
                    {archiveImages.map((src, i) => (
                        <div key={i} className="snap-center shrink-0">
                            <div className="relative w-[70vw] h-[40vh] border-[8px] border-white bg-white shadow-xl rotate-1">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1614] rounded-full z-20 shadow-sm" />
                                <div className="relative w-full h-full overflow-hidden">
                                    <Image
                                        src={src}
                                        alt={`Archive ${i}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 70vw, 400px"
                                        priority={i < 2}
                                        quality={60}
                                    />
                                </div>
                                <div className="absolute bottom-2 right-2 font-mono text-[10px] bg-black text-white px-2 py-0.5">
                                    #{i + 500}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute top-4 right-4 animate-pulse">
                    <div className="w-8 h-8 rounded-full border border-[#cd5c09] flex items-center justify-center">
                        <div className="w-1 h-1 bg-[#cd5c09] rounded-full" />
                    </div>
                </div>
            </div>

            {/* --- Desktop View: Cinematic Sticky Scroll --- */}
            <div ref={targetRef} className="hidden md:block relative h-[250vh]">
                <div className="sticky top-0 flex h-screen items-center bg-[radial-gradient(circle_at_center,_#2b2b2b_0%,_#1a1614_80%)] overflow-hidden">
                    {/* Premium Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay pointer-events-none" />

                    {!isUnlocked && <FingerprintAccess onUnlock={() => setIsUnlocked(true)} />}

                    <div className={cn("absolute inset-0 transition-all duration-700", !isUnlocked ? "scale-105" : "scale-100")}>

                        {/* Background Title */}
                        <div className="absolute top-20 left-20 z-0 w-full select-none pointer-events-none">
                            <h3 className="font-serif text-[15vw] leading-none text-white/5 whitespace-nowrap">
                                THE VAULT
                            </h3>
                        </div>

                        {/* Sticker Title */}
                        <div className="absolute top-24 left-24 z-40 rotate-[15deg]">
                            <h3 className="font-serif text-[3vw] text-[#e8e0d5] bg-black px-6 py-2 shadow-[10px_10px_0_rgba(205,92,9,1)] border-2 border-[#cd5c09]" style={{ fontFamily: "'Rye', serif" }}>
                                The Vault
                            </h3>
                        </div>

                        <div className="relative z-10 overflow-hidden py-10 h-full flex items-center">
                            <motion.div style={{ x }} className="flex gap-12 px-20 items-center w-fit">
                                {archiveImages.map((src, i) => (
                                    <motion.div
                                        key={i}
                                        className="relative w-[400px] h-[55vh] shrink-0 border-[12px] border-white bg-white shadow-2xl rotate-2"
                                        whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
                                        style={{ rotate: i % 2 === 0 ? 3 : -3 }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full z-20 shadow-md border-2 border-gray-600" />
                                        <div className="relative w-full h-full overflow-hidden transition-all duration-500 group">
                                            <Image
                                                src={src}
                                                alt={`Archive ${i}`}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                sizes="400px" // Fixed desktop size
                                                quality={60}
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                        </div>
                                        <div className="absolute bottom-4 right-4 font-mono text-sm bg-black/80 text-white px-3 py-1 backdrop-blur-md">
                                            EVIDENCE_#{i + 500}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        <div className="absolute bottom-0 w-full z-20">
                            <Marquee text="REGISTER NOW FOR 2K26" direction={-1} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Shared Marquee for Mobile (if needed, or kept inside desktop) */}
            <div className="md:hidden">
                <Marquee text="REGISTER NOW FOR 2K26" direction={-1} />
            </div>
        </section>
    )
}

const RegistrationCTA = () => {
    return (
        <section className="relative h-screen bg-[#1a1614] flex items-center justify-center text-[#e8e0d5] overflow-hidden">

            {/* Animated Background Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute border border-[#d4af37]/20 rounded-full"
                        style={{ width: `${i * 30}vw`, height: `${i * 30}vw` }}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-4">
                <Reveal direction="up" delay={0.2} width="100%">
                    <div className="group relative bg-[#e8e0d5] text-[#1a1614] p-8 md:p-12 rotate-1 shadow-[0_0_50px_rgba(212,175,55,0.3)] border-4 border-[#d4af37] overflow-hidden">

                        {/* Scanner Light Effect */}
                        <motion.div
                            className="absolute inset-0 w-full h-[20%] bg-gradient-to-b from-transparent via-white/50 to-transparent z-20 pointer-events-none mix-blend-soft-light"
                            animate={{ top: ["-20%", "120%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                        />

                        <div className="text-center space-y-8 relative z-30">
                            <div className="flex justify-center flex-col items-center">
                                <h2 className="font-serif text-6xl md:text-8xl uppercase leading-none" style={{ fontFamily: "'Rye', serif" }}>
                                    JOIN
                                </h2>
                                <span className="font-mono text-xl tracking-[0.5em] uppercase text-[#cd5c09]">The Convoy</span>
                            </div>

                            <p className="font-serif text-xl opacity-80 max-w-md mx-auto">
                                March 14, 2026. Be there or be dust.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05, x: [-2, 2, -2, 2, 0] }} // Engine vibration shake
                                whileTap={{ scale: 0.95 }}
                                transition={{
                                    scale: { type: "spring", stiffness: 400, damping: 10 },
                                    x: { duration: 0.4 } // Use tween for shake keyframes
                                }}
                                className="w-full group/btn relative flex items-center justify-between bg-[#1a1614] text-[#d4af37] px-8 py-6 text-xl font-bold uppercase tracking-widest hover:bg-[#cd5c09] hover:text-[#1a1614] transition-all duration-300 overflow-hidden shadow-xl"
                            >
                                <span className="relative z-10">Get Your Ticket</span>
                                <Ticket className="relative z-10 group-hover/btn:rotate-[360deg] transition-transform duration-700" />

                                {/* Button Fill Animation */}
                                <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 z-0" />
                            </motion.button>

                            <div className="flex justify-between items-center text-xs font-mono uppercase opacity-60 pt-4 border-t border-[#1a1614]/20">
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

export default function MotomaniaPage() {
    return (
        <main className="relative min-h-screen bg-[#1a1614] text-[#f0f0f0] selection:bg-[#cd5c09] selection:text-white overflow-x-hidden">
            <Hero />
            <Marquee text="REGISTER NOW FOR 2K26" direction={1} />
            <AboutSection />
            <RoadGallery />
            <HorizontalArchive />
            <RegistrationCTA />
            <Tachometer />
        </main>
    );
}
