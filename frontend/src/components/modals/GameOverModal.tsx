import React from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { useGameStore } from '../../store/gameStore';
import { stopGameLoop } from '../../game-engine/gameLoop';
import { DialogueBox } from '../ui/DialogueBox';

export const GameOverModal: React.FC = () => {
  const status = useSessionStore((state) => state.status);
  const setStatus = useSessionStore((state) => state.setStatus);
  const score = useGameStore((state) => state.score);
  const resetGame = useGameStore((state) => state.resetGame);

  if (status !== 'HOUSE_BURNED_FAIL' && status !== 'GAME_WON') return null;

  const isWin = status === 'GAME_WON';

  const handleReturn = () => {
    resetGame();
    stopGameLoop();
    setStatus('LEVEL_SELECT');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className={`p-12 rounded-3xl border-2 flex flex-col items-center max-w-lg text-center ${
        isWin ? 'border-green-500 bg-green-900/20' : 'border-red-600 bg-red-950/40'
      }`}>
        <h1 className={`text-6xl font-black uppercase tracking-tighter mb-4 ${
          isWin ? 'text-green-400' : 'text-red-500'
        }`}>
          {isWin ? 'Mission Success' : 'House Burned Down'}
        </h1>
        
        <div className="mb-8 w-full flex justify-center">
          <DialogueBox 
            type={isWin ? 'Winner' : 'Angry'} 
            text={isWin 
              ? 'You have exterminated enough bugs to stabilize the system.' 
              : 'The bugs got out of hand and the server caught fire.'
            } 
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8 w-full">
          <div className="text-zinc-500 uppercase tracking-widest text-sm mb-2">Final Score</div>
          <div className="text-5xl font-mono text-white">{score}</div>
        </div>

        <button
          onClick={handleReturn}
          className="bg-white text-black font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors w-full"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
