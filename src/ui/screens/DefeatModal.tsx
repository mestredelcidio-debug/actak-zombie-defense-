import React from 'react';
import { AlertOctagon, Home, RotateCcw, ShieldAlert, Wrench } from 'lucide-react';
import { LevelConfig } from '../../game/types';
import { Button } from '../components/Button';

interface DefeatModalProps {
  levelConfig: LevelConfig;
  defeatedCount: number;
  totalCount: number;
  coinsEarned: number;
  onRetry: () => void;
  onOpenArmory: () => void;
  onQuitToMenu: () => void;
}

export const DefeatModal: React.FC<DefeatModalProps> = ({
  levelConfig,
  defeatedCount,
  totalCount,
  coinsEarned,
  onRetry,
  onOpenArmory,
  onQuitToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-red-900/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
        {/* Defeat Alert Badge */}
        <div className="w-16 h-16 rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20 scale-105">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>A BASE FOI INVADIDA</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-0.5">
            DERROTA!
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Os monstros romperam o perímetro no {levelConfig.name}.
          </p>
        </div>

        {/* Stats on Defeat */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-around text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">ELIMINAÇÕES</span>
            <span className="font-mono font-bold text-white text-sm">
              {defeatedCount} / {totalCount}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">RECURSOS COLETADOS</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              +{coinsEarned} C
            </span>
          </div>
        </div>

        {/* Tactical Tip */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-left">
          <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">
            💡 DICA TÁTICA:
          </span>
          <p className="text-xs text-slate-300 mt-0.5 leading-snug">
            Acesse o <strong className="text-amber-400">Menu de Armas & Melhorias</strong> para aumentar o Dano da sua arma e a Vida Máxima do herói antes de tentar novamente!
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2 pt-1">
          <Button
            size="lg"
            variant="danger"
            fullWidth
            icon={<RotateCcw className="w-5 h-5" />}
            onClick={onRetry}
          >
            TENTAR NOVAMENTE
          </Button>

          <Button
            size="md"
            variant="secondary"
            fullWidth
            icon={<Wrench className="w-4 h-4 text-amber-400" />}
            onClick={onOpenArmory}
          >
            ARMAS E MELHORIAS
          </Button>

          <Button
            size="sm"
            variant="ghost"
            fullWidth
            icon={<Home className="w-3.5 h-3.5" />}
            onClick={onQuitToMenu}
          >
            MENU PRINCIPAL
          </Button>
        </div>
      </div>
    </div>
  );
};
