"use client";

import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaGithub, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaCode, FaDownload } from "react-icons/fa";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import CyberBackground from "./CyberBackground";
import FooterTicker from "./FooterTicker";

// Scramble Text Component
const ScrambleText = ({ text, className }: { text: string; className?: string }) => {
    const [display, setDisplay] = useState(text || "");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    useEffect(() => {
        if (!text) return;
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 2;
        }, 30);

        return () => clearInterval(interval);
    }, [text]);

    return <span className={className}>{display}</span>;
};

const Slider = () => {
    const developers = [
        {
            name: "Raghavendra GS",
            role: "Web Master & Faculty Coordinator",
            designation: "Assistant Professor (Senior)",
            dept: "Computer Science & Engineering",
            img: "/images/developers/image-removebg-preview.png",
            email: "raghugs.cs@sode-edu.in",
            phone: "+91 97384 05453",
            linkedin: "#",
            github: "",
            instagram: "",
            description: "Mentoring the next generation of tech innovators with passion and dedication.",
            themeColor: "#ff9f1c", // Golden Orange
            id: "FAC-001"
        },
        {
            name: "Bhushan Poojary",
            role: "Web Lead & Full Stack Developer",
            designation: "3rd Year AI & DS",
            dept: "Artificial Intelligence & Data Science",
            img: "/images/developers/WhatsApp_Image_2026-02-07_at_11.38.19_PM-removebg-preview.png",
            email: "bhushan.poojary2006@gmail.com",
            phone: "7381709385",
            linkedin: "https://www.linkedin.com/in/bhushan-poojary-26a717296/",
            github: "https://github.com/rockstar-2006?tab=repositories",
            instagram: "https://www.instagram.com/_vinu_.4/",
            description: "Architecting scalable web solutions and leading the development team.",
            themeColor: "#00e5ff", // Cyan
            id: "DEV-L01"
        },
        {
            name: "Tejas Nayak",
            role: "Full Stack Developer",
            designation: "3rd Year CSE",
            dept: "Computer Science & Engineering",
            img: "/images/developers/WhatsApp_Image_2026-01-28_at_8.16.43_PM-removebg-preview.png",
            email: "tejasnayak25@outlook.com",
            phone: "+91 82961 51023",
            linkedin: "https://www.linkedin.com/in/tejas-nayak-3110a7220/",
            github: "https://github.com/tejasnayak25",
            instagram: "https://www.instagram.com/tjnayak/",
            description: "Crafting efficient code and optimizing application performance.",
            themeColor: "#00ff00", // Matrix Green
            id: "DEV-003"
        },
        {
            name: "Abhishek Kini",
            role: "Full Stack Developer",
            designation: "3rd Year CSE",
            dept: "Computer Science & Engineering",
            img: "/images/developers/WhatsApp_Image_2026-01-28_at_8.03.15_PM__1_-removebg-preview.png",
            email: "abhishekkini.2005@gmail.com",
            phone: "+91 98441 01520",
            linkedin: "https://www.linkedin.com/in/abhishek-kini-181669287/",
            github: "https://github.com/heynameisabhi",
            instagram: "https://www.instagram.com/hey.name.is.abhi/",
            description: "Building robust backend systems and intuitive user interfaces.",
            themeColor: "#ff0055", // Neon Red
            id: "DEV-002"
        },
        {
            name: "Shivam Shetty",
            role: "Full Stack Developer",
            designation: "3rd Year AI & ML",
            dept: "Artificial Intelligence & Machine Learning",
            img: "/images/developers/WhatsApp_Image_2026-01-28_at_8.04.13_PM-removebg-preview.png",
            email: "shivam.23ai046@sode-edu.in",
            phone: "",
            linkedin: "https://www.linkedin.com/in/shivam-shetty-3674b4301",
            github: "https://github.com/SHETTYSHIVAM",
            instagram: "",
            description: "Exploring the frontiers of AI and Machine Learning technologies.",
            themeColor: "#bf00ff", // Neon Purple
            id: "RES-004"
        },
    ];

    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState("next");
    const router = useRouter();

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-300, 300], [10, -10]);
    const rotateY = useTransform(x, [-300, 300], [-10, 10]);

    const springConfig = { damping: 20, stiffness: 100 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    const handleMouseMove = (event: React.MouseEvent) => {
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;
        const centerX = innerWidth / 2;
        const centerY = innerHeight / 2;
        x.set(clientX - centerX);
        y.set(clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const currentTheme = developers[index].themeColor;

    const handlePrev = () => {
        setDirection("prev");
        setIndex((prev) => (prev - 1 + developers.length) % developers.length);
    };

    const handleNext = () => {
        setDirection("next");
        setIndex((prev) => (prev + 1) % developers.length);
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 },
        },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const itemVariants: Variants = {
        hidden: { x: 50, opacity: 0, filter: "blur(10px)" },
        visible: {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: { type: "spring", stiffness: 100 }
        },
        exit: { x: -50, opacity: 0, filter: "blur(10px)" }
    };

    const imageVariants: Variants = {
        enter: (direction: string) => ({
            opacity: 0,
            scale: 1.2,
            y: 20,
            filter: "blur(15px) brightness(3)",
        }),
        center: {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px) brightness(1)",
            transition: {
                opacity: { duration: 0.4 },
                scale: { duration: 0.8, ease: "circOut" },
                y: { type: "spring", stiffness: 100, damping: 20 },
                filter: { duration: 0.6 }
            },
        },
        exit: (direction: string) => ({
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px) brightness(0.5)",
            transition: { duration: 0.3 }
        }),
    };

    return (
        <div
            className="slider"
            style={{ "--theme-color": currentTheme } as React.CSSProperties}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Pass theme color to background for dynamic particles */}
            <CyberBackground themeColor={currentTheme} />

            <button
                className="back-btn"
                onClick={() => router.back()}
                style={{ borderColor: `${currentTheme}40`, color: currentTheme }}
                title="Go Back"
            >
                <FaArrowLeft size={18} />
                <span className="back-text">BACK</span>
            </button>

            <button className="arrow left-arrow" onClick={handlePrev} style={{ borderColor: currentTheme, color: currentTheme }}>
                <FaChevronLeft size={28} />
            </button>

            <div className="slider-content">
                <div className="image-container">
                    <AnimatePresence mode="popLayout" custom={direction}>
                        <motion.div
                            key={index}
                            custom={direction}
                            variants={imageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="hologram-wrapper"
                        >
                            <img
                                src={developers[index].img}
                                alt={developers[index].name}
                                className="dev-img-main"
                                style={{ filter: `drop-shadow(0 0 15px ${currentTheme})` }}
                            />
                            <div className="scanline" style={{ background: currentTheme, boxShadow: `0 0 15px ${currentTheme}` }}></div>

                            {/* Image HUD details */}
                            <div className="img-hud top-right">{developers[index].id}</div>
                            <div className="img-hud bottom-left">SYNC_COMPLETE</div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="info-container">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            className="slider-info dev-info"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{
                                borderColor: `${currentTheme}40`,
                                boxShadow: `0 0 30px ${currentTheme}20, inset 0 0 20px ${currentTheme}10`,
                                rotateX: springRotateX,
                                rotateY: springRotateY
                            }}
                        >
                            {/* Technical HUD Corners */}
                            <div className="hud-corner top-left-corner" style={{ borderTop: `2px solid ${currentTheme}`, borderLeft: `2px solid ${currentTheme}` }}></div>
                            <div className="hud-corner top-right-corner" style={{ borderTop: `2px solid ${currentTheme}`, borderRight: `2px solid ${currentTheme}` }}></div>
                            <div className="hud-corner bottom-right-corner" style={{ borderBottom: `2px solid ${currentTheme}`, borderRight: `2px solid ${currentTheme}` }}></div>
                            <div className="hud-corner bottom-left-corner" style={{ borderBottom: `2px solid ${currentTheme}`, borderLeft: `2px solid ${currentTheme}` }}></div>

                            <div className="sys-stat top-stat">SYSTEM_ONLINE</div>
                            <div className="sys-stat bottom-stat">DATA_VERIFIED</div>

                            <motion.div variants={itemVariants} className="role-wrapper">
                                <FaCode className="role-icon" style={{ color: currentTheme }} />
                                <h2 className="dev-role" style={{ color: currentTheme, textShadow: `0 0 10px ${currentTheme}80` }}>
                                    <ScrambleText text={developers[index].role} className="" />
                                </h2>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <h1 className="dev-name" style={{ textShadow: `2px 2px 0px ${currentTheme}40` }}>
                                    <ScrambleText text={developers[index].name} className="glitch-text" />
                                </h1>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div className="dev-details-grid" style={{ borderColor: `${currentTheme}40`, background: `${currentTheme}05` }}>
                                    <div className="detail-item">
                                        <span className="label" style={{ color: currentTheme }}>Designation:</span>
                                        <span className="value">{developers[index].designation}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label" style={{ color: currentTheme }}>Department:</span>
                                        <span className="value">{developers[index].dept}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="social-links">
                                {[
                                    { icon: FaEnvelope, href: developers[index].email ? `mailto:${developers[index].email}` : "", title: "Email" },
                                    { icon: FaPhone, href: developers[index].phone ? `tel:${developers[index].phone}` : "", title: "Phone" },
                                    { icon: FaLinkedin, href: developers[index].linkedin, title: "LinkedIn" },
                                    { icon: FaGithub, href: developers[index].github, title: "GitHub" },
                                    { icon: FaInstagram, href: developers[index].instagram, title: "Instagram" }
                                ].filter(social => social.href && social.href !== '#' && social.href !== 'mailto:' && social.href !== 'tel:').map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.href}
                                        className="social-icon"
                                        title={social.title}
                                        style={{ borderColor: `${currentTheme}40`, color: currentTheme }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = currentTheme;
                                            e.currentTarget.style.color = "#000";
                                            e.currentTarget.style.boxShadow = `0 0 20px ${currentTheme}`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                                            e.currentTarget.style.color = currentTheme;
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <social.icon />
                                    </a>
                                ))}
                            </motion.div>


                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <button className="arrow right-arrow" onClick={handleNext} style={{ borderColor: currentTheme, color: currentTheme }}>
                <FaChevronRight size={28} />
            </button>

            {/* Grid overlay for texture */}
            <div className="texture-overlay"></div>

            {/* Footer System Ticker */}
            <FooterTicker themeColor={currentTheme} />
        </div>
    );
};

export default Slider;
