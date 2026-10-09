import * as THREE from 'three';
import { GameScene } from './GameScene';
import { BlueGuardEntity, DropEntity, EnemyEntity, MerchantEntity, PlayerEntity, ProjectileEntity, TurretEntity } from './Entities';
import { BuyZoneDef, GameState, LevelConfig, PlayerStats, WeaponDef, WeaponId, ZombieType } from './types';
import { LEVEL_CONFIGS } from './levels';
import { loadSavedPlayerStats, savePlayerStats, resetPlayerStats } from './storage';
import { BuyZoneManager } from './BuyZones';
import { sound } from './Audio';

export const WEAPON_CATALOG: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: 'pistol',
    name: 'Pistola Tática 9mm',
    type: 'Pistola Básica',
    description: 'Arma leve e confiável para sobrevivência inicial. Elimina zumbis com 1 disparo nas primeiras hordas!',
    damage: 22,
    fireRate: 3.5,
    range: 14,
    pellets: 1,
    bulletSpeed: 28,
    critChance: 0.15,
    unlockCost: 0,
    unlockGems: 0,
    maxLevel: 10,
    color: 0x90a4ae,
  },
  shotgun: {
    id: 'shotgun',
    name: 'Espingarda Caçadora',
    type: 'Espingarda de Dispersão',
    description: 'Dispara 5 projéteis em leque devastando hordas inteiras de zumbis à queima-roupa no gargalo do portão.',
    damage: 18,
    fireRate: 1.8,
    range: 12,
    pellets: 5,
    bulletSpeed: 25,
    critChance: 0.2,
    unlockCost: 150,
    unlockGems: 3,
    maxLevel: 10,
    color: 0xff9800,
  },
  rifle: {
    id: 'rifle',
    name: 'Fuzil AK-Pro',
    type: 'Fuzil de Assalto',
    description: 'Alta cadência de tiro e longo alcance para abater zumbis antes que cruzem a ponte e o portão.',
    damage: 32,
    fireRate: 6.8,
    range: 16,
    pellets: 1,
    bulletSpeed: 34,
    critChance: 0.25,
    unlockCost: 450,
    unlockGems: 10,
    maxLevel: 10,
    color: 0x4caf50,
  },
  minigun: {
    id: 'minigun',
    name: 'Minigun Giratória',
    type: 'Metralhadora Pesada',
    description: 'Chuva incessante de projéteis giratórios. Desintegra qualquer horda em segundos.',
    damage: 26,
    fireRate: 12.0,
    range: 15,
    pellets: 1,
    bulletSpeed: 36,
    critChance: 0.18,
    unlockCost: 1000,
    unlockGems: 25,
    maxLevel: 10,
    color: 0x00e5ff,
  },
  plasma: {
    id: 'plasma',
    name: 'Canhão de Plasma',
    type: 'Arma de Energia',
    description: 'Esferas de plasma concentrado que causam dano em área a múltiplos monstros.',
    damage: 75,
    fireRate: 2.2,
    range: 14,
    pellets: 1,
    bulletSpeed: 22,
    critChance: 0.35,
    unlockCost: 2000,
    unlockGems: 40,
    maxLevel: 10,
    color: 0xe040fb,
  },
  rocket: {
    id: 'rocket',
    name: 'Lança-Mísseis RPG',
    type: 'Explosivo Pesado',
    description: 'Foguetes de alto impacto feitos sob medida para exterminar chefões gigantes.',
    damage: 200,
    fireRate: 1.1,
    range: 18,
    pellets: 1,
    bulletSpeed: 18,
    critChance: 0.4,
    unlockCost: 3500,
    unlockGems: 60,
    maxLevel: 10,
    color: 0xff1744,
  },
};

export class GameEngine {
  public scene: GameScene;
  public player: PlayerEntity;
  public merchant: MerchantEntity;
  public enemies: EnemyEntity[] = [];
  public projectiles: ProjectileEntity[] = [];
  public drops: DropEntity[] = [];
  public guards: BlueGuardEntity[] = [];
  public turrets: TurretEntity[] = [];
  public buyZones: BuyZoneManager;

  public state: GameState = 'PLAYING';
  public isInvasionActive: boolean = false;
  public currentLevel: number = 1;
  public playerStats: PlayerStats;

  // Wave & level counters
  public levelEnemiesSpawned: number = 0;
  public levelEnemiesDefeated: number = 0;
  public totalLevelEnemies: number = 10;
  public activeBoss: EnemyEntity | null = null;
  public starsEarnedThisRun: number = 1;

