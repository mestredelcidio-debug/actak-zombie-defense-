import React from 'react';
import { Play, Shield, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div
      onClick={onStart}
      className="absolute inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-6 sm:p-8 select-none cursor-pointer animate-in fade-in"
    >
      {/* Top Protocol Tag */}
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full mt-4">
        <Shield className="w-4 h-4 text-amber-400" />
        <span className="text-[11px] font-mono font-bold text-amber-300 tracking-widest uppercase">
          PROTOCOLO DE DEFESA ISOMÉTRICO
        </span>
      </div>

      {/* Main Title Lockup */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 border-2 border-white/40 mb-3 scale-105 animate-bounce">
          <Shield className="w-10 h-10 fill-current" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase text-white leading-none drop-shadow-lg">
          DEFESA DA BASE
        </h1>
        <p className="text-xs sm:text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase mt-1">
          HYPER-CASUAL 3D TACTICAL SHOOTER
        </p>
      </div>

      {/* Bottom Prompt Button */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 mb-6">
        <Button
          size="lg"
          variant="gold"
          fullWidth
          pulse
          icon={<Play className="w-5 h-5 fill-current" />}
          onClick={onStart}
        >
          TOQUE PARA ENTRAR
        </Button>
        <span className="text-[11px] text-slate-500 font-medium">
          Defenda o portão contra hordas infinitas de slimes
        </span>
      </div>
    </div>
  );
};
