'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { Github, Code } from 'lucide-react'
import Image from 'next/image'

export default function DevelopersPage() {
    const { setPageTheme } = useApp()

    useEffect(() => {
        setPageTheme({
            name: 'DEVS',
            rgb: '139, 92, 246', // Violet
            primary: '#8b5cf6'
        })
    }, [setPageTheme])

    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12 text-center"
                >
                    The <span className="text-violet-500">Architects</span>
                </motion.h1>

                <p className="text-center text-lg text-gray-400 mb-20 max-w-2xl mx-auto">
                    Meet the team behind the digital experience of Varnothsava 2026. <br />Combining code, design, and passion.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Placeholder for developers */}
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden group hover:border-violet-500/50 transition-colors"
                        >
                            <div className="h-48 bg-gradient-to-br from-violet-900/20 to-black relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Code className="w-12 h-12 text-violet-500/30 group-hover:text-violet-400 transition-colors" />
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold uppercase tracking-tight text-white mb-1">Developer Name</h3>
                                <p className="text-violet-400 font-mono text-xs uppercase tracking-widest mb-4">Frontend Engineer</p>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Passionate about creating immersive web experiences and interactive interfaces.
                                </p>
                                <div className="flex gap-4">
                                    <Github className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                                    <div className="w-5 h-5 rounded-full border border-gray-500 hover:border-white cursor-pointer transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