  // Timers & Input
  public moveVector: THREE.Vector2 = new THREE.Vector2(0, 0);
  private shootTimer: number = 0;
  private spawnTimer: number = 0;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Callbacks to UI
  public onStateChange: (state: GameState) => void = () => {};
  public onStatsUpdate: (stats: PlayerStats) => void = () => {};
  public onProgressUpdate: (defeated: number, total: number, bossHpRatio?: number) => void = () => {};
  public onDamageFlash: () => void = () => {};
  public onMerchantProximity: (isNear: boolean) => void = () => {};

  constructor(scene: GameScene) {
    this.scene = scene;
    this.player = new PlayerEntity();
    this.player.mesh.position.set(0, 0, 3);
    this.scene.scene.add(this.player.mesh);

    // 3D Weapons Merchant NPC inside the base
    this.merchant = new MerchantEntity(-7.0, 4.0);
    this.scene.scene.add(this.merchant.mesh);

    // Initial player stats & persistence
    this.playerStats = loadSavedPlayerStats();
    this.currentLevel = this.playerStats.maxUnlockedLevel || 1;
    this.applyWeaponChange(this.playerStats.equippedWeapon);

    // Buy Zones Manager
    this.buyZones = new BuyZoneManager(this.playerStats.unlockedZones);
    this.buyZones.initMeshes(this.scene.scene);

    // Instantiate saved unlocked defenses
    this.initDefensesFromSavedState();

    this.initLevel(this.currentLevel, false);

    this.loop = this.loop.bind(this);
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private initDefensesFromSavedState() {
    if (this.playerStats.unlockedZones['BUILD_TURRET_1']) {
      this.spawnTurret(-3.8, -4.2, false);
    }
    if (this.playerStats.unlockedZones['BUILD_TURRET_2']) {
      this.spawnTurret(3.8, -4.2, false);
    }
    if (this.playerStats.unlockedZones['BUILD_TURRET_3']) {
      this.spawnTurret(0, 6.2, true);
    }
    if (this.playerStats.unlockedZones['RECRUIT_GUARD_1']) {
      this.spawnGuard(-1.6, -5.0);
    }
    if (this.playerStats.unlockedZones['RECRUIT_GUARD_2']) {
      this.spawnGuard(1.6, -5.0);
    }
    if (this.playerStats.unlockedZones['UNLOCK_GATE_NORTH']) {
      this.scene.openNorthGate();
    }
    if (this.playerStats.unlockedZones['EXPAND_PERIMETER']) {
      this.scene.expandBasePerimeter();
    }
  }

  public saveCurrentStats() {
    savePlayerStats(this.playerStats);
  }

  public initLevel(lvl: number, autoStart = false) {
    this.currentLevel = Math.max(1, Math.min(LEVEL_CONFIGS.length, lvl));
    const cfg = LEVEL_CONFIGS[this.currentLevel - 1] || LEVEL_CONFIGS[0];

    this.clearEnemiesAndDrops();
    this.player.mesh.position.set(0, 0, 3);
    this.playerStats.hp = this.getCalculatedMaxHp();
    this.levelEnemiesSpawned = 0;
    this.levelEnemiesDefeated = 0;
    this.totalLevelEnemies = cfg.totalEnemies + (cfg.hasBoss ? 1 : 0);
    this.activeBoss = null;
    this.starsEarnedThisRun = 1;
    this.isInvasionActive = autoStart;

    this.onStatsUpdate(this.playerStats);
    this.onProgressUpdate(0, this.totalLevelEnemies);
  }

  public startInvasion() {
    this.isInvasionActive = true;
    this.state = 'PLAYING';
    this.spawnTimer = 0.4;
    sound.playClick();
    this.onStateChange(this.state);
  }

  public startLevel() {
    this.startInvasion();
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.onStateChange(this.state);
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.onStateChange(this.state);
    }
  }

  public applyWeaponChange(weaponId: WeaponId) {
    this.playerStats.equippedWeapon = weaponId;
    this.player.rebuildGun(weaponId);
    this.saveCurrentStats();
    this.onStatsUpdate(this.playerStats);
  }

