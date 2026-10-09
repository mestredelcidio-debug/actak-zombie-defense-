import React from 'react';
import { Crosshair, Play, Settings, ShoppingBag, Trophy, Users, Volume2, VolumeX, Zap } from 'lucide-react';
import { CharacterDef, PlayerStats, WeaponDef } from '../types';

interface MainMenuProps {
  playerStats: PlayerStats;
  character: CharacterDef;
  weapon: WeaponDef;
  onPlay: () => void;
  onOpenShop: (tab?: 'weapons' | 'characters' | 'upgrades') => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  playerStats,
  character,
  weapon,
  onPlay,
  onOpenShop,
  onOpenSettings,
  onToggleSound,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-between p-4 select-none overflow-hidden font-sans">
      {/* Top Bar: Best Record, Coins, Sound */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl shadow-lg">
          <Trophy className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <span className="text-[9px] text-slate-400 uppercase font-mono block leading-none">
              RECORDE
            </span>
            <span className="text-sm font-black text-amber-400 font-mono leading-tight">
              {playerStats.bestDistance}m
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-yellow-500/50 px-3.5 py-1.5 rounded-2xl shadow-lg">
            <span className="text-base">🪙</span>
            <span className="text-sm font-mono font-black text-yellow-300">
              {playerStats.coins}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            {playerStats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>
      </div>

      {/* Center Branding & Title */}
      <div className="flex flex-col items-center gap-2 my-auto text-center animate-in zoom-in-95 duration-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[11px] font-mono font-black uppercase tracking-widest">
          SOBREVIVÊNCIA LATERAL 2.5D
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-400 to-red-600 tracking-tighter drop-shadow-[0_8px_25px_rgba(239,68,68,0.5)]">
          ZOMBIE ROAD
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xs leading-snug">
          Avance pela estrada pós-apocalíptica, pule obstáculos e extermine zumbis!
        </p>

        {/* Selected Hero & Weapon Card */}
        <div className="mt-3 flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 px-4 shadow-xl">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">HERÓI</span>
            <span className="text-xs font-black text-cyan-400">{character.name}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">ARMA</span>
            <span className="text-xs font-black text-amber-400">{weapon.name}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Menu: JOGAR (Big) + ARMAS, PERSONAGENS, LOJA, CONFIG */}
      <div className="flex flex-col gap-3 pb-3 max-w-sm mx-auto w-full">
        {/* Big JOGAR Button */}
        <button
          onClick={onPlay}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:to-red-500 text-slate-950 font-black text-xl tracking-wider uppercase shadow-[0_10px_35px_rgba(249,115,22,0.6)] border-2 border-yellow-200 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-slate-950 text-slate-950" />
          <span>JOGAR</span>
        </button>

        {/* Secondary Menu Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onOpenShop('weapons')}
            className="py-2.5 px-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-amber-300 hover:text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase">ARMAS</span>
          </button>

          <button
            onClick={() => onOpenShop('characters')}
            className="py-2.5 px-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-cyan-300 hover:text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold uppercase">HERÓIS</span>
          </button>

          <button
            onClick={() => onOpenShop('upgrades')}
            className="py-2.5 px-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-emerald-300 hover:text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase">LOJA</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="py-2.5 px-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold uppercase">AJUSTES</span>
          </button>
        </div>
      </div>
    </div>
  );
};
