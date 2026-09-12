import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import gsap from 'gsap';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';
import RatIdle from '../../assets/icons/in-game/Rat/idle.svg?react';
import RatRun from '../../assets/icons/in-game/Rat/run.svg?react';
import RatSprint from '../../assets/icons/in-game/Rat/sprint.svg?react';
import RatJump1 from '../../assets/icons/in-game/Rat/Jump1.svg?react';
import RatHit from '../../assets/icons/in-game/Rat/Hit.svg?react';

export const RatSprite: React.FC = () => {
  const { ratPos, ratDirection, ratState } = useGameStore();
  const spriteRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const jumpRef = useRef(false);

  useEffect(() => {
    if (spriteRef.current) {
      gsap.to(spriteRef.current, {
        left: `${(ratPos.x / GAME_WIDTH) * 100}%`,
        top: `${(ratPos.y / GAME_HEIGHT) * 100}%`,
        duration: 0.1,
        ease: 'power1.out'
      });
    }
    // Alternate jump frames when evading
    if (ratState === 'evading') {
      frameRef.current = (frameRef.current + 1) % 4;
      jumpRef.current = frameRef.current < 2;
    } else {
      jumpRef.current = false;
    }
  }, [ratPos, ratState]);

  let SpriteComponent = RatIdle;
  let scaleX = 1;
  
  if (ratState === 'evading') {
    // Use sprint or jump alternating
    SpriteComponent = jumpRef.current ? RatJump1 : RatSprint;
  } else {
    SpriteComponent = RatIdle;
  }

  // Mirror for leftward movement
  if (ratDirection === 'Left') {
    scaleX = -1;
  }

  return (
    <div 
      ref={spriteRef}
      className="absolute z-20"
      style={{
        width: '44px',
        height: '44px',
        marginLeft: '-22px',
        marginTop: '-22px',
        left: `${(ratPos.x / GAME_WIDTH) * 100}%`,
        top: `${(ratPos.y / GAME_HEIGHT) * 100}%`,
        transform: `scaleX(${scaleX})`,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
      }}
    >
      <SpriteComponent className="w-full h-full object-contain" />
    </div>
  );
};