  public getCalculatedWeaponStats(weaponId: WeaponId): WeaponDef {
    const base = { ...WEAPON_CATALOG[weaponId] };
    const upg = this.playerStats.weaponUpgrades[weaponId] || { damageLvl: 0, fireRateLvl: 0, rangeLvl: 0 };
    return {
      ...base,
      damage: Math.round(base.damage * (1 + upg.damageLvl * 0.15)),
      fireRate: Number((base.fireRate * (1 + upg.fireRateLvl * 0.12)).toFixed(1)),
      range: Number((base.range * (1 + upg.rangeLvl * 0.1)).toFixed(1)),
      level: 1 + Math.floor((upg.damageLvl + upg.fireRateLvl + upg.rangeLvl) / 3),
    };
  }

  public getCalculatedMaxHp(): number {
    return 100 + this.playerStats.playerUpgrades.hpLvl * 25;
  }

  public getCalculatedSpeed(): number {
    return 7.0 + this.playerStats.playerUpgrades.speedLvl * 0.6;
  }

  public getCalculatedMagnet(): number {
    return 5.5 + this.playerStats.playerUpgrades.magnetLvl * 1.5;
  }

  public getCalculatedCritChance(weaponId: WeaponId): number {
    const baseCrit = WEAPON_CATALOG[weaponId].critChance;
    return baseCrit + (this.playerStats.playerUpgrades.critLvl || 0) * 0.04;
  }

  public getCalculatedDamageReduction(): number {
    return this.playerStats.playerUpgrades.defenseLvl * 0.05;
  }

