'use client'

import React, { useEffect, useRef } from 'react'

export default function TerminalBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = canvas.width = window.innerWidth
        let height = canvas.height = window.innerHeight

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}/[]*&^%$'
        const fontSize = 14
        const columns = Math.ceil(width / fontSize)
        const drops: number[] = []

        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100 // Start at random heights above screen
        }

        const draw = () => {
            // Semi-transparent black to create trail effect - Pure Black to match Login
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
            ctx.fillRect(0, 0, width, height)

            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)]

                // Color variation: Emerald Green to match "Technical" brand
                const isBright = Math.random() > 0.98
                ctx.fillStyle = isBright ? '#fff' : '#10b981'

                const x = i * fontSize
                const y = drops[i] * fontSize

                ctx.fillText(text, x, y)

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0
                }
                drops[i]++
            }
        }

        let animationId: number
        const animate = () => {
            draw()
            animationId = requestAnimationFrame(animate)
        }
        animate()

        const handleResize = () => {
            width = canvas.width = window.innerWidth
            height = canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)
        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-black"
        />
    )
}
