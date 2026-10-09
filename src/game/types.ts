export type GameState = 
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'DEFEAT'
  | 'WEAPONS'
  | 'UPGRADES';

export type WeaponId = 'pistol' | 'shotgun' | 'rifle' | 'minigun' | 'plasma' | 'rocket';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  type: string;
  description: string;
  damage: number;
  fireRate: number; // shots per second
  range: number;
  pellets: number; // 1 for single, 5 for shotgun
  bulletSpeed: number;
  critChance: number;
  unlockCost: number; // in coins / cash
  unlockGems: number;
  maxLevel: number;
  level?: number;
  color: number;
}

export type BuyZoneType = 
  | 'UNLOCK_GATE_NORTH'
  | 'UNLOCK_GATE_WEST'
  | 'UNLOCK_GATE_EAST'
  | 'BUILD_TURRET_1'
  | 'BUILD_TURRET_2'
  | 'BUILD_TURRET_3'
  | 'RECRUIT_GUARD_1'
  | 'RECRUIT_GUARD_2'
  | 'UPGRADE_WEAPONS'
  | 'UPGRADE_HEALTH'
  | 'EXPAND_PERIMETER';

export interface BuyZoneDef {
  id: BuyZoneType;
  title: string;
  subtitle: string;
  cost: number;
  currentPaid: number;
  x: number;
  z: number;
  radius: number;
  isUnlocked: boolean;
  category: 'gate' | 'turret' | 'guard' | 'upgrade' | 'expansion';
  icon: string;
  color: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  speed: number;
  magnetRadius: number;
  coins: number;
  gems: number;
  money?: number;
  diamonds?: number;
  equippedWeapon: WeaponId;
  maxUnlockedLevel: number;
  levelStars: Record<number, number>;
  unlockedWeapons: Record<WeaponId, boolean>;
  weaponUpgrades: Record<WeaponId, {
    damageLvl: number;
    fireRateLvl: number;
    rangeLvl: number;
  }>;
  playerUpgrades: {
    hpLvl: number;
    speedLvl: number;
    magnetLvl: number;
    critLvl: number;
    defenseLvl: number;
  };
  unlockedZones: Record<string, boolean>;
  hiredGuardsCount: number;
  builtTurretsCount: number;
  currentWave: number;
  totalZombiesKilled: number;
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    hapticsEnabled: boolean;
  };
}

export type ZombieType = 
  | 'green_walker' 
  | 'green_runner' 
  | 'green_tank' 
  | 'green_spitter' 
  | 'green_boss'
  | 'green_slime'
  | 'black_slime'
  | 'red_spitter'
  | 'armored_slime'
  | 'giant_boss'
  | 'dark_lord_boss';

export interface LevelConfig {
  level: number;
  name: string;
  subtitle: string;
  description: string;
  totalEnemies: number;
  waves: number;
  hasBoss: boolean;
  bossType?: string;
  bossName?: string;
  enemyComposition: {
    greenSlimes: number;
    blackSlimes: number;
    redSpitters: number;
    armoredSlimes: number;
    mutantCrawlers: number;
  };
  coinReward: number;
  gemReward: number;
  environmentVariant: string;
  recommendedPower: number;
}

export interface FloatingTextData {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  isCrit?: boolean;
}
