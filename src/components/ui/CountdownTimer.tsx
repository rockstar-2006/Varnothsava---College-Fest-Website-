"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '900'],
})

interface CountdownTimerProps {
    targetDate: number;
    title: string;
}

export default function CountdownTimer({ targetDate, title }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = targetDate - Date.now();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto mb-8 bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-2xl border border-emerald-500/30 p-4 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden isolate"
        >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className={`${orbitron.className} text-emerald-400 font-black uppercase tracking-wider text-sm sm:text-base px-2 sm:px-0`}>
                            {title}
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5 px-2 sm:px-0">Registration closes on March 9th at 11:59 PM!</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-4 max-w-full overflow-x-hidden">
                    <TimeBlock value={timeLeft.days} label="DAYS" />
                    <span className="text-emerald-500 text-xl font-bold pb-4">:</span>
                    <TimeBlock value={timeLeft.hours} label="HRS" />
                    <span className="text-emerald-500 text-xl font-bold pb-4">:</span>
                    <TimeBlock value={timeLeft.minutes} label="MIN" />
                    <span className="text-emerald-500 text-xl font-bold pb-4">:</span>
                    <TimeBlock value={timeLeft.seconds} label="SEC" />
                </div>
            </div>
        </motion.div>
    );
}

function TimeBlock({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-inner">
                <span className={`${orbitron.className} text-xl sm:text-2xl font-black text-white`}>
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest mt-2">{label}</span>
        </div>
    );
}
