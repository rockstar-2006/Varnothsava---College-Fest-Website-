'use client';

import React, { useRef, useState, useEffect } from 'react';
import HTMLFlipBook from "react-pageflip";

// Generated list of images based on the files moved to public/rulebook
const sortedImageUrls = Array.from({ length: 28 }, (_, i) => {
    // Filename format: VARNOTHSAVA Brochure 2026-images-0.jpg
    const fileName = `VARNOTHSAVA Brochure 2026-images-${i}.jpg`;
    return `/rulebook/${encodeURIComponent(fileName)}`;
});



function Book() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const book = useRef<any>(null);
    const [zoom, setZoom] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            // Consider tablet (up to 1024px) or any portrait orientation as mobile
            setIsMobile(window.innerWidth <= 1024 || window.innerHeight > window.innerWidth);
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goToPrev = () => {
        book.current?.pageFlip().flipPrev();
    };

    const goToNext = () => {
        book.current?.pageFlip().flipNext();
    };

    const zoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 1.5));
    };

    const zoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };

    // Realistic Flip Sound Logic
    const playFlipSound = () => {
        const audio = new Audio('/flip.mp3');
        audio.volume = 0.6;
        audio.currentTime = 0; // Rewind to start for every flip
        audio.play().catch(err => console.log("Sound play prevented by browser:", err));
    };



    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const FlipBook = HTMLFlipBook as any;

    return (
        <div className="book-container-relative">

            {/* Left Button */}
            <button className="nav-button left-button" onClick={goToPrev} aria-label="Previous Page">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <div className="book-wrapper" style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}>
                <FlipBook
                    key={isMobile ? 'mobile' : 'desktop'}


                    width={isMobile ? 340 : 600}
                    height={isMobile ? 500 : 850}
                    size="fixed"
                    minWidth={200}
                    maxWidth={1200}
                    minHeight={300}
                    maxHeight={1600}
                    drawShadow={!isMobile} // Disable shadow on mobile for performance
                    maxShadowOpacity={0.3}
                    showCover={true}
                    mobileScrollSupport={true}
                    usePortrait={isMobile}
                    startPage={0}
                    className="flip-book"
                    ref={book}
                    onFlip={playFlipSound}
                    flippingTime={1000} // Slower for Safari stability

                    style={{
                        position: 'relative',
                        margin: '0 auto',
                        touchAction: 'none',
                        willChange: 'transform',
                        WebkitTransform: 'translateZ(0)' // Safari Fix
                    }}
                    clickEventForward={true}
                    useMouseEvents={true}
                    swipeDistance={40} // More deliberate swipe for smoothness
                    showPageCorners={false} // Performance boost
                    disableCanvasCopy={true} // Essential Safari/iOS Fix

                >





                    {sortedImageUrls.map((url, index) => (
                        <div className="page" key={index}>
                            <div className="page-content">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={url}
                                    alt={`Page ${index + 1}`}
                                    className="page-image"
                                    loading={index < 4 ? "eager" : "lazy"}
                                    decoding="async"
                                    fetchPriority={index < 2 ? "high" : "low"}
                                />
                            </div>
                        </div>
                    ))}

                </FlipBook>
            </div>

            {/* Right Button */}
            <button className="nav-button right-button" onClick={goToNext} aria-label="Next Page">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>

            {/* Zoom Controls */}
            <div className="zoom-controls">
                <button onClick={zoomOut} className="zoom-btn" title="Zoom Out">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="zoom-btn" title="Zoom In">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>

        </div>
    );
}

export default Book;
