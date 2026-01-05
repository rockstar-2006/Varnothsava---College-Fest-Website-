"use client";

import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, ShieldCheck, CheckCircle2, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface RazorpayUIProps {
    amount: number;
    onSuccess: () => void;
    onClose: () => void;
}

export default function RazorpayUI({ amount, onSuccess, onClose }: RazorpayUIProps) {
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')

    const handlePay = () => {
        setStep('processing')
        setTimeout(() => {
            setStep('success')
            setTimeout(() => {
                onSuccess()
            }, 2500)
        }, 2000)
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl text-slate-800"
                >
                    {/* Header */}
                    <div className="bg-[#2b334a] p-6 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500 p-2 rounded-xl">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-none">Varnothsava Checkout</h3>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Secured by Razorpay</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 'details' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total to Pay</p>
                                        <h4 className="text-3xl font-black text-slate-900">₹{amount.toFixed(2)}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Enrollment ID</p>
                                        <p className="font-mono text-xs text-slate-600">REG-{Math.floor(Math.random() * 90000) + 10000}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Payment Methods</p>
                                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-lg font-bold text-blue-600">UPI</div>
                                            <div>
                                                <p className="text-sm font-bold">BHIM / GPay / PhonePe</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-tight">Instant Verification</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-slate-200 group-hover:text-blue-500" />
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 flex items-center justify-center rounded-lg font-bold text-slate-600">CC</div>
                                            <div>
                                                <p className="text-sm font-bold">Credit / Debit Cards</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-tight">Visa, MasterCard, etc.</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-slate-200 group-hover:text-blue-500" />
                                    </div>
                                </div>

                                <button
                                    onClick={handlePay}
                                    className="w-full bg-blue-600 py-5 rounded-xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    PROCEED TO PAY ₹{amount.toFixed(2)}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-slate-300">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[8px] font-black uppercase tracking-widest italic">Secure PCI-DSS Compliant Payment</span>
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-slate-100 rounded-full" />
                                    <motion.div
                                        className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 italic">Processing...</h4>
                                    <p className="text-xs text-slate-500 mt-1">Establishing secure connection for registration</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute inset-0 bg-green-500 rounded-full"
                                    />
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h4 className="text-2xl font-black text-slate-900 italic uppercase">Success!</h4>
                                    <p className="text-xs font-black text-green-600 mt-2 uppercase tracking-widest">Enrollment Confirmed</p>

                                    <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Transaction Reference</p>
                                        <p className="font-mono text-sm font-bold text-slate-800 mt-1">TXN-91XkL0P{Math.floor(Math.random() * 100000)}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>

                    <div className="bg-slate-50 px-8 py-4 flex justify-center items-center opacity-60">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Powered by Razorpay Secure</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
