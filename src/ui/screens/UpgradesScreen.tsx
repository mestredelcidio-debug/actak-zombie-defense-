import React from 'react';
import { ArrowLeft, Crosshair, Heart, Shield, Sparkles, Wrench, Zap } from 'lucide-react';
import { PlayerStats } from '../../game/types';
import { ResourceCounter } from '../components/ResourceCounter';
import { UpgradeCard } from '../components/UpgradeCard';

interface UpgradesScreenProps {
  playerStats: PlayerStats;
  onUpgradePlayerStat: (stat: 'hpLvl' | 'speedLvl' | 'magnetLvl' | 'critLvl' | 'defenseLvl') => void;
  onBack: () => void;
}

export const UpgradesScreen: React.FC<UpgradesScreenProps> = ({
  playerStats,
  onUpgradePlayerStat,
  onBack,
}) => {
  const hpLvl = playerStats.playerUpgrades.hpLvl;
  const speedLvl = playerStats.playerUpgrades.speedLvl;
  const magnetLvl = playerStats.playerUpgrades.magnetLvl;
  const critLvl = playerStats.playerUpgrades.critLvl;
  const defenseLvl = playerStats.playerUpgrades.defenseLvl;

  const hpCost = 80 + hpLvl * 60;
  const speedCost = 100 + speedLvl * 80;
  const magnetCost = 70 + magnetLvl * 50;
  const critCost = 120 + critLvl * 90;
  const defenseCost = 150 + defenseLvl * 100;

  return (
    <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col justify-between p-4 select-none overflow-hidden animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR</span>
        </button>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wide">
            MELHORIAS DO HERÓI
          </h3>
        </div>

        <ResourceCounter coins={playerStats.coins} gems={playerStats.gems} />
      </div>

      {/* Upgrades List */}
      <div className="flex-1 overflow-y-auto py-3 pr-1 flex flex-col gap-3 custom-scrollbar">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            ATRIBUTOS PERMANENTES
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            PROGRESSÃO DO JOGADOR
          </span>
        </div>

        {/* Vida Máxima */}
        <UpgradeCard
          title="Vida Máxima (HP)"
          description="Aumenta a resistência e pontos de vida do personagem."
          currentLevel={hpLvl}
          currentValueText={`${100 + hpLvl * 25} HP`}
          nextValueText="+25 HP"
          icon={<Heart className="w-5 h-5 text-red-500 fill-red-500" />}
          cost={hpCost}
          canAfford={playerStats.coins >= hpCost}
          onUpgrade={() => onUpgradePlayerStat('hpLvl')}
        />

        {/* Velocidade de Movimento */}
        <UpgradeCard
          title="Velocidade de Movimento"
          description="Aumenta a velocidade de deslocamento do herói pela base."
          currentLevel={speedLvl}
          currentValueText={`${(7.0 + speedLvl * 0.6).toFixed(1)} m/s`}
          nextValueText="+8% vel"
          icon={<Zap className="w-5 h-5 text-cyan-400" />}
          cost={speedCost}
          canAfford={playerStats.coins >= speedCost}
          onUpgrade={() => onUpgradePlayerStat('speedLvl')}
        />

        {/* Ímã de Moedas & Cristais */}
        <UpgradeCard
          title="Ímã de Recursos"
          description="Amplia o raio de atração magnética de moedas e cristais."
          currentLevel={magnetLvl}
          currentValueText={`${(4.5 + magnetLvl * 1.2).toFixed(1)} metros`}
          nextValueText="+1.2m alcance"
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
          cost={magnetCost}
          canAfford={playerStats.coins >= magnetCost}
          onUpgrade={() => onUpgradePlayerStat('magnetLvl')}
        />

        {/* Precisão Crítica */}
        <UpgradeCard
          title="Precisão Crítica"
          description="Aumenta a chance de causar dano crítico devastador (+80% dano)."
          currentLevel={critLvl}
          currentValueText={`${15 + critLvl * 4}% chance`}
          nextValueText="+4% crit"
          icon={<Crosshair className="w-5 h-5 text-red-400" />}
          cost={critCost}
          canAfford={playerStats.coins >= critCost}
          onUpgrade={() => onUpgradePlayerStat('critLvl')}
        />

        {/* Armadura de Defesa */}
        <UpgradeCard
          title="Armadura Tática"
          description="Reduz o dano sofrido por colisões com os monstros."
          currentLevel={defenseLvl}
          currentValueText={`${defenseLvl * 5}% redução`}
          nextValueText="+5% defesa"
          icon={<Shield className="w-5 h-5 text-blue-400" />}
          cost={defenseCost}
          canAfford={playerStats.coins >= defenseCost}
          onUpgrade={() => onUpgradePlayerStat('defenseLvl')}
        />
      </div>
    </div>
  );
};
