import { CharacterDef, CharacterId } from '../types';

export const CHARACTERS_CATALOG: Record<CharacterId, CharacterDef> = {
  survivor: {
    id: 'survivor',
    name: 'Sobrevivente',
    title: 'O Resiliente',
    description: 'Equilibrado e veloz. Sobreviveu ao primeiro colapso graças à agilidade e determinação.',
    perk: 'Velocidade e pulo balanceados',
    unlockCost: 0,
    maxHearts: 3,
    speedMultiplier: 1.0,
    jumpForceMultiplier: 1.0,
    damageMultiplier: 1.0,
    jacketColor: 0x2563eb, // Vibrant blue survivor jacket
    pantsColor: 0x334155, // Dark slate cargo
    hairColor: 0x451a03,
    backpackColor: 0x92400e,
  },
  soldier: {
    id: 'soldier',
    name: 'Soldado',
    title: 'Ex-Forças Especiais',
    description: 'Treinado em combate tático. Possui armadura reforçada que concede mais resistência.',
    perk: '+1 Coração de Vida Máxima (4 ❤️)',
    unlockCost: 500,
    maxHearts: 4,
    speedMultiplier: 0.95,
    jumpForceMultiplier: 0.95,
    damageMultiplier: 1.15,
    jacketColor: 0x166534, // Tactical military olive
    pantsColor: 0x14532d,
    hairColor: 0x1e293b,
    backpackColor: 0x064e3b,
  },
  hunter: {
    id: 'hunter',
    name: 'Caçadora',
    title: 'Rastreadora Ágil',
    description: 'Extremamente ágil e silenciosa. Capaz de realizar saltos mais altos e se esquivar com facilidade.',
    perk: '+20% Altura do Pulo e Velocidade',
    unlockCost: 1200,
    maxHearts: 3,
    speedMultiplier: 1.18,
    jumpForceMultiplier: 1.22,
    damageMultiplier: 1.0,
    jacketColor: 0xd97706, // Amber leather jacket
    pantsColor: 0x1e293b,
    hairColor: 0x991b1b, // Auburn
    backpackColor: 0x78350f,
  },
  medic: {
    id: 'medic',
    name: 'Médico',
    title: 'Paramédico de Campo',
    description: 'Conhecimentos médicos de emergência. Aumenta o valor e atração de recursos coletados.',
    perk: 'Mais Moedas e Ímã de Coleta Maior',
    unlockCost: 2000,
    maxHearts: 3,
    speedMultiplier: 1.05,
    jumpForceMultiplier: 1.05,
    damageMultiplier: 1.0,
    jacketColor: 0xdc2626, // Red rescue jacket with white cross
    pantsColor: 0x475569,
    hairColor: 0xd97706,
    backpackColor: 0xffffff,
  },
  mercenary: {
    id: 'mercenary',
    name: 'Mercenário',
    title: 'Especialista em Armas',
    description: 'Letal com qualquer calibre. Disparos causam dano massivo e estraçalham grupos de zumbis.',
    perk: '+35% Dano em Todas as Armas',
    unlockCost: 3500,
    maxHearts: 3,
    speedMultiplier: 1.0,
    jumpForceMultiplier: 1.0,
    damageMultiplier: 1.35,
    jacketColor: 0x581c87, // Dark purple tactical trench
    pantsColor: 0x0f172a,
    hairColor: 0x0f172a,
    backpackColor: 0x3b0764,
  },
};
