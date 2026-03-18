'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Download, Share2, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: any;
}

export const CertificateModal = ({ isOpen, onClose, userData }: CertificateModalProps) => {
    const router = useRouter();
    const [isDownloading, setIsDownloading] = useState(false);

    if (!userData) return null;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // We open in new tab but we could also fetch and save
            window.open(`/api/certificates/download/${userData.profileCode}`, '_blank');
            // Give it some time to "complete" before resetting state
            setTimeout(() => setIsDownloading(false), 2000);
        } catch (error) {
            console.error('Download error:', error);
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-[20px]"
                    />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 30 }}
                        className="relative w-full max-w-2xl bg-[#0a0f0d] border border-amber-500/50 rounded-[2.5rem] shadow-[0_0_150px_rgba(245,158,11,0.3)] overflow-hidden isolate"
                    >
                        {/* Celebrate Particles */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                            {[...Array(40)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0, x: '50%', y: '50%' }}
                                    animate={{ 
                                        opacity: [0, 1, 0], 
                                        scale: [0, 1.2, 0],
                                        x: [`${Math.random() * 200 - 100}%`, `${Math.random() * 200 - 100}%`],
                                        y: [`${Math.random() * 200 - 100}%`, `${Math.random() * 200 - 100}%`],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 2 }}
                                    className={`absolute w-2 h-2 rounded-full blur-[1px] ${i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                                />
                            ))}
                        </div>

                        <div className="relative z-10 p-8 md:p-12">
                            <button 
                                onClick={onClose}
                                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center space-y-8">
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
                                    className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.2)] border border-amber-500/30"
                                >
                                    <Award size={40} className="animate-bounce" />
                                </motion.div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tight leading-none">YOUR CERTIFICATE IS READY!</h2>
                                    <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-[10px]">Official E-Certification Awarded</p>
                                </div>

                                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                                    Congratulations, <span className="text-white font-bold">{userData.name}</span>! You have successfully participated in Varnothsava 2026. Your official certificate is now available for download.
                                </p>

                                <div className="relative group max-w-sm mx-auto p-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                    <Image 
                                        src="/image_copy_7.png" 
                                        alt="Certificate" 
                                        width={600}
                                        height={424}
                                        className="w-full h-auto rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-6">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Official Preview</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isDownloading}
                                        onClick={handleDownload}
                                        className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {isDownloading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                                        )}
                                        {isDownloading ? 'GENERATING...' : 'DOWNLOAD PNG'}
                                    </motion.button>
                                    <button 
                                        onClick={() => {
                                            router.push(`/certificate/${userData.profileCode}`);
                                            onClose();
                                        }}
                                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Share2 size={16} /> PUBLIC LINK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
