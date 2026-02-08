"use client";

import React, { useEffect, useRef } from 'react';

interface CyberBackgroundProps {
    themeColor?: string;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ themeColor = "#00e5ff" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const themeRef = useRef(themeColor);

    useEffect(() => {
        themeRef.current = themeColor;
    }, [themeColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Particles
        const particles: Particle[] = [];
        const particleCount = 100;

        class Particle {
            x: number = 0;
            y: number = 0;
            z: number = 0;
            vx: number = 0;
            vy: number = 0;
            size: number = 0;
            alpha: number = 0;

            constructor() {
                this.reset();
            }

            reset() {
                if (!canvas) return;
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 2; // Depth
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
                // Use slightly randomized alpha for depth
                this.alpha = Math.random() * 0.5;
            }

            update() {
                if (!canvas) return;
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                // Parse hex to rgb for alpha
                const hex = themeRef.current.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
                ctx.fill();
            }
        }

        // Grid lines
        let gridOffset = 0;

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const drawGrid = () => {
            if (!ctx || !canvas) return;

            const hex = themeRef.current.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            ctx.lineWidth = 1;

            const w = canvas.width;
            const h = canvas.height;

            // Perspective Grid
            const horizon = h / 2;

            // Floor
            for (let y = horizon; y < h; y += 20) {
                let progress = (y - horizon) / (h - horizon); // 0 to 1
                let opacity = progress;
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`;
                ctx.beginPath();
                ctx.moveTo(0, y + gridOffset);
                ctx.lineTo(w, y + gridOffset);
                ctx.stroke();
            }

            // Vertical diverging lines
            const centerX = w / 2;
            for (let x = -w; x < w * 2; x += 100) {
                ctx.beginPath();
                ctx.moveTo(centerX, horizon);
                ctx.lineTo(x, h);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
                ctx.stroke();
            }

            gridOffset = (gridOffset + 0.5) % 20;

            // Ceiling (mirror of floor)
            for (let y = horizon; y > 0; y -= 20) {
                let progress = (horizon - y) / horizon;
                let opacity = progress;
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`;
                ctx.beginPath();
                ctx.moveTo(0, y - gridOffset);
                ctx.lineTo(w, y - gridOffset);
                ctx.stroke();
            }
            // Vertical diverging lines (Ceiling)
            for (let x = -w; x < w * 2; x += 100) {
                ctx.beginPath();
                ctx.moveTo(centerX, horizon);
                ctx.lineTo(x, 0);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
                ctx.stroke();
            }
        };

        const render = () => {
            if (!ctx || !canvas) return;

            // Dark fade for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Stronger clear for less trail ghosting
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawGrid();

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Connection lines
            const hex = themeRef.current.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.1)`; // Slightly brighter lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                    }
                }
            }
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
};

export default CyberBackground;
