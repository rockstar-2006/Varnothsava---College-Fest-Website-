"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Heart = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const ExternalLink = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

// ─── Tilt Container (used by medal cards) ─────────────────────────────────────
const TiltCard = ({ children, className = "", maxAngle = 10 }: { children: React.ReactNode; className?: string; maxAngle?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 100, damping: 16 });
  const my = useSpring(y, { stiffness: 100, damping: 16 });
  const rotateX = useTransform(my, [-0.5, 0.5], [maxAngle, -maxAngle]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-maxAngle, maxAngle]);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  return (
    <motion.div ref={containerRef} onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className={className}>
      {children}
    </motion.div>
  );
};

interface SimpleParticle {
  id: number;
  x: number;
  y: number;
  duration: number;
  repeatDelay: number;
}

const GoldDust = ({ active, containerSize }: { active: boolean; containerSize?: number }) => {
  const [particles, setParticles] = useState<SimpleParticle[]>([])

  useEffect(() => {
    const p = Array.from({ length: 52 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      duration: Math.random() * 2 + 2,
      repeatDelay: Math.random() * 1.5 + 0.5
    }))
    setParticles(p)
  }, [])

  return (
    <AnimatePresence>
      {active &&
        particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ opacity: [0,1,0] }}
            transition={{ duration: p.duration, repeat: Infinity, repeatDelay: p.repeatDelay }}
          />
        ))}
    </AnimatePresence>
  )
}

