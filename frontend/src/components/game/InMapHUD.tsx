/**
 * InMapHUD.tsx
 *
 * Renders interactive buttons exactly over the baked-in circular buttons
 * painted in the house map SVG.
 *
 * SVG button centres (from gradient defs in the SVG):
 *   Pause    : cx=65,   cy=49   (left side)
 *   Forward  : cx=150,  cy=49
 *   Bag      : cx=235,  cy=49
 *   Fire     : cx=1387, cy=49   (right side - Progress indicator & BugTask trigger)
 */

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../../store/gameStore';
import { useSessionStore } from '../../store/sessionStore';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';

import Fire0 from '../../assets/icons/in-game/fire/Level0.svg?react';
import Fire1 from '../../assets/icons/in-game/fire/Level1.svg?react';
import Fire2 from '../../assets/icons/in-game/fire/Level2.svg?react';
import Fire3 from '../../assets/icons/in-game/fire/Level3.svg?react';
import Fire4 from '../../assets/icons/in-game/fire/Level4.svg?react';
import Fire5 from '../../assets/icons/in-game/fire/Level5.svg?react';
import Fire6 from '../../assets/icons/in-game/fire/Level6.svg?react';
import Fire7 from '../../assets/icons/in-game/fire/Level7.svg?react';
import PauseIcon from '../../assets/icons/in-game/Pause.svg?react';
import ForwardIcon from '../../assets/icons/in-game/Forward.svg?react';
import BagIcon from '../../assets/icons/in-game/Bag.svg?react';

const FireIcons = [Fire0, Fire1, Fire2, Fire3, Fire4, Fire5, Fire6, Fire7];

// SVG button centre coordinates (in 1440×1024 game space)
const CENTRES = {
  pause:   { cx: 65,   cy: 49 },
  forward: { cx: 150,  cy: 49 },
  bag:     { cx: 235,  cy: 49 },
  fire:    { cx: 1387, cy: 49 },
};

// Fixed button diameter in pixels
const BTN_SIZE = 72;

/** One clickable hotspot positioned over a SVG button circle */
const MapBtn: React.FC<{
  cx: number;
  cy: number;
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ cx, cy, onClick, label, active, children }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (btnRef.current) {
      gsap.fromTo(btnRef.current,
        { scale: 1 },
        { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: 'power2.inOut' }
      );
    }
    onClick();
  };

  return (
    <button
      ref={btnRef}
      aria-label={label}
      onClick={handleClick}
      className="absolute z-30 rounded-full flex items-center justify-center
                 cursor-pointer focus:outline-none select-none
                 transition-shadow duration-150"
      style={{
        left:      `${(cx / GAME_WIDTH) * 100}%`,
        top:       `${(cy / GAME_HEIGHT) * 100}%`,
        width:     `${BTN_SIZE}px`,
        height:    `${BTN_SIZE}px`,
        transform: 'translate(-50%, -50%)',
        background: 'transparent',
        boxShadow: active
          ? '0 0 0 4px rgba(255,200,50,0.7), 0 0 14px rgba(255,150,0,0.6)'
          : undefined,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        className="flex items-center justify-center"
        style={{ width: '42px', height: '42px' }}
      >
        {children}
      </span>
    </button>
  );
};

export const InMapHUD: React.FC = () => {
  const fireLevel  = useGameStore((state) => state.fireLevel);
  const gameSpeed  = useSessionStore((state) => state.gameSpeed);
  const status     = useSessionStore((state) => state.status);
  const setStatus  = useSessionStore((state) => state.setStatus);
  const setGameSpeed = useSessionStore((state) => state.setGameSpeed);

  const ActiveFireIcon = FireIcons[fireLevel] ?? Fire0;
  const isPaused  = status === 'PAUSED';
  const isFast    = gameSpeed === 2;

  const handleFireIndicatorClick = () => {
    if (fireLevel > 0) {
      setStatus('BUG_FIXING');
    }
  };

  return (
    <>
      {/* ── Pause ──────────────────────────────────────────── */}
      <MapBtn
        cx={CENTRES.pause.cx}
        cy={CENTRES.pause.cy}
        onClick={() => setStatus(isPaused ? 'PLAYING' : 'PAUSED')}
        label="Pause / Resume"
        active={isPaused}
      >
        <PauseIcon
          className="w-full h-full"
          style={{ filter: isPaused ? 'brightness(1.5) drop-shadow(0 0 4px #fff)' : undefined }}
        />
      </MapBtn>

      {/* ── Fast-forward ────────────────────────────────────── */}
      <MapBtn
        cx={CENTRES.forward.cx}
        cy={CENTRES.forward.cy}
        onClick={() => setGameSpeed(isFast ? 1 : 2)}
        label="Fast forward"
        active={isFast}
      >
        <ForwardIcon
          className="w-full h-full"
          style={{ filter: isFast ? 'brightness(1.5) drop-shadow(0 0 6px #ff8c00)' : undefined }}
        />
      </MapBtn>

      {/* ── Bag / BugFix ───────────────────────────────────── */}
      <MapBtn
        cx={CENTRES.bag.cx}
        cy={CENTRES.bag.cy}
        onClick={() => setStatus('BUG_FIXING')}
        label="Bag / Fix Bug"
      >
        <BagIcon className="w-full h-full" />
      </MapBtn>

      {/* ── Fire Progress Indicator & Extinguish BugTask Trigger ─ */}
      <div
        onClick={handleFireIndicatorClick}
        className={`absolute z-30 rounded-full flex items-center justify-center select-none transition-all ${
          fireLevel > 0 ? 'cursor-pointer animate-pulse hover:scale-110' : 'pointer-events-none'
        }`}
        style={{
          left:      `${(CENTRES.fire.cx / GAME_WIDTH) * 100}%`,
          top:       `${(CENTRES.fire.cy / GAME_HEIGHT) * 100}%`,
          width:     `${BTN_SIZE}px`,
          height:    `${BTN_SIZE}px`,
          transform: 'translate(-50%, -50%)',
        }}
        title={fireLevel > 0 ? `Fire Level ${fireLevel}/7 - Click to Fix Bug and Extinguish!` : `House Fire Status: Level 0/7`}
      >
        <span
          className="flex items-center justify-center transition-all duration-300"
          style={{ width: '42px', height: '42px' }}
        >
          <ActiveFireIcon
            className="w-full h-full object-contain"
            style={{
              filter: fireLevel > 0
                ? `drop-shadow(0 0 ${fireLevel * 3}px rgba(255,80,0,0.9))`
                : undefined,
            }}
          />
        </span>
      </div>
    </>
  );
};
