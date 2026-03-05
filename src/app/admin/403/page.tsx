'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="inline-flex items-center justify-center p-6 rounded-full bg-red-500/10 mb-8"
                >
                    <ShieldAlert className="w-16 h-16 text-red-500" />
                </motion.div>

                <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
                <p className="text-gray-400 mb-10 leading-relaxed">
                    You don't have the required permissions to access this area.
                    If you believe this is an error, please contact the system administrator.
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <Link
                        href="/login"
                        className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-xl transition-all"
                    >
                        Switch Account
                    </Link>
                </div>
            </div>
        </div>
    )
}
