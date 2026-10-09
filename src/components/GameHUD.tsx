/**
 * Sector Quarantine: Mobile Touch Heads-Up Display
 * Ergonomic thumb-zone controls, active reload sweet spot bar, weapon switcher, and vital indicators.
 */

import React from 'react';
import {
  Crosshair,
  Flame,
  Hammer,
  Pause,
  RefreshCw,
  Shield,
  Zap,
} from 'lucide-react';
import { GamePhase, PlayerProfile, PlayerStats, WeaponId, WeaponStats } from '../types/game';

interface GameHUDProps {
  phase: GamePhase;
  currentWave: number;
  totalWaves: number;
  zombiesRemaining: number;
  barricadeHp: number;
  maxBarricadeHp: number;
  player: PlayerStats;
  weapon: WeaponStats;
  profile: PlayerProfile;
  onFireTap: () => void;
  onReloadTap: () => void;
  onSwitchWeapon: (id: WeaponId) => void;
  onRepairTap: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  phase,
  currentWave,
  totalWaves,
  zombiesRemaining,
  barricadeHp,
  maxBarricadeHp,
  player,
  weapon,
  profile,
  onReloadTap,
  onSwitchWeapon,
  onRepairTap,
  onMoveLeft,
  onMoveRight,
  onPause,
}) => {
  const barricadePercent = Math.max(0, Math.round((barricadeHp / maxBarricadeHp) * 100));
  const playerHpPercent = Math.max(0, Math.round((player.hp / player.maxHp) * 100));

  // Active reload sweet spot window (45% to 75%)
  const isSweetSpotActive = player.isReloading && player.reloadProgress >= 0.45 && player.reloadProgress <= 0.75;

  const unlockedWeapons = (Object.keys(profile.weapons) as WeaponId[]).filter(
    (id) => profile.weapons[id].unlocked
  );

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Bar: Vitals, Phase, Waves & Pause */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Phase Badge */}
          <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800 rounded-lg px-3 py-1.5 backdrop-blur-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                phase === 'CLEANUP' ? 'bg-amber-400 animate-ping' : 'bg-red-500 animate-pulse'
              }`}
            />
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-200">
              {phase === 'CLEANUP' ? 'CLEANUP SWEEP' : `DEFENSE · W-${currentWave}/${totalWaves}`}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs font-mono tabular-nums text-zinc-400">
              {zombiesRemaining} HOSTILES
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-lg bg-zinc-950/90 border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95 transition-transform"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>

        {/* Vital Gauges (Barricade Integrity & Player Health) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Barricade HP */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-zinc-400">
                <Shield className="w-3 h-3 text-amber-500" /> BARRICADE
              </span>
              <span className="font-mono tabular-nums text-zinc-200 font-semibold">{barricadePercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  barricadePercent > 50
                    ? 'bg-amber-500'
                    : barricadePercent > 20
                    ? 'bg-orange-500'
                    : 'bg-red-600'
                }`}
                style={{ width: `${barricadePercent}%` }}
              />
            </div>
          </div>

          {/* Player HP */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-zinc-400">
                <Flame className="w-3 h-3 text-emerald-400" /> OPERATOR
              </span>
              <span className="font-mono tabular-nums text-zinc-200 font-semibold">{playerHpPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  playerHpPercent > 50
                    ? 'bg-emerald-500'
                    : playerHpPercent > 25
                    ? 'bg-amber-500'
                    : 'bg-red-600'
                }`}
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Interactive Notification (e.g. Flashlight warning in cleanup) */}
      {phase === 'CLEANUP' && (
        <div className="self-center bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-center backdrop-blur-md">
          <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Aim flashlight into dark corners & inspect doors!
          </p>
        </div>
      )}

      {/* Bottom Natural Thumb Zone: Ammo, Active Reload, Weapon Carousel & Movement */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Active Reload Timing Bar (Shows when player is reloading) */}
        {player.isReloading && (
          <div className="bg-zinc-950/95 border border-zinc-800 rounded-xl p-2.5 backdrop-blur-md shadow-xl flex flex-col gap-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                {isSweetSpotActive ? 'TAP NOW FOR TACTICAL SPEED!' : 'RELOADING CHAMBER...'}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">ACTIVE SWEET-SPOT</span>
            </div>
            {/* Visual Timing Bar with Sweet Spot Window */}
            <div className="relative w-full h-4 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
              {/* Sweet spot target zone */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-400"
                style={{ left: '45%', width: '30%' }}
              />
              {/* Progress Slider */}
              <div
                className={`h-full transition-all duration-75 ${
                  isSweetSpotActive ? 'bg-emerald-400' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, player.reloadProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Weapons Carousel Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {unlockedWeapons.map((id) => {
            const isEquipped = player.currentWeaponId === id;
            return (
              <button
                key={id}
                onClick={() => onSwitchWeapon(id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isEquipped
                    ? 'bg-zinc-100 text-zinc-950 border-white shadow-md scale-105'
                    : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span>{id.toUpperCase()}</span>
                {isEquipped && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls Cluster */}
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Movement Strafe Left */}
          <button
            onPointerDown={onMoveLeft}
            className="col-span-2 h-14 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-300 font-bold active:bg-zinc-800 active:scale-95 transition-all"
            aria-label="Strafe Left"
          >
            ◀
          </button>

          {/* Barricade Repair Action */}
          <button
            onClick={onRepairTap}
            className="col-span-2 h-14 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col items-center justify-center text-amber-400 active:scale-95 transition-all"
            aria-label="Repair Barricade"
          >
            <Hammer className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">REPAIR</span>
          </button>

          {/* Ammo Counter & Weapon Name */}
          <div className="col-span-4 h-14 bg-zinc-950/90 border border-zinc-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wide truncate max-w-[110px]">
              {weapon.name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-zinc-100 tabular-nums">
                {player.ammoInMag}
              </span>
              <span className="text-xs text-zinc-500 font-mono">/ {weapon.magazineSize}</span>
            </div>
          </div>

          {/* Tactical Reload Button (Triggers Active Sweet-spot if tapped during reload) */}
          <button
            onClick={onReloadTap}
            className={`col-span-2 h-14 rounded-xl border flex flex-col items-center justify-center active:scale-95 transition-all ${
              isSweetSpotActive
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-500/30 animate-pulse'
                : player.ammoInMag <= 2
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-zinc-900/90 text-zinc-300 border-zinc-800'
            }`}
            aria-label="Reload"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">
              {isSweetSpotActive ? 'TAP!' : 'RELOAD'}
            </span>
          </button>

          {/* Movement Strafe Right */}
          <button
            onPointerDown={onMoveRight}
            className="col-span-2 h-14 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-300 font-bold active:bg-zinc-800 active:scale-95 transition-all"
            aria-label="Strafe Right"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
