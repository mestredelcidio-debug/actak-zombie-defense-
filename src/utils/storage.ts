/**
 * Sector Quarantine: Breach & Clear
 * Game Data, Weapons Catalog, Missions, and Persistence Storage
 */

import { MissionLocation, PlayerProfile, WeaponId, WeaponStats } from '../types/game';

export const WEAPONS_CATALOG: Record<WeaponId, WeaponStats> = {
  pistol: {
    id: 'pistol',
    name: 'Model-9 "Vanguard"',
    caliber: '9x19mm Parabellum',
    description: 'Standard issue tactical sidearm. High accuracy, rapid recovery, and lightning-fast reload speed.',
    unlocked: true,
    cost: 0,
    level: 1,
    damage: 26,
    fireRate: 4.5,
    magazineSize: 12,
    reloadTime: 1.1,
    accuracy: 0.94,
    knockback: 35,
    critChance: 0.18,
  },
  revolver: {
    id: 'revolver',
    name: 'Colt .44 "Equalizer"',
    caliber: '.44 Magnum',
    description: 'Heavy steel hand cannon. Punishing kinetic knockback that staggers heavy zombies and decapitates on headshots.',
    unlocked: true,
    cost: 350,
    level: 1,
    damage: 75,
    fireRate: 1.8,
    magazineSize: 6,
    reloadTime: 1.8,
    accuracy: 0.92,
    knockback: 90,
    critChance: 0.35,
  },
  shotgun: {
    id: 'shotgun',
    name: 'Scatter-12 "Breacher"',
    caliber: '12-Gauge 00 Buck',
    description: 'Pump-action trench defense shotgun. Fires 8 high-velocity pellets that obliterate crowds and launch ragdolls.',
    unlocked: false,
    cost: 650,
    level: 1,
    damage: 18, // 18 x 8 = 144 max point blank
    pelletCount: 8,
    fireRate: 1.2,
    magazineSize: 6,
    reloadTime: 2.1,
    accuracy: 0.72,
    knockback: 120,
    critChance: 0.15,
  },
  smg: {
    id: 'smg',
    name: 'Vector-X "Stinger"',
    caliber: '.45 ACP Compact',
    description: 'Extreme rate of fire submachine gun. Melts incoming sprinters and swarms in split seconds.',
    unlocked: false,
    cost: 1100,
    level: 1,
    damage: 20,
    fireRate: 12.0,
    magazineSize: 32,
    reloadTime: 1.4,
    accuracy: 0.82,
    knockback: 25,
    critChance: 0.12,
  },
  assault_rifle: {
    id: 'assault_rifle',
    name: 'ARC-76 "Peacekeeper"',
    caliber: '5.56x45mm NATO',
    description: 'Military assault rifle with balanced DPS, excellent effective range, and light armor penetration.',
    unlocked: false,
    cost: 1800,
    level: 1,
    damage: 38,
    fireRate: 7.5,
    magazineSize: 30,
    reloadTime: 1.6,
    accuracy: 0.88,
    knockback: 45,
    critChance: 0.22,
    pierceCount: 1,
  },
  sniper: {
    id: 'sniper',
    name: 'Valkyrie .50 "Widowmaker"',
    caliber: '.50 BMG Anti-Material',
    description: 'Devastating heavy bolt-action rifle. Pierces through multiple enemies and guarantees decapitation on headshots.',
    unlocked: false,
    cost: 2600,
    level: 1,
    damage: 190,
    fireRate: 0.9,
    magazineSize: 5,
    reloadTime: 2.4,
    accuracy: 0.99,
    knockback: 160,
    critChance: 0.50,
    pierceCount: 3,
  },
  crossbow: {
    id: 'crossbow',
    name: 'Phantom Rebar Bolter',
    caliber: 'Hardened Steel Bolts',
    description: 'Silent hunting crossbow. High penetration, silent discharge that avoids alerting surrounding rooms during cleanup.',
    unlocked: false,
    cost: 1400,
    level: 1,
    damage: 95,
    fireRate: 1.5,
    magazineSize: 4,
    reloadTime: 1.5,
    accuracy: 0.96,
    knockback: 70,
    critChance: 0.40,
    pierceCount: 2,
  },
  launcher: {
    id: 'launcher',
    name: 'Thumper M79 "Oblivion"',
    caliber: '40mm High Explosive',
    description: 'Break-action grenade launcher. Catastrophic blast radius sending waves of zombies ragdolling across walls.',
    unlocked: false,
    cost: 3500,
    level: 1,
    damage: 220,
    isExplosive: true,
    fireRate: 0.7,
    magazineSize: 1,
    reloadTime: 2.2,
    accuracy: 0.85,
    knockback: 220,
    critChance: 0.25,
  },
};

