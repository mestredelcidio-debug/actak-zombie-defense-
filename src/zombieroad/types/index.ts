export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY' | 'SHOP' | 'CHARACTERS' | 'SETTINGS';

export type BiomeType = 'highway' | 'city' | 'suburbs' | 'forest' | 'industrial';

export interface BiomeConfig {
  id: BiomeType;
  name: string;
  subtitle: string;
  skyColor: number;
  fogColor: number;
  groundColor: number;
  roadColor: number;
  lightColor: number;
  ambientColor: number;
  lightIntensity: number;
  description: string;
}

export type CharacterId = 'survivor' | 'soldier' | 'hunter' | 'medic' | 'mercenary';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  perk: string;
  unlockCost: number;
  maxHearts: number;
  speedMultiplier: number;
  jumpForceMultiplier: number;
  damageMultiplier: number;
  jacketColor: number;
  pantsColor: number;
  hairColor: number;
  backpackColor: number;
}

export type WeaponId = 'pistol' | 'smg' | 'shotgun' | 'rifle' | 'plasma';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  type: string;
  description: string;
  damage: number;
  fireRate: number; // shots per second
  pellets: number;
  spread: number;
  bulletSpeed: number;
  range: number;
  unlockCost: number;
  color: number;
  recoil: number;
}

export type ZombieType = 'common' | 'runner' | 'jumper' | 'crawler' | 'brute' | 'boss_mutant';

export interface ZombieDef {
  type: ZombieType;
  name: string;
  maxHp: number;
  speed: number;
  damage: number;
  score: number;
  coinReward: number;
  width: number;
  height: number;
  color: number;
  isBoss?: boolean;
}

export type ObstacleType = 'rock' | 'car_wreck' | 'bus_wreck' | 'barrel' | 'crate' | 'fence' | 'hole';

export interface ObstacleDef {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  jumpable: boolean;
  destructible: boolean;
  hp?: number;
}

export interface CoinItem {
  id: string;
  x: number;
  y: number;
  value: number;
  collected: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  rangeRemaining: number;
  color: number;
  isPlayerBullet: boolean;
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface PlayerStats {
  coins: number;
  totalDistance: number;
  bestDistance: number;
  zombiesKilled: number;
  selectedCharacter: CharacterId;
  selectedWeapon: WeaponId;
  unlockedCharacters: Record<CharacterId, boolean>;
  unlockedWeapons: Record<WeaponId, boolean>;
  weaponUpgrades: Record<WeaponId, { damageLvl: number; fireRateLvl: number }>;
  healthUpgradeLvl: number;
  coinMagnetLvl: number;
  currentBiome: BiomeType;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface RunSummary {
  distance: number;
  zombiesKilled: number;
  coinsCollected: number;
  timeSurvived: number;
  damageTaken: number;
  newRecord: boolean;
  biomeCompleted?: boolean;
}
