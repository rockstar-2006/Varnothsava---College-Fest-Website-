'use client'

import { useEffect, useState } from 'react'

export default function RazorpayTestPage() {
    const [status, setStatus] = useState<{
        scriptLoaded: boolean
        razorpayAvailable: boolean
        error: string | null
    }>({
        scriptLoaded: false,
        razorpayAvailable: false,
        error: null
    })

    useEffect(() => {
        const checkRazorpay = () => {
            const script = document.querySelector('script[src*="checkout.razorpay.com"]')
            const razorpayAvailable = typeof window !== 'undefined' && !!window.Razorpay

            setStatus({
                scriptLoaded: !!script,
                razorpayAvailable,
                error: null
            })

            if (!script) {
                setStatus(prev => ({
                    ...prev,
                    error: 'Razorpay script tag not found in DOM'
                }))
            } else if (!razorpayAvailable) {
                setStatus(prev => ({
                    ...prev,
                    error: 'Razorpay script loaded but window.Razorpay not available'
                }))
            }
        }

        // Check immediately
        checkRazorpay()

        // Check again after 2 seconds
        const timeout = setTimeout(checkRazorpay, 2000)

        return () => clearTimeout(timeout)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h1 className="text-3xl font-bold text-white mb-6">
                    🔍 Razorpay SDK Diagnostic
                </h1>

                <div className="space-y-4">
                    {/* Script Loaded */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white font-medium">Script Tag in DOM</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.scriptLoaded
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {status.scriptLoaded ? '✅ Yes' : '❌ No'}
                        </span>
                    </div>

                    {/* Razorpay Available */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white font-medium">window.Razorpay Available</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.razorpayAvailable
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {status.razorpayAvailable ? '✅ Yes' : '❌ No'}
                        </span>
                    </div>

                    {/* Error */}
                    {status.error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 font-medium mb-2">⚠️ Issue Detected:</p>
                            <p className="text-red-300 text-sm">{status.error}</p>
                        </div>
                    )}

                    {/* Success */}
                    {status.scriptLoaded && status.razorpayAvailable && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-green-400 font-medium mb-2">✅ All Good!</p>
                            <p className="text-green-300 text-sm">
                                Razorpay SDK is loaded and ready to use.
                            </p>
                        </div>
                    )}

                    {/* Troubleshooting */}
                    {!status.razorpayAvailable && (
                        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-yellow-400 font-medium mb-3">🔧 Troubleshooting Steps:</p>
                            <ul className="text-yellow-300 text-sm space-y-2 list-disc list-inside">
                                <li>Check your internet connection</li>
                                <li>Disable ad blockers or browser extensions</li>
                                <li>Check browser console for errors (F12)</li>
                                <li>Try refreshing the page</li>
                                <li>Try a different browser</li>
                                <li>Check if firewall is blocking checkout.razorpay.com</li>
                            </ul>
                        </div>
                    )}

                    {/* Console Check */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 font-medium mb-2">💡 Check Browser Console</p>
                        <p className="text-blue-300 text-sm mb-2">
                            Press F12 to open developer tools and check the Console tab for errors.
                        </p>
                        <p className="text-blue-300 text-sm">
                            Look for any errors related to "checkout.razorpay.com" or "Razorpay"
                        </p>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        🔄 Refresh Page
                    </button>

                    {/* Back to Home */}
                    <a
                        href="/"
                        className="block w-full mt-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors text-center"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    )
}
