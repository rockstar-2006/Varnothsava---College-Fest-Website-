'use client'

import { useState } from "react";
import Image from "next/image";
import "@/styles/event-card.css";

interface EventCardProps {
    gameName: string;
    eventTitle: string;
    date: string;
    prizePool: string;
    slots: string;
    image: string;
    theme: "bgmi" | "valorant";
    onRegister?: () => void;
    onDetail?: () => void;
    isRegistered?: boolean;
    whatsappLink?: string;
}

export default function EventCard({
    gameName,
    eventTitle,
    date,
    prizePool,
    slots,
    image,
    theme,
    onRegister,
    onDetail,
    isRegistered,
    whatsappLink,
}: EventCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`event-card-wrapper ${theme} gpu-accel`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Outer geometric frame layers */}
            <div className="geo-frame-outer" />
            <div className="geo-frame-middle" />

            {/* Main card */}
            <div className={`event-card ${isHovered ? "hovered" : ""}`}>
                {/* Animated corner brackets */}
                <div className="corner-bracket tl">
                    <div className="bracket-h" />
                    <div className="bracket-v" />
                    <div className="bracket-dot" />
                </div>
                <div className="corner-bracket tr">
                    <div className="bracket-h" />
                    <div className="bracket-v" />
                    <div className="bracket-dot" />
                </div>
                <div className="corner-bracket bl">
                    <div className="bracket-h" />
                    <div className="bracket-v" />
                    <div className="bracket-dot" />
                </div>
                <div className="corner-bracket br">
                    <div className="bracket-h" />
                    <div className="bracket-v" />
                    <div className="bracket-dot" />
                </div>

                {/* Top diamond accent */}
                <div className="diamond-accent top-diamond">
                    <div className="diamond-inner" />
                </div>

                {/* Game badge */}
                <div className="game-badge">
                    <div className="badge-bg" />
                    <span className="badge-text font-display uppercase italic tracking-[0.2em]">{gameName}</span>
                </div>

                {/* Character image with geometric mask */}
                <div className="character-container">
                    <div className="hex-outer-ring" />
                    <div className="hex-mid-ring" />
                    <div className="character-frame">
                        <Image
                            src={image}
                            alt={gameName}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="character-img object-cover"
                        />
                        <div className="character-overlay" />
                    </div>
                    {/* Floating elements */}
                    <div className="float-geo geo-diamond" />
                    <div className="float-geo geo-triangle" />
                    <div className="float-geo geo-circle" />
                    <div className="float-geo geo-square" />
                </div>

                {/* Event title */}
                <div className="event-title-container">
                    <div className="title-line left" />
                    <h2 className="event-title font-display italic tracking-tighter uppercase">{eventTitle}</h2>
                    <div className="title-line right" />
                </div>

                {/* Date banner */}
                <div className="date-banner">
                    <div className="date-edge left" />
                    <span className="date-text font-mono font-black">{date}</span>
                    <div className="date-edge right" />
                </div>

                {/* Stats grid */}
                <div className="stats-grid">
                    {/* <div className="stat-box">
                        <div className="stat-icon text-[10px]">🏆</div>
                        <div className="stat-content">
                            <span className="stat-label">PRIZE</span>
                            <span className="stat-value">{prizePool}</span>
                        </div>
                    </div>
                    <div className="stat-divider" /> */}
                    <div className="stat-box flex-center">
                        <div className="stat-icon text-[10px]">👥</div>
                        <div className="stat-content">
                            <span className="stat-label">SLOTS</span>
                            <span className="stat-value uppercase">{slots || 'LIMITED'}</span>
                        </div>
                    </div>
                </div>

                {/* Actions container */}
                <div className="actions-container">
                    {/* Details button - Smaller Secondary */}
                    <button className="detail-btn" onClick={(e) => { e.stopPropagation(); onDetail?.(); }}>
                        <div className="btn-outline" />
                        <span className="btn-text font-display font-black tracking-widest">DETAILS</span>
                    </button>

                    {/* Register button - Primary */}
                    <button className="register-btn group" onClick={(e) => { e.stopPropagation(); onRegister?.(); }}>
                        <div className="btn-bg" />
                        <div className="btn-edge left" />
                        <div className="btn-edge right" />
                        <span className="btn-text font-display font-black tracking-widest group-hover:tracking-[0.2em] transition-all">
                            {isRegistered ? (whatsappLink ? 'WHATSAPP' : 'REGISTERED') : 'REGISTER'}
                        </span>
                        <div className="btn-shine" />
                    </button>
                </div>

                {/* Bottom diamond accent */}
                <div className="diamond-accent bottom-diamond">
                    <div className="diamond-inner" />
                </div>


                {/* Side geometric decorations */}
                <div className="side-deco left-deco">
                    <div className="deco-line" />
                    <div className="deco-dot" />
                    <div className="deco-line short" />
                </div>
                <div className="side-deco right-deco">
                    <div className="deco-line" />
                    <div className="deco-dot" />
                    <div className="deco-line short" />
                </div>

                {/* Scan lines overlay */}
                <div className="scan-lines" />

                {/* Energy pulse effect */}
                <div className="energy-pulse" />
            </div>
        </div>
    );
}