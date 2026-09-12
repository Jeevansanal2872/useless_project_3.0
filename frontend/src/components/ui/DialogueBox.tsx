import React from 'react';
import AngryIcon from '../../assets/icons/Dialogues/character/Angry.svg?react';
import HeroIcon from '../../assets/icons/Dialogues/character/Hero.svg?react';
import WinnerIcon from '../../assets/icons/Dialogues/character/Winner.svg?react';

interface DialogueBoxProps {
  type: 'Angry' | 'Hero' | 'Winner';
  text: string;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ type, text }) => {
  let Icon = HeroIcon;
  if (type === 'Angry') Icon = AngryIcon;
  if (type === 'Winner') Icon = WinnerIcon;

  return (
    <div className="flex items-center space-x-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 p-4 rounded-2xl shadow-xl w-full max-w-xl">
      <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <Icon className="w-[150%] h-[150%] object-cover mt-4" />
      </div>
      <div className="flex-1 text-white font-medium text-lg leading-snug">
        {text}
      </div>
    </div>
  );
};
