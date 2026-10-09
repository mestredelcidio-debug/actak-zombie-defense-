/**
 * Sector Quarantine: Settings & Options Modal
 */

import React from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { PlayerProfile } from '../types/game';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  onOpenTutorial: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onUpdateProfile,
  onOpenTutorial,
  onResetProgress,
  onClose,
}) => {
  const toggleSound = () => {
    const next = !profile.soundEnabled;
    const newProfile = { ...profile, soundEnabled: next };
    sound.setSettings(next, profile.musicEnabled, profile.sfxVolume, profile.musicVolume);
    onUpdateProfile(newProfile);
  };

  const toggleMusic = () => {
    const next = !profile.musicEnabled;
    const newProfile = { ...profile, musicEnabled: next };
    sound.setSettings(profile.soundEnabled, next, profile.sfxVolume, profile.musicVolume);
    onUpdateProfile(newProfile);
  };

  const toggleAutoFire = () => {
    const next = !profile.autoFireEnabled;
    const newProfile = { ...profile, autoFireEnabled: next };
    onUpdateProfile(newProfile);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 text-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
              TACTICAL SETTINGS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-3">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              {profile.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-600" />
              )}
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Sound FX</span>
                <span className="text-[10px] text-zinc-500">Gunfire, impacts & ragdoll groans</span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                profile.soundEnabled ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profile.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🎵</span>
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Atmospheric Audio</span>
                <span className="text-[10px] text-zinc-500">Procedural tension drone</span>
              </div>
            </div>
            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                profile.musicEnabled ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profile.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto-Fire Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div>
              <span className="text-xs font-bold text-zinc-200 block">Auto-Fire on Hold</span>
              <span className="text-[10px] text-zinc-500">Hold touch anywhere to spray</span>
            </div>
            <button
              onClick={toggleAutoFire}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                profile.autoFireEnabled ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profile.autoFireEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Replay Tutorial */}
          <button
            onClick={() => {
              onClose();
              onOpenTutorial();
            }}
            className="w-full p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>FIELD TRAINING TUTORIAL</span>
          </button>

          {/* Reset Game Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all campaign progress, coins, weapons, and upgrades?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="w-full p-2.5 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-red-950/40 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>RESET SAVE DATA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
