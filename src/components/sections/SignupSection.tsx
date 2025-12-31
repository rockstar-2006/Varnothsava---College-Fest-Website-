"use client";

import ProEventBackground from "@/components/ui/ProEventBackground";

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Float, Environment, MeshTransmissionMaterial, Torus, Stars } from '@react-three/drei'
import { useRef, Suspense, useState } from 'react'
import * as THREE from 'three'
import { motion, Variants } from 'framer-motion'
import { ChevronDown, Users, Activity, Globe } from 'lucide-react'

export default function SignupSection() {
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring" as const, stiffness: 100 },
        },
    }

    const formVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.7, type: "spring" as const, stiffness: 100 },
        },
    }

    const inputVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
        },
    }

    const buttonVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
        },
        hover: {
            scale: 1.02,
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
            transition: { type: "spring" as const, stiffness: 300 },
        },
    }

    return (
        <div className="relative h-screen w-full bg-[#050805] overflow-hidden pt-20">
            {/* Professional 3D Sector - Lowered Alignment and Depth */}
            <ProEventBackground />
            <motion.div 
                className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 lg:px-16"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Login Form Container */}
                <motion.div 
                    className="bg-black/70 backdrop-blur-md rounded-lg p-8 max-w-md w-full text-white border border-green-600/70 shadow-lg shadow-green-600/20 transition-all"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ boxShadow: "0 0 30px rgba(16, 185, 129, 0.3)" }}
                >
                    <motion.h2 
                        className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Create Account
                    </motion.h2>

                    <motion.form 
                        className="space-y-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Email Field */}
                        <motion.div 
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.label 
                                htmlFor="email" 
                                className="block text-sm font-medium mb-2 text-green-300"
                            >
                                Email Address
                            </motion.label>
                            <motion.input
                                type="email"
                                id="email"
                                className="w-full px-4 py-2 rounded-md bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-white placeholder-gray-500"
                                placeholder="Enter your email"
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                whileFocus={{
                                    scale: 1.02,
                                    boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)",
                                }}
                                transition={{ type: "spring", stiffness: 400 }}
                            />
                        </motion.div>

                        {/* Password Field */}
                        <motion.div 
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.label 
                                htmlFor="password" 
                                className="block text-sm font-medium mb-2 text-green-300"
                            >
                                Password
                            </motion.label>
                            <motion.input
                                type="password"
                                id="password"
                                className="w-full px-4 py-2 rounded-md bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-white placeholder-gray-500"
                                placeholder="Enter your password"
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                whileFocus={{
                                    scale: 1.02,
                                    boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)",
                                }}
                                transition={{ type: "spring", stiffness: 400 }}
                            />
                        </motion.div>

                        {/* Login Button */}
                        <motion.button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            whileTap={{ scale: 0.98 }}
                        >
                            Signup
                        </motion.button>

                        <motion.a href="/login" className="block text-center text-sm text-green-400 mt-2 cursor-pointer hover:underline">Already have an account? Login</motion.a>

                        {/* Divider with Animation */}
                        <motion.div 
                            className="flex items-center mt-4 mb-10"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div 
                                className="flex-grow border-t border-green-600/70"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            />
                            <span className="mx-2 text-green-400 text-xs font-semibold">OR</span>
                            <motion.div 
                                className="flex-grow border-t border-green-600/70"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            />
                        </motion.div>

                        {/* Google Sign In Button */}
                        <motion.button
                            type="button"
                            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors border border-gray-300"
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ 
                                scale: 1.02,
                                boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.img 
                                src="/google-logo.png" 
                                alt="Google Logo" 
                                className="w-5 h-5"
                                whileHover={{ rotate: 10 }}
                            />
                            Continue with Google
                        </motion.button>
                    </motion.form>
                </motion.div>
            </motion.div>
        </div>
    );
}