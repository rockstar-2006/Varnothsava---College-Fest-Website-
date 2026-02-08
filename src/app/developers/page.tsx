'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Slider from '@/components/developers/Slider'
import Entrance from '@/components/developers/Entrance'
import './developers.css'

export default function DevelopersPage() {
    const [showSlider, setShowSlider] = useState(false);

    console.log("DevelopersPage rendering");

    return (
        <div className="developers-page-root" style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            background: '#000',
            overflow: 'hidden'
        }}>
            <AnimatePresence mode="wait">
                {!showSlider ? (
                    <motion.div
                        key="entrance"
                        exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1001 }}
                    >
                        <Entrance onComplete={() => setShowSlider(true)} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="slider"
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Slider />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
