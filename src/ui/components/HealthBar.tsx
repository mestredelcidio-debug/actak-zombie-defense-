import React from 'react';
import { Heart } from 'lucide-react';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const HealthBar: React.FC<HealthBarProps> = ({
  currentHp,
  maxHp,
  showText = true,
  size = 'md',
}) => {
  const hpRatio = Math.max(0, Math.min(1, currentHp / Math.max(1, maxHp)));
  const hpPercent = Math.round(hpRatio * 100);

  const isLow = hpRatio <= 0.25;

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const getBarColor = () => {
    if (hpRatio > 0.5) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (hpRatio > 0.25) return 'bg-gradient-to-r from-amber-500 to-yellow-400';
    return 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse';
  };

  return (
    <div className="flex flex-col gap-1 select-none">
      {showText && (
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1 text-slate-300">
            <Heart className={`w-3.5 h-3.5 ${isLow ? 'text-red-500 animate-ping' : 'text-red-400 fill-red-400'}`} />
            <span>VIDA</span>
          </span>
          <span className="font-mono tabular-nums text-white">
            {Math.round(currentHp)} / {maxHp}
          </span>
        </div>
      )}

      <div className={`w-full ${heightStyles[size]} bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative`}>
        <div
          className={`h-full rounded-full transition-all duration-200 ${getBarColor()}`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>
    </div>
  );
};