export const INITIAL_LOCATIONS: MissionLocation[] = [
  {
    id: 'loc_apartments',
    name: 'Oakcrest Apartment Block',
    zoneCode: 'SEC-01',
    description: 'Breached residential corridor. Clear infected residents and sweep apartment doors for barricaded lurkers.',
    unlocked: true,
    starsEarned: 0,
    difficulty: 1,
    wavesCount: 3,
    cleanupZombiesCount: 3,
    rewardCoins: 250,
    rewardScrap: 30,
    environmentTheme: 'apartments',
    objectives: [
      { text: 'Clear all 3 defense waves and cleanup sweep', completed: false, condition: 'finish' },
      { text: 'Preserve Barricade HP above 70%', completed: false, condition: 'barricade_hp_70' },
      { text: 'Score at least 5 Headshots', completed: false, condition: 'headshots_5' },
    ],
  },
  {
    id: 'loc_hospital',
    name: 'Mercy General Hospital',
    zoneCode: 'SEC-02',
    description: 'ICU ward and emergency triage. High concentration of agile infected medical staff and heavy crawlers.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 2,
    wavesCount: 4,
    cleanupZombiesCount: 4,
    rewardCoins: 400,
    rewardScrap: 50,
    environmentTheme: 'hospital',
    objectives: [
      { text: 'Survive and clear ICU triage corridor', completed: false, condition: 'finish' },
      { text: 'Score at least 8 Headshots', completed: false, condition: 'headshots_5' },
      { text: 'Complete Cleanup Phase under 40 seconds', completed: false, condition: 'fast_cleanup' },
    ],
  },
  {
    id: 'loc_warehouse',
    name: 'North Docks Cold Storage',
    zoneCode: 'SEC-03',
    description: 'Industrial freezing facility. Tight shipping container choke points and explosive coolant canisters.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 2,
    wavesCount: 4,
    cleanupZombiesCount: 4,
    rewardCoins: 550,
    rewardScrap: 70,
    environmentTheme: 'warehouse',
    objectives: [
      { text: 'Defend refrigerated loading bay', completed: false, condition: 'finish' },
      { text: 'Preserve Barricade HP above 75%', completed: false, condition: 'barricade_hp_70' },
      { text: 'Take no direct player damage', completed: false, condition: 'no_damage' },
    ],
  },
  {
    id: 'loc_mall',
    name: 'Metro Central Shopping Mall',
    zoneCode: 'SEC-04',
    description: 'Wide multi-story concourse. Multiple breached storefronts allow fast sprinters to swarm your flanks.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 3,
    wavesCount: 5,
    cleanupZombiesCount: 5,
    rewardCoins: 750,
    rewardScrap: 95,
    environmentTheme: 'mall',
    objectives: [
      { text: 'Clear central atrium concourse', completed: false, condition: 'finish' },
      { text: 'Score at least 12 Headshots', completed: false, condition: 'headshots_5' },
      { text: 'Preserve Barricade HP above 70%', completed: false, condition: 'barricade_hp_70' },
    ],
  },
  {
    id: 'loc_subway',
    name: 'Sub-Transit Station 4',
    zoneCode: 'SEC-05',
    description: 'Underground metro terminal. Pitch dark railway tunnels bring armors and lurking exploders.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 3,
    wavesCount: 5,
    cleanupZombiesCount: 5,
    rewardCoins: 900,
    rewardScrap: 120,
    environmentTheme: 'subway',
    objectives: [
      { text: 'Hold the turnstile gate line', completed: false, condition: 'finish' },
      { text: 'Complete Cleanup Phase under 35 seconds', completed: false, condition: 'fast_cleanup' },
      { text: 'Score at least 10 Headshots', completed: false, condition: 'headshots_5' },
    ],
  },
  {
    id: 'loc_offices',
    name: 'Apex Executive Plaza',
    zoneCode: 'SEC-06',
    description: 'Shattered cubicle floor with high-voltage junction boxes and volatile corporate survivors.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 4,
    wavesCount: 5,
    cleanupZombiesCount: 6,
    rewardCoins: 1100,
    rewardScrap: 140,
    environmentTheme: 'office',
    objectives: [
      { text: 'Purge the 42nd executive floor', completed: false, condition: 'finish' },
      { text: 'Preserve Barricade HP above 80%', completed: false, condition: 'barricade_hp_70' },
      { text: 'Score at least 15 Headshots', completed: false, condition: 'headshots_5' },
    ],
  },
  {
    id: 'loc_school',
    name: 'Lincoln District High School',
    zoneCode: 'SEC-07',
    description: 'Gymnasium and main hallway. Howlers and sprinters echoing through locker-lined corridors.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 4,
    wavesCount: 6,
    cleanupZombiesCount: 6,
    rewardCoins: 1350,
    rewardScrap: 165,
    environmentTheme: 'school',
    objectives: [
      { text: 'Sweep and secure the academic wing', completed: false, condition: 'finish' },
      { text: 'Take no direct player damage', completed: false, condition: 'no_damage' },
      { text: 'Score at least 14 Headshots', completed: false, condition: 'headshots_5' },
    ],
  },
  {
    id: 'loc_factory',
    name: 'Foundry Heavy Industry',
    zoneCode: 'SEC-08',
    description: 'Catwalks, metal slag, and roaring furnaces. Heavily armored workers and toxic exploders.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 5,
    wavesCount: 6,
    cleanupZombiesCount: 7,
    rewardCoins: 1600,
    rewardScrap: 200,
    environmentTheme: 'factory',
    objectives: [
      { text: 'Hold the blast door perimeter', completed: false, condition: 'finish' },
      { text: 'Preserve Barricade HP above 75%', completed: false, condition: 'barricade_hp_70' },
      { text: 'Score at least 18 Headshots', completed: false, condition: 'headshots_5' },
    ],
  },
  {
    id: 'loc_rural',
    name: 'Pine Ridge Farmhouse',
    zoneCode: 'SEC-09',
    description: 'Isolated compound on the quarantine perimeter. Fast hunters prowling the timber barn.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 5,
    wavesCount: 7,
    cleanupZombiesCount: 7,
    rewardCoins: 1900,
    rewardScrap: 240,
    environmentTheme: 'rural',
    objectives: [
      { text: 'Repel the perimeter horde', completed: false, condition: 'finish' },
      { text: 'Complete Cleanup Phase under 30 seconds', completed: false, condition: 'fast_cleanup' },
      { text: 'Score at least 20 Headshots', completed: false, condition: 'headshots_5' },
    ],
  },
  {
    id: 'loc_bunker',
    name: 'Bio-Hazard Containment Bunker',
    zoneCode: 'SEC-10',
    description: 'Deep subterranean research facility. Origin ground zero with relentless elite mutations.',
    unlocked: false,
    starsEarned: 0,
    difficulty: 5,
    wavesCount: 8,
    cleanupZombiesCount: 8,
    rewardCoins: 2500,
    rewardScrap: 350,
    environmentTheme: 'bunker',
    objectives: [
      { text: 'Seal the subterranean core breach', completed: false, condition: 'finish' },
      { text: 'Preserve Barricade HP above 80%', completed: false, condition: 'barricade_hp_70' },
      { text: 'Score at least 25 Headshots', completed: false, condition: 'headshots_5' },
    ],
  },
];

