'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Download, Share2, X, Loader2, Trophy } from 'lucide-react'
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
            window.open(`/api/certificates/download/${userData.profileCode}`, '_blank');
            setTimeout(() => setIsDownloading(false), 2500);
        } catch (error) {
            console.error('Download error:', error);
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-[16px]"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 60 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 60 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                        className="relative w-full sm:max-w-lg md:max-w-xl bg-[#09100d] border-t sm:border border-amber-500/40 sm:rounded-[2rem] rounded-t-[2rem] shadow-[0_0_120px_rgba(245,158,11,0.25)] overflow-hidden"
                        style={{ maxHeight: '96dvh' }}
                    >
                        {/* Ambient Glow */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-[60px] pointer-events-none" />
                        <div className="absolute -bottom-10 right-0 w-48 h-24 bg-emerald-500/10 blur-[60px] pointer-events-none" />

                        {/* Confetti Particles - fewer on mobile for perf */}
                        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0, x: '50%', y: '50%' }}
                                    animate={{
                                        opacity: [0, 0.8, 0],
                                        scale: [0, 1, 0],
                                        x: [`${Math.random() * 200 - 100}%`, `${Math.random() * 200 - 100}%`],
                                        y: [`${Math.random() * 200 - 100}%`, `${Math.random() * 200 - 100}%`],
                                    }}
                                    transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
                                    className={`absolute w-1.5 h-1.5 rounded-full blur-[1px] ${i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                                />
                            ))}
                        </div>

                        {/* Scrollable Content */}
                        <div
                            className="relative z-10 overflow-y-auto"
                            style={{ maxHeight: '96dvh' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-3 sm:px-7 sm:pt-7">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                                        <Trophy size={15} className="text-amber-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.25em]">Achievement Unlocked</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-90"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-5 pb-6 sm:px-7 sm:pb-8 space-y-5">

                                {/* Title */}
                                <div className="text-center space-y-1.5">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -15 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.7, type: 'spring', bounce: 0.5, delay: 0.1 }}
                                        className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.2)] border border-amber-500/30 mb-3"
                                    >
                                        <Award size={30} className="animate-bounce sm:hidden" />
                                        <Award size={38} className="animate-bounce hidden sm:block" />
                                    </motion.div>

                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight leading-none">
                                        Certificate Ready! 🎉
                                    </h2>
                                    <p className="text-amber-400 font-bold uppercase tracking-[0.25em] text-[9px] sm:text-[10px]">
                                        Official E-Certification • Varnothsava 2026
                                    </p>
                                </div>

                                {/* Congratulations message */}
                                <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed text-center max-w-sm mx-auto">
                                    Congratulations, <span className="text-white font-bold">{userData.name}</span>! Your official participation certificate is ready to download.
                                </p>

                                {/* Certificate Preview with Dynamic Overlay */}
                                <div className="relative group mx-auto max-w-xs sm:max-w-sm">
                                    <div className="p-1.5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl relative">
                                        <div className="relative w-full aspect-[1.414/1] rounded-lg overflow-hidden bg-white/5">
                                            <Image
                                                src="/image_copy_7.png"
                                                alt="Certificate Preview"
                                                fill
                                                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                            
                                            {/* Dynamic Name Overlay (Matches y-position 598/1131 = 52.8%) */}
                                            <div 
                                                className="absolute left-[36%] top-[52.8%] -translate-y-1/2 w-[60%] text-left pointer-events-none"
                                                style={{ zIndex: 5 }}
                                            >
                                                <p className="text-[rgb(27,38,49)] font-serif font-black uppercase text-[5px] sm:text-[6px] md:text-[8px] truncate">
                                                    {userData.name}
                                                </p>
                                            </div>

                                            {/* Dynamic College Overlay (Matches y-position 658/1131 = 58.1%) */}
                                            <div 
                                                className="absolute left-[26%] top-[58.1%] -translate-y-1/2 w-[60%] text-left pointer-events-none"
                                                style={{ zIndex: 5 }}
                                            >
                                                <p className="text-[rgb(81,90,90)] font-serif font-medium italic uppercase text-[4px] sm:text-[5px] md:text-[6px] truncate leading-tight">
                                                    {userData.collegeName || userData.college || 'INSTITUTION'}
                                                </p>
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] whitespace-nowrap">Official Preview</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Glow ring */}
                                    <div className="absolute -inset-1 bg-amber-500/10 rounded-2xl blur-xl -z-10" />
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        disabled={isDownloading}
                                        onClick={handleDownload}
                                        className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[0_8px_30px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 disabled:opacity-60 min-h-[52px]"
                                    >
                                        {isDownloading ? (
                                            <><Loader2 size={15} className="animate-spin" /> Generating...</>
                                        ) : (
                                            <><Download size={15} /> Download PNG</>
                                        )}
                                    </motion.button>

                                    <button
                                        onClick={() => {
                                            router.push(`/certificate/${userData.profileCode}`);
                                            onClose();
                                        }}
                                        className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 min-h-[52px]"
                                    >
                                        <Share2 size={15} /> Public Link
                                    </button>
                                </div>

                                {/* Bottom dismiss hint */}
                                <p className="text-center text-[9px] text-white/20 font-medium">
                                    Tap outside or press ✕ to dismiss
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
