import React from 'react';
import { Coins, Gem, Plus } from 'lucide-react';

interface ResourceCounterProps {
  coins: number;
  gems: number;
  onAddCoins?: () => void;
  onAddGems?: () => void;
  compact?: boolean;
}

export const ResourceCounter: React.FC<ResourceCounterProps> = ({
  coins,
  gems,
  onAddCoins,
  onAddGems,
  compact = false,
}) => {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Coins Badge */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 rounded-xl px-2.5 py-1 shadow-md">
        <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <span className="font-mono font-black text-xs sm:text-sm text-amber-300 tabular-nums">
          {coins.toLocaleString()}
        </span>
        {onAddCoins && (
          <button
            onClick={onAddCoins}
            className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center ml-0.5 hover:bg-amber-300 active:scale-90 transition-transform"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Gems / Diamonds Badge */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-cyan-500/40 rounded-xl px-2.5 py-1 shadow-md">
        <div className="w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center">
          <Gem className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <span className="font-mono font-black text-xs sm:text-sm text-cyan-300 tabular-nums">
          {gems.toLocaleString()}
        </span>
        {onAddGems && (
          <button
            onClick={onAddGems}
            className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center ml-0.5 hover:bg-cyan-300 active:scale-90 transition-transform"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
