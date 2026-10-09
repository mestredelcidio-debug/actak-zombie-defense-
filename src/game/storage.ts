import { PlayerStats } from './types';

const STORAGE_KEY = 'defesa_da_base_z_survival_v3';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  speed: 7.0,
  magnetRadius: 5.5,
  coins: 200,
  gems: 20,
  equippedWeapon: 'pistol',
  maxUnlockedLevel: 1,
  levelStars: { 1: 0 },
  unlockedWeapons: {
    pistol: true,
    shotgun: false,
    rifle: false,
    minigun: false,
    plasma: false,
    rocket: false,
  },
  weaponUpgrades: {
    pistol: { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 },
    shotgun: { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 },
    rifle: { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 },
    minigun: { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 },
    plasma: { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 },
    rocket: { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 },
  },
  playerUpgrades: {
    hpLvl: 0,
    speedLvl: 0,
    magnetLvl: 0,
    critLvl: 0,
    defenseLvl: 0,
  },
  unlockedZones: {},
  hiredGuardsCount: 0,
  builtTurretsCount: 0,
  currentWave: 1,
  totalZombiesKilled: 0,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
  },
};

export function loadSavedPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PLAYER_STATS,
        ...parsed,
        unlockedWeapons: {
          ...DEFAULT_PLAYER_STATS.unlockedWeapons,
          ...(parsed.unlockedWeapons || {}),
        },
        weaponUpgrades: {
          ...DEFAULT_PLAYER_STATS.weaponUpgrades,
          ...(parsed.weaponUpgrades || {}),
        },
        playerUpgrades: {
          ...DEFAULT_PLAYER_STATS.playerUpgrades,
          ...(parsed.playerUpgrades || {}),
        },
        unlockedZones: {
          ...DEFAULT_PLAYER_STATS.unlockedZones,
          ...(parsed.unlockedZones || {}),
        },
        settings: {
          ...DEFAULT_PLAYER_STATS.settings,
          ...(parsed.settings || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Erro ao carregar dados salvos:', err);
  }
  return { ...DEFAULT_PLAYER_STATS };
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Erro ao salvar dados do jogador:', err);
  }
}

export function resetPlayerStats(): PlayerStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_PLAYER_STATS };
}
