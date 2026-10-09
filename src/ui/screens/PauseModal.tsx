import React from 'react';
import { Home, Play, RotateCcw, Settings, Wrench } from 'lucide-react';
import { Button } from '../components/Button';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenArmory: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onOpenArmory,
  onOpenSettings,
  onQuitToMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-center animate-in zoom-in-95 duration-150">
        <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">
          JOGO PAUSADO
        </h2>

        <Button
          size="md"
          variant="gold"
          fullWidth
          icon={<Play className="w-4 h-4 fill-current" />}
          onClick={onResume}
        >
          CONTINUAR
        </Button>

        <Button
          size="md"
          variant="secondary"
          fullWidth
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={onRestart}
        >
          REINICIAR NÍVEL
        </Button>

        <Button
          size="md"
          variant="secondary"
          fullWidth
          icon={<Wrench className="w-4 h-4 text-amber-400" />}
          onClick={onOpenArmory}
        >
          ARMAS & MELHORIAS
        </Button>

        <Button
          size="md"
          variant="secondary"
          fullWidth
          icon={<Settings className="w-4 h-4" />}
          onClick={onOpenSettings}
        >
          CONFIGURAÇÕES
        </Button>

        <Button
          size="md"
          variant="danger"
          fullWidth
          icon={<Home className="w-4 h-4" />}
          onClick={onQuitToMenu}
        >
          SAIR DO NÍVEL
        </Button>
      </div>
    </div>
  );
};
