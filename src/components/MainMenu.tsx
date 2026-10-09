/**
 * Sector Quarantine: Main Title Menu & Hub
 * Atmospheric mobile home screen with animated elements, game modes, and navigation.
 */

import React from 'react';
import {
  Calendar,
  Crosshair,
  Flame,
  HelpCircle,
  Infinity as InfinityIcon,
  Play,
  RotateCcw,
  Settings,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GameMode, MissionLocation, PlayerProfile } from '../types/game';
import gameCoverArt from '../assets/images/game_cover_art_1790558384661.jpg';

interface MainMenuProps {
  profile: PlayerProfile;
  locations: MissionLocation[];
  onStartGame: (mode: GameMode, location?: MissionLocation) => void;
  onOpenArsenal: () => void;
  onOpenOperator: () => void;
  onOpenMap: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  locations,
  onStartGame,
  onOpenArsenal,
  onOpenOperator,
  onOpenMap,
  onOpenTutorial,
  onOpenSettings,
}) => {
  const nextAvailableMission =
    locations.find((l) => l.unlocked && l.starsEarned < 3) || locations[0];

  return (
    <div className="relative w-full h-full bg-zinc-950 text-zinc-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Cinematic Cover Art */}
      <div className="absolute inset-0 z-0">
        <img
          src={gameCoverArt}
          alt="Sector Quarantine"
          className="w-full h-full object-cover scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40" />
      </div>

      {/* Top Bar: Currencies, Tutorial & Settings */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
              {profile.coins}
            </span>
            <span className="text-[10px] font-bold text-zinc-500">C</span>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {profile.scrap}
            </span>
            <span className="text-[10px] font-bold text-zinc-500">S</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTutorial}
            className="w-9 h-9 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
            aria-label="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Branding & Title */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mt-2">
        <div className="flex items-center gap-2 bg-red-950/80 border border-red-800/80 px-3 py-1 rounded-full mb-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-red-300 tracking-widest uppercase">
            BIO-HAZARD PROTOCOL ACTIVE
          </span>
        </div>

        <h1 className="text-4xl font-display font-extrabold tracking-tight uppercase leading-none text-zinc-100 drop-shadow-md">
          SECTOR QUARANTINE
        </h1>
        <p className="text-xs font-mono tracking-widest text-amber-400/90 font-bold uppercase mt-1">
          BREACH & CLEAR DEFENSE
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="relative z-10 flex flex-col gap-2.5 px-4 mb-2 overflow-y-auto max-h-[50vh]">
        {/* Campaign Button */}
        <button
          onClick={() => onStartGame('CAMPAIGN', nextAvailableMission)}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 p-3.5 rounded-2xl flex items-center justify-between font-bold shadow-xl shadow-amber-500/20 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-zinc-950/20 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase opacity-80 block">
                PRIMARY DIRECTIVE
              </span>
              <span className="text-sm font-black uppercase">CAMPAIGN OPERATIONS</span>
              <span className="text-[10px] block opacity-90 mt-0.5">
                Next: {nextAvailableMission.name}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-zinc-950/20 px-2.5 py-1 rounded-lg">
            DEPLOY
          </span>
        </button>

        {/* Endless Horde Defense */}
        <button
          onClick={() => onStartGame('ENDLESS', locations[1])}
          className="w-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <InfinityIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-100 block">ENDLESS DEFENSE</span>
              <span className="text-[10px] text-zinc-400">
                Infinite horde waves · Best: Wave {profile.endlessHighScoreWave}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold">SURVIVE</span>
        </button>

        {/* Cleanup Night Challenge */}
        <button
          onClick={() => onStartGame('CLEANUP_CHALLENGE', locations[2])}
          className="w-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-100 block">CLEANUP NIGHT SWEEP</span>
              <span className="text-[10px] text-zinc-400">
                Flashlight room sweep under high tension
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">SWEEP</span>
        </button>

        {/* Daily Contract */}
        <button
          onClick={() => onStartGame('DAILY_CONTRACT', locations[0])}
          className="w-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-100 block">DAILY CONTRACT</span>
              <span className="text-[10px] text-zinc-400">Special modifier · 3x Rewards</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-purple-400 font-bold">3X REWARD</span>
        </button>
      </div>

      {/* Bottom Fixed Navigation Anchor */}
      <div className="relative z-10 grid grid-cols-4 p-2 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md">
        <button
          onClick={onOpenMap}
          className="flex flex-col items-center py-2 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">SECTORS</span>
        </button>

        <button
          onClick={onOpenArsenal}
          className="flex flex-col items-center py-2 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">ARSENAL</span>
        </button>

        <button
          onClick={onOpenOperator}
          className="flex flex-col items-center py-2 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">OPERATOR</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center py-2 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">SETTINGS</span>
        </button>
      </div>
    </div>
  );
};
