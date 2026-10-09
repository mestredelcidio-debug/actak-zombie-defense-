/**
 * Sector Quarantine: Arsenal & Armory Workbench
 * Detailed weapons catalog with modular upgrades for Damage, Magazine, Reload, and Accuracy.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crosshair,
  Lock,
  RotateCcw,
  Shield,
  Zap,
} from 'lucide-react';
import { PlayerProfile, WeaponId } from '../types/game';
import {
  WEAPONS_CATALOG,
  getCalculatedWeaponStats,
  getUpgradeCost,
} from '../utils/storage';
import { sound } from '../utils/audio';
import armoryBackdropImg from '../assets/images/arsenal_armory_backdrop_1790558405147.jpg';

interface ArsenalViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  onBack: () => void;
}

export const ArsenalView: React.FC<ArsenalViewProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const weaponIds = Object.keys(WEAPONS_CATALOG) as WeaponId[];
  const [selectedId, setSelectedId] = useState<WeaponId>(weaponIds[0]);

  const activeWeaponStats = getCalculatedWeaponStats(selectedId, profile);
  const userWeaponData = profile.weapons[selectedId] || {
    unlocked: false,
    level: 1,
    upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 },
  };

  const handleUnlock = () => {
    const cost = activeWeaponStats.cost;
    if (profile.coins < cost) return;

    const newProfile = { ...profile };
    newProfile.coins -= cost;
    newProfile.weapons[selectedId] = {
      unlocked: true,
      level: 1,
      upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 },
    };

    sound.playUI('purchase');
    onUpdateProfile(newProfile);
  };

  const handleUpgradeStat = (stat: 'damage' | 'magSize' | 'reload' | 'accuracy') => {
    const currentLvl = userWeaponData.upgrades[stat];
    if (currentLvl >= 5) return;

    const { coins, scrap } = getUpgradeCost(currentLvl);
    if (profile.coins < coins || profile.scrap < scrap) return;

    const newProfile = { ...profile };
    newProfile.coins -= coins;
    newProfile.scrap -= scrap;
    newProfile.weapons[selectedId].upgrades[stat]++;
    newProfile.weapons[selectedId].level =
      1 +
      Math.floor(
        (newProfile.weapons[selectedId].upgrades.damage +
          newProfile.weapons[selectedId].upgrades.magSize +
          newProfile.weapons[selectedId].upgrades.reload +
          newProfile.weapons[selectedId].upgrades.accuracy) /
          4
      );

    sound.playUI('purchase');
    onUpdateProfile(newProfile);
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      {/* Background Workbench Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src={armoryBackdropImg}
          alt="Armory"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>
        <span className="text-sm font-bold tracking-wider text-zinc-200 uppercase">
          ARMORY WORKBENCH
        </span>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-amber-400 font-bold">{profile.coins} COINS</span>
          <span className="text-cyan-400 font-bold">{profile.scrap} SCRAP</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col p-3 gap-3 overflow-y-auto">
        {/* Selected Weapon Detail Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-500 tracking-wider">
                {activeWeaponStats.caliber} · TIER {activeWeaponStats.level}
              </span>
              <h2 className="text-lg font-bold text-zinc-100">{activeWeaponStats.name}</h2>
            </div>
            {userWeaponData.unlocked ? (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> READY
              </span>
            ) : (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> LOCKED
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {activeWeaponStats.description}
          </p>

          {/* Primary Stat Bars */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>DAMAGE</span>
                <span className="font-mono text-zinc-100 font-bold">{activeWeaponStats.damage}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${Math.min(100, (activeWeaponStats.damage / 240) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>MAGAZINE</span>
                <span className="font-mono text-zinc-100 font-bold">{activeWeaponStats.magazineSize}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (activeWeaponStats.magazineSize / 40) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>RELOAD SPEED</span>
                <span className="font-mono text-zinc-100 font-bold">{activeWeaponStats.reloadTime}s</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.max(10, 100 - (activeWeaponStats.reloadTime / 3) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>ACCURACY</span>
                <span className="font-mono text-zinc-100 font-bold">
                  {Math.round(activeWeaponStats.accuracy * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${activeWeaponStats.accuracy * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Upgrade Controls (If Unlocked) or Unlock Action */}
          {userWeaponData.unlocked ? (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                WEAPON WORKBENCH TUNING (MAX LVL 5)
              </span>

              {(['damage', 'magSize', 'reload', 'accuracy'] as const).map((stat) => {
                const lvl = userWeaponData.upgrades[stat];
                const { coins, scrap } = getUpgradeCost(lvl);
                const isMax = lvl >= 5;
                const canAfford = profile.coins >= coins && profile.scrap >= scrap;

                return (
                  <div
                    key={stat}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-zinc-300">
                        {stat === 'magSize' ? 'MAG CAPACITY' : stat}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`w-1.5 h-3 rounded-sm ${
                              s <= lvl ? 'bg-amber-400' : 'bg-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpgradeStat(stat)}
                      disabled={isMax || !canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isMax
                          ? 'bg-zinc-800 text-zinc-500 cursor-default'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-95'
                          : 'bg-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? (
                        'MAXED'
                      ) : (
                        <>
                          <span>{coins} C</span>
                          <span className="text-zinc-600">/</span>
                          <span>{scrap} S</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={handleUnlock}
                disabled={profile.coins < activeWeaponStats.cost}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  profile.coins >= activeWeaponStats.cost
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>UNLOCK FOR {activeWeaponStats.cost} COINS</span>
              </button>
            </div>
          )}
        </div>

        {/* Weapons List Horizontal Carousel */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">
            FIREARMS CATALOG ({weaponIds.length})
          </span>

          <div className="grid grid-cols-2 gap-2 pb-4">
            {weaponIds.map((id) => {
              const base = WEAPONS_CATALOG[id];
              const isSelected = id === selectedId;
              const isUnlocked = profile.weapons[id]?.unlocked;

              return (
                <button
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500/80 shadow-md'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                      {id}
                    </span>
                    {isUnlocked ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <Lock className="w-3 h-3 text-zinc-600" />
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-zinc-200 mt-2 truncate">{base.name}</h3>
                  <span className="text-[10px] text-zinc-500">{base.caliber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
