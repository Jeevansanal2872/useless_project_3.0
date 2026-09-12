import React from 'react';
import { useSessionStore } from '../../store/sessionStore';

export const HomePage: React.FC = () => {
  const setStatus = useSessionStore((state) => state.setStatus);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 bg-zinc-800/80 p-12 rounded-3xl backdrop-blur-xl border border-zinc-700/50 shadow-2xl">
        <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-br from-orange-400 to-red-600 text-transparent bg-clip-text drop-shadow-sm">
          Rat Chase
        </h1>
        
        <p className="text-zinc-400 max-w-md text-center text-lg">
          Fix the bugs, put out the fires, and catch that rat!
        </p>

        <div className="flex flex-col gap-4 w-full mt-4">
          <button 
            onClick={() => setStatus('LEVEL_SELECT' as any)} // Using a temporary intermediate state if needed, or we just manage this in App
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            Play Now
          </button>
          
          <button className="w-full py-4 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-xl transition-all active:scale-95">
            Leaderboard
          </button>
          
          <button className="w-full py-4 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-xl transition-all active:scale-95">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};
