import React from 'react';
import Fire0 from '../../assets/icons/in-game/fire/Level0.svg?react';
import Fire1 from '../../assets/icons/in-game/fire/Level1.svg?react';
import Fire2 from '../../assets/icons/in-game/fire/Level2.svg?react';
import Fire3 from '../../assets/icons/in-game/fire/Level3.svg?react';
import Fire4 from '../../assets/icons/in-game/fire/Level4.svg?react';
import Fire5 from '../../assets/icons/in-game/fire/Level5.svg?react';
import Fire6 from '../../assets/icons/in-game/fire/Level6.svg?react';
import Fire7 from '../../assets/icons/in-game/fire/Level7.svg?react';
import { useGameStore } from '../../store/gameStore';
import { triggerFire } from '../../game-engine/fireSystem';

const FireIcons = [Fire0, Fire1, Fire2, Fire3, Fire4, Fire5, Fire6, Fire7];
import { FireMeter } from './FireMeter';
import { ScoreBadge } from './ScoreBadge';
import { useSessionStore } from '../../store/sessionStore';
import { stopGameLoop } from '../../game-engine/gameLoop';
import PauseIcon from '../../assets/icons/in-game/Pause.svg?react';
import ForwardIcon from '../../assets/icons/in-game/Forward.svg?react';
import BagIcon from '../../assets/icons/in-game/Bag.svg?react';

export const NavBar: React.FC = () => {
  const setStatus = useSessionStore((state) => state.setStatus);
  const fireLevel = useGameStore((state) => state.fireLevel);
  const ActiveFireIcon = FireIcons[fireLevel] || Fire0;

  const handleQuit = () => {
    stopGameLoop();
    setStatus('LEVEL_SELECT');
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-start pointer-events-none">
      
      {/* Left side: Controls and Score */}
      <div className="pointer-events-auto flex items-center gap-4">
        {/* Controls */}
        <div className="flex gap-2">
          <button 
            onClick={() => setStatus(useSessionStore.getState().status === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
            className="w-12 h-12 bg-orange-400 rounded-full border-4 border-orange-200 shadow hover:scale-105 transition-transform flex items-center justify-center"
          >
            <PauseIcon className="w-6 h-6 text-white" />
          </button>
          
          <button 
            onClick={() => {
              const speed = useSessionStore.getState().gameSpeed;
              useSessionStore.getState().setGameSpeed(speed === 1 ? 2 : 1);
            }}
            className={`w-12 h-12 rounded-full border-4 border-orange-200 shadow hover:scale-105 transition-transform flex items-center justify-center ${useSessionStore.getState().gameSpeed === 2 ? 'bg-orange-500' : 'bg-orange-400'}`}
          >
            <ForwardIcon className="w-6 h-6 text-white" />
          </button>
          
          <button 
            onClick={() => console.log('Bag clicked')}
            className="w-12 h-12 bg-orange-400 rounded-full border-4 border-orange-200 shadow hover:scale-105 transition-transform flex items-center justify-center"
          >
            <BagIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <ScoreBadge />
      </div>

      {/* Middle: Fire Meter */}
      <div className="pointer-events-auto">
        <FireMeter />
      </div>

      {/* Right side: Quit & Fire Icon */}
      <div className="pointer-events-auto flex items-center gap-4">
        <button 
          onClick={handleQuit}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors border border-zinc-700"
        >
          Quit
        </button>

        <button 
          onClick={triggerFire}
          className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-yellow-200 shadow hover:scale-105 transition-transform flex items-center justify-center p-2"
        >
          <ActiveFireIcon className="w-full h-full object-contain" />
        </button>
      </div>
    </div>
  );
};
