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

// Key fix: GSAP controls the *outer* div's position (left/top).
// The *inner* div handles transform (scaleX) for mirroring.
// This prevents React re-renders from interfering with GSAP animations.

export const PlayerSprite: React.FC = () => {
  const { playerPos, playerDirection, isSprinting, isStunned, isTired } = useGameStore();
  const posRef = useRef<HTMLDivElement>(null); // GSAP animates this

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
      // Right or Down while sprinting
      SpriteComponent = SprintingSprite;
    }
  } else {
    // Normal walking
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
    // Outer div: GSAP animates left/top — keep style here minimal so GSAP owns it
    <div
      ref={posRef}
      className="absolute z-20"
      style={{
        left: `${(playerPos.x / GAME_WIDTH) * 100}%`,
        top: `${(playerPos.y / GAME_HEIGHT) * 100}%`,
        width: 0,
        height: 0,
        // Offset the sprite so it's centered on the position point
      }}
    >
      {/* Inner div: React controls transform (scaleX mirror) — GSAP does NOT touch this */}
      <div
        style={{
          position: 'absolute',
          width: '56px',
          height: '56px',
          marginLeft: '-28px',
          marginTop: '-28px',
          transform: `scaleX(${scaleX})`,
          transition: 'transform 0.1s ease',
          filter: isStunned ? 'drop-shadow(0 0 8px rgba(255,0,0,0.8))' : undefined,
        }}
      >
        <SpriteComponent className="w-full h-full object-contain" />
      </div>
    </div>
  );
};
