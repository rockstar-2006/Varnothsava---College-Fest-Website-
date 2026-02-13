'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { X, ShieldCheck, User, School, Hash, Award } from 'lucide-react'

interface QrScannerProps {
    onClose: () => void
}

export const QrScanner: React.FC<QrScannerProps> = ({ onClose }) => {
    const [scanResult, setScanResult] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [scannedData, setScannedData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        if (isScanning && !scanResult) {
            scannerRef.current = new Html5QrcodeScanner(
                'reader',
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            )

            scannerRef.current.render(onScanSuccess, onScanFailure)
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error('Failed to clear scanner', err))
            }
        }
    }, [isScanning, scanResult])

    async function onScanSuccess(decodedText: string) {
        setScanResult(decodedText)
        setIsScanning(false)
        if (scannerRef.current) {
            await scannerRef.current.clear()
        }

        // If it looks like a profile code (6 chars alphanumeric), try to fetch info
        if (decodedText.length === 6) {
            fetchScannedUser(decodedText)
        }
    }

    function onScanFailure(error: any) {
        // Quietly ignore scan failures
    }

    async function fetchScannedUser(code: string) {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/user-by-code?code=${code}`)
            if (response.ok) {
                const data = await response.json()
                setScannedData(data.user)
            }
        } catch (err) {
            console.error('Failed to fetch scanned user', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-6 py-4">
            {!isScanning && !scanResult && !scannedData && (
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Award size={40} className="text-emerald-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-white font-bold uppercase italic">Scanner Deployment</h4>
                        <p className="text-xs text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                            Initialize your device camera to scan student passes or coordinator codes.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsScanning(true)}
                        className="px-8 py-4 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
                    >
                        Activate Camera
                    </button>
                </div>
            )}

            {isScanning && (
                <div className="w-full max-w-[350px] mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    <div id="reader" className="qr-reader"></div>
                    <button
                        onClick={() => setIsScanning(false)}
                        className="w-full py-3 bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        Cancel Scan
                    </button>
                </div>
            )}

            {(scanResult || scannedData) && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    {isLoading ? (
                        <div className="flex flex-col items-center py-10 gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] animate-pulse">Scanning Bio-Data...</p>
                        </div>
                    ) : scannedData ? (
                        /* --- RECEIPT / PAPER STYLE CARD --- */
                        <div className="relative mx-auto w-full max-w-[340px] perspective-1000">
                            <div id="printable-receipt" className="bg-white text-black p-8 shadow-2xl relative overflow-hidden flex flex-col items-center"
                                style={{
                                    clipPath: 'polygon(0 0, 100% 0, 100% 95%, 98% 97%, 95% 95%, 92% 97%, 89% 95%, 86% 97%, 83% 95%, 80% 97%, 77% 95%, 74% 97%, 71% 95%, 68% 97%, 65% 95%, 62% 97%, 59% 95%, 56% 97%, 53% 95%, 50% 97%, 47% 95%, 44% 97%, 41% 95%, 38% 97%, 35% 95%, 32% 97%, 29% 95%, 26% 97%, 23% 95%, 20% 97%, 17% 95%, 14% 97%, 11% 95%, 8% 97%, 5% 95%, 2% 97%, 0 95%)'
                                }}>

                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-[-35deg]">
                                    <span className="text-6xl font-black">VARNOTHSAVA</span>
                                </div>

                                <div className="w-full border-b-2 border-dashed border-gray-300 pb-4 mb-6 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 mb-3 shadow-lg">
                                        <img src={scannedData.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="text-xl font-black tracking-tighter uppercase">{scannedData.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em]">OFFICIAL ENTRY PASS</p>
                                </div>

                                <div className="w-full space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">USN / ID</span>
                                        <span className="text-xs font-bold text-black border-b border-black/10">{scannedData.usn}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">College</span>
                                        <span className="text-[10px] font-bold text-black text-right max-w-[180px] truncate">{scannedData.collegeName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact</span>
                                        <span className="text-xs font-bold text-black">{scannedData.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pass Code</span>
                                        <span className="text-xs font-mono font-bold text-emerald-600">{scannedData.profileCode}</span>
                                    </div>
                                </div>

                                <div className="w-full py-4 border-y-2 border-dashed border-gray-300 mb-8 flex flex-col items-center justify-center relative">
                                    <div className={`
                                            transform rotate-[-5deg] px-6 py-2 border-4 font-black uppercase tracking-widest text-lg md:text-xl
                                            ${scannedData.hasPaid ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}
                                        `}>
                                        {scannedData.hasPaid ? 'VERIFIED' : 'PENDING'}
                                    </div>
                                    <p className={`text-[8px] font-bold mt-2 tracking-[0.3em] ${scannedData.hasPaid ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {scannedData.hasPaid ? 'PAYMENT SUCCESSFUL' : 'ACTION REQUIRED'}
                                    </p>
                                </div>

                                <p className="text-[8px] text-gray-400 font-medium text-center italic">
                                    Timestamp: {new Date().toLocaleString()}<br />
                                    Secure node verification: ACTIVE
                                </p>

                                <div className="h-6" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    className="py-4 bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                                >
                                    Download Ticket
                                </button>
                                <button
                                    onClick={() => {
                                        setScanResult(null)
                                        setScannedData(null)
                                        setIsScanning(true)
                                    }}
                                    className="py-4 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg"
                                >
                                    Scan Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center space-y-4">
                            <p className="text-slate-400 text-xs font-medium">Unknown Token Identified:</p>
                            <p className="text-white font-mono text-sm break-all bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">{scanResult}</p>
                            <div className="pt-4 space-y-3">
                                <div className="px-4 py-2 border-2 border-red-500/50 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-lg inline-block rotate-[-2deg]">
                                    FAILED VERIFICATION
                                </div>
                                <button
                                    onClick={() => {
                                        setScanResult(null)
                                        setIsScanning(true)
                                    }}
                                    className="w-full py-4 bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/20 transition-all active:scale-95"
                                >
                                    Retry Scanned Code
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
