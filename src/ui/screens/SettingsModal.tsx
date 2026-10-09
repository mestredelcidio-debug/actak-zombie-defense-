import React from 'react';
import { AlertTriangle, HelpCircle, RotateCcw, Settings, Volume2, VolumeX, Smartphone, X } from 'lucide-react';
import { PlayerStats } from '../../game/types';
import { Button } from '../components/Button';

interface SettingsModalProps {
  isOpen: boolean;
  settings: PlayerStats['settings'];
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleHaptics: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onToggleSound,
  onToggleMusic,
  onToggleHaptics,
  onResetProgress,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              CONFIGURAÇÕES DO JOGO
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2.5">
          {/* Efeitos Sonoros */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">Efeitos Sonoros</span>
                <span className="text-[10px] text-slate-400">Tiros, impactos e moedas</span>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Música Ambiente */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🎵</span>
              <div>
                <span className="text-xs font-bold text-white block">Música & Atmosfera</span>
                <span className="text-[10px] text-slate-400">Trilha de fundo sintetizada</span>
              </div>
            </div>
            <button
              onClick={onToggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.musicEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Feedback Háptico / Vibração */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-white block">Vibração & Impacto</span>
                <span className="text-[10px] text-slate-400">Flash de tela ao sofrer dano</span>
              </div>
            </div>
            <button
              onClick={onToggleHaptics}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Save Progress */}
        <div className="pt-1">
          <Button
            size="sm"
            variant="danger"
            fullWidth
            icon={<AlertTriangle className="w-4 h-4" />}
            onClick={() => {
              if (window.confirm('Atenção: Deseja apagar todo o progresso de níveis, moedas e melhorias?')) {
                onResetProgress();
                onClose();
              }
            }}
          >
            REINICIAR TODO O PROGRESSO
          </Button>
        </div>
      </div>
    </div>
  );
};
