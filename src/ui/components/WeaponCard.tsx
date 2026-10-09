import React from 'react';
import { Check, Coins, Crosshair, Flame, Gem, Lock, Sparkles, Wrench, Zap } from 'lucide-react';
import { WeaponDef, WeaponId } from '../../game/types';
import { Button } from './Button';

interface WeaponCardProps {
  weapon: WeaponDef;
  isUnlocked: boolean;
  isEquipped: boolean;
  playerCoins: number;
  playerGems: number;
  upgrades: { damageLvl: number; fireRateLvl: number; rangeLvl: number };
  onEquip: (id: WeaponId) => void;
  onUnlock: (id: WeaponId) => void;
  onUpgradeStat: (id: WeaponId, stat: 'damageLvl' | 'fireRateLvl' | 'rangeLvl') => void;
}

export const WeaponCard: React.FC<WeaponCardProps> = ({
  weapon,
  isUnlocked,
  isEquipped,
  playerCoins,
  playerGems,
  upgrades,
  onEquip,
  onUnlock,
  onUpgradeStat,
}) => {
  const effectiveDamage = Math.round(weapon.damage * (1 + upgrades.damageLvl * 0.15));
  const effectiveFireRate = Number((weapon.fireRate * (1 + upgrades.fireRateLvl * 0.12)).toFixed(1));
  const effectiveRange = Number((weapon.range * (1 + upgrades.rangeLvl * 0.1)).toFixed(1));
  const effectiveTier = 1 + Math.floor((upgrades.damageLvl + upgrades.fireRateLvl + upgrades.rangeLvl) / 3);

  const damageCost = 50 + upgrades.damageLvl * 45;
  const fireRateCost = 60 + upgrades.fireRateLvl * 55;
  const rangeCost = 40 + upgrades.rangeLvl * 35;

  return (
    <div className="w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-3 select-none">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
            {weapon.type} · TIER {effectiveTier}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">{weapon.name}</h3>
        </div>

        {isEquipped ? (
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> EQUIPADA
          </span>
        ) : isUnlocked ? (
          <Button size="sm" variant="gold" onClick={() => onEquip(weapon.id)}>
            EQUIPAR
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onUnlock(weapon.id)}
            disabled={playerCoins < weapon.unlockCost || playerGems < weapon.unlockGems}
            icon={<Lock className="w-3.5 h-3.5" />}
          >
            DESBLOQUEAR ({weapon.unlockCost} C)
          </Button>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {weapon.description}
      </p>

      {/* Stats and Upgrades Grid */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Dano */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between">
          <div className="flex-1 pr-3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" /> DANO
              </span>
              <span className="font-mono text-white">
                {effectiveDamage} <span className="text-emerald-400 text-[10px]">(+15%)</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (effectiveDamage / 200) * 100)}%` }}
              />
            </div>
          </div>

          {isUnlocked && (
            <Button
              size="sm"
              variant="gold"
              onClick={() => onUpgradeStat(weapon.id, 'damageLvl')}
              disabled={upgrades.damageLvl >= 10 || playerCoins < damageCost}
              soundType="upgrade"
              className="text-[11px] px-2.5 py-1.5 min-h-[34px]"
            >
              {upgrades.damageLvl >= 10 ? 'MAX' : `${damageCost} C`}
            </Button>
          )}
        </div>

        {/* Cadência de Tiro */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between">
          <div className="flex-1 pr-3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> CADÊNCIA DE TIRO
              </span>
              <span className="font-mono text-white">
                {effectiveFireRate}/s <span className="text-emerald-400 text-[10px]">(+12%)</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (effectiveFireRate / 15) * 100)}%` }}
              />
            </div>
          </div>

          {isUnlocked && (
            <Button
              size="sm"
              variant="gold"
              onClick={() => onUpgradeStat(weapon.id, 'fireRateLvl')}
              disabled={upgrades.fireRateLvl >= 10 || playerCoins < fireRateCost}
              soundType="upgrade"
              className="text-[11px] px-2.5 py-1.5 min-h-[34px]"
            >
              {upgrades.fireRateLvl >= 10 ? 'MAX' : `${fireRateCost} C`}
            </Button>
          )}
        </div>

        {/* Alcance da Mira */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between">
          <div className="flex-1 pr-3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> ALCANCE DA MIRA
              </span>
              <span className="font-mono text-white">
                {effectiveRange}m <span className="text-emerald-400 text-[10px]">(+10%)</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (effectiveRange / 20) * 100)}%` }}
              />
            </div>
          </div>

          {isUnlocked && (
            <Button
              size="sm"
              variant="gold"
              onClick={() => onUpgradeStat(weapon.id, 'rangeLvl')}
              disabled={upgrades.rangeLvl >= 10 || playerCoins < rangeCost}
              soundType="upgrade"
              className="text-[11px] px-2.5 py-1.5 min-h-[34px]"
            >
              {upgrades.rangeLvl >= 10 ? 'MAX' : `${rangeCost} C`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
