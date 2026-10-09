import { CharacterId, PlayerStats, WeaponId } from '../types';

const STORAGE_KEY = 'zombie_road_save_v1';

const DEFAULT_STATS: PlayerStats = {
  coins: 100,
  totalDistance: 0,
  bestDistance: 0,
  zombiesKilled: 0,
  selectedCharacter: 'survivor',
  selectedWeapon: 'pistol',
  unlockedCharacters: {
    survivor: true,
    soldier: false,
    hunter: false,
    medic: false,
    mercenary: false,
  },
  unlockedWeapons: {
    pistol: true,
    smg: false,
    shotgun: false,
    rifle: false,
    plasma: false,
  },
  weaponUpgrades: {
    pistol: { damageLvl: 0, fireRateLvl: 0 },
    smg: { damageLvl: 0, fireRateLvl: 0 },
    shotgun: { damageLvl: 0, fireRateLvl: 0 },
    rifle: { damageLvl: 0, fireRateLvl: 0 },
    plasma: { damageLvl: 0, fireRateLvl: 0 },
  },
  healthUpgradeLvl: 0,
  coinMagnetLvl: 0,
  currentBiome: 'highway',
  soundEnabled: true,
  musicEnabled: true,
};

export function loadSavedPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      unlockedCharacters: { ...DEFAULT_STATS.unlockedCharacters, ...parsed.unlockedCharacters },
      unlockedWeapons: { ...DEFAULT_STATS.unlockedWeapons, ...parsed.unlockedWeapons },
      weaponUpgrades: { ...DEFAULT_STATS.weaponUpgrades, ...parsed.weaponUpgrades },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save Zombie Road stats:', err);
  }
}

export function resetPlayerStats(): PlayerStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return DEFAULT_STATS;
}
