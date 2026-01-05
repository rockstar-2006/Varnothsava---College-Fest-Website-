'use client';

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import './DomeGallery.css';

const DEFAULT_IMAGES = [
    { src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200', alt: 'Innovation' },
    { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200', alt: 'Stage' },
    { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200', alt: 'Crowd' },
    { src: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200', alt: 'Gaming' },
    { src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200', alt: 'Exhibit' },
    { src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200', alt: 'Concert' },
    { src: 'https://images.unsplash.com/photo-1475721027464-57275c7fdbcc?w=1200', alt: 'Tech' },
    { src: 'https://images.unsplash.com/photo-1531050171651-7330d938bb8c?w=1200', alt: 'Lab' },
    { src: 'https://images.unsplash.com/photo-1505373676634-11882ed308c1?w=1200', alt: 'Night' },
    { src: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200', alt: 'Music' },
];

const DEFAULTS = {
    maxVerticalRotationDeg: 15,
    dragSensitivity: 15,
    enlargeTransitionMs: 400,
    segmentsDesktop: 45,
    segmentsMobile: 24
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
    const a = (((deg + 180) % 360) + 360) % 360;
    return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
    const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
    const n = attr == null ? NaN : parseFloat(attr);
    return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: any[], seg: number) {
    const xCols = Array.from({ length: seg }, (_, i) => i - seg / 2);
    // Calibrated for 60 segments to ensure no overlap and proper circular spacing
    const evenYs = [-10, -5, 0, 5, 10];
    const oddYs = [-7.5, -2.5, 2.5, 7.5];

    const coords = xCols.flatMap((x, c) => {
        // Reduced gap: Spacing every 3 units instead of 4
        if (c % 3 !== 0) return [];

        const ys = (c / 3) % 2 === 0 ? evenYs : oddYs;
        // Increased Width: sizeX boosted to 4.5x
        return ys.map(y => ({ x: x, y: y, sizeX: 4.5, sizeY: 5.0 }));
    });

    const totalSlots = coords.length;
    if (pool.length === 0) return coords.map(c => ({ ...c, src: '', alt: '' }));

    const normalizedImages = pool.map(image => (typeof image === 'string' ? { src: image, alt: '' } : { src: image.src || '', alt: image.alt || '' }));
    const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

    return coords.map((c, i) => ({ ...c, src: usedImages[i].src, alt: usedImages[i].alt }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
    const rotateY = (offsetX / segments) * 360;
    const rotateX = (offsetY / segments) * 180;
    return { rotateX, rotateY };
}

interface DomeGalleryProps {
    images?: any[]
    fit?: number
    fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height'
    minRadius?: number
    maxRadius?: number
    padFactor?: number
    overlayBlurColor?: string
    maxVerticalRotationDeg?: number
    dragSensitivity?: number
    enlargeTransitionMs?: number
    segments?: number
    dragDampening?: number
    openedImageWidth?: string
    openedImageHeight?: string
    imageBorderRadius?: string
    openedImageBorderRadius?: string
    grayscale?: boolean
}

export default function DomeGallery({
    images = DEFAULT_IMAGES,
    fit = 1.6,
    fitBasis = 'auto',
    minRadius = 750,
    maxRadius = 750,
    padFactor = 0.1,
    overlayBlurColor = '#020402',
    maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
    dragSensitivity = DEFAULTS.dragSensitivity,
    enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
    segments = 45,
    dragDampening = 2,
    openedImageWidth = '450px',
    openedImageHeight = '600px',
    imageBorderRadius = '12px',
    openedImageBorderRadius = '24px',
    grayscale = false
}: DomeGalleryProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const sphereRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);
    const focusedElRef = useRef<HTMLElement | null>(null);
    const originalTilePositionRef = useRef<any>(null);

    const rotationRef = useRef({ x: 0, y: 0 });
    const startRotRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef<{ x: number, y: number } | null>(null);
    const draggingRef = useRef(false);
    const movedRef = useRef(false);
    const inertiaRAF = useRef<number | null>(null);
    const openingRef = useRef(false);
    const openStartedAtRef = useRef(0);
    const lastDragEndAt = useRef(0);

    const scrollLockedRef = useRef(false);
    const lockScroll = useCallback(() => {
        if (scrollLockedRef.current) return;
        scrollLockedRef.current = true;
        document.body.classList.add('dg-scroll-lock');
    }, []);
    const unlockScroll = useCallback(() => {
        if (!scrollLockedRef.current) return;
        if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
        scrollLockedRef.current = false;
        document.body.classList.remove('dg-scroll-lock');
    }, []);

    const [currentSegments, setCurrentSegments] = React.useState(DEFAULTS.segmentsDesktop);

    useEffect(() => {
        const checkMobile = () => {
            setCurrentSegments(window.innerWidth < 768 ? DEFAULTS.segmentsMobile : DEFAULTS.segmentsDesktop);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const items = useMemo(() => buildItems(images, currentSegments), [images, currentSegments]);
    const mouseSpeedRef = useRef({ x: 0, y: 0 });
    const smoothVelocityRef = useRef({ x: 0, y: 0 }); // Smooth interpolation
    const lastTimeRef = useRef(performance.now());

    const [isAssembled, setIsAssembled] = React.useState(false);

    // Generate random explosion offsets for the 'Reverse Blast' entry
    const explosionOffsets = useMemo(() => {
        return items.map(() => ({
            rx: (Math.random() - 0.5) * 1000,
            ry: (Math.random() - 0.5) * 1000,
            rz: 1500 + Math.random() * 2000,
            scale: Math.random() * 0.3
        }));
    }, [items]);

    const applyTransform = useCallback((xDeg: number, yDeg: number) => {
        const el = sphereRef.current;
        if (el) el.style.transform = `translate3d(0, 0, calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }, []);

    // Continuous Cinematic Rotation
    useEffect(() => {
        let rafId: number;
        const rotate = (time: number) => {
            const dt = (time - lastTimeRef.current) / 16.666; // Normalize to 60fps
            lastTimeRef.current = time;

            const isHeld = draggingRef.current;
            const isAutoRotating = !inertiaRAF.current && !openingRef.current;

            if (isAutoRotating) {
                // Smoothly interpolate steering/boost for a premium feel
                const targetSteerX = mouseSpeedRef.current.x;
                const targetSteerY = mouseSpeedRef.current.y;
                const holdBoost = isHeld ? 2.5 : 0;

                // Simple Lerp for buttery transitions
                smoothVelocityRef.current.x += (targetSteerX + holdBoost - smoothVelocityRef.current.x) * 0.12;
                smoothVelocityRef.current.y += (targetSteerY - smoothVelocityRef.current.y) * 0.12;

                const baseSpeed = 0.45;
                rotationRef.current.y += (baseSpeed + smoothVelocityRef.current.x) * dt;
                rotationRef.current.x = clamp(rotationRef.current.x - (smoothVelocityRef.current.y * 0.35) * dt, -maxVerticalRotationDeg, maxVerticalRotationDeg);

                const sphere = sphereRef.current;
                if (sphere) {
                    sphere.style.transform = `translate3d(0, 0, calc(var(--radius) * -1)) rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
                }
            }
            rafId = requestAnimationFrame(rotate);
        };
        rafId = requestAnimationFrame(rotate);
        return () => cancelAnimationFrame(rafId);
    }, [applyTransform]);

    // Trigger assembly animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsAssembled(true), 150);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const ro = new ResizeObserver(entries => {
            const cr = entries[0].contentRect;
            const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
            const aspect = w / h;
            let basis = aspect >= 1.3 ? w : Math.min(w, h);
            let radius = clamp(basis * fit, minRadius, maxRadius);

            root.style.setProperty('--radius', `${radius}px`);
            root.style.setProperty('--viewer-pad', `${Math.round(Math.min(w, h) * padFactor)}px`);
            root.style.setProperty('--image-filter', grayscale ? 'grayscale(0.3) brightness(0.9)' : 'none');
            applyTransform(rotationRef.current.x, rotationRef.current.y);
        });
        ro.observe(root);
        return () => ro.disconnect();
    }, [fit, minRadius, maxRadius, padFactor, grayscale, applyTransform]);

    useEffect(() => { applyTransform(rotationRef.current.x, rotationRef.current.y); }, [applyTransform]);

    const stopInertia = useCallback(() => { if (inertiaRAF.current) { cancelAnimationFrame(inertiaRAF.current); inertiaRAF.current = null; } }, []);
    const startInertia = useCallback((vx: number, vy: number) => {
        const MAX_V = 1.4;
        let vX = clamp(vx, -MAX_V, MAX_V) * 80;
        let vY = clamp(vy, -MAX_V, MAX_V) * 80;
        const d = clamp(dragDampening ?? 0.6, 0, 1);
        const frictionMul = 0.94 + 0.055 * d;
        const step = () => {
            vX *= frictionMul; vY *= frictionMul;
            if (Math.abs(vX) < 0.01 && Math.abs(vY) < 0.01) { inertiaRAF.current = null; return; }
            const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
            const nextY = rotationRef.current.y + vX / 200; // Unbounded for smoothness
            rotationRef.current = { x: nextX, y: nextY };
            applyTransform(nextX, nextY);
            inertiaRAF.current = requestAnimationFrame(step);
        };
        stopInertia(); inertiaRAF.current = requestAnimationFrame(step);
    }, [dragDampening, maxVerticalRotationDeg, stopInertia, applyTransform]);

    useGesture({
        onDragStart: ({ event }) => {
            if (focusedElRef.current) return;
            stopInertia();
            mouseSpeedRef.current = { x: 0, y: 0 }; // Stop cursor-steering during manual drag
            const evt = event as any;
            draggingRef.current = true; movedRef.current = false;
            startRotRef.current = { ...rotationRef.current };
            startPosRef.current = { x: evt.clientX || evt.touches?.[0]?.clientX, y: evt.clientY || evt.touches?.[0]?.clientY };
        },
        onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
            if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
            const evt = event as any;
            const clientX = evt.clientX || evt.touches?.[0]?.clientX;
            const clientY = evt.clientY || evt.touches?.[0]?.clientY;
            if (clientX === undefined) return;
            const dxTotal = clientX - startPosRef.current.x;
            const dyTotal = clientY - startPosRef.current.y;
            if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef.current = true;
            const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
            const nextY = startRotRef.current.y + dxTotal / dragSensitivity; // Unbounded

            // Only update X directly; Y is now partially driven by the rotate loop's holdBoost 
            // for a smoother 'continuous rotate' feel.
            rotationRef.current.x = nextX;
            rotationRef.current.y = nextY;

            applyTransform(rotationRef.current.x, rotationRef.current.y);
            if (last) {
                draggingRef.current = false;
                let [vMagX, vMagY] = velocity; const [dirX, dirY] = direction;
                let vx = vMagX * dirX, vy = vMagY * dirY;
                if (vMagX < 0.01 && vMagY < 0.01 && movement) { vx = (movement[0] / dragSensitivity) * 0.02; vy = (movement[1] / dragSensitivity) * 0.02; }
                if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
                if (movedRef.current) lastDragEndAt.current = performance.now();
            }
        },
        onMove: ({ xy: [x, y] }) => {
            if (draggingRef.current || openingRef.current) return;
            const el = mainRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();

            const midX = rect.left + rect.width / 2;
            const midY = rect.top + rect.height / 2;

            const offX = (x - midX) / (rect.width / 2); // -1 to 1
            const offY = (y - midY) / (rect.height / 2); // -1 to 1

            mouseSpeedRef.current = {
                x: offX * 1.5,
                y: offY * 0.8 // Slightly less sensitivity for vertical
            };
        }
    }, { target: mainRef as any, eventOptions: { passive: true } });

    const close = useCallback(() => {
        const el = focusedElRef.current; if (!el) return;
        const parent = el.parentElement as HTMLElement;
        const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement; if (!overlay) return;
        const refDiv = parent.querySelector('.item__image--reference') as HTMLElement;
        const originalPos = originalTilePositionRef.current;

        if (!originalPos) {
            overlay.remove(); if (refDiv) refDiv.remove();
            parent.style.setProperty('--rot-y-delta', '0deg'); parent.style.setProperty('--rot-x-delta', '0deg');
            el.style.visibility = ''; el.style.zIndex = '0'; focusedElRef.current = null;
            rootRef.current?.removeAttribute('data-enlarging'); openingRef.current = false; unlockScroll(); return;
        }

        const rootRect = rootRef.current!.getBoundingClientRect();
        const currentRect = overlay.getBoundingClientRect();
        const animatingOverlay = document.createElement('div');
        animatingOverlay.className = 'enlarge-closing';
        animatingOverlay.style.cssText = `position:absolute;left:${currentRect.left - rootRect.left}px;top:${currentRect.top - rootRect.top}px;width:${currentRect.width}px;height:${currentRect.height}px;z-index:9999;border-radius: var(--enlarge-radius, 24px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms cubic-bezier(0.23, 1, 0.32, 1);`;

        const originalImg = overlay.querySelector('img');
        if (originalImg) { const img = originalImg.cloneNode() as HTMLImageElement; img.style.cssText = 'width:100%;height:100%;object-fit:cover;'; animatingOverlay.appendChild(img); }
        overlay.remove(); rootRef.current?.appendChild(animatingOverlay);

        requestAnimationFrame(() => {
            animatingOverlay.style.left = originalPos.left - rootRect.left + 'px';
            animatingOverlay.style.top = originalPos.top - rootRect.top + 'px';
            animatingOverlay.style.width = originalPos.width + 'px';
            animatingOverlay.style.height = originalPos.height + 'px';
            animatingOverlay.style.opacity = '0';
        });

        animatingOverlay.addEventListener('transitionend', () => {
            animatingOverlay.remove(); if (refDiv) refDiv.remove();
            parent.style.setProperty('--rot-y-delta', '0deg'); parent.style.setProperty('--rot-x-delta', '0deg');
            el.style.visibility = ''; el.style.opacity = '1'; el.style.zIndex = '0'; focusedElRef.current = null;
            rootRef.current?.removeAttribute('data-enlarging'); openingRef.current = false; unlockScroll();
        }, { once: true });
    }, [enlargeTransitionMs, unlockScroll]);

    const openItemFromElement = useCallback((el: HTMLElement) => {
        if (openingRef.current) return;
        openingRef.current = true; openStartedAtRef.current = performance.now(); lockScroll();
        const parent = el.parentElement as HTMLElement;
        focusedElRef.current = el; el.setAttribute('data-focused', 'true');
        const parentRot = computeItemBaseRotation(getDataNumber(parent, 'offsetX', 0), getDataNumber(parent, 'offsetY', 0), getDataNumber(parent, 'sizeX', 2), getDataNumber(parent, 'sizeY', 2), segments);
        const parentY = normalizeAngle(parentRot.rotateY), globalY = normalizeAngle(rotationRef.current.y);
        let rotY = -(parentY + globalY) % 360; if (rotY < -180) rotY += 360;
        parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
        parent.style.setProperty('--rot-x-delta', `${-parentRot.rotateX - rotationRef.current.x}deg`);

        const refDiv = document.createElement('div'); refDiv.className = 'item__image item__image--reference'; refDiv.style.opacity = '0';
        refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`; parent.appendChild(refDiv);

        const tileR = refDiv.getBoundingClientRect(), mainR = mainRef.current!.getBoundingClientRect(), frameR = frameRef.current!.getBoundingClientRect();
        originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
        el.style.visibility = 'hidden';

        const overlay = document.createElement('div'); overlay.className = 'enlarge'; overlay.style.cssText = `position:absolute;left:${frameR.left - mainR.left}px;top:${frameR.top - mainR.top}px;width:${frameR.width}px;height:${frameR.height}px;z-index:300;transition:all ${enlargeTransitionMs}ms cubic-bezier(0.23, 1, 0.32, 1);`;
        const img = document.createElement('img'); img.src = parent.dataset.src || ''; overlay.appendChild(img);
        viewerRef.current?.appendChild(overlay);

        const sx0 = tileR.width / frameR.width, sy0 = tileR.height / frameR.height;
        overlay.style.transform = `translate(${tileR.left - frameR.left}px, ${tileR.top - frameR.top}px) scale(${sx0}, ${sy0})`;
        setTimeout(() => { overlay.style.transform = 'translate(0, 0) scale(1)'; rootRef.current?.setAttribute('data-enlarging', 'true'); }, 16);
    }, [enlargeTransitionMs, lockScroll, segments]);

    const onTileClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (draggingRef.current || movedRef.current) return;
        if (performance.now() - lastDragEndAt.current < 80) return;
        if (openingRef.current) return;
        openItemFromElement(e.currentTarget);
    }, [openItemFromElement]);

    const onTilePointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (e.pointerType !== 'touch') return;
        if (draggingRef.current || movedRef.current) return;
        if (performance.now() - lastDragEndAt.current < 80) return;
        if (openingRef.current) return;
        openItemFromElement(e.currentTarget);
    }, [openItemFromElement]);

    useEffect(() => {
        const sc = scrimRef.current; if (sc) sc.addEventListener('click', close);
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => { sc?.removeEventListener('click', close); window.removeEventListener('keydown', onKey); document.body.classList.remove('dg-scroll-lock'); };
    }, [close]);

    return (
        <div ref={rootRef} className="sphere-root" style={{ ['--segments-x' as any]: segments, ['--segments-y' as any]: segments }}>
            <main ref={mainRef} className="sphere-main">
                <div className="stage">
                    <div ref={sphereRef} className="sphere">
                        {items.map((it, i) => {
                            const explode = explosionOffsets[i];
                            return (
                                <div
                                    key={`${it.x},${it.y},${i}`}
                                    className="item"
                                    data-src={it.src}
                                    data-offset-x={it.x}
                                    data-offset-y={it.y}
                                    data-size-x={it.sizeX}
                                    data-size-y={it.sizeY}
                                    style={{
                                        ['--offset-x' as any]: it.x,
                                        ['--offset-y' as any]: it.y,
                                        ['--item-size-x' as any]: it.sizeX,
                                        ['--item-size-y' as any]: it.sizeY,
                                        ['--entry-rx' as any]: `${explode.rx}deg`,
                                        ['--entry-ry' as any]: `${explode.ry}deg`,
                                        ['--entry-rz' as any]: `${explode.rz}px`,
                                        ['--entry-scale' as any]: explode.scale,
                                        transitionDelay: isAssembled ? `${Math.random() * 800}ms` : '0ms'
                                    }}
                                    data-assembled={isAssembled}
                                    data-dragging={draggingRef.current}
                                >
                                    <div className="item__image" role="button" aria-label={it.alt} onClick={onTileClick} onPointerUp={onTilePointerUp}>
                                        <img src={it.src} draggable={false} alt={it.alt} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="overlay" /><div className="overlay overlay--blur" /><div className="edge-fade edge-fade--top" /><div className="edge-fade edge-fade--bottom" />
                <div className="viewer" ref={viewerRef}><div ref={scrimRef} className="scrim" /><div ref={frameRef} className="frame" /></div>
            </main>
        </div>
    );
}
