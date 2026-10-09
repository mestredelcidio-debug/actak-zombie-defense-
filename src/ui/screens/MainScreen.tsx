import React from 'react';
import {
  Crosshair,
  Flame,
  Layers,
  Play,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  Wrench,
  Zap,
} from 'lucide-react';
import { LevelConfig, PlayerStats, WeaponDef } from '../../game/types';
import { ResourceCounter } from '../components/ResourceCounter';
import { Button } from '../components/Button';

interface MainScreenProps {
  playerStats: PlayerStats;
  currentWeapon: WeaponDef;
  currentLevelConfig: LevelConfig;
  onPlay: () => void;
  onOpenLevelSelect: () => void;
  onOpenWeapons: () => void;
  onOpenUpgrades: () => void;
  onOpenSettings: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  playerStats,
  currentWeapon,
  currentLevelConfig,
  onPlay,
  onOpenLevelSelect,
  onOpenWeapons,
  onOpenUpgrades,
  onOpenSettings,
}) => {
  const totalStars = Object.values(playerStats.levelStars || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 select-none overflow-hidden animate-in fade-in">
      {/* Top Header: Brand & Resources */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight leading-none">
              DEFESA DA BASE
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 font-bold leading-none">
              QUARTEL GENERAL
            </span>
          </div>
        </div>

        <ResourceCounter
          coins={playerStats.coins}
          gems={playerStats.gems}
        />
      </div>

      {/* Central Tactical Level Showcase */}
      <div className="my-auto flex flex-col gap-3.5 max-w-sm mx-auto w-full">
        {/* Mission Card */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden">
          {/* Subtle glow backdrop */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                MISSÃO ATUAL
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {currentLevelConfig.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentLevelConfig.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-300">
                ★ {totalStars}/24
              </span>
            </div>
          </div>

          {/* Intel Summary */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 text-center">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold">INIMIGOS</span>
              <span className="text-xs font-bold font-mono text-white">
                {currentLevelConfig.totalEnemies} Slimes
              </span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">RECOMPENSA</span>
              <span className="text-xs font-bold font-mono text-amber-400">
                +{currentLevelConfig.coinReward} C
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold">ARMA ATIVA</span>
              <span className="text-xs font-bold font-mono text-cyan-400 truncate block">
                {currentWeapon.name.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Primary Dominant Button: JOGAR */}
          <Button
            size="xl"
            variant="gold"
            fullWidth
            pulse
            icon={<Play className="w-6 h-6 fill-current" />}
            onClick={onPlay}
            className="mt-1 shadow-amber-500/25"
          >
            JOGAR
          </Button>
        </div>

        {/* Secondary Navigation Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Níveis */}
          <button
            onClick={onOpenLevelSelect}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-slate-300 hover:text-white cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">NÍVEIS</span>
          </button>

          {/* Armas */}
          <button
            onClick={onOpenWeapons}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-slate-300 hover:text-white cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">ARMAS</span>
          </button>

          {/* Melhorias */}
          <button
            onClick={onOpenUpgrades}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-slate-300 hover:text-white cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">MELHORIAS</span>
          </button>

          {/* Configurações */}
          <button
            onClick={onOpenSettings}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-slate-300 hover:text-white cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">AJUSTES</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="text-center text-[10px] text-slate-600 font-mono">
        DEFESA DA BASE V2 · 3D ISOMETRIC ENGINE
      </div>
    </div>
  );
};