const AmbientMotes = ({ containerSize }: { containerSize: number }) => {
  const [motes, setMotes] = useState<Array<{ id: number; x: number; size: number; duration: number; delay: number; driftX: number; }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMotes(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 5 + 4,
        delay: Math.random() * 7,
        driftX: (Math.random() - 0.5) * 50,
      }))
    );
  }, []);

  if (!mounted || motes.length === 0) {
    return <div className="absolute pointer-events-none" style={{ inset: -30, zIndex: 19, borderRadius: "50%", overflow: "hidden" }} suppressHydrationWarning />;
  }

  return (
    <div className="absolute pointer-events-none" style={{ inset: -30, zIndex: 19, borderRadius: "50%", overflow: "hidden" }}>
      {motes.map((m) => (
        <motion.div key={m.id} className="absolute rounded-full"
          style={{ width: m.size, height: m.size, left: `${m.x}%`, bottom: "-5%", background: "radial-gradient(circle, #FFD700, #C49A2A)", boxShadow: `0 0 ${m.size * 3}px #FFD700bb` }}
          animate={{ y: [0, -(containerSize * 1.1)], x: [0, m.driftX], opacity: [0, 0.55, 0.35, 0], scale: [0.4, 1, 0.6, 0] }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

const MetalShine = ({ color }: { color: string }) => (
  <motion.div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden" style={{ zIndex: 10 }}>
    <motion.div style={{ position: "absolute", top: 0, bottom: 0, width: "60%", background: `linear-gradient(90deg, transparent, ${color}40, ${color}90, ${color}40, transparent)`, filter: "blur(6px)" }}
      animate={{ left: ["-60%", "160%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" }} />
  </motion.div>
);

const StarBurst = ({ color, n = 16 }: { color: string; n?: number }) => (
  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
    {Array.from({ length: n }).map((_, i) => {
      const angle = (i / n) * 360, rad = (angle * Math.PI) / 180;
      return <line key={i} x1="100" y1="100" x2={100 + Math.cos(rad) * 95} y2={100 + Math.sin(rad) * 95} stroke={color} strokeWidth="0.8" strokeOpacity={i % 2 === 0 ? 0.35 : 0.18} />;
    })}
  </svg>
);

const Ribbon = ({ color1, color2, shimmer, width = 100, height = 56 }: { color1: string; color2: string; shimmer: string; width?: number; height?: number }) => (
  <div className="relative flex justify-center" style={{ height, marginTop: -4 }}>
    <svg width={width} height={height} viewBox="0 0 100 56" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`rib-l-${shimmer}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={color1} /><stop offset="40%" stopColor={color2} /><stop offset="100%" stopColor={color1} stopOpacity="0.8" /></linearGradient>
        <linearGradient id={`rib-r-${shimmer}`} x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={color1} /><stop offset="40%" stopColor={color2} /><stop offset="100%" stopColor={color1} stopOpacity="0.8" /></linearGradient>
        <linearGradient id={`rib-hi-${shimmer}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="white" stopOpacity="0.25" /><stop offset="100%" stopColor="white" stopOpacity="0" /></linearGradient>
      </defs>
      <polygon points="28,0 50,0 36,56 10,56" fill={`url(#rib-l-${shimmer})`} /><polygon points="28,0 50,0 36,56 10,56" fill={`url(#rib-hi-${shimmer})`} /><polygon points="10,56 23,56 17,44" fill="rgba(0,0,0,0.35)" />
      <polygon points="72,0 50,0 64,56 90,56" fill={`url(#rib-r-${shimmer})`} /><polygon points="72,0 50,0 64,56 90,56" fill={`url(#rib-hi-${shimmer})`} /><polygon points="90,56 77,56 83,44" fill="rgba(0,0,0,0.35)" />
      <line x1="50" y1="0" x2="50" y2="56" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    </svg>
  </div>
);

const MedalRing = ({ colors, size = 160 }: { colors: string[]; size?: number }) => {
  const [c1, c2, c3] = colors, r = size / 2, inner = r - 8;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <defs>
        <linearGradient id={`ring-grad-${c1.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c1} /><stop offset="35%" stopColor={c2} /><stop offset="65%" stopColor={c3} /><stop offset="100%" stopColor={c1} /></linearGradient>
        <filter id={`ring-glow-${c1.replace("#", "")}`}><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
      </defs>
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke={c2} strokeWidth="3" strokeOpacity="0.3" filter={`url(#ring-glow-${c1.replace("#", "")})`} />
      <circle cx={r} cy={r} r={r - 4} fill="none" stroke={`url(#ring-grad-${c1.replace("#", "")})`} strokeWidth="6" />
      <circle cx={r} cy={r} r={inner - 2} fill="none" stroke={c2} strokeWidth="1.5" strokeOpacity="0.6" />
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2 - Math.PI / 2, isMain = i % 9 === 0, ro = r - 5, ri = isMain ? r - 12 : r - 9;
        return <line key={i} x1={r + Math.cos(a) * ro} y1={r + Math.sin(a) * ro} x2={r + Math.cos(a) * ri} y2={r + Math.sin(a) * ri} stroke={c2} strokeWidth={isMain ? 2 : 1} strokeOpacity={isMain ? 0.9 : 0.4} />;
      })}
    </svg>
  );
};

const MedalFace = ({ colors, sponsorName, sponsorLogoUrl, hovered, size = 160 }: { colors: string[]; sponsorName: string; sponsorLogoUrl: string; hovered: boolean; size?: number }) => {
  const [c1, c2, c3] = colors, inset = Math.round(size * 0.05), logoMax = Math.round(size * 0.55), logoMaxH = Math.round(size * 0.36), pad = Math.round(size * 0.13);
  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full overflow-hidden" style={{ zIndex: 0 }}><StarBurst color={c2} n={20} /></div>
      <div className="absolute rounded-full" style={{ zIndex: 2, inset, background: `radial-gradient(circle at 35% 30%, ${c3}ff, ${c1}cc 50%, ${c1}99 100%)`, boxShadow: `inset 0 ${size * 0.025}px ${size * 0.075}px rgba(255,255,255,0.3), inset 0 -${size * 0.025}px ${size * 0.05}px rgba(0,0,0,0.4), 0 ${size * 0.05}px ${size * 0.2}px ${c1}88` }} />
      {[0.82, 0.65].map((scale, i) => (<div key={i} className="absolute rounded-full" style={{ zIndex: 3, inset: `${inset + (1 - scale) * size * 0.38}px`, border: `1px solid rgba(255,255,255,${0.15 - i * 0.05})` }} />))}
      <div className="absolute rounded-full overflow-hidden" style={{ zIndex: 4, inset }}><MetalShine color={c3} /></div>
      <MedalRing colors={colors} size={size} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ zIndex: 12, padding: pad }}>
        {sponsorLogoUrl ? (<img src={sponsorLogoUrl} alt={sponsorName} style={{ maxWidth: logoMax, maxHeight: logoMaxH, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }} />) : (<span className="font-black text-white/90 text-center leading-tight px-1" style={{ fontSize: Math.max(9, size * 0.065), textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{sponsorName}</span>)}
      </div>
    </div>
  );
};

const MedalCard = ({ tier, sponsorName, sponsorLogoUrl, websiteUrl, tagline, colors, ribbonColors, label, medalSize = 200, index = 0 }: { tier: string; sponsorName: string; sponsorLogoUrl: string; websiteUrl: string; tagline?: string; colors: string[]; ribbonColors: string[]; label: string; medalSize?: number; index?: number }) => {
  const [hovered, setHovered] = useState(false);
  const uid = tier.replace(/\s/g, "");
  const glowSize = medalSize + 40, ribbonW = Math.round(medalSize * 0.75), ribbonH = Math.round(medalSize * 0.38);
  return (
    <motion.a href={websiteUrl} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col items-center cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <TiltCard className="flex flex-col items-center" maxAngle={12}>
        <motion.div className="absolute rounded-full pointer-events-none"
          style={{ width: glowSize, height: glowSize, top: -20, left: "50%", transform: "translateX(-50%)", background: `radial-gradient(circle, ${colors[1]}55, transparent 70%)`, filter: "blur(20px)" }}
          animate={{ opacity: hovered ? 1 : 0.4, scale: hovered ? 1.15 : 1 }} transition={{ duration: 0.4 }} />
        <Ribbon color1={ribbonColors[0]} color2={ribbonColors[1]} shimmer={uid} width={ribbonW} height={ribbonH} />
        <motion.div animate={{ y: hovered ? -8 : 0, scale: hovered ? 1.05 : 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} style={{ marginTop: -10, position: "relative" }}>
          <MedalFace colors={colors} sponsorName={sponsorName} sponsorLogoUrl={sponsorLogoUrl} hovered={hovered} size={medalSize} />
        </motion.div>
        <div className="mt-5 flex flex-col items-center gap-1.5 text-center px-2">
          <div className="px-3 py-0.5 rounded-full font-black tracking-[0.25em] uppercase" style={{ fontSize: Math.max(8, medalSize * 0.055), background: `${colors[0]}33`, border: `1px solid ${colors[1]}66`, color: colors[1] }}>{label}</div>
          <p className="font-bold text-white mt-1 leading-tight" style={{ fontSize: Math.max(12, Math.round(medalSize * 0.085)) }}>{sponsorName}</p>
          {tagline && <p className="leading-snug" style={{ fontSize: Math.max(9, Math.round(medalSize * 0.065)), maxWidth: medalSize * 1.05, color: `${colors[1]}88` }}>{tagline}</p>}
          <motion.div animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }} transition={{ duration: 0.25 }} className="flex items-center gap-1 mt-1">
            <div style={{ color: colors[1] }}><ExternalLink size={10} /></div>
            <span className="text-[9px] tracking-widest uppercase font-bold" style={{ color: colors[1] }}>Visit</span>
          </motion.div>
        </div>
      </TiltCard>
    </motion.a>
  );
};

export const GoldCard = (props: Omit<Parameters<typeof MedalCard>[0], 'tier' | 'label' | 'colors' | 'ribbonColors' | 'medalSize'>) => (
  <MedalCard {...props} tier="Gold" label="Gold Sponsor" colors={["#92400e", "#FBBF24", "#FEF3C7"]} ribbonColors={["#92400e", "#D97706"]} medalSize={240} />
);
export const SilverCard = (props: Omit<Parameters<typeof MedalCard>[0], 'tier' | 'label' | 'colors' | 'ribbonColors' | 'medalSize'>) => (
  <MedalCard {...props} tier="Silver" label="Silver Sponsor" colors={["#374151", "#CBD5E1", "#F1F5F9"]} ribbonColors={["#1e293b", "#64748B"]} medalSize={200} />
);
export const BronzeCard = (props: Omit<Parameters<typeof MedalCard>[0], 'tier' | 'label' | 'colors' | 'ribbonColors' | 'medalSize'>) => (
  <MedalCard {...props} tier="Bronze" label="Bronze Sponsor" colors={["#7c2d12", "#C2773B", "#FDE68A"]} ribbonColors={["#7c2d12", "#9A5724"]} medalSize={165} />
);

export const WellWisherRow = ({ sponsorName, sponsorLogoUrl, websiteUrl, index = 0 }: { sponsorName: string; sponsorLogoUrl?: string; websiteUrl: string; index?: number }) => (
  <motion.a href={websiteUrl} target="_blank" rel="noopener noreferrer"
    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }} transition={{ delay: index * 0.06, duration: 0.4 }}
    className="group flex items-center gap-3 px-4 py-3 border border-emerald-900/40 bg-emerald-950/20 hover:bg-emerald-900/20 hover:border-emerald-600/50 transition-all duration-300"
    style={{ clipPath: "polygon(6px 0%,calc(100% - 6px) 0%,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0% calc(100% - 6px),0% 6px)" }}>
    <div className="p-2 rounded-full bg-emerald-900/40 shrink-0 flex items-center justify-center w-24 h-24">
      {sponsorLogoUrl ? (
        <img src={sponsorLogoUrl} alt={sponsorName} className="w-20 h-14 object-contain" />
      ) : (
        <Heart size={13} className="text-emerald-500" />
      )}
    </div>
    <span className="text-sm font-semibold text-white flex-1">{sponsorName}</span>
    <span className="text-[9px] text-emerald-500 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">Visit →</span>
  </motion.a>
);