  private loop(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.update(dt);
    this.scene.updateCamera(this.player.mesh.position);
    this.scene.update();
    this.scene.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private update(dt: number) {
    const elapsed = performance.now() * 0.001;

    // 1. Merchant animation & proximity check
    this.merchant.update(elapsed);
    const distToMerchant = this.player.mesh.position.distanceTo(this.merchant.position);
    this.onMerchantProximity(distToMerchant < 2.5);

    // 2. Buy Zones Walk-Over Interaction
    this.buyZones.updatePlayerInteraction(
      this.player.mesh.position.x,
      this.player.mesh.position.z,
      this.playerStats.coins,
      dt,
      (amount) => {
        this.playerStats.coins = Math.max(0, this.playerStats.coins - amount);
        this.onStatsUpdate(this.playerStats);
      },
      (zone) => {
        this.handleZoneUnlocked(zone);
      }
    );
    this.buyZones.animate(elapsed);

    // 3. Player Movement is ALWAYS active in the base!
    if (this.state !== 'PAUSED') {
      this.updatePlayerMovement(dt);
      this.updateDrops(dt);
    }

    // 4. Combat is active when invasion is ongoing
    if (this.state === 'PLAYING' && this.isInvasionActive) {
      this.updateAutoCombat(dt);
      this.updateGuards(dt);
      this.updateTurrets(dt);
      this.updateSpawning(dt);
      this.updateEnemies(dt);
      this.updateProjectiles(dt);
    } else {
      // Clean projectiles if any
      this.updateProjectiles(dt);
    }
  }

  private handleZoneUnlocked(zone: BuyZoneDef) {
    this.playerStats.unlockedZones[zone.id] = true;

    if (zone.id === 'BUILD_TURRET_1') {
      this.spawnTurret(-3.8, -4.2, false);
      this.playerStats.builtTurretsCount = (this.playerStats.builtTurretsCount || 0) + 1;
    } else if (zone.id === 'BUILD_TURRET_2') {
      this.spawnTurret(3.8, -4.2, false);
      this.playerStats.builtTurretsCount = (this.playerStats.builtTurretsCount || 0) + 1;
    } else if (zone.id === 'BUILD_TURRET_3') {
      this.spawnTurret(0, 6.2, true);
      this.playerStats.builtTurretsCount = (this.playerStats.builtTurretsCount || 0) + 1;
    } else if (zone.id === 'RECRUIT_GUARD_1') {
      this.spawnGuard(-1.6, -5.0);
      this.playerStats.hiredGuardsCount = (this.playerStats.hiredGuardsCount || 0) + 1;
    } else if (zone.id === 'RECRUIT_GUARD_2') {
      this.spawnGuard(1.6, -5.0);
      this.playerStats.hiredGuardsCount = (this.playerStats.hiredGuardsCount || 0) + 1;
    } else if (zone.id === 'UNLOCK_GATE_NORTH') {
      this.scene.openNorthGate();
    } else if (zone.id === 'EXPAND_PERIMETER') {
      this.scene.expandBasePerimeter();
    } else if (zone.id === 'UPGRADE_HEALTH') {
      this.playerStats.playerUpgrades.hpLvl += 1;
      this.playerStats.hp = this.getCalculatedMaxHp();
    } else if (zone.id === 'UPGRADE_WEAPONS') {
      const eq = this.playerStats.equippedWeapon;
      if (this.playerStats.weaponUpgrades[eq]) {
        this.playerStats.weaponUpgrades[eq].damageLvl += 1;
        this.playerStats.weaponUpgrades[eq].fireRateLvl += 1;
      }
    }

    this.saveCurrentStats();
    this.onStatsUpdate(this.playerStats);
  }

  private spawnGuard(x: number, z: number) {
    const guard = new BlueGuardEntity(x, z);
    this.guards.push(guard);
    this.scene.scene.add(guard.mesh);
  }

  private spawnTurret(x: number, z: number, isCannon = false) {
    const turret = new TurretEntity(x, z, isCannon);
    this.turrets.push(turret);
    this.scene.scene.add(turret.mesh);
  }

  private updateGuards(dt: number) {
    for (const guard of this.guards) {
      let closest: EnemyEntity | null = null;
      let minDist = guard.range;
      for (const e of this.enemies) {
        if (e.isDead) continue;
        const d = guard.mesh.position.distanceTo(e.mesh.position);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      }

      guard.update(dt, closest, (origin, dir, damage) => {
        sound.playGunshot('rifle');
        const proj = new ProjectileEntity(origin, dir, damage, 32, false, false);
        this.projectiles.push(proj);
        this.scene.scene.add(proj.mesh);
      });
    }
  }

  private updateTurrets(dt: number) {
    for (const turret of this.turrets) {
      let closest: EnemyEntity | null = null;
      let minDist = turret.range;
      for (const e of this.enemies) {
        if (e.isDead) continue;
        const d = turret.mesh.position.distanceTo(e.mesh.position);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      }

      turret.update(dt, closest, (origin, dir, damage, isCannon) => {
        sound.playGunshot(isCannon ? 'rocket' : 'minigun');
        const proj = new ProjectileEntity(origin, dir, damage, 34, false, isCannon);
        this.projectiles.push(proj);
        this.scene.scene.add(proj.mesh);
      });
    }
  }

  private updatePlayerMovement(dt: number) {
    const speed = this.getCalculatedSpeed();
    const isMoving = this.moveVector.lengthSq() > 0.01;
    this.player.isMoving = isMoving;

    if (isMoving) {
      const moveX = this.moveVector.x * speed * dt;
      const moveZ = this.moveVector.y * speed * dt;

      const bounds = this.scene.baseArea;
      this.player.mesh.position.x = Math.max(bounds.minX + 0.8, Math.min(bounds.maxX - 0.8, this.player.mesh.position.x + moveX));
      this.player.mesh.position.z = Math.max(bounds.minZ + 0.8, Math.min(bounds.maxZ - 0.8, this.player.mesh.position.z + moveZ));

      if (this.enemies.length === 0) {
        this.player.targetAngle = Math.atan2(this.moveVector.x, this.moveVector.y);
      }
    }

    this.player.update(dt);
  }

  private updateAutoCombat(dt: number) {
    const weapon = this.getCalculatedWeaponStats(this.playerStats.equippedWeapon);
    this.shootTimer -= dt;

    let closestEnemy: EnemyEntity | null = null;
    let minDist = weapon.range;

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const dist = this.player.mesh.position.distanceTo(enemy.mesh.position);
      if (dist < minDist) {
        minDist = dist;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      const dx = closestEnemy.mesh.position.x - this.player.mesh.position.x;
      const dz = closestEnemy.mesh.position.z - this.player.mesh.position.z;
      this.player.targetAngle = Math.atan2(dx, dz);

      if (this.shootTimer <= 0) {
        this.shootTimer = 1 / weapon.fireRate;
        this.fireWeapon(closestEnemy, weapon);
      }
    }
  }

  private fireWeapon(target: EnemyEntity, weapon: WeaponDef) {
    const origin = this.player.mesh.position.clone();
    origin.y = 1.05;

    const targetPos = target.mesh.position.clone();
    targetPos.y = 1.05;

    const baseDir = targetPos.clone().sub(origin).normalize();

    this.player.triggerMuzzleFlash();
    sound.playGunshot(weapon.id);

    const critChance = this.getCalculatedCritChance(weapon.id);
    const isCrit = Math.random() < critChance;
    const finalDamage = isCrit ? Math.round(weapon.damage * 1.8) : weapon.damage;
    const isExplosive = weapon.id === 'plasma' || weapon.id === 'rocket';

    if (weapon.pellets > 1) {
      const spreadAngle = 0.35;
      for (let i = 0; i < weapon.pellets; i++) {
        const angleOffset = (i - (weapon.pellets - 1) / 2) * (spreadAngle / (weapon.pellets - 1));
        const dir = baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angleOffset);
        const proj = new ProjectileEntity(origin, dir, finalDamage, weapon.bulletSpeed, isCrit, isExplosive);
        this.projectiles.push(proj);
        this.scene.scene.add(proj.mesh);
      }
    } else {
      const proj = new ProjectileEntity(origin, baseDir, finalDamage, weapon.bulletSpeed, isCrit, isExplosive);
      this.projectiles.push(proj);
      this.scene.scene.add(proj.mesh);
    }
  }

