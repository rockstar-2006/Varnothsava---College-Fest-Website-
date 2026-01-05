'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Trash2, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import ProEventBackground from '@/components/ui/ProEventBackground'

export default function CheckoutPage() {
    const { cart, removeFromCart } = useApp()

    const total = cart.reduce((acc, item) => acc + item.fee, 0)

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <ProEventBackground theme="emerald" isDetailed={true} />

            <div className="relative z-10 max-w-4xl mx-auto pt-32 pb-24 px-6">
                <Link href="/events" className="inline-flex items-center gap-2 text-white/40 hover:text-emerald-400 transition-colors mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest font-mono">Back to Events</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Cart Items */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Your Bag</h1>
                            <span className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">[{cart.length} ITEMS_SYNCED]</span>
                        </div>

                        {cart.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShoppingCart className="w-6 h-6 text-white/20" />
                                </div>
                                <p className="text-white/40 font-mono text-sm uppercase tracking-widest">No events in your bag.</p>
                                <Link href="/events" className="inline-block px-8 py-3 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all rounded-lg">
                                    Browse Events
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative group p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 hover:border-emerald-500/30 transition-all"
                                    >
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                            <img src={item.visual} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-black uppercase tracking-tight truncate">{item.title}</h3>
                                            <p className="text-[10px] font-mono text-white/40 uppercase mt-1">Fee: ₹{item.fee}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-3 text-white/20 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Summary */}
                    <div className="w-full lg:w-80 h-fit space-y-6">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6 backdrop-blur-xl">
                            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500">Summary</h2>

                            <div className="space-y-3 font-mono text-xs uppercase">
                                <div className="flex justify-between text-white/40">
                                    <span>Subtotal</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="flex justify-between text-white/40">
                                    <span>Platform Fee</span>
                                    <span>₹0</span>
                                </div>
                                <div className="h-[1px] bg-white/10 my-2" />
                                <div className="flex justify-between text-lg font-black text-white italic">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>

                            <button
                                disabled={cart.length === 0}
                                className="w-full py-4 bg-emerald-500 disabled:opacity-50 disabled:bg-white/10 text-black font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Proceed to Payment
                            </button>

                            <div className="flex items-center justify-center gap-2 text-white/20">
                                <ShieldCheck size={12} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Secure Checkout via Razorpay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
