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

// Sprinting.svg is a sideways-facing sprite — perfect for left/right movement
// We flip it horizontally using scaleX for leftward movement

export const PlayerSprite: React.FC = () => {
  const { playerPos, playerDirection, isSprinting, isStunned, isTired } = useGameStore();
  const spriteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spriteRef.current) {
      gsap.to(spriteRef.current, {
        left: `${(playerPos.x / GAME_WIDTH) * 100}%`,
        top: `${(playerPos.y / GAME_HEIGHT) * 100}%`,
        duration: 0.08,
        ease: 'power1.out'
      });
    }
  }, [playerPos]);

  let SpriteComponent = DownSprite;
  let scaleX = 1;

  if (isStunned) {
    // Unconscious sprite — no direction matters
    SpriteComponent = UnconsciousSprite;
  } else if (isTired) {
    SpriteComponent = TiredSprite;
  } else if (isSprinting) {
    // Sprint animation: use Up-1 for up, sprinting for left/right/down
    if (playerDirection === 'Up') {
      SpriteComponent = Up1Sprite;
    } else if (playerDirection === 'Left') {
      SpriteComponent = SprintingSprite;
      scaleX = -1; // mirror for left
    } else {
      SpriteComponent = SprintingSprite;
    }
  } else {
    // Normal walking animations
    if (playerDirection === 'Up') {
      SpriteComponent = UpSprite;
    } else if (playerDirection === 'Down') {
      SpriteComponent = DownSprite;
    } else if (playerDirection === 'Left') {
      // Use sprinting sprite sideways (mirrored) for left walk
      SpriteComponent = SprintingSprite;
      scaleX = -1;
    } else if (playerDirection === 'Right') {
      // Use sprinting sprite sideways for right walk
      SpriteComponent = SprintingSprite;
    }
  }

  return (
    <div 
      ref={spriteRef}
      className="absolute z-20"
      style={{
        width: '56px',
        height: '56px',
        marginLeft: '-28px',
        marginTop: '-28px',
        left: `${(playerPos.x / GAME_WIDTH) * 100}%`,
        top: `${(playerPos.y / GAME_HEIGHT) * 100}%`,
        transform: `scaleX(${scaleX})`,
        filter: isStunned ? 'drop-shadow(0 0 8px rgba(255,0,0,0.8))' : undefined,
      }}
    >
      <SpriteComponent className="w-full h-full object-contain" />
    </div>
  );
};
