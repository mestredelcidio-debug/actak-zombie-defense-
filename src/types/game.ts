/**
 * Sector Quarantine: Breach & Clear
 * Core Game Data Types and Specifications
 */

export type GamePhase = 'DEFENSE' | 'CLEANUP' | 'VICTORY' | 'DEFEAT' | 'PAUSED';

export type GameMode = 'CAMPAIGN' | 'ENDLESS' | 'CLEANUP_CHALLENGE' | 'DAILY_CONTRACT';

export type ZombieType = 
  | 'SHAMBLER'    // Basic Walker
  | 'SPRINTER'    // Fast runner
  | 'BRUTE'       // Heavy tank
  | 'CRAWLER'     // Floor lurker
  | 'JUGGERNAUT'  // Armored
  | 'VOLATILE'    // Exploder
  | 'HOWLER'      // Screamer / buffer
  | 'STALKER';    // Ambush hunter

export type WeaponId = 
  | 'pistol'
  | 'revolver'
  | 'shotgun'
  | 'smg'
  | 'assault_rifle'
  | 'sniper'
  | 'crossbow'
  | 'launcher';

export interface WeaponStats {
  id: WeaponId;
  name: string;
  caliber: string;
  description: string;
  unlocked: boolean;
  cost: number;
  level: number;
  damage: number;
  fireRate: number; // rounds per second
  magazineSize: number;
  reloadTime: number; // in seconds
  accuracy: number; // 0 to 1 (1 = pinpoint)
  knockback: number; // impulse force
  critChance: number; // 0 to 1
  pelletCount?: number; // for shotgun
  isExplosive?: boolean;
  pierceCount?: number; // for sniper/crossbow
}

export interface WeaponUpgradeLevels {
  damage: number;
  magSize: number;
  reload: number;
  accuracy: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  x: number; // position along barricade line
  aimAngle: number; // in radians
  currentWeaponId: WeaponId;
  ammoInMag: number;
  reserveAmmo: number;
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  activeReloadSuccess: boolean;
}

export interface RagdollPart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  radius: number;
  type: 'head' | 'torso' | 'arm_l' | 'arm_r' | 'leg_l' | 'leg_r';
  isDecapitated?: boolean;
}

export interface Zombie {
  id: string;
  type: ZombieType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackCooldown: number;
  attackTimer: number;
  isDead: boolean;
  isFrenzied?: boolean;
  frenzyTimer?: number;
  armorHealth?: number; // For Juggernaut
  ragdoll?: RagdollPart[];
  // For cleanup phase
  isHidden?: boolean;
  hidingSpotId?: string;
  isAlerted?: boolean;
  searchDiscoveryProgress?: number;
}

export interface EnvironmentalObject {
  id: string;
  type: 'BARREL_EXPLOSIVE' | 'BREAKER_BOX' | 'BARRIER_CRATE' | 'SEARCH_DOOR' | 'SEARCH_LOCKER' | 'SEARCH_DESK';
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  isDestroyed: boolean;
  isActive?: boolean;
  cooldown?: number;
  // Cleanup phase specific
  isSearched?: boolean;
  hasHiddenZombie?: boolean;
  hiddenZombieType?: ZombieType;
  lootAwarded?: boolean;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  knockback: number;
  critChance: number;
  isExplosive: boolean;
  pierceRemaining: number;
  pelletIndex?: number;
  color?: string;
  trail: {x: number; y: number}[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'blood' | 'spark' | 'smoke' | 'fire' | 'shell' | 'debris' | 'shockwave';
  rotation?: number;
  vRot?: number;
}

export interface BloodDecal {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  splatterType: 'pool' | 'arc' | 'burst';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  isCrit?: boolean;
}

export interface MissionLocation {
  id: string;
  name: string;
  zoneCode: string;
  description: string;
  unlocked: boolean;
  starsEarned: number; // 0 to 3
  difficulty: 1 | 2 | 3 | 4 | 5;
  wavesCount: number;
  cleanupZombiesCount: number;
  rewardCoins: number;
  rewardScrap: number;
  environmentTheme: 'hospital' | 'warehouse' | 'apartments' | 'mall' | 'subway' | 'office' | 'school' | 'factory' | 'rural' | 'bunker';
  objectives: {
    text: string;
    completed: boolean;
    condition: 'finish' | 'barricade_hp_70' | 'headshots_5' | 'no_damage' | 'fast_cleanup';
  }[];
}

export interface PlayerProfile {
  coins: number;
  scrap: number;
  reputationLevel: number;
  totalKills: number;
  headshots: number;
  barricadesRepaired: number;
  missionsCompleted: number;
  endlessHighScoreWave: number;
  weapons: Record<WeaponId, {
    unlocked: boolean;
    level: number;
    upgrades: WeaponUpgradeLevels;
  }>;
  perks: {
    medicLevel: number;      // Max HP + regen
    engineerLevel: number;   // Barricade max HP + repair rate
    fastHandsLevel: number;  // Reload speed & active reload window
    scavengerLevel: number;  // Extra ammo drops & scrap multiplier
    sharpshooterLevel: number; // Headshot damage bonus
  };
  cosmeticOutfit: 'tactical_black' | 'hazmat_amber' | 'urban_camo' | 'ghost_recon';
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  autoFireEnabled: boolean;
  tutorialCompleted: boolean;
}
