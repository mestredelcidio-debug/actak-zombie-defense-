/**
 * Sector Quarantine: Operator Skills, Perks & Uniform Customization
 */

import React from 'react';
import {
  ArrowLeft,
  Check,
  Crosshair,
  Flame,
  Hammer,
  RotateCcw,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PlayerProfile } from '../types/game';
import { getPerkCost } from '../utils/storage';
import { sound } from '../utils/audio';

interface OperatorViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  onBack: () => void;
}

export const OperatorView: React.FC<OperatorViewProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const outfits: { id: PlayerProfile['cosmeticOutfit']; name: string; color: string; desc: string }[] = [
    { id: 'tactical_black', name: 'Tactical Black', color: 'bg-zinc-900 border-zinc-700', desc: 'Standard issue urban containment gear' },
    { id: 'hazmat_amber', name: 'Hazmat Amber', color: 'bg-amber-600 border-amber-400', desc: 'High-visibility bio-hazard isolation suit' },
    { id: 'urban_camo', name: 'Urban Camo', color: 'bg-slate-700 border-slate-500', desc: 'Shattered city camouflage pattern' },
    { id: 'ghost_recon', name: 'Ghost Recon', color: 'bg-zinc-950 border-cyan-500/40', desc: 'Deep-shadow covert night sweep rig' },
  ];

  const perksList: {
    key: keyof PlayerProfile['perks'];
    name: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'medicLevel',
      name: 'Combat Medic',
      desc: '+20 Max Operator HP and passive injury resistance',
      icon: <Flame className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'engineerLevel',
      name: 'Combat Engineer',
      desc: '+100 Max Barricade HP and +25 faster repair hammer efficiency',
      icon: <Hammer className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'fastHandsLevel',
      name: 'Fast Hands',
      desc: '-8% Reload Time and wider tactical active reload sweet-spot',
      icon: <RotateCcw className="w-4 h-4 text-cyan-400" />,
    },
    {
      key: 'scavengerLevel',
      name: 'Scavenger Instinct',
      desc: '+20% Extra Scrap and coin rewards found from sweeps',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
    },
    {
      key: 'sharpshooterLevel',
      name: 'Deadly Precision',
      desc: '+25% Headshot Critical multiplier bonus',
      icon: <Crosshair className="w-4 h-4 text-red-400" />,
    },
  ];

  const handleUpgradePerk = (key: keyof PlayerProfile['perks']) => {
    const currentLvl = profile.perks[key];
    if (currentLvl >= 5) return;

    const { coins, scrap } = getPerkCost(currentLvl);
    if (profile.coins < coins || profile.scrap < scrap) return;

    const newProfile = { ...profile };
    newProfile.coins -= coins;
    newProfile.scrap -= scrap;
    newProfile.perks[key]++;

    sound.playUI('purchase');
    onUpdateProfile(newProfile);
  };

  const handleSelectOutfit = (outfit: PlayerProfile['cosmeticOutfit']) => {
    const newProfile = { ...profile, cosmeticOutfit: outfit };
    sound.playUI('click');
    onUpdateProfile(newProfile);
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>
        <span className="text-sm font-bold tracking-wider text-zinc-200 uppercase">
          OPERATOR DOSSIER
        </span>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-amber-400 font-bold">{profile.coins} COINS</span>
          <span className="text-cyan-400 font-bold">{profile.scrap} SCRAP</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-3 gap-4 overflow-y-auto">
        {/* Career Dossier Overview */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                TACTICAL PROFILE
              </span>
              <h2 className="text-lg font-bold text-zinc-100">QUARANTINE OPERATOR</h2>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-center">
              <span className="text-[10px] font-bold text-amber-400 block">REPUTATION</span>
              <span className="text-base font-bold font-mono text-zinc-100">
                LVL {1 + Math.floor(profile.missionsCompleted / 2)}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
              <span className="text-[10px] text-zinc-500 block">TOTAL KILLS</span>
              <span className="text-sm font-bold font-mono text-zinc-200">{profile.totalKills}</span>
            </div>
            <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
              <span className="text-[10px] text-zinc-500 block">HEADSHOTS</span>
              <span className="text-sm font-bold font-mono text-red-400">{profile.headshots}</span>
            </div>
            <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
              <span className="text-[10px] text-zinc-500 block">ENDLESS HIGH</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                W-{profile.endlessHighScoreWave}
              </span>
            </div>
          </div>
        </div>

        {/* Uniform & Camo Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">
            CAMOUFLAGE UNIFORM
          </span>
          <div className="grid grid-cols-2 gap-2">
            {outfits.map((outfit) => {
              const isSelected = profile.cosmeticOutfit === outfit.id;
              return (
                <button
                  key={outfit.id}
                  onClick={() => handleSelectOutfit(outfit.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500 shadow-md'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-3.5 h-3.5 rounded-full border ${outfit.color}`} />
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-xs font-bold text-zinc-200 mt-1">{outfit.name}</span>
                  <span className="text-[10px] text-zinc-500 leading-tight">{outfit.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Perk Upgrades Tree */}
        <div className="flex flex-col gap-2 pb-4">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">
            OPERATOR PERKS (MAX LVL 5)
          </span>

          {perksList.map((perk) => {
            const lvl = profile.perks[perk.key];
            const { coins, scrap } = getPerkCost(lvl);
            const isMax = lvl >= 5;
            const canAfford = profile.coins >= coins && profile.scrap >= scrap;

            return (
              <div
                key={perk.key}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800">
                      {perk.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">{perk.name}</h4>
                      <p className="text-[10px] text-zinc-400">{perk.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`w-2 h-3.5 rounded-sm ${
                          s <= lvl ? 'bg-amber-400' : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-zinc-400 ml-1.5 font-bold">
                      LVL {lvl}/5
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpgradePerk(perk.key)}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
