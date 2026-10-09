import React from 'react';
import { Button } from './Button';

interface UpgradeCardProps {
  title: string;
  description: string;
  currentLevel: number;
  maxLevel?: number;
  currentValueText: string;
  nextValueText?: string;
  icon: React.ReactNode;
  cost: number;
  canAfford: boolean;
  onUpgrade: () => void;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  title,
  description,
  currentLevel,
  maxLevel = 10,
  currentValueText,
  nextValueText,
  icon,
  cost,
  canAfford,
  onUpgrade,
}) => {
  const isMax = currentLevel >= maxLevel;

  return (
    <div className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white">{title}</h4>
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              LVL {currentLevel}/{maxLevel}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-0.5">
            {currentValueText}
            {nextValueText && !isMax && (
              <span className="text-emerald-400 ml-1 font-bold">({nextValueText})</span>
            )}
          </p>

          {/* Level Pips */}
          <div className="flex items-center gap-1 mt-1.5">
            {Array.from({ length: maxLevel }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-1.5 rounded-xs transition-colors ${
                  i < currentLevel ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          size="sm"
          variant="gold"
          onClick={onUpgrade}
          disabled={isMax || !canAfford}
          soundType="upgrade"
        >
          {isMax ? 'MAX' : `${cost} C`}
        </Button>
      </div>
    </div>
  );
};
