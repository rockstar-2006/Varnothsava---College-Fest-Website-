"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EntranceProps {
    onComplete: () => void;
}

const Entrance: React.FC<EntranceProps> = ({ onComplete }) => {
    const [showPortal, setShowPortal] = useState(false);

    useEffect(() => {
        // 1. Show Text immediately
        const textTimer = setTimeout(() => {
            // 2. Trigger Portal Effect after text has been read (e.g., 2 seconds)
            setShowPortal(true);
        }, 2500);

        return () => clearTimeout(textTimer);
    }, []);

    const handlePortalComplete = () => {
        onComplete();
    };

    return (
        <div className="entrance-container">
            <div className="overlay-grid"></div>

            <AnimatePresence>
                {!showPortal && (
                    <motion.div
                        className="cinematic-text"
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="glitch-header" data-text="MEET THE DEVELOPERS">
                            MEET THE DEVELOPERS
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence onExitComplete={handlePortalComplete}>
                {showPortal && (
                    <motion.div
                        className="warp-portal"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 50, opacity: 1 }}
                        exit={{ opacity: 0 }} // Keep it simple, the main app will fade in
                        transition={{ duration: 0.8, ease: "easeIn" }}
                        onAnimationComplete={handlePortalComplete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Entrance;
