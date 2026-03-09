'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getAuthToken } from '@/lib/firebaseClient'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { Html5Qrcode } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import {
    QrCode, X, Search, CheckCircle2, XCircle, AlertCircle,
    Users, Award, Calendar, CreditCard, ShieldCheck, Database, Zap,
    Camera, Upload, Info
} from 'lucide-react'

// Types
export interface ScannedUser {
    id: string;
    name: string;
    email: string;
    collegeName: string;
    phone: string;
    usn: string;
    hasPaid: boolean;
    avatar: string;
    profileCode: string;
    studentType: string;
    registeredEventsCount: number;
}

export interface ScannedMember {
    id: string;
    name: string;
    usn: string;
    profileCode: string;
    hasPaid: boolean;
    collegeName: string;
    isLeader: boolean;
}

export interface ScannedRegistration {
    registrationId: string;
    eventId: string;
    eventName: string;
    eventCategory: string;
    teamName: string;
    registeredAt: any;
    members: ScannedMember[];
}

export interface ScanResult {
    timestamp: number;
    user: ScannedUser;
    registrations: ScannedRegistration[];
}

export default function ScannerDetailsPage() {
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentScan, setCurrentScan] = useState<ScanResult | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'prompt'>('prompt')
    const [isSecure, setIsSecure] = useState(true)

    const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

    useEffect(() => {
        // Check for secure context (required for camera on mobile)
        setIsSecure(window.isSecureContext)

        const stored = localStorage.getItem('admin_scan_history')
        if (stored) {
            try {
                setScanHistory(JSON.parse(stored))
            } catch (e) { }
        }

        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(e => console.error(e))
            }
        }
    }, [])

    const startScanner = async () => {
        setErrorMsg(null)
        setPermissionStatus('pending')
        setIsScanning(true)

        // Wait for DOM mounting
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Check for insecure context (HTTP local IP) which kills camera access on mobile
            if (!window.isSecureContext) {
                setPermissionStatus('denied');
                setErrorMsg("SECURITY BLOCK: Browsers disable cameras on HTTP connections. Use 'localhost' on your laptop or HTTPS (ngrok) for your phone.");
                return;
            }

            // This call triggers the browser's permission prompt if not already denied
            const devices = await Html5Qrcode.getCameras();
            console.log("Scanner hardware signature:", devices);

            if (!devices || devices.length === 0) {
                throw new Error("No camera hardware detected.");
            }

            const html5QrCode = new Html5Qrcode("admin-reader");
            html5QrCodeRef.current = html5QrCode;

            const config = { fps: 15, qrbox: { width: 250, height: 250 } };

            // ATTEMPT 1: Try environment (back) camera
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => onScanSuccess(decodedText),
                    () => { }
                );
            } catch (envErr) {
                // ATTEMPT 2: Fallback to the first available camera (common for laptops)
                console.warn("Mobile back-camera failed, attempting first available device...");
                await html5QrCode.start(
                    devices[0].id,
                    config,
                    (decodedText) => onScanSuccess(decodedText),
                    () => { }
                );
            }

            setPermissionStatus('granted')
        } catch (err: any) {
            console.error("Scanner Lifecycle Error:", err);
            const errStr = err.toString().toLowerCase();

            if (errStr.includes("notallowederror") || errStr.includes("permission denied")) {
                setPermissionStatus('denied')
                setErrorMsg("Camera access is blocked by your browser. Please click the LOCK icon in your address bar and reset the 'Camera' permission.");
            } else if (errStr.includes("notfounderror") || errStr.includes("no camera")) {
                setErrorMsg("System could not find a camera connected to this device.");
            } else {
                setErrorMsg("Scanner initialization failed: " + (err.message || "Hardware conflict"));
            }
        }
    }

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) {
                    await html5QrCodeRef.current.stop()
                }
            } catch (e) {
                console.error(e)
            } finally {
                html5QrCodeRef.current = null;
            }
        }
        setIsScanning(false)
        setErrorMsg(null)
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        try {
            const html5QrCode = new Html5Qrcode("admin-reader-dummy");
            const decodedText = await html5QrCode.scanFile(file, true);
            await onScanSuccess(decodedText);
        } catch (err) {
            setErrorMsg("Could not find a valid QR code in this image.")
        } finally {
            setIsLoading(false)
        }
    }

    const onScanSuccess = async (decodedText: string) => {
        await stopScanner()
        setIsLoading(true)
        setErrorMsg(null)

        try {
            const token = await getAuthToken()
            const res = await fetch(`/api/admin/scan-pass?code=${decodedText}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await res.json()
            if (res.ok) {
                const newScan: ScanResult = {
                    timestamp: Date.now(),
                    user: data.user,
                    registrations: data.registrations
                }
                setCurrentScan(newScan)

                setScanHistory(prev => {
                    const newHistory = [newScan, ...prev.filter(s => s.user.profileCode !== newScan.user.profileCode)]
                    localStorage.setItem('admin_scan_history', JSON.stringify(newHistory))
                    return newHistory
                })

                try {
                    const audio = new Audio('/success-beep.mp3')
                    audio.play().catch(() => { })
                } catch (e) { }

            } else {
                setErrorMsg(data.message || "Invalid QR Code")
            }
        } catch (err: any) {
            setErrorMsg("Network Error: Could not verify pass.")
        } finally {
            setIsLoading(false)
        }
    }

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear the local scan history?")) {
            setScanHistory([])
            localStorage.removeItem('admin_scan_history')
        }
    }

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COORDINATOR', 'VOLUNTEER']}>
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-3">
                            <Zap size={14} className="text-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Rapid Verification</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                            SCANNER DETAILS
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-2 max-w-lg">
                            Instantly scan participant passes to retrieve deep profile structures, nested team data, and live billing status. Data is logged locally for your session.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#111] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Session Scans</p>
                                <p className="text-xl font-black text-emerald-400 italic leading-none">{scanHistory.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scanner Actions & View */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Scanner Module & Live Result */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-[#111] border border-emerald-500/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <QrCode className="text-emerald-500" size={18} /> Deploy Scanner
                                </h2>
                                {isScanning && (
                                    <span className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active
                                    </span>
                                )}
                            </div>

                            {!isScanning && !isLoading && (
                                <div className="space-y-4">
                                    <button
                                        onClick={startScanner}
                                        className="w-full h-40 border-2 border-dashed border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-emerald-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] active:scale-95"
                                    >
                                        <Camera size={40} className="opacity-80 group-hover:scale-110 transition-transform" />
                                        <div className="text-center">
                                            <span className="text-xs font-black uppercase tracking-[0.2em] block">Activate Live Camera</span>
                                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1 block">Best for phone / rapid scan</span>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                            <div className="py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 transition-all">
                                                <Upload size={14} /> Scan from File
                                            </div>
                                        </label>
                                    </div>

                                    {!isSecure && (
                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                            <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-amber-500 font-bold leading-relaxed uppercase tracking-wide">
                                                <span className="block border-b border-amber-500/20 pb-1 mb-1">INSECURE CONTEXT DETECTED</span>
                                                Browsers block cameras on non-HTTPS origins. Use <span className="text-white underline">localhost</span> or <span className="text-white underline">HTTPS tunnel (ngrok)</span> for mobile scanning.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isLoading && (
                                <div className="w-full h-40 border-2 border-emerald-500/20 rounded-2xl bg-emerald-500/5 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:100%_4px] animate-scan pointer-events-none" />
                                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin relative z-10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 relative z-10 animate-pulse">Processing Data Stream...</span>
                                </div>
                            )}

                            {isScanning && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95">
                                    <div className="rounded-2xl overflow-hidden border-2 border-emerald-500/50 relative shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-black">
                                        <div id="admin-reader" className="w-full"></div>
                                        {/* Hidden dummy for file scanning logic fallback internally */}
                                        <div id="admin-reader-dummy" className="hidden"></div>
                                    </div>
                                    <button
                                        onClick={stopScanner}
                                        className="w-full py-3 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
                                    >
                                        Abort Scan
                                    </button>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col gap-3 text-red-400 animate-in slide-in-from-top-2">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider">System Error</p>
                                            <p className="text-[10px] font-bold opacity-80 mt-1 leading-relaxed">{errorMsg}</p>
                                        </div>
                                    </div>

                                    {permissionStatus === 'denied' && (
                                        <div className="pt-3 border-t border-red-500/10 space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Troubleshooting:</p>
                                                <ul className="text-[9px] font-bold text-gray-500 space-y-1 ml-4 list-disc uppercase tracking-wide">
                                                    <li>Click the LOCK icon next to the address bar</li>
                                                    <li>Toggle 'Camera' to ON or click 'Reset Permission'</li>
                                                    <li>Reload the browser page</li>
                                                    <li>Ensure no other app is using your camera</li>
                                                </ul>
                                            </div>

                                            <button
                                                onClick={startScanner}
                                                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                Retry Initialization
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Current Scan Display */}
                        <AnimatePresence mode="popLayout">
                            {currentScan && !isScanning && !isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="bg-[#111] border-2 border-emerald-500/40 rounded-[2rem] p-6 md:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden"
                                >
                                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[80px]" />

                                    {/* Status Badge */}
                                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black uppercase text-[10px] tracking-widest ${currentScan.user.hasPaid ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                                        {currentScan.user.hasPaid ? 'PAID // ALL SECURED' : 'UNPAID // ACTION REQUIRED'}
                                    </div>

                                    <div className="flex items-center gap-5 border-b border-white/10 pb-6 mb-6 pt-2 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 p-1 border border-emerald-500/30">
                                            <img src={currentScan.user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{currentScan.user.name}</h3>
                                            <p className="text-xs text-gray-400 font-mono mt-1">{currentScan.user.usn} • {currentScan.user.profileCode}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">College Node</p>
                                            <p className="text-xs font-bold text-white truncate">{currentScan.user.collegeName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Contact Signal</p>
                                            <p className="text-xs font-bold text-white">{currentScan.user.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Nested Validated Events & Teams */}
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                <Database size={12} /> Registered Events ({currentScan.registrations.length})
                                            </h4>
                                        </div>

                                        {currentScan.registrations.length === 0 ? (
                                            <p className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-500 font-medium italic text-center">No active event registrations found for this profile.</p>
                                        ) : (
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {currentScan.registrations.map(reg => (
                                                    <div key={reg.registrationId} className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-xs font-black text-white uppercase tracking-tight">{reg.eventName}</p>
                                                                <p className="text-[9px] font-bold text-emerald-400 mt-0.5">{reg.teamName}</p>
                                                            </div>
                                                            <span className="text-[8px] font-mono px-2 py-1 bg-black/40 rounded border border-white/10 uppercase text-gray-400">
                                                                {reg.eventCategory}
                                                            </span>
                                                        </div>

                                                        {/* Nested Team Members Array */}
                                                        {reg.members.length > 0 && (
                                                            <div className="pt-2 border-t border-white/5 space-y-2">
                                                                {reg.members.map(member => (
                                                                    <div key={member.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${member.hasPaid ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                                                                            <div>
                                                                                <p className="text-[10px] font-bold text-gray-200 uppercase">{member.name}</p>
                                                                                <p className="text-[8px] font-mono text-gray-500">{member.usn} {member.isLeader && '(LEADER)'}</p>
                                                                            </div>
                                                                        </div>
                                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${member.hasPaid ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                                                            {member.hasPaid ? 'PAID' : 'DUE'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Local State Scanner Database View */}
                    <div className="lg:col-span-7 h-full flex flex-col min-h-[500px]">
                        <div className="bg-[#111] border border-white/10 rounded-[2rem] shadow-2xl flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent">
                                <div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Database className="text-emerald-500" size={16} /> Local Scan Log
                                    </h2>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Temporary Session Data Array</p>
                                </div>
                                {scanHistory.length > 0 && (
                                    <button onClick={clearHistory} className="text-[10px] uppercase font-bold text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20">
                                        Clear Array
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/40">
                                {scanHistory.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 pb-10">
                                        <QrCode size={64} className="mb-4 text-emerald-500" />
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-white">No nodes verified</p>
                                        <p className="text-xs text-emerald-400 mt-2 italic font-mono">Awaiting scanner input array...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {scanHistory.map((scan, idx) => (
                                                <motion.div
                                                    key={`${scan.user.profileCode}-${scan.timestamp}`}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => setCurrentScan(scan)}
                                                    className={`p-4 rounded-xl border cursor-pointer hover:bg-white/5 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${currentScan?.timestamp === scan.timestamp ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0a0a0a] border-white/5'}`}
                                                >
                                                    {currentScan?.timestamp === scan.timestamp && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                                                    )}

                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-black text-xs ${scan.user.hasPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                                            {scan.user.avatar ? (
                                                                <img src={scan.user.avatar} className="w-full h-full rounded-full object-cover" />
                                                            ) : (
                                                                scan.user.name[0].toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white uppercase truncate">{scan.user.name}</p>
                                                            <p className="text-[10px] font-mono text-gray-500">[{scan.user.profileCode}] {scan.user.usn}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 sm:ml-auto">
                                                        <div className="flex flex-col sm:items-end">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                                {scan.registrations.length} Events Linked
                                                            </p>
                                                        </div>
                                                        <div className="text-[8px] font-mono text-gray-600 opacity-60">
                                                            {new Date(scan.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
