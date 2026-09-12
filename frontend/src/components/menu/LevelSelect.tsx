import React from 'react';
import { useSessionStore } from '../../store/sessionStore';

export const LevelSelect: React.FC = () => {
  const setStatus = useSessionStore((state) => state.setStatus);
  const setCurrentLevel = useSessionStore((state) => state.setCurrentLevel);

  const handleSelectLevel = (level: 'easy' | 'medium' | 'hard') => {
    setCurrentLevel(level);
    setStatus('PLAYING');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 bg-zinc-800/80 p-12 rounded-3xl backdrop-blur-xl border border-zinc-700/50 shadow-2xl w-full max-w-2xl">
        <h2 className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-orange-400 to-red-600 text-transparent bg-clip-text drop-shadow-sm">
          Select Difficulty
        </h2>

        <div className="flex gap-6 w-full">
          <button 
            onClick={() => handleSelectLevel('easy')}
            className="flex-1 py-8 flex flex-col items-center gap-4 bg-zinc-700/50 hover:bg-green-600/20 hover:border-green-500 border border-transparent rounded-2xl transition-all active:scale-95 group"
          >
            <span className="text-2xl font-bold text-zinc-300 group-hover:text-green-400">Easy</span>
            <span className="text-sm text-zinc-500 group-hover:text-zinc-300 text-center px-4">Slower fire spread, basic bugs.</span>
          </button>

          <button 
            onClick={() => handleSelectLevel('medium')}
            className="flex-1 py-8 flex flex-col items-center gap-4 bg-zinc-700/50 hover:bg-orange-600/20 hover:border-orange-500 border border-transparent rounded-2xl transition-all active:scale-95 group"
          >
            <span className="text-2xl font-bold text-zinc-300 group-hover:text-orange-400">Medium</span>
            <span className="text-sm text-zinc-500 group-hover:text-zinc-300 text-center px-4">Standard rat speed and fire timing.</span>
          </button>

          <button 
            onClick={() => handleSelectLevel('hard')}
            className="flex-1 py-8 flex flex-col items-center gap-4 bg-zinc-700/50 hover:bg-red-600/20 hover:border-red-500 border border-transparent rounded-2xl transition-all active:scale-95 group"
          >
            <span className="text-2xl font-bold text-zinc-300 group-hover:text-red-400">Hard</span>
            <span className="text-sm text-zinc-500 group-hover:text-zinc-300 text-center px-4">Fast rat, complex bugs, rapid fire.</span>
          </button>
        </div>
        
        <button 
          onClick={() => setStatus('IDLE')}
          className="mt-4 text-zinc-400 hover:text-white transition-colors underline-offset-4 hover:underline"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
