import React from 'react';
import { Coins, Gem, Home, Play, Sparkles, Star, Trophy, Wrench } from 'lucide-react';
import { LevelConfig } from '../../game/types';
import { Button } from '../components/Button';

interface VictoryModalProps {
  levelConfig: LevelConfig;
  starsEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  onNextLevel: () => void;
  onOpenArmory: () => void;
  onQuitToMenu: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelConfig,
  starsEarned,
  coinsEarned,
  gemsEarned,
  onNextLevel,
  onOpenArmory,
  onQuitToMenu,
  hasNextLevel,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
        {/* Victory Trophy Badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/30 scale-105 animate-bounce">
          <Trophy className="w-8 h-8 fill-current" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BASE FORTIFICADA</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-0.5">
            VITÓRIA!
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {levelConfig.name} concluído com sucesso!
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-7 h-7 transition-all ${
                s <= starsEarned
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Reward Summary Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">MOEDAS GANHAS</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-base font-black font-mono text-amber-300">
                +{coinsEarned}
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">DIAMANTES</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Gem className="w-4 h-4 text-cyan-400" />
              <span className="text-base font-black font-mono text-cyan-300">
                +{gemsEarned}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 pt-1">
          {hasNextLevel ? (
            <Button
              size="lg"
              variant="gold"
              fullWidth
              pulse
              icon={<Play className="w-5 h-5 fill-current" />}
              onClick={onNextLevel}
            >
              PRÓXIMO NÍVEL
            </Button>
          ) : (
            <div className="text-xs font-bold text-amber-400 bg-amber-500/10 py-3 rounded-2xl border border-amber-500/30 font-mono">
              ★ PARABÉNS! TODOS OS NÍVEIS CONCLUÍDOS! ★
            </div>
          )}

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
