import { ZombieDef, ZombieType } from '../types';

export const ZOMBIES_CATALOG: Record<ZombieType, ZombieDef> = {
  common: {
    type: 'common',
    name: 'Zumbi Comum',
    maxHp: 24,
    speed: 1.8,
    damage: 1, // 1 coração de dano
    score: 50,
    coinReward: 2,
    width: 0.8,
    height: 1.8,
    color: 0x4ade80, // Classic toxic green
  },
  runner: {
    type: 'runner',
    name: 'Zumbi Corredor',
    maxHp: 18,
    speed: 4.8, // Muito rápido
    damage: 1,
    score: 100,
    coinReward: 4,
    width: 0.7,
    height: 1.7,
    color: 0x22c55e,
  },
  jumper: {
    type: 'jumper',
    name: 'Zumbi Saltador',
    maxHp: 28,
    speed: 2.8,
    damage: 1,
    score: 140,
    coinReward: 6,
    width: 0.8,
    height: 1.8,
    color: 0xa855f7, // Purple mutant
  },
  crawler: {
    type: 'crawler',
    name: 'Zumbi Rastejante',
    maxHp: 16,
    speed: 2.2,
    damage: 1,
    score: 80,
    coinReward: 3,
    width: 1.2,
    height: 0.7, // Baixo no chão
    color: 0x84cc16,
  },
  brute: {
    type: 'brute',
    name: 'Zumbi Brutamontes',
    maxHp: 120, // Resistente
    speed: 1.2,
    damage: 1,
    score: 300,
    coinReward: 15,
    width: 1.4,
    height: 2.4, // Gigante
    color: 0x15803d, // Dark armored green
  },
  boss_mutant: {
    type: 'boss_mutant',
    name: 'O Mutante Gigante',
    maxHp: 450, // Mini-chefe
    speed: 1.6,
    damage: 2, // 2 corações de dano!
    score: 1000,
    coinReward: 60,
    width: 2.2,
    height: 3.4,
    color: 0x991b1b, // Crimson mutant colossus
    isBoss: true,
  },
};
