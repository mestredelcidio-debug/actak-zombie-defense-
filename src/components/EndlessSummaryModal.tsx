/**
 * Sector Quarantine: Mission Victory & Defeat Summary Modal
 */

import React from 'react';
import {
  Crosshair,
  Flame,
  RotateCcw,
  Shield,
  Star,
  Trophy,
} from 'lucide-react';

interface SummaryModalProps {
  type: 'VICTORY' | 'DEFEAT';
  starsEarned?: number;
  coinsEarned: number;
  scrapEarned: number;
  stats: {
    kills: number;
    headshots: number;
    waveReached?: number;
  };
  onRetry: () => void;
  onNextOrContinue: () => void;
  onReturnToBase: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  type,
  starsEarned = 1,
  coinsEarned,
  scrapEarned,
  stats,
  onRetry,
  onNextOrContinue,
  onReturnToBase,
}) => {
  const isVictory = type === 'VICTORY';

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 text-center shadow-2xl">
        {/* Header Ribbon */}
        <div className="flex flex-col items-center gap-1">
          <span
            className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isVictory ? 'text-emerald-400' : 'text-red-500'
            }`}
          >
            {isVictory ? 'SECTOR PURGED' : 'DEFENSE BREACHED'}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-zinc-100">
            {isVictory ? 'MISSION ACCOMPLISHED' : 'CASUALTY REPORT'}
          </h2>
        </div>

        {/* Stars Display (If Victory) */}
        {isVictory && (
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 transition-all ${
                  s <= starsEarned
                    ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-zinc-800'
                }`}
              />
            ))}
          </div>
        )}

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-semibold uppercase">
              <Flame className="w-3 h-3 text-red-500" /> HOSTILES KILLED
            </span>
            <span className="text-base font-bold font-mono text-zinc-100 tabular-nums">
              {stats.kills}
            </span>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-semibold uppercase">
              <Crosshair className="w-3 h-3 text-amber-500" /> HEADSHOT KILLS
            </span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
              {stats.headshots}
            </span>
          </div>
        </div>

        {/* Rewards Breakdown */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-500">PAYOUT</span>
            <span className="text-base font-bold font-mono text-amber-400">+{coinsEarned} C</span>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-500">SALVAGED</span>
            <span className="text-base font-bold font-mono text-cyan-400">+{scrapEarned} S</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {isVictory ? (
            <button
              onClick={onNextOrContinue}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              CONTINUE OPERATION
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              RETRY SECTOR DEFENSE
            </button>
          )}

          <button
            onClick={onReturnToBase}
            className="w-full py-2.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold text-xs active:scale-95 transition-all"
          >
            RETURN TO BASE MENU
          </button>
        </div>
      </div>
    </div>
  );
};
