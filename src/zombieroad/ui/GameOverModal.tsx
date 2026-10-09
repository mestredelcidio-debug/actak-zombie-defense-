import React from 'react';
import { RotateCcw, Home, Skull, Trophy, ShoppingBag } from 'lucide-react';
import { RunSummary } from '../types';

interface GameOverModalProps {
  summary: RunSummary;
  onRetry: () => void;
  onMenu: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  onRetry,
  onMenu,
  onOpenShop,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-red-600/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
        {/* Skull Alert Icon */}
        <div className="w-16 h-16 rounded-3xl bg-red-600/20 border-2 border-red-500/60 flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/30 scale-105 animate-bounce">
          <Skull className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold text-red-400 tracking-widest uppercase block">
            FIM DA LINHA
          </span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            VOCÊ MORREU
          </h2>
        </div>

        {/* New Record Banner */}
        {summary.newRecord && (
          <div className="w-full py-1.5 px-3 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center gap-2 text-amber-300 text-xs font-mono font-bold animate-pulse">
            <Trophy className="w-4 h-4" />
            <span>NOVO RECORDE DE DISTÂNCIA!</span>
          </div>
        )}

        {/* Run Stats Summary Card */}
        <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col gap-2.5 text-left font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">DISTÂNCIA PERCORRIDA:</span>
            <span className="font-black text-amber-400 text-sm">{summary.distance}m</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">ZUMBIS ELIMINADOS:</span>
            <span className="font-black text-emerald-400 text-sm">{summary.zombiesKilled}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">MOEDAS COLETADAS:</span>
            <span className="font-black text-yellow-300 text-sm">🪙 {summary.coinsCollected}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          {/* Tentar Novamente Button */}
          <button
            onClick={onRetry}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:to-red-500 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_6px_25px_rgba(249,115,22,0.5)] border border-yellow-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>TENTAR NOVAMENTE</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenShop}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>LOJA</span>
            </button>

            <button
              onClick={onMenu}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
