import React from 'react';
import { useSessionStore } from '../../store/sessionStore';
import HouseEasy from '../../assets/House_map/House-Easy.svg?react';
import HouseMedium from '../../assets/House_map/House-Medium.svg?react';
import HouseHard from '../../assets/House_map/House-Hard.svg?react';

export const HouseMap: React.FC = () => {
  const currentLevel = useSessionStore((state) => state.currentLevel);

  let MapComponent = HouseEasy;
  if (currentLevel === 'medium') MapComponent = HouseMedium;
  if (currentLevel === 'hard') MapComponent = HouseHard;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
      <MapComponent className="w-full h-full" preserveAspectRatio="none" />
    </div>
  );
};
