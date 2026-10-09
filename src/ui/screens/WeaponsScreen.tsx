import React from 'react';
import { ArrowLeft, Check, Crosshair, Shield, ShoppingCart, Sparkles, UserCheck, Wrench } from 'lucide-react';
import { WEAPON_CATALOG } from '../../game/GameEngine';
import { PlayerStats, WeaponId } from '../../game/types';
import { ResourceCounter } from '../components/ResourceCounter';
import { WeaponCard } from '../components/WeaponCard';

interface WeaponsScreenProps {
  playerStats: PlayerStats;
  onEquipWeapon: (id: WeaponId) => void;
  onUnlockWeapon: (id: WeaponId) => void;
  onUpgradeWeaponStat: (id: WeaponId, stat: 'damageLvl' | 'fireRateLvl' | 'rangeLvl') => void;
  onBack: () => void;
}

export const WeaponsScreen: React.FC<WeaponsScreenProps> = ({
  playerStats,
  onEquipWeapon,
  onUnlockWeapon,
  onUpgradeWeaponStat,
  onBack,
}) => {
  const weaponIds = Object.keys(WEAPON_CATALOG) as WeaponId[];

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 select-none overflow-hidden animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR À BASE</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
              LOJA DO VENDEDOR
            </h3>
            <span className="text-[10px] text-amber-400 font-mono block leading-tight font-bold">
              ARMAS & UPGRADES
            </span>
          </div>
        </div>

        <ResourceCounter coins={playerStats.coins} gems={playerStats.gems} />
      </div>

      {/* Merchant NPC Speech Bubble Banner */}
      <div className="my-2 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shrink-0">
          🤠
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block leading-tight">
            Vendedor de Armas da Base:
          </span>
          <p className="text-xs text-slate-200 leading-snug">
            "Escolha seu poder de fogo, soldado! Compre armas melhores para estraçalhar zumbis mais fortes!"
          </p>
        </div>
      </div>

      {/* Weapons Catalog Grid */}
      <div className="flex-1 overflow-y-auto py-1 pr-1 flex flex-col gap-3.5 custom-scrollbar">
        {weaponIds.map((id) => {
          const weapon = WEAPON_CATALOG[id];
          const isUnlocked = playerStats.unlockedWeapons[id];
          const isEquipped = playerStats.equippedWeapon === id;
          const upgrades = playerStats.weaponUpgrades[id] || { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 };

          return (
            <WeaponCard
              key={id}
              weapon={weapon}
              isUnlocked={isUnlocked}
              isEquipped={isEquipped}
              playerCoins={playerStats.coins}
              playerGems={playerStats.gems}
              upgrades={upgrades}
              onEquip={onEquipWeapon}
              onUnlock={onUnlockWeapon}
              onUpgradeStat={onUpgradeWeaponStat}
            />
          );
        })}
      </div>
    </div>
  );
};
