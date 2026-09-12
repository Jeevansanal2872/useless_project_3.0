import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const ScoreBadge: React.FC = () => {
  const score = useGameStore((state) => state.score);

  return (
    <div className="bg-zinc-800/80 px-4 py-2 rounded-lg border border-zinc-700 flex items-center gap-2">
      <span className="text-zinc-400 font-bold uppercase text-xs tracking-wider">Score</span>
      <span className="text-white font-mono text-xl">{score.toString().padStart(4, '0')}</span>
    </div>
  );
};