  private updateSpawning(dt: number) {
    const cfg = LEVEL_CONFIGS[this.currentLevel - 1] || LEVEL_CONFIGS[0];
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0 && this.levelEnemiesSpawned < cfg.totalEnemies) {
      this.spawnEnemy();
      this.spawnTimer = 1.2 + Math.random() * 0.6;
    }

    if (cfg.hasBoss && !this.activeBoss && this.levelEnemiesSpawned >= cfg.totalEnemies && this.enemies.length <= 2) {
      const bType = (cfg.bossType === 'dark_lord_boss' ? 'dark_lord_boss' : 'giant_boss') as 'giant_boss' | 'dark_lord_boss';
      this.spawnBoss(bType);
    }
  }

  private spawnEnemy() {
    const cfg = LEVEL_CONFIGS[this.currentLevel - 1] || LEVEL_CONFIGS[0];

    const types: ZombieType[] = ['green_walker'];
    if (cfg.enemyComposition.blackSlimes > 0) types.push('green_runner');
    if (cfg.enemyComposition.redSpitters > 0) types.push('green_spitter');
    if (cfg.enemyComposition.armoredSlimes > 0) types.push('green_tank');

    const type = types[Math.floor(Math.random() * types.length)];
    const enemy = new EnemyEntity(type, this.currentLevel);

    enemy.mesh.position.set(
      (Math.random() - 0.5) * 5.0,
      0,
      -12.0 - Math.random() * 4
    );

    this.enemies.push(enemy);
    this.scene.scene.add(enemy.mesh);
    this.levelEnemiesSpawned++;
  }

  private spawnBoss(bossType: 'giant_boss' | 'dark_lord_boss') {
    const boss = new EnemyEntity(bossType, this.currentLevel);
    boss.mesh.position.set(0, 0, -15);
    this.enemies.push(boss);
    this.scene.scene.add(boss.mesh);
    this.activeBoss = boss;
    sound.playBossRoar();
  }

  private updateEnemies(dt: number) {
    const defReduction = this.getCalculatedDamageReduction();

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player.mesh.position);

      const distToPlayer = enemy.mesh.position.distanceTo(this.player.mesh.position);
      if (distToPlayer < enemy.radius + 0.45) {
        const rawDamage = enemy.damage * dt * 2.5;
        const mitigated = Math.max(1, rawDamage * (1 - defReduction));
        this.playerStats.hp = Math.max(0, this.playerStats.hp - mitigated);
        this.onStatsUpdate(this.playerStats);
        this.onDamageFlash();

        if (this.playerStats.hp <= 0) {
          this.handleDefeat();
          return;
        }
      }

      if (enemy.isDead) {
        sound.playSlimeDeath();
        this.spawnDrops(enemy.mesh.position, enemy.rewardCoins, enemy.rewardGems);
        this.scene.scene.remove(enemy.mesh);
        this.enemies.splice(i, 1);

        this.levelEnemiesDefeated++;
        this.playerStats.totalZombiesKilled = (this.playerStats.totalZombiesKilled || 0) + 1;
        const bossRatio = this.activeBoss ? this.activeBoss.hp / this.activeBoss.maxHp : undefined;
        this.onProgressUpdate(this.levelEnemiesDefeated, this.totalLevelEnemies, bossRatio);

        if (this.levelEnemiesDefeated >= this.totalLevelEnemies) {
          this.handleVictory();
          return;
        }
      }
    }

    if (this.activeBoss) {
      const bossRatio = Math.max(0, this.activeBoss.hp / this.activeBoss.maxHp);
      this.onProgressUpdate(this.levelEnemiesDefeated, this.totalLevelEnemies, bossRatio);
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);

      let hit = false;
      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const dist = p.mesh.position.distanceTo(enemy.mesh.position);
        if (dist < enemy.radius + p.radius) {
          enemy.takeDamage(p.damage);
          sound.playSlimeHit();
          hit = true;

          if (p.isExplosive) {
            for (const other of this.enemies) {
              if (other !== enemy && !other.isDead) {
                const splashDist = p.mesh.position.distanceTo(other.mesh.position);
                if (splashDist < 3.2) {
                  other.takeDamage(Math.round(p.damage * 0.65));
                }
              }
            }
          }
          break;
        }
      }

      if (hit || p.life <= 0) {
        this.scene.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateDrops(dt: number) {
    const magnet = this.getCalculatedMagnet();
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      const collected = drop.update(dt, this.player.mesh.position, magnet);
      if (collected) {
        if (drop.type === 'coin') {
          this.playerStats.coins += drop.value;
          sound.playCoin();
        } else {
          this.playerStats.gems += drop.value;
          sound.playGem();
        }
        this.scene.scene.remove(drop.mesh);
        this.drops.splice(i, 1);
        this.onStatsUpdate(this.playerStats);
      }
    }
  }

  private spawnDrops(pos: THREE.Vector3, coins: number, gems: number) {
    const coinCount = Math.min(8, Math.max(1, Math.round(coins / 3)));
    for (let i = 0; i < coinCount; i++) {
      const drop = new DropEntity(pos, 'coin', Math.ceil(coins / coinCount));
      this.drops.push(drop);
      this.scene.scene.add(drop.mesh);
    }

    for (let i = 0; i < gems; i++) {
      const drop = new DropEntity(pos, 'gem', 1);
      this.drops.push(drop);
      this.scene.scene.add(drop.mesh);
    }
  }

  private handleVictory() {
    this.isInvasionActive = false;
    this.state = 'VICTORY';
    sound.playVictory();

    const maxHp = this.getCalculatedMaxHp();
    const hpRatio = this.playerStats.hp / maxHp;
    const stars = hpRatio >= 0.75 ? 3 : hpRatio >= 0.35 ? 2 : 1;
    this.starsEarnedThisRun = stars;

    const cfg = LEVEL_CONFIGS[this.currentLevel - 1] || LEVEL_CONFIGS[0];
    this.playerStats.coins += cfg.coinReward;
    this.playerStats.gems += cfg.gemReward;

    this.playerStats.levelStars[this.currentLevel] = Math.max(
      this.playerStats.levelStars[this.currentLevel] || 0,
      stars
    );

    if (this.currentLevel >= this.playerStats.maxUnlockedLevel && this.currentLevel < LEVEL_CONFIGS.length) {
      this.playerStats.maxUnlockedLevel = this.currentLevel + 1;
    }

    this.saveCurrentStats();
    this.onStatsUpdate(this.playerStats);
    this.onStateChange(this.state);
  }

  private handleDefeat() {
    this.isInvasionActive = false;
    this.state = 'DEFEAT';
    sound.playDefeat();
    this.onStateChange(this.state);
  }

  private clearEnemiesAndDrops() {
    this.enemies.forEach((e) => this.scene.scene.remove(e.mesh));
    this.enemies = [];

    this.projectiles.forEach((p) => this.scene.scene.remove(p.mesh));
    this.projectiles = [];

    this.drops.forEach((d) => this.scene.scene.remove(d.mesh));
    this.drops = [];
  }

  public resetAll() {
    this.playerStats = resetPlayerStats();
    this.currentLevel = 1;
    this.guards.forEach((g) => this.scene.scene.remove(g.mesh));
    this.guards = [];
    this.turrets.forEach((t) => this.scene.scene.remove(t.mesh));
    this.turrets = [];
    this.initLevel(1, false);
    this.applyWeaponChange('pistol');
    this.state = 'PLAYING';
    this.isInvasionActive = false;
    this.onStateChange(this.state);
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.clearEnemiesAndDrops();
    this.guards.forEach((g) => this.scene.scene.remove(g.mesh));
    this.turrets.forEach((t) => this.scene.scene.remove(t.mesh));
    this.scene.scene.remove(this.player.mesh);
    this.scene.scene.remove(this.merchant.mesh);
  }
}