const DEFAULT_PROFILE: PlayerProfile = {
  coins: 450,
  scrap: 60,
  reputationLevel: 1,
  totalKills: 0,
  headshots: 0,
  barricadesRepaired: 0,
  missionsCompleted: 0,
  endlessHighScoreWave: 0,
  weapons: {
    pistol: { unlocked: true, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
    revolver: { unlocked: false, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
    shotgun: { unlocked: false, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
    smg: { unlocked: false, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
    assault_rifle: { unlocked: false, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
    sniper: { unlocked: false, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
    crossbow: { unlocked: false, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
    launcher: { unlocked: false, level: 1, upgrades: { damage: 0, magSize: 0, reload: 0, accuracy: 0 } },
  },
  perks: {
    medicLevel: 0,
    engineerLevel: 0,
    fastHandsLevel: 0,
    scavengerLevel: 0,
    sharpshooterLevel: 0,
  },
  cosmeticOutfit: 'tactical_black',
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  autoFireEnabled: false,
  tutorialCompleted: false,
};

const STORAGE_KEY_PROFILE = 'sq_player_profile_v1';
const STORAGE_KEY_LOCATIONS = 'sq_locations_v1';

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {
    // ignore parse error
  }
  return { ...DEFAULT_PROFILE };
}

export function savePlayerProfile(profile: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {
    // quota error
  }
}

export function loadLocations(): MissionLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch {
    // ignore
  }
  return [...INITIAL_LOCATIONS];
}

export function saveLocations(locations: MissionLocation[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
  } catch {
    // quota
  }
}

export function resetGameProgress(): { profile: PlayerProfile; locations: MissionLocation[] } {
  localStorage.removeItem(STORAGE_KEY_PROFILE);
  localStorage.removeItem(STORAGE_KEY_LOCATIONS);
  return { profile: { ...DEFAULT_PROFILE }, locations: [...INITIAL_LOCATIONS] };
}

/**
 * Calculates effective weapon stats factoring in upgrade tiers
 */
export function getCalculatedWeaponStats(id: WeaponId, profile: PlayerProfile): WeaponStats {
  const base = { ...WEAPONS_CATALOG[id] };
  const userWeapon = profile.weapons[id];
  const unlocked = userWeapon ? userWeapon.unlocked : base.unlocked;

  if (!userWeapon) return { ...base, unlocked };

  const { damage, magSize, reload, accuracy } = userWeapon.upgrades;
  // +18% damage per level
  const effectiveDamage = Math.round(base.damage * (1 + damage * 0.18));
  // +2 mag size per level (or +1 for low mag)
  const effectiveMag = base.magazineSize + magSize * (base.magazineSize > 10 ? 4 : 1);
  // -12% reload time per level
  const effectiveReload = Math.max(0.5, Number((base.reloadTime * (1 - reload * 0.12)).toFixed(2)));
  // +0.03 accuracy
  const effectiveAccuracy = Math.min(0.99, Number((base.accuracy + accuracy * 0.03).toFixed(2)));
  // Perk bonuses
  const perkReloadBoost = 1 - profile.perks.fastHandsLevel * 0.08;

  return {
    ...base,
    unlocked,
    level: 1 + Math.floor((damage + magSize + reload + accuracy) / 4),
    damage: effectiveDamage,
    magazineSize: effectiveMag,
    reloadTime: Math.max(0.4, Number((effectiveReload * perkReloadBoost).toFixed(2))),
    accuracy: effectiveAccuracy,
  };
}

/**
 * Cost calculation for weapon upgrades
 */
export function getUpgradeCost(currentLevel: number): { coins: number; scrap: number } {
  const coins = 120 + currentLevel * 140;
  const scrap = 15 + currentLevel * 20;
  return { coins, scrap };
}

/**
 * Perk cost calculation
 */
export function getPerkCost(currentLevel: number): { coins: number; scrap: number } {
  const coins = 200 + currentLevel * 250;
  const scrap = 25 + currentLevel * 30;
  return { coins, scrap };
}
