/**
 * Sector Quarantine: Campaign Map & Sector Selector
 * Displays the 10 abandoned facilities with threat levels, objectives, and stars.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Flame,
  Lock,
  Play,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { MissionLocation, PlayerProfile } from '../types/game';
import campaignMapImg from '../assets/images/campaign_map_preview_1790558395017.jpg';

interface CampaignMapProps {
  locations: MissionLocation[];
  profile: PlayerProfile;
  onSelectMission: (location: MissionLocation) => void;
  onBack: () => void;
}

export const CampaignMap: React.FC<CampaignMapProps> = ({
  locations,
  onSelectMission,
  onBack,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0].id);
  const activeMission = locations.find((l) => l.id === selectedLocId) || locations[0];

  return (
    <div className="relative w-full h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      {/* Background Blueprint Map Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src={campaignMapImg}
          alt="Tactical Map"
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
          TACTICAL SECTOR MAP
        </span>
        <div className="w-12 text-right">
          <span className="text-xs font-mono text-amber-400 font-bold">
            ★ {locations.reduce((acc, l) => acc + l.starsEarned, 0)}/30
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden p-3 gap-3">
        {/* Selected Mission Spotlight Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-500 tracking-wider">
                {activeMission.zoneCode} · THREAT LVL {activeMission.difficulty}
              </span>
              <h2 className="text-lg font-bold text-zinc-100">{activeMission.name}</h2>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= activeMission.starsEarned
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {activeMission.description}
          </p>

          {/* Objectives List */}
          <div className="flex flex-col gap-1.5 bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800/50">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              MISSION DIRECTIVES
            </span>
            {activeMission.objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-zinc-300">{obj.text}</span>
              </div>
            ))}
          </div>

          {/* Mission Rewards & Deploy CTA */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-amber-400 font-bold">+{activeMission.rewardCoins} COINS</span>
              <span className="text-zinc-500">·</span>
              <span className="text-cyan-400 font-bold">+{activeMission.rewardScrap} SCRAP</span>
            </div>

            <button
              onClick={() => onSelectMission(activeMission)}
              disabled={!activeMission.unlocked}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeMission.unlocked
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {activeMission.unlocked ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>DEPLOY UNIT</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>LOCKED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Sector List */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">
            ABANDONED INSTALLATIONS ({locations.length})
          </span>

          {locations.map((loc, idx) => {
            const isSelected = loc.id === activeMission.id;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocId(loc.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-amber-500/60 shadow-md'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      loc.unlocked
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'bg-zinc-900 text-zinc-600'
                    }`}
                  >
                    {loc.unlocked ? (idx + 1).toString().padStart(2, '0') : <Lock className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-200">{loc.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      <span>{loc.zoneCode}</span>
                      <span>·</span>
                      <span>{loc.wavesCount} Waves + Sweep</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= loc.starsEarned
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
