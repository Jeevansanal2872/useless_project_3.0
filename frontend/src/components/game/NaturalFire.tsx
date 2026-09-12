import React from 'react';

interface NaturalFireProps {
  x: number;
  y: number;
  intensity: number; // 1 to 3
  onClick: () => void;
}

/**
 * NaturalFire Component
 *
 * Renders a natural, realistic flickering fire flame with organic flame tongues,
 * glowing ember particles, and heat aura — completely replacing static circle icons!
 */
export const NaturalFire: React.FC<NaturalFireProps> = ({ x, y, intensity, onClick }) => {
  // Scale based on intensity (80px to 140px)
  const baseSize = 75 + intensity * 22;

  return (
    <div
      onClick={onClick}
      title="🔥 Fire on floor! Click to solve Bug Task and extinguish!"
      className="absolute z-20 pointer-events-auto cursor-pointer group select-none transition-all duration-300 transform hover:scale-110"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${baseSize}px`,
        height: `${baseSize * 1.25}px`,
        transform: 'translate(-50%, -85%)',
      }}
    >
      {/* ── 1. Heat Light Glow Base ────────────────────────────────────────── */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] rounded-full blur-md opacity-80 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,140,0,0.8) 0%, rgba(239,68,68,0.5) 50%, rgba(0,0,0,0) 80%)',
        }}
      />

      {/* ── 2. Natural Organic Flame SVG ──────────────────────────────────── */}
      <svg
        className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(245,158,11,0.9)] transition-all duration-300"
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Flame Gradients */}
          <linearGradient id={`flameOuterGrad_${x}_${y}`} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="35%" stopColor="#dc2626" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id={`flameInnerGrad_${x}_${y}`} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <linearGradient id={`flameCoreGrad_${x}_${y}`} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Flame Shape (Dancing shape) */}
        <path
          className="animate-[fireFlicker1_0.7s_infinite_alternate_ease-in-out]"
          d="M 50 120 
             C 20 115, 5 95, 12 70 
             C 18 50, 32 45, 28 25 
             C 38 40, 48 30, 52 5 
             C 60 25, 75 35, 82 55 
             C 90 75, 85 105, 50 120 Z"
          fill={`url(#flameOuterGrad_${x}_${y})`}
        />

        {/* Secondary Flame Tongue (Asymmetric wave) */}
        <path
          className="animate-[fireFlicker2_0.5s_infinite_alternate_ease-in-out]"
          d="M 50 115 
             C 25 110, 15 90, 22 70 
             C 28 55, 40 50, 38 30 
             C 45 42, 55 35, 58 15 
             C 65 32, 72 45, 78 62 
             C 84 80, 75 105, 50 115 Z"
          fill={`url(#flameInnerGrad_${x}_${y})`}
          opacity="0.95"
        />

        {/* Hot Core Flame (Bright center flame) */}
        <path
          className="animate-[fireFlicker3_0.35s_infinite_alternate_ease-in-out]"
          d="M 50 110 
             C 35 105, 28 90, 32 75 
             C 36 62, 45 58, 46 42 
             C 50 50, 56 46, 58 32 
             C 62 44, 68 55, 70 70 
             C 72 85, 65 102, 50 110 Z"
          fill={`url(#flameCoreGrad_${x}_${y})`}
        />
      </svg>

      {/* ── 3. Rising Ember Particles ────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute bottom-2 left-1/3 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-[ember1_1.2s_infinite_linear] shadow-[0_0_6px_#fde047]" />
        <span className="absolute bottom-3 left-1/2 w-2 h-2 rounded-full bg-orange-400 animate-[ember2_1.5s_infinite_linear] shadow-[0_0_8px_#fb923c]" />
        <span className="absolute bottom-1 right-1/3 w-1 h-1 rounded-full bg-red-400 animate-[ember1_1.8s_infinite_linear] shadow-[0_0_4px_#f87171]" />
      </div>

      {/* Hover Tooltip Banner */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-950/90 text-yellow-300 text-[10px] font-mono px-2 py-0.5 rounded border border-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        🔥 EXTINGUISH FIRE (SOLVE BUG)
      </div>
    </div>
  );
};
