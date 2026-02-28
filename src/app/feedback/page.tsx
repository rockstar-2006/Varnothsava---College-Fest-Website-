'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbitron, Inter } from 'next/font/google';
import {
    Star,
    Send,
    User,
    Building,
    Briefcase,
    Mail,
    Phone,
    ArrowLeft,
    CheckCircle,
    Sparkles,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const orbitron = Orbitron({
    subsets: ['latin'],
    variable: '--font-orbitron'
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter'
});

// --- Scramble Text Component ---
const ScrambleText = ({ text, className }: { text: string; className?: string }) => {
    const [display, setDisplay] = useState(text || "");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    useEffect(() => {
        if (!text) return;
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text]);

    return <span className={className}>{display}</span>;
};

// --- Quick Select for Designation ---
const QuickSelect = ({ label, options, value, onSelect }: { label: string, options: string[], value: string, onSelect: (val: string) => void }) => {
    return (
        <div className="flex flex-col gap-3 w-full">
            <label className={`${orbitron.className} text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase`}>
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <motion.button
                        key={opt}
                        type="button"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(opt)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest border transition-all duration-300 ${value === opt
                            ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                            }`}
                    >
                        {opt.toUpperCase()}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

// --- Star Rating Component ---
const StarRating = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3">
                <label className={`${orbitron.className} text-xs font-bold tracking-[0.2em] text-emerald-400 capitalize`}>
                    {label}
                </label>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none"
                    >
                        <Star
                            size={32}
                            fill={(hover || value) >= star ? "#10b981" : "transparent"}
                            className={`${(hover || value) >= star ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "text-white/20"} transition-colors duration-200`}
                        />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

// --- Floating Form Input ---
const FormInput = ({ icon: Icon, label, name, value, onChange, placeholder, type = "text" }: any) => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <label className={`${orbitron.className} text-[10px] font-bold tracking-[0.2em] text-white/40 group-focus-within:text-emerald-400 transition-colors uppercase`}>
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors">
                    <Icon size={18} />
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                />
            </div>
        </div>
    );
};

export default function FeedbackPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        designation: '',
        contact: '',
        eventExperience: 0,
        institutionImpression: 0,
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRatingChange = (field: string, val: number) => {
        setFormData({ ...formData, [field]: val });
    };

    const handleDesignationSelect = (val: string) => {
        setFormData({ ...formData, designation: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.eventExperience === 0 || formData.institutionImpression === 0) {
            alert("Please provide star ratings for both experience and impression.");
            return;
        }

        setStatus('submitting');
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const calculateProgress = () => {
        let filled = 0;
        if (formData.name) filled++;
        if (formData.companyName) filled++;
        if (formData.designation) filled++;
        if (formData.contact) filled++;
        if (formData.eventExperience > 0) filled++;
        if (formData.institutionImpression > 0) filled++;
        return (filled / 6) * 100;
    };

    return (
        <main className={`min-h-screen ${inter.className} bg-[#020504] text-white overflow-hidden relative selection:bg-emerald-500/30`}>
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05)_0%,_transparent_70%)]" />
                <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />

                {/* Animated Orbs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -40, 0], y: [0, -50, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
                />
            </div>

            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.push('/')}
                    className="pointer-events-auto flex items-center gap-2 text-white/60 hover:text-white transition-colors group px-5 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-xl"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className={`${orbitron.className} text-[10px] font-black uppercase tracking-widest`}>Back to Home</span>
                </motion.button>
            </nav>

            <div className="relative z-10 max-w-4xl mx-auto pt-32 pb-20 px-6 flex flex-col items-center">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className={`${orbitron.className} text-[9px] font-bold text-emerald-400 tracking-[0.2em] uppercase`}>
                            Stakeholder Feedback Portal
                        </span>
                    </div>

                    <h1 className={`${orbitron.className} text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight`}>
                        PARTNER <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">FEEDBACK</span>
                    </h1>

                    <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Your insights help us refine the Varnothsava experience. Please share your thoughts on the event and our institution.
                    </p>
                </motion.div>

                {/* Feedback Form Card */}
                <div className="w-full max-w-2xl mb-6 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-emerald-400" />
                                <span className={`${orbitron.className} text-[9px] font-black text-white/40 tracking-widest`}>COMPLETION_STATUS</span>
                            </div>
                            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateProgress()}%` }}
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                                />
                            </div>
                            <span className={`${orbitron.className} text-[10px] font-black text-emerald-400 min-w-[30px]`}>
                                {Math.round(calculateProgress())}%
                            </span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success-screen"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-12 md:p-20 text-center backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-8"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"
                                />
                                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                                    <CheckCircle size={48} className="text-black" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className={`${orbitron.className} text-3xl font-black text-white uppercase`}>Thank You</h3>
                                <p className="text-white/60 font-medium">Your valuable feedback has been recorded. We appreciate your time and dedication to our institution's growth.</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/')}
                                className={`mt-4 px-10 py-4 bg-emerald-500 text-black font-black ${orbitron.className} text-xs tracking-[0.2em] rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all`}
                            >
                                BACK TO SITE
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form-screen"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex flex-col gap-10 mb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                        <FormInput
                                            icon={User}
                                            label="FullName"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                        />
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                        <FormInput
                                            icon={Building}
                                            label="Company"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Tech Solutions Inc."
                                        />
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2">
                                        <div className="flex flex-col gap-6">
                                            <FormInput
                                                icon={Briefcase}
                                                label="Designation"
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleChange}
                                                placeholder="e.g. Talent Acquisition Manager"
                                            />
                                            <QuickSelect
                                                label="Quick Selection"
                                                options={["HR Manager", "Technical Lead", "Placement Officer", "CEO / Founder", "Alumni"]}
                                                value={formData.designation}
                                                onSelect={handleDesignationSelect}
                                            />
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2">
                                        <FormInput
                                            icon={Mail}
                                            label="Contact Information"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            placeholder="email@company.com or +91 98XXX XXXXX"
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="space-y-10 mb-12">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                    <StarRating
                                        label="Overall Event Experience"
                                        value={formData.eventExperience}
                                        onChange={(val) => handleRatingChange('eventExperience', val)}
                                    />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                    <StarRating
                                        label="Overall Impression of the Institution"
                                        value={formData.institutionImpression}
                                        onChange={(val) => handleRatingChange('institutionImpression', val)}
                                    />
                                </motion.div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={status === 'submitting'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 relative overflow-hidden group border-2 ${status === 'submitting' ? 'bg-emerald-500/20 border-emerald-500/50 cursor-wait' : 'bg-emerald-500 border-emerald-500 text-black'
                                    } transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.2)]`}
                            >
                                {status === 'submitting' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        <span className={`${orbitron.className} text-xs font-black tracking-widest text-emerald-400`}>SUBMITTING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className={`${orbitron.className} text-xs font-black tracking-widest uppercase`}>Submit Feedback</span>
                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}

                                {/* Button Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                            </motion.button>

                            {status === 'error' && (
                                <p className="mt-4 text-center text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                                    Transmission Failure. Please retry.
                                </p>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Institutional Footer Decoration */}
                <div className="mt-20 w-full max-w-2xl px-12 py-6 border-t border-white/10 flex items-center justify-between opacity-30">
                    <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                    </div>
                    <span className="font-mono text-[9px] tracking-[0.5em] text-white">SMVITM VARNOTHSAVA</span>
                    <Zap size={14} className="text-emerald-500" />
                </div>
            </div>

            <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
        </main>
    );
}
