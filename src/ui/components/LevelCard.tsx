import React from 'react';
import { ChevronRight, Coins, Gem, Lock, Play, ShieldAlert, Skull, Star } from 'lucide-react';
import { LevelConfig } from '../../game/types';
import { Button } from './Button';

interface LevelCardProps {
  levelConfig: LevelConfig;
  isUnlocked: boolean;
  isCurrent: boolean;
  starsEarned: number;
  onSelect: (level: LevelConfig) => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  levelConfig,
  isUnlocked,
  isCurrent,
  starsEarned,
  onSelect,
}) => {
  return (
    <div
      onClick={() => isUnlocked && onSelect(levelConfig)}
      className={`relative w-full rounded-2xl p-4 border transition-all select-none duration-150 flex items-center justify-between gap-3 ${
        !isUnlocked
          ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
          : isCurrent
          ? 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-amber-500/80 shadow-xl shadow-amber-500/10 cursor-pointer scale-[1.01]'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850 cursor-pointer shadow-md'
      }`}
    >
      {/* Left Level Badge */}
      <div className="flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 border ${
            !isUnlocked
              ? 'bg-slate-950 border-slate-800 text-slate-600'
              : isCurrent
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 border-amber-300 text-slate-950 shadow-md'
              : 'bg-slate-800 border-slate-700 text-white'
          }`}
        >
          {isUnlocked ? (
            <>
              <span className="text-[9px] font-bold opacity-80 uppercase leading-none">NÍVEL</span>
              <span className="text-base font-black font-mono leading-none mt-0.5">{levelConfig.level}</span>
            </>
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </div>

        {/* Level Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white leading-tight">
              {levelConfig.name}
            </h4>
            {levelConfig.hasBoss && (
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Skull className="w-2.5 h-2.5" /> CHEFÃO
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {levelConfig.subtitle}
          </p>

          {/* Rewards & Stars */}
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= starsEarned
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            <span className="text-slate-600">·</span>

            {/* Rewards */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-amber-300 font-bold">+{levelConfig.coinReward} C</span>
              <span className="text-cyan-300 font-bold">+{levelConfig.gemReward} D</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Action Chevron / Play */}
      <div className="shrink-0">
        {isUnlocked ? (
          isCurrent ? (
            <Button size="sm" variant="gold" icon={<Play className="w-3.5 h-3.5 fill-current" />}>
              JOGAR
            </Button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
              <ChevronRight className="w-4 h-4" />
            </div>
          )
        ) : (
          <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">BLOQUEADO</span>
        )}
      </div>
    </div>
  );
};
