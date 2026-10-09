import React from 'react';
import { ArrowLeft, Layers, Trophy } from 'lucide-react';
import { LEVEL_CONFIGS } from '../../game/levels';
import { LevelConfig, PlayerStats } from '../../game/types';
import { LevelCard } from '../components/LevelCard';
import { ResourceCounter } from '../components/ResourceCounter';

interface LevelSelectScreenProps {
  playerStats: PlayerStats;
  currentLevel: number;
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  playerStats,
  currentLevel,
  onSelectLevel,
  onBack,
}) => {
  const totalStars = Object.values(playerStats.levelStars || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col justify-between p-4 select-none overflow-hidden animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR</span>
        </button>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wide">
            MAPA DE MISSÕES
          </h3>
        </div>

        <ResourceCounter coins={playerStats.coins} gems={playerStats.gems} />
      </div>

      {/* Level List */}
      <div className="flex-1 overflow-y-auto py-3 pr-1 flex flex-col gap-2.5 custom-scrollbar">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            SETORES DISPONÍVEIS ({LEVEL_CONFIGS.length})
          </span>
          <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalStars} / {LEVEL_CONFIGS.length * 3} ESTRELAS</span>
          </div>
        </div>

        {LEVEL_CONFIGS.map((lvl) => {
          const isUnlocked = lvl.level <= playerStats.maxUnlockedLevel;
          const isCurrent = lvl.level === currentLevel;
          const starsEarned = playerStats.levelStars[lvl.level] || 0;

          return (
            <LevelCard
              key={lvl.level}
              levelConfig={lvl}
              isUnlocked={isUnlocked}
              isCurrent={isCurrent}
              starsEarned={starsEarned}
              onSelect={onSelectLevel}
            />
          );
        })}
      </div>
    </div>
  );
};