export const SectionHead = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-4 mb-10">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,transparent,${color}55)` }} />
    <span className="text-xs font-bold tracking-[0.35em] uppercase" style={{ color }}>{label}</span>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,${color}55,transparent)` }} />
  </div>
);

const IndianCoinRing = ({ size = 420 }) => {
  const cx = size / 2, cy = size / 2, outerR = size / 2 - 4;
  const leafInnerR = outerR - 18, leafOuterR = outerR - 2, riceR = outerR - 30;
  const leaves = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2 - Math.PI / 2, nextAngle = ((i + 1) / 40) * Math.PI * 2 - Math.PI / 2, midAngle = (angle + nextAngle) / 2;
    const lx1 = cx + Math.cos(angle) * leafInnerR, ly1 = cy + Math.sin(angle) * leafInnerR;
    const lx2 = cx + Math.cos(angle) * leafOuterR, ly2 = cy + Math.sin(angle) * leafOuterR;
    const ctrlBulge = (leafInnerR + leafOuterR) / 2 + 9;
    return { lx1, ly1, lx2, ly2, bx: cx + Math.cos(midAngle) * ctrlBulge, by: cy + Math.sin(midAngle) * ctrlBulge, i };
  });
  const riceGrains = Array.from({ length: 20 }, (_, i) => {
    const angle = ((i + 0.5) / 20) * Math.PI * 2 - Math.PI / 2;
    return { rx: cx + Math.cos(angle) * riceR, ry: cy + Math.sin(angle) * riceR, degAngle: (angle * 180) / Math.PI + 90 };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <defs>
        <radialGradient id="pt-coin-face" cx="38%" cy="32%" r="68%"><stop offset="0%" stopColor="#dbbe86" /><stop offset="35%" stopColor="#b8943f" /><stop offset="70%" stopColor="#8a6a1a" /><stop offset="100%" stopColor="#5c3f08" /></radialGradient>
        <radialGradient id="pt-rim" cx="50%" cy="50%" r="50%"><stop offset="60%" stopColor="#a07820" /><stop offset="85%" stopColor="#c49a2a" /><stop offset="100%" stopColor="#e8c96a" /></radialGradient>
        <linearGradient id="pt-leaf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#b8cc6a" /><stop offset="45%" stopColor="#88a030" /><stop offset="100%" stopColor="#506018" /></linearGradient>
        <linearGradient id="pt-leaf-dark" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#98b050" /><stop offset="100%" stopColor="#3a4e10" /></linearGradient>
        <linearGradient id="pt-rice" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fff8e0" /><stop offset="50%" stopColor="#e8d890" /><stop offset="100%" stopColor="#c8a840" /></linearGradient>
        <filter id="pt-shadow"><feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.75" /><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#c49a2a" floodOpacity="0.25" /></filter>
        <filter id="pt-leaf-emboss"><feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="b" /><feOffset in="b" dx="0.5" dy="1" result="o" /><feBlend in="SourceGraphic" in2="o" mode="multiply" /></filter>
        <clipPath id="pt-coin-clip"><circle cx={cx} cy={cy} r={outerR} /></clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={outerR} fill="url(#pt-rim)" filter="url(#pt-shadow)" />
      <circle cx={cx} cy={cy} r={leafInnerR - 6} fill="url(#pt-coin-face)" />
      {leaves.map(({ lx1, ly1, lx2, ly2, bx, by, i }) => (
        <g key={`lf-${i}`} filter="url(#pt-leaf-emboss)">
          <path d={`M ${lx1} ${ly1} Q ${bx} ${by} ${lx2} ${ly2} Q ${bx} ${by} ${lx1} ${ly1}`} fill={i % 2 === 0 ? "url(#pt-leaf)" : "url(#pt-leaf-dark)"} stroke="#2a3808" strokeWidth="0.35" strokeOpacity="0.5" />
          <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="rgba(20,40,5,0.4)" strokeWidth="0.5" />
        </g>
      ))}
      {riceGrains.map(({ rx, ry, degAngle }, i) => (
        <ellipse key={`rc-${i}`} cx={rx} cy={ry} rx={3} ry={7.5} fill="url(#pt-rice)" stroke="#b8943f" strokeWidth="0.5" strokeOpacity="0.8" transform={`rotate(${degAngle}, ${rx}, ${ry})`} opacity="0.9" />
      ))}
      {[leafInnerR - 8, leafInnerR - 22, leafInnerR - 38].map((r, i) => (
        <circle key={`cr-${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={i === 0 ? "#e8c96a" : "#b8943f"} strokeWidth={i === 0 ? 1.8 : 0.9} strokeOpacity={0.65 - i * 0.12} />
      ))}
      <path d={`M ${cx - outerR * 0.52} ${cy - outerR * 0.65} A ${outerR * 0.75} ${outerR * 0.75} 0 0 1 ${cx + outerR * 0.52} ${cy - outerR * 0.5}`} fill="none" stroke="rgba(255,248,200,0.3)" strokeWidth="14" strokeLinecap="round" clipPath="url(#pt-coin-clip)" />
    </svg>
  );
};

