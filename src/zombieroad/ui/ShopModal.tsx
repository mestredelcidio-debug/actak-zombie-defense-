import React, { useState } from 'react';
import { ArrowLeft, Check, Crosshair, Heart, Lock, Shield, Sparkles, Users, Zap } from 'lucide-react';
import { CharacterDef, CharacterId, PlayerStats, WeaponDef, WeaponId } from '../types';
import { CHARACTERS_CATALOG } from '../data/characters';
import { WEAPONS_CATALOG } from '../data/weapons';

interface ShopModalProps {
  initialTab?: 'weapons' | 'characters' | 'upgrades';
  playerStats: PlayerStats;
  onSelectCharacter: (id: CharacterId) => void;
  onUnlockCharacter: (id: CharacterId) => void;
  onSelectWeapon: (id: WeaponId) => void;
  onUnlockWeapon: (id: WeaponId) => void;
  onUpgradeWeapon: (id: WeaponId, stat: 'damageLvl' | 'fireRateLvl') => void;
  onBack: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  initialTab = 'weapons',
  playerStats,
  onSelectCharacter,
  onUnlockCharacter,
  onSelectWeapon,
  onUnlockWeapon,
  onUpgradeWeapon,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'weapons' | 'characters' | 'upgrades'>(initialTab);

  const characterList = Object.values(CHARACTERS_CATALOG);
  const weaponList = Object.values(WEAPONS_CATALOG);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 select-none overflow-hidden font-sans animate-in fade-in duration-150">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR</span>
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('weapons')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'weapons' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ARMAS
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'characters' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            HERÓIS
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upgrades' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            UPGRADES
          </button>
        </div>

        {/* Coins Counter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-yellow-500/50 px-3 py-1.5 rounded-xl shadow-md">
          <span>🪙</span>
          <span className="font-mono font-black text-sm text-yellow-300">{playerStats.coins}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-3 pr-1 flex flex-col gap-3 custom-scrollbar">
        {/* ================= WEAPONS TAB ================= */}
        {activeTab === 'weapons' && (
          <div className="flex flex-col gap-3">
            {weaponList.map((weapon) => {
              const isUnlocked = playerStats.unlockedWeapons[weapon.id];
              const isEquipped = playerStats.selectedWeapon === weapon.id;
              const upg = playerStats.weaponUpgrades[weapon.id] || { damageLvl: 0, fireRateLvl: 0 };
              const dmgUpgradeCost = 120 + upg.damageLvl * 90;
              const rateUpgradeCost = 120 + upg.fireRateLvl * 90;

              return (
                <div
                  key={weapon.id}
                  className={`bg-slate-900 border rounded-3xl p-4 shadow-xl flex flex-col gap-3 transition-all ${
                    isEquipped ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-white">{weapon.name}</h4>
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-mono font-bold uppercase">
                            EQUIPADA
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        {weapon.description}
                      </span>
                    </div>

                    {/* Equip / Unlock Button */}
                    {isUnlocked ? (
                      <button
                        onClick={() => onSelectWeapon(weapon.id)}
                        disabled={isEquipped}
                        className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95 shadow-md'
                        }`}
                      >
                        {isEquipped ? 'EM USO' : 'EQUIPAR'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onUnlockWeapon(weapon.id)}
                        disabled={playerStats.coins < weapon.unlockCost}
                        className={`px-4 py-2 rounded-2xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                          playerStats.coins >= weapon.unlockCost
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>🪙 {weapon.unlockCost}</span>
                      </button>
                    )}
                  </div>

                  {/* Weapon Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">DANO</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {Math.round(weapon.damage * (1 + upg.damageLvl * 0.15))}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">CADÊNCIA</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">
                        {(weapon.fireRate * (1 + upg.fireRateLvl * 0.12)).toFixed(1)}/s
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">BALOTES</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {weapon.pellets > 1 ? `x${weapon.pellets}` : '1'}
                      </span>
                    </div>
                  </div>

                  {/* Upgrades Sub-buttons */}
                  {isUnlocked && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => onUpgradeWeapon(weapon.id, 'damageLvl')}
                        disabled={playerStats.coins < dmgUpgradeCost || upg.damageLvl >= 10}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 border border-slate-700 flex items-center justify-between active:scale-95 transition-all cursor-pointer"
                      >
                        <span>+DANO (Nv.{upg.damageLvl})</span>
                        <span className="text-yellow-400 font-mono">🪙 {dmgUpgradeCost}</span>
                      </button>

                      <button
                        onClick={() => onUpgradeWeapon(weapon.id, 'fireRateLvl')}
                        disabled={playerStats.coins < rateUpgradeCost || upg.fireRateLvl >= 10}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 border border-slate-700 flex items-center justify-between active:scale-95 transition-all cursor-pointer"
                      >
                        <span>+CADÊNCIA (Nv.{upg.fireRateLvl})</span>
                        <span className="text-yellow-400 font-mono">🪙 {rateUpgradeCost}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ================= CHARACTERS TAB ================= */}
        {activeTab === 'characters' && (
          <div className="flex flex-col gap-3">
            {characterList.map((char) => {
              const isUnlocked = playerStats.unlockedCharacters[char.id];
              const isSelected = playerStats.selectedCharacter === char.id;

              return (
                <div
                  key={char.id}
                  className={`bg-slate-900 border rounded-3xl p-4 shadow-xl flex flex-col gap-3 transition-all ${
                    isSelected ? 'border-cyan-400 ring-1 ring-cyan-400/50' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-white">{char.name}</h4>
                        <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold">
                          {char.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
                        {char.description}
                      </span>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => onSelectCharacter(char.id)}
                        disabled={isSelected}
                        className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 active:scale-95 shadow-md'
                        }`}
                      >
                        {isSelected ? 'SELECIONADO' : 'SELECIONAR'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onUnlockCharacter(char.id)}
                        disabled={playerStats.coins < char.unlockCost}
                        className={`px-4 py-2 rounded-2xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                          playerStats.coins >= char.unlockCost
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>🪙 {char.unlockCost}</span>
                      </button>
                    )}
                  </div>

                  {/* Character Perk Badge */}
                  <div className="flex items-center gap-2 bg-slate-950/80 p-2 px-3 rounded-2xl border border-slate-800">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      HABILIDADE: {char.perk}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= UPGRADES TAB ================= */}
        {activeTab === 'upgrades' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">+1 CORAÇÃO DE VIDA</h4>
                  <span className="text-[11px] text-slate-400">
                    Nível Atual: {playerStats.healthUpgradeLvl} / 3
                  </span>
                </div>
              </div>

              <button
                disabled={playerStats.coins < 800 || playerStats.healthUpgradeLvl >= 3}
                className="px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs uppercase shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                🪙 800
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-yellow-600/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">ÍMÃ DE MOEDAS</h4>
                  <span className="text-[11px] text-slate-400">
                    Nível Atual: {playerStats.coinMagnetLvl} / 5
                  </span>
                </div>
              </div>

              <button
                disabled={playerStats.coins < 500 || playerStats.coinMagnetLvl >= 5}
                className="px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs uppercase shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                🪙 500
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
