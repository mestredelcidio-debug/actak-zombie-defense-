import React from 'react';
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { PlayerStats } from '../types';

interface SettingsModalProps {
  playerStats: PlayerStats;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  playerStats,
  onToggleSound,
  onToggleMusic,
  onResetData,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-center shadow-2xl flex flex-col gap-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer active:scale-90 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black text-white uppercase tracking-wider">
          CONFIGURAÇÕES
        </h3>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onToggleSound}
            className="flex items-center justify-between w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer active:scale-95 transition-all"
          >
            <span>EFEITOS SONOROS (SFX)</span>
            {playerStats.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            onClick={onToggleMusic}
            className="flex items-center justify-between w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer active:scale-95 transition-all"
          >
            <span>MÚSICA DE FUNDO</span>
            {playerStats.musicEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>

        {/* Reset Progress */}
        <button
          onClick={() => {
            if (window.confirm('Deseja realmente resetar todo o progresso de moedas e armas?')) {
              onResetData();
            }
          }}
          className="py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESETAR PROGRESSO</span>
        </button>
      </div>
    </div>
  );
};
