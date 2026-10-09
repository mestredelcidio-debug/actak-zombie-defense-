import React from 'react';
import {
  Crosshair,
  Heart,
  Pause,
  Shield,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { PlayerStats, WeaponDef } from '../../game/types';
import { ResourceCounter } from '../components/ResourceCounter';
import { HealthBar } from '../components/HealthBar';

interface GameHUDProps {
  level: number;
  levelName: string;
  defeated: number;
  total: number;
  bossHpRatio?: number;
  playerStats: PlayerStats;
  maxHp: number;
  currentWeapon: WeaponDef;
  onPause: () => void;
  onOpenArmory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  levelName,
  defeated,
  total,
  bossHpRatio,
  playerStats,
  maxHp,
  currentWeapon,
  onPause,
  onOpenArmory,
  soundEnabled,
  onToggleSound,
}) => {
  const progressPercent = Math.min(100, Math.round((defeated / Math.max(1, total)) * 100));

  return (
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex flex-col gap-2 z-20 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Level & Horde Progress Panel */}
        <div className="flex-1 max-w-[210px] sm:max-w-xs bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
            <span className="text-amber-400 font-mono tracking-wide">NÍVEL {level}</span>
            <span className="text-slate-300 font-mono text-[10px]">
              HORDA: {defeated}/{total}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-200 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Boss HP Bar (When active) */}
          {bossHpRatio !== undefined && (
            <div className="mt-1.5 pt-1 border-t border-slate-800">
              <div className="flex justify-between text-[9px] font-bold text-red-400 mb-0.5">
                <span>CHEFÃO GIGANTE</span>
                <span>{Math.round(bossHpRatio * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-red-900">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-100"
                  style={{ width: `${Math.max(0, bossHpRatio * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resources & Quick Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <ResourceCounter coins={playerStats.coins} gems={playerStats.gems} compact />

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all shadow-md cursor-pointer"
            aria-label="Pausar"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Bar: Player Vitals & Weapon Stats */}
      <div className="flex items-center justify-between px-1">
        {/* Player Health Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl pointer-events-auto w-36 sm:w-44 shadow-md">
          <HealthBar currentHp={playerStats.hp} maxHp={maxHp} size="sm" />
        </div>

        {/* Active Weapon Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 pointer-events-auto shadow-md">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <div className="text-right">
            <span className="text-[10px] text-slate-300 block font-bold leading-tight truncate max-w-[90px]">
              {currentWeapon.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 leading-tight">
              DANO {currentWeapon.damage} · TIER {currentWeapon.level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
