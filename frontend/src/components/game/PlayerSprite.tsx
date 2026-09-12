import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import gsap from 'gsap';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';
import UpSprite from '../../assets/icons/in-game/Character/Up.svg?react';
import Up1Sprite from '../../assets/icons/in-game/Character/Up-1.svg?react';
import DownSprite from '../../assets/icons/in-game/Character/Down.svg?react';
import SprintingSprite from '../../assets/icons/in-game/Character/sprinting.svg?react';
import UnconsciousSprite from '../../assets/icons/in-game/Character/Unconsious.svg?react';
import TiredSprite from '../../assets/icons/in-game/Character/Tired.svg?react';

export const PlayerSprite: React.FC = () => {
  const { playerPos, playerDirection, isSprinting, isStunned, isTired, slapTrigger } = useGameStore();
  const posRef = useRef<HTMLDivElement>(null);       // GSAP animates position (left/top)
  const spriteInnerRef = useRef<HTMLDivElement>(null);// GSAP animates torch swing hit
  const slashRef = useRef<HTMLDivElement>(null);     // GSAP animates fiery slash arc

  // Position interpolation
  useEffect(() => {
    if (posRef.current) {
      gsap.to(posRef.current, {
        left: `${(playerPos.x / GAME_WIDTH) * 100}%`,
        top: `${(playerPos.y / GAME_HEIGHT) * 100}%`,
        duration: 0.08,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }
  }, [playerPos]);

  // GSAP Slap / Torch Swing Hit Animation
  useEffect(() => {
    if (slapTrigger > 0 && spriteInnerRef.current) {
      const tl = gsap.timeline();
      
      // Swing sprite back then burst forward
      tl.to(spriteInnerRef.current, {
        rotation: playerDirection === 'Left' ? -35 : 35,
        scale: 1.3,
        duration: 0.1,
        ease: 'back.out(2)',
      }).to(spriteInnerRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.15,
        ease: 'power2.inOut',
      });

      // Fiery slash effect burst
      if (slashRef.current) {
        gsap.fromTo(slashRef.current,
          { opacity: 1, scale: 0.4, rotation: -45 },
          { opacity: 0, scale: 1.6, rotation: 45, duration: 0.25, ease: 'power2.out' }
        );
      }
    }
  }, [slapTrigger, playerDirection]);

  let SpriteComponent = DownSprite;
  let scaleX = 1;

  if (isStunned) {
    SpriteComponent = UnconsciousSprite;
  } else if (isTired) {
    SpriteComponent = TiredSprite;
  } else if (isSprinting) {
    if (playerDirection === 'Up') {
      SpriteComponent = Up1Sprite;
    } else if (playerDirection === 'Left') {
      SpriteComponent = SprintingSprite;
      scaleX = -1;
    } else {
      SpriteComponent = SprintingSprite;
    }
  } else {
    if (playerDirection === 'Up') {
      SpriteComponent = UpSprite;
    } else if (playerDirection === 'Down') {
      SpriteComponent = DownSprite;
    } else if (playerDirection === 'Left') {
      SpriteComponent = SprintingSprite;
      scaleX = -1;
    } else if (playerDirection === 'Right') {
      SpriteComponent = SprintingSprite;
    }
  }

  return (
    <div
      ref={posRef}
      className="absolute z-20 pointer-events-none"
      style={{
        left: `${(playerPos.x / GAME_WIDTH) * 100}%`,
        top: `${(playerPos.y / GAME_HEIGHT) * 100}%`,
        width: 0,
        height: 0,
      }}
    >
      <div
        ref={spriteInnerRef}
        style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          marginLeft: '-40px',
          marginTop: '-40px',
          transform: `scaleX(${scaleX})`,
          filter: isStunned ? 'drop-shadow(0 0 12px rgba(239,68,68,0.9))' : undefined,
        }}
      >
        <SpriteComponent className="w-full h-full object-contain" />

        {/* Fiery Torch Swing Slash Arc Graphic */}
        <div
          ref={slashRef}
          className="absolute inset-0 opacity-0 pointer-events-none flex items-center justify-center"
        >
          <svg className="w-24 h-24 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" viewBox="0 0 100 100">
            <path
              d="M 20 80 Q 50 10 90 40 Q 50 40 20 80 Z"
              fill="url(#torchSlashGrad)"
            />
            <defs>
              <linearGradient id="torchSlashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
