import React from 'react';
import { Crosshair, Flame, Play, ShieldAlert, Skull, Wrench, X } from 'lucide-react';
import { LevelConfig, WeaponDef } from '../../game/types';
import { Button } from '../components/Button';

interface LevelBriefingModalProps {
  isOpen: boolean;
  levelConfig: LevelConfig;
  currentWeapon: WeaponDef;
  onStart: () => void;
  onOpenArmory: () => void;
  onClose: () => void;
}

export const LevelBriefingModal: React.FC<LevelBriefingModalProps> = ({
  isOpen,
  levelConfig,
  currentWeapon,
  onStart,
  onOpenArmory,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 duration-150 relative">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center justify-center gap-1.5 self-center bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest">
            DEFESA DA BASE · NÍVEL {levelConfig.level}
          </span>
        </div>

        {/* Mission Title & Subtitle */}
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {levelConfig.name.split(':')[1] || levelConfig.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {levelConfig.description}
          </p>
        </div>

        {/* Mission Directives Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2 text-left">
          {/* Enemies */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <Skull className="w-3.5 h-3.5 text-red-400" /> INIMIGOS
            </span>
            <span className="text-xs font-black font-mono text-white">
              {levelConfig.totalEnemies} Slimes {levelConfig.hasBoss ? '(+ CHEFÃO)' : ''}
            </span>
          </div>

          {/* Rewards */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> RECOMPENSA
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span className="text-amber-400">+{levelConfig.coinReward} MOEDAS</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400">+{levelConfig.gemReward} D</span>
            </div>
          </div>

          {/* Equipped Weapon */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> ARMA ATIVA
            </span>
            <span className="text-xs font-black font-mono text-cyan-300">
              {currentWeapon.name} (DANO {currentWeapon.damage})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Primary: INICIAR */}
          <Button
            size="lg"
            variant="gold"
            fullWidth
            pulse
            icon={<Play className="w-5 h-5 fill-current" />}
            onClick={onStart}
          >
            INICIAR
          </Button>

          {/* Secondary: ARMAS E MELHORIAS */}
          <Button
            size="md"
            variant="secondary"
            fullWidth
            icon={<Wrench className="w-4 h-4 text-amber-400" />}
            onClick={onOpenArmory}
          >
            ARMAS E MELHORIAS
          </Button>
        </div>
      </div>
    </div>
  );
};
