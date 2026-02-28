'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Phone, Info, Calendar, MapPin, CreditCard, Users } from 'lucide-react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    id: string
    text: string
    sender: 'bot' | 'user'
    timestamp: Date
}

import { useApp } from '@/context/AppContext'
import { CheckCircle } from 'lucide-react'

const QUICK_QUESTIONS = [
    "How to register?",
    "About Payment & Robo Soccer",
    "Accommodation Info",
    "Contact Details"
]

export function ChatBot() {
    const { isChatOpen, setIsChatOpen } = useApp()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm the Varnothsava AI Assistant. Ask me anything about the fest! 🤖",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const quickActionsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async (text: string) => {
        if (!text.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: messages.slice(-6) // Send last few messages for context
                })
            })

            const data = await response.json()

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.text || "I'm sorry, I couldn't process that. Please try again.",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            console.error("Chat Error:", error)
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting to my brain! 😅 Please contact our coordinators for quick help:\n\n• Bhushan: 7381709385\n• Tejas: 8296151023\n• Abhishek: 9844101520",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 md:bottom-20 right-0 w-[92vw] md:w-[420px] h-[550px] bg-[#0a0a0a]/95 border border-emerald-500/20 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col backdrop-blur-2xl pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 p-4 border-b border-emerald-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-none text-sm">Varnothsava AI</h3>
                                    <p className="text-[10px] text-emerald-500/60 font-medium tracking-[0.2em] uppercase">Varnothsava Official</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            data-lenis-prevent
                            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth overscroll-contain bg-[#0a0a0a] chat-scrollbar"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user'
                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                        : 'bg-white/5 border border-emerald-500/20 text-emerald-50/90 rounded-tl-none'
                                        }`}>
                                        {msg.sender === 'bot' ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-a:text-emerald-400 hover:prose-a:text-emerald-300 transition-colors">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-line">{msg.text}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-emerald-500/10 p-3 rounded-2xl rounded-tl-none">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions - Revamped for visibility and scrolling */}
                        <div className="px-3 py-3 border-t border-white/5 bg-black/40">
                            <div
                                ref={quickActionsRef}
                                className="grid grid-cols-2 gap-2"
                            >
                                {QUICK_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => handleSend(q)}
                                        className="px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:border-emerald-500/30"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-white/10 bg-[#080808]">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(input) }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/40 transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="w-11 h-11 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-900/20 flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:grayscale cursor-pointer"
                                >
                                    <Send size={18} className="text-white" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
