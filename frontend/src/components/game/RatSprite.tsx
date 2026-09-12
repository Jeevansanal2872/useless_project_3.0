import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import gsap from 'gsap';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';
import RatIdle   from '../../assets/icons/in-game/Rat/idle.svg?react';
import RatJump1  from '../../assets/icons/in-game/Rat/Jump1.svg?react';
import RatJump2  from '../../assets/icons/in-game/Rat/Jump2.svg?react';

export const RatSprite: React.FC = () => {
  const { ratPos, ratDirection, ratState } = useGameStore();
  const posRef   = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [jumpStep, setJumpStep] = useState(0);

  // Steady animation frame timer for rat running jump cycle
  useEffect(() => {
    if (ratState !== 'evading') return;
    const interval = setInterval(() => {
      setJumpStep((prev) => (prev + 1) % 2);
    }, 120);
    return () => clearInterval(interval);
  }, [ratState]);

  // GSAP position interpolation — tight 60fps locking
  useEffect(() => {
    if (posRef.current) {
      gsap.to(posRef.current, {
        left:     `${(ratPos.x / GAME_WIDTH) * 100}%`,
        top:      `${(ratPos.y / GAME_HEIGHT) * 100}%`,
        duration: 0.06,
        ease:     'power1.out',
        overwrite:'auto',
      });
    }
  }, [ratPos]);

  // Handle rat visibility and death animation cleanly
  useEffect(() => {
    if (!innerRef.current) return;
    gsap.killTweensOf(innerRef.current);

    if (ratState === 'dead') {
      gsap.to(innerRef.current, {
        scale: 0,
        opacity: 0,
        rotation: 180,
        duration: 0.35,
        ease: 'back.in(2)',
      });
    } else {
      // ALWAYS force full opacity & scale 1 when alive (prevents any accidental invisibility)
      gsap.set(innerRef.current, { scale: 1, opacity: 1, rotation: 0 });
    }
  }, [ratState]);

  let SpriteComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  let scaleX = 1;

  if (ratState === 'evading') {
    SpriteComponent = jumpStep === 0 ? RatJump1 : RatJump2;
  } else {
    SpriteComponent = RatIdle;
  }

  if (ratDirection === 'Left') scaleX = -1;

  return (
    <div
      ref={posRef}
      className="absolute z-30 pointer-events-none"
      style={{
        left:   `${(ratPos.x / GAME_WIDTH) * 100}%`,
        top:    `${(ratPos.y / GAME_HEIGHT) * 100}%`,
        width:  0,
        height: 0,
      }}
    >
      <div
        ref={innerRef}
        style={{
          position:  'absolute',
          width:     '58px',
          height:    '58px',
          marginLeft:'-29px',
          marginTop: '-29px',
          transform: `scaleX(${scaleX})`,
          transition:'transform 0.12s ease-out',
          opacity: 1, // Explicit 100% opacity guarantee
          filter:    ratState === 'dead'
            ? 'drop-shadow(0 0 8px rgba(255,50,50,0.9)) grayscale(1)'
            : 'drop-shadow(0 0 8px rgba(251,191,36,0.7)) drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
        }}
      >
        <SpriteComponent className="w-full h-full object-contain" />
      </div>
    </div>
  );
};
