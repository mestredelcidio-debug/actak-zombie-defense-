import React from 'react';
import { Home, Play, RotateCcw, Settings, ShoppingBag, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onMenu: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenShop,
  onOpenSettings,
  onMenu,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
          JOGO PAUSADO
        </h2>

        {/* Audio Toggles */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onToggleSound}
            className="flex items-center justify-between w-full p-2.5 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all"
          >
            <span>EFEITOS SONOROS (SFX)</span>
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            onClick={onToggleMusic}
            className="flex items-center justify-between w-full p-2.5 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all"
          >
            <span>MÚSICA DE FUNDO</span>
            {musicEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>CONTINUAR</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR PARTIDA</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenShop}
              className="py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>LOJA</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>AJUSTES</span>
            </button>
          </div>

          <button
            onClick={onMenu}
            className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENU PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