const CoinShine = ({ size }: { size: number }) => (
  <div className="absolute rounded-full overflow-hidden pointer-events-none" style={{ width: size, height: size, zIndex: 15 }}>
    <motion.div style={{ position: "absolute", top: 0, bottom: 0, width: "45%", background: "linear-gradient(90deg, transparent, rgba(255,240,180,0.07), rgba(255,248,220,0.16), rgba(255,240,180,0.07), transparent)", filter: "blur(10px)" }}
      animate={{ left: ["-45%", "145%"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }} />
  </div>
);

const OliveCrown = ({ containerSize }: { containerSize: number }) => {
  const leafW = containerSize * 0.52;
  return (
    <>
      <img src="left-wreath.png" alt="" aria-hidden="true" style={{ position: "absolute", width: leafW, bottom: "2%", left: "0%", transformOrigin: "bottom left", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))", zIndex: 11, pointerEvents: "none" }} />
      <img src="right-wreath.png" alt="" aria-hidden="true" style={{ position: "absolute", width: leafW, bottom: "2%", right: "0%", transformOrigin: "bottom right", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))", zIndex: 11, pointerEvents: "none" }} />
    </>
  );
};

const PlatinumCardBack = ({ sponsorName, tagline, discDiam }: { sponsorName: string; tagline?: string; discDiam: number }) => (
  <div style={{
    width: discDiam, height: discDiam, borderRadius: "50%",
    background: "radial-gradient(circle at 60% 65%, #dbbe86, #b8943f 40%, #7a5010 72%, #3c1e00 100%)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 14, padding: "10%",
    boxShadow: "inset 0 4px 20px rgba(255,220,100,0.25), inset 0 -4px 12px rgba(0,0,0,0.5)",
    border: "2px solid rgba(232,201,106,0.35)",
    position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", inset: "6%", borderRadius: "50%", border: "1px solid rgba(232,201,106,0.2)", pointerEvents: "none" }} />
    <svg width={discDiam * 0.22} height={discDiam * 0.22} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <polygon points="20,2 24.8,14.6 38,14.6 27.6,22.8 31.6,36 20,28 8.4,36 12.4,22.8 2,14.6 15.2,14.6" fill="#FFE066" stroke="#C49A2A" strokeWidth="0.8" />
    </svg>
    {/* FIXED: removed whiteSpace nowrap, added wrapping constraints */}
    <p style={{
      fontFamily: "Georgia, serif",
      fontSize: Math.round(discDiam * 0.065),
      fontWeight: 900,
      color: "#f5e8c0",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      textShadow: "0 2px 6px rgba(0,0,0,0.8)",
      textAlign: "center",
      lineHeight: 1.25,
      maxWidth: "78%",
      wordBreak: "break-word",
      overflowWrap: "break-word",
    }}>
      {sponsorName}
    </p>
    {tagline && (
      <p style={{ fontSize: Math.round(discDiam * 0.052), color: "#e8c96a99", textAlign: "center", lineHeight: 1.5, maxWidth: "78%" }}>
        {tagline}
      </p>
    )}
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.3)", borderRadius: 100, padding: "5px 14px", border: "1px solid rgba(232,201,106,0.3)", marginTop: 4 }}>
      <ExternalLink size={11} className="text-yellow-300" />
      <span style={{ fontSize: 10, letterSpacing: "0.22em", color: "#FFD700", fontWeight: 700, textTransform: "uppercase" }}>Visit Sponsor</span>
    </div>
  </div>
);

export const PlatinumCard = ({
  sponsorName, sponsorLogoUrl, tagline, websiteUrl, index = 0,
}: {
  sponsorName: string; sponsorLogoUrl: string; tagline?: string; websiteUrl: string; index?: number;
}) => {
  const [hovered, setHovered] = useState(false);

  const COIN = 420;
  const LEAF_INNER_R = COIN / 2 - 22;
  const DISC_R = LEAF_INNER_R - 14;
  const DISC_DIAM = DISC_R * 2;
  const LOGO_SIZE = Math.round(DISC_DIAM * 0.48);
  const NAME_FONT = Math.round(DISC_DIAM * 0.065);

  return (
    <motion.a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="col-span-full w-full flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-10 flex items-center gap-3 px-7 py-2.5" style={{
        border: "1px solid rgba(196,154,42,0.5)", background: "rgba(196,154,42,0.07)",
        clipPath: "polygon(14px 0%,calc(100% - 14px) 0%,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0% calc(100% - 14px),0% 14px)",
      }}>
        <span style={{ color: "#e8c96a", fontSize: 11, letterSpacing: "0.32em", fontWeight: 900, textTransform: "uppercase" }}>
          ✦ &nbsp;Title Sponsor · Platinum&nbsp; ✦
        </span>
      </div>

      <div className="relative flex flex-col items-center">
        <motion.div className="absolute rounded-full pointer-events-none" style={{
          width: COIN + 80, height: COIN + 80, top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, rgba(196,154,42,0.3) 0%, rgba(138,106,26,0.15) 50%, transparent 72%)",
          filter: "blur(28px)",
        }} animate={{ opacity: hovered ? 1 : 0.45, scale: hovered ? 1.1 : 1 }} transition={{ duration: 0.5 }} />

        <AmbientMotes containerSize={COIN} />

        <div style={{ perspective: 1400 }}>
          <motion.div
            style={{ transformStyle: "preserve-3d", position: "relative", width: COIN, height: COIN }}
            animate={{ rotateY: hovered ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
          >
            {/* ── FRONT FACE ── */}
            <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", position: "absolute", inset: 0 }}>
              <div className="relative flex items-center justify-center" style={{ width: COIN, height: COIN }}>
                <GoldDust active={hovered} containerSize={COIN} />
                <IndianCoinRing size={COIN} />
                <div className="absolute flex flex-col items-center justify-center" style={{
                  width: DISC_DIAM, height: DISC_DIAM, borderRadius: "50%",
                  zIndex: 10, top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                  overflow: "hidden",
                  background: "radial-gradient(circle at 36% 30%, #dbbe86, #b8943f 40%, #8a6a1a 72%, #5c3f08 100%)",
                }}>
                  <OliveCrown containerSize={DISC_DIAM} />
                  <div className="relative flex flex-col items-center justify-center gap-3" style={{ zIndex: 20, marginBottom: "12%", padding: "0 8%" }}>
                    <div style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 10, background: "rgba(0,0,0,0.28)", border: "1.5px solid rgba(232,201,106,0.3)", boxShadow: "inset 0 4px 12px rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, flexShrink: 0 }}>
                      {sponsorLogoUrl && <img src={sponsorLogoUrl} alt={sponsorName} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.7))" }} />}
                    </div>
                    <div style={{ textAlign: "center", width: "100%" }}>
                      {/* FIXED: removed whiteSpace nowrap, added wrapping + smaller font */}
                      <p style={{
                        fontFamily: "Georgia, serif",
                        fontSize: NAME_FONT,
                        fontWeight: 900,
                        color: "#f5e8c0",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                        lineHeight: 1.25,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        maxWidth: LOGO_SIZE,
                        margin: "0 auto",
                      }}>{sponsorName}</p>
                      <div className="flex justify-center gap-1.5 mt-2">
                        {[0, 1, 2].map((i) => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#e8c96a" }} />)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute" style={{ width: COIN, height: COIN, zIndex: 16, top: 0, left: 0 }}>
                  <CoinShine size={COIN} />
                </div>
              </div>
            </div>

            {/* ── BACK FACE ── */}
            <div style={{
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
              position: "absolute", inset: 0,
              transform: "rotateY(180deg)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GoldDust active={hovered} containerSize={COIN} />
              <IndianCoinRing size={COIN} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 12 }}>
                <PlatinumCardBack sponsorName={sponsorName} tagline={tagline} discDiam={DISC_DIAM} />
              </div>
              <div className="absolute" style={{ width: COIN, height: COIN, zIndex: 16, top: 0, left: 0 }}>
                <CoinShine size={COIN} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <p style={{ fontSize: 12, letterSpacing: "0.26em", color: "#7a5a1a", textTransform: "uppercase", fontWeight: 700 }}>
          {tagline} {sponsorName}
        </p>
        {tagline && <p style={{ fontSize: 13, color: "#c49a2a88", maxWidth: 420, lineHeight: 1.6 }}>{tagline}</p>}
      </div>
    </motion.a>
  );
};