import React from 'react';
import { ChevronLeft, ChevronRight, Crosshair, Flame, Heart, Pause } from 'lucide-react';
import { WeaponDef } from '../types';

interface HUDProps {
  currentHearts: number;
  maxHearts: number;
  distance: number;
  coins: number;
  weapon: WeaponDef;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onStopMove: () => void;
  onJump: () => void;
  onShoot: () => void;
  onPause: () => void;
  onOpenShop: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentHearts,
  maxHearts,
  distance,
  coins,
  weapon,
  onMoveLeft,
  onMoveRight,
  onStopMove,
  onJump,
  onShoot,
  onPause,
  onOpenShop,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
}) => {
  const checkpointDistance = (Math.floor(distance / 150) + 1) * 150;
  const checkpointProgress = Math.min(100, ((distance % 150) / 150) * 100);
  const remainingToCheckpoint = Math.max(0, checkpointDistance - distance);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none z-30 font-sans">
      {/* ==========================================
          1. TOP HEADER (STATUS & RESOURCES)
          ========================================== */}
      <div className="flex items-center justify-between gap-2 pointer-events-auto">
        {/* Hearts Life Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart
              key={i}
              className={`w-6 h-6 transition-all duration-200 ${
                i < currentHearts
                  ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-100 animate-pulse'
                  : 'text-slate-600 fill-slate-800 scale-90 opacity-40'
              }`}
            />
          ))}
        </div>

        {/* Center Distance Progress Meter */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-amber-500/50 shadow-xl flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-400 font-mono tracking-widest uppercase">
            DISTÂNCIA
          </span>
          <span className="text-lg font-black text-white font-mono tracking-tight">
            {distance}m
          </span>
        </div>

        {/* Coins Counter, Audio Toggles & Pause Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-yellow-500/50 hover:border-yellow-400 active:scale-95 transition-all shadow-lg cursor-pointer"
            title="Loja de Armas e Arsenal"
          >
            <span className="text-base animate-bounce">🪙</span>
            <span className="font-mono font-black text-sm text-yellow-300">
              {coins}
            </span>
          </button>

          {/* Quick Sound SFX Toggle */}
          <button
            onClick={onToggleSound}
            className={`w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border ${
              soundEnabled ? 'border-slate-700 text-emerald-400' : 'border-red-800 text-red-400'
            } flex items-center justify-center active:scale-90 transition-all shadow-lg cursor-pointer`}
            title={soundEnabled ? 'Efeitos Sonoros Ligados (Clique para Desligar)' : 'Efeitos Sonoros Desligados (Clique para Ligar)'}
          >
            {soundEnabled ? (
              <span className="text-xs font-bold font-mono">🔊</span>
            ) : (
              <span className="text-xs font-bold font-mono">🔇</span>
            )}
          </button>

          {/* Quick Music Toggle */}
          <button
            onClick={onToggleMusic}
            className={`w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border ${
              musicEnabled ? 'border-slate-700 text-cyan-400' : 'border-red-800 text-red-400'
            } flex items-center justify-center active:scale-90 transition-all shadow-lg cursor-pointer`}
            title={musicEnabled ? 'Música Ligada (Clique para Desligar)' : 'Música Desligada (Clique para Ligar)'}
          >
            {musicEnabled ? (
              <span className="text-xs font-bold font-mono">🎵</span>
            ) : (
              <span className="text-xs font-bold font-mono line-through opacity-70">🎵</span>
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-90 transition-all shadow-lg cursor-pointer"
            title="Pausar Jogo"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Mission objective: a clear reason to keep advancing, without auto-running. */}
      <div className="pointer-events-none absolute top-[4.6rem] left-1/2 -translate-x-1/2 w-[min(19rem,58vw)] rounded-xl border border-emerald-500/35 bg-slate-950/85 px-3 py-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">OBJETIVO</span>
          <span className="text-[10px] font-mono font-bold text-slate-100">{remainingToCheckpoint}m</span>
        </div>
        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-200">Alcance o posto de controle</div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-700/90">
          <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-200" style={{ width: `${checkpointProgress}%` }} />
        </div>
      </div>

      {/* Weapon Info Badge (Clickable to switch/upgrade) */}
      <button
        onClick={onOpenShop}
        className="self-start mt-1 bg-slate-900/85 hover:bg-slate-800/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 hover:border-amber-500/60 text-left pointer-events-auto shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        title="Ver Arsenal e Melhorar Arma"
      >
        <Crosshair className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[11px] font-bold text-slate-200">
          {weapon.name}
        </span>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">
          DANO {weapon.damage}
        </span>
        <span className="text-[9px] font-semibold text-amber-400/90 ml-1">
          (ARSENAL)
        </span>
      </button>

      {/* ==========================================
          2. BOTTOM CONTROLS (MANUAL MOVEMENT & ACTIONS)
          ========================================== */}
      <div className="flex items-end justify-between w-full px-2 pb-2 pointer-events-auto">
        {/* Left Side: Manual Movement Directional Buttons (◀ ESQUERDA e DIREITA ▶) */}
        <div className="flex items-center gap-2.5">
          {/* Move Left */}
          <button
            onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); onMoveLeft(); }} onPointerUp={(e) => { e.preventDefault(); onStopMove(); }} onPointerCancel={onStopMove} onLostPointerCapture={onStopMove}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-900/90 backdrop-blur-md border-2 border-slate-700 active:border-cyan-400 active:bg-cyan-950/60 active:scale-95 transition-all shadow-xl flex flex-col items-center justify-center text-slate-200 active:text-cyan-300 cursor-pointer select-none touch-manipulation"
            title="Mover para Esquerda"
          >
            <ChevronLeft className="w-8 h-8 stroke-[3]" />
            <span className="text-[9px] font-bold uppercase tracking-wider">ESQ</span>
          </button>

          {/* Move Right */}
          <button
            onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); onMoveRight(); }} onPointerUp={(e) => { e.preventDefault(); onStopMove(); }} onPointerCancel={onStopMove} onLostPointerCapture={onStopMove}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-900/90 backdrop-blur-md border-2 border-slate-700 active:border-cyan-400 active:bg-cyan-950/60 active:scale-95 transition-all shadow-xl flex flex-col items-center justify-center text-slate-200 active:text-cyan-300 cursor-pointer select-none touch-manipulation"
            title="Mover para Direita"
          >
            <ChevronRight className="w-8 h-8 stroke-[3]" />
            <span className="text-[9px] font-bold uppercase tracking-wider">DIR</span>
          </button>
        </div>

        {/* Right Side: ATIRAR + PULAR Large 3D Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* ATIRAR Button (Raises gun and shoots bullets that kill zombies) */}
          <button
            onPointerDown={(e) => { e.preventDefault(); onShoot(); }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 active:scale-90 transition-all shadow-[0_8px_25px_rgba(249,115,22,0.6)] border-3 border-amber-200 flex flex-col items-center justify-center text-slate-950 font-black cursor-pointer select-none touch-manipulation group"
          >
            <Flame className="w-8 h-8 sm:w-9 sm:h-9 fill-slate-950 text-slate-950 group-active:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-xs tracking-wider uppercase mt-0.5">
              ATIRAR
            </span>
          </button>

          {/* PULAR Button (Large with Up Arrow) */}
          <button
            onPointerDown={(e) => { e.preventDefault(); onJump(); }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-sky-300 active:scale-90 transition-all shadow-[0_10px_30px_rgba(6,182,212,0.65)] border-3 border-cyan-100 flex flex-col items-center justify-center text-slate-950 font-black cursor-pointer select-none touch-manipulation group"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10 sm:w-12 sm:h-12 fill-slate-950 text-slate-950 group-active:-translate-y-1 transition-transform"
            >
              <path d="M12 2L3 11h6v11h6V11h6L12 2z" />
            </svg>
            <span className="text-xs sm:text-sm tracking-wider uppercase mt-0.5">
              PULAR
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
