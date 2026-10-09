import * as THREE from 'three';
import { ZombieRoadScene } from './ZombieRoadScene';
import { PlayerMesh } from './PlayerMesh';
import { ZombieMeshInstance } from './ZombieMeshes';
import { ObstacleMeshInstance } from './ObstacleMeshes';
import { CoinMeshInstance } from './ItemMeshes';
import { ChunkGenerator } from './ChunkGenerator';
import { BloodSystem } from './BloodSystem';
import { BiomeType, CharacterDef, CharacterId, CoinItem, GameState, ObstacleDef, PlayerStats, Projectile, RunSummary, WeaponDef, WeaponId, ZombieType } from '../types';
import { CHARACTERS_CATALOG } from '../data/characters';
import { WEAPONS_CATALOG } from '../data/weapons';
import { loadSavedPlayerStats, savePlayerStats } from '../storage/saveData';
import { sound } from '../audio/SoundSystem';

export class GameEngine {
  public scene: ZombieRoadScene;
  public playerMesh: PlayerMesh;
  public chunkGen: ChunkGenerator;
  public bloodSystem: BloodSystem;

  public state: GameState = 'MENU';
  public playerStats: PlayerStats;

  // Manual Player Input State
  public inputMoveX: number = 0; // -1: Left, 0: Stop, 1: Right
  public facingRight: boolean = true;

  // Player Physics & Position
  public playerX: number = 0;
  public playerY: number = 0;
  public playerVy: number = 0;
  public isGrounded: boolean = true;
  public currentHearts: number = 3;
  public maxHearts: number = 3;
  public isInvulnerable: boolean = false;
  private invulnerableTimer: number = 0;
  public isFallingInHole: boolean = false;

  // Active Entities
  public zombies: ZombieMeshInstance[] = [];
  public obstacles: ObstacleMeshInstance[] = [];
  public coins: CoinMeshInstance[] = [];
  public projectiles: Projectile[] = [];
  private projectileMeshes: THREE.Mesh[] = [];

  // Run Counters
  public distanceRun: number = 0;
  public maxDistanceReached: number = 0;
  public runCoins: number = 0;
  public runZombiesKilled: number = 0;
  public runDamageTaken: number = 0;
  public runStartTime: number = 0;
  private shootCooldown: number = 0;

  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // UI Callbacks
  public onStateChange: (state: GameState) => void = () => {};
  public onStatsUpdate: (stats: PlayerStats, hearts: number, maxHearts: number) => void = () => {};
  public onDistanceUpdate: (meters: number) => void = () => {};
  public onGameOver: (summary: RunSummary) => void = () => {};
  public onVictory: (summary: RunSummary) => void = () => {};

  constructor(scene: ZombieRoadScene) {
    this.scene = scene;
    this.playerStats = loadSavedPlayerStats();
    this.chunkGen = new ChunkGenerator();
    this.bloodSystem = new BloodSystem(this.scene.scene);

    const charDef = CHARACTERS_CATALOG[this.playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];
    this.playerMesh = new PlayerMesh(charDef);
    this.scene.scene.add(this.playerMesh.group);

    this.loop = this.loop.bind(this);
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public startRun() {
    this.clearWorld();
    this.bloodSystem.clearAll();

    const charDef = CHARACTERS_CATALOG[this.playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];
    const weaponDef = WEAPONS_CATALOG[this.playerStats.selectedWeapon] || WEAPONS_CATALOG['pistol'];

    this.playerMesh.setCharacterStyle(charDef);
    this.playerMesh.rebuildWeapon(weaponDef.id);

    this.maxHearts = charDef.maxHearts + this.playerStats.healthUpgradeLvl;
    this.currentHearts = this.maxHearts;
    this.playerX = 0;
    this.playerY = 0;
    this.playerVy = 0;
    this.inputMoveX = 0;
    this.facingRight = true;
    this.isGrounded = true;
    this.isInvulnerable = false;
    this.isFallingInHole = false;

    this.distanceRun = 0;
    this.maxDistanceReached = 0;
    this.runCoins = 0;
    this.runZombiesKilled = 0;
    this.runDamageTaken = 0;
    this.runStartTime = performance.now();
    this.shootCooldown = 0;

    this.chunkGen.reset(16);
    this.state = 'PLAYING';

    sound.startMusic();
    this.onStateChange(this.state);
    this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
  }

  public setMoveInput(dir: number) {
    this.inputMoveX = Math.max(-1, Math.min(1, dir));
    if (this.inputMoveX > 0) this.facingRight = true;
    else if (this.inputMoveX < 0) this.facingRight = false;
  }

  public jump() {
    if (this.state !== 'PLAYING' || !this.isGrounded || this.isFallingInHole) return;

    const charDef = CHARACTERS_CATALOG[this.playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];
    const jumpForce = 12.2 * charDef.jumpForceMultiplier;

    this.playerVy = jumpForce;
    this.isGrounded = false;
    sound.playJump();
  }

  public shoot() {
    if (this.state !== 'PLAYING' || this.isFallingInHole || this.shootCooldown > 0) return;

    const weaponDef = WEAPONS_CATALOG[this.playerStats.selectedWeapon] || WEAPONS_CATALOG['pistol'];
    const charDef = CHARACTERS_CATALOG[this.playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];
    const upg = this.playerStats.weaponUpgrades[weaponDef.id] || { damageLvl: 0, fireRateLvl: 0 };

    const fireRate = weaponDef.fireRate * (1 + upg.fireRateLvl * 0.12);
    this.shootCooldown = 1 / fireRate;

    const baseDamage = weaponDef.damage * charDef.damageMultiplier * (1 + upg.damageLvl * 0.15);

    // Visual arm raise and muzzle flash
    this.playerMesh.triggerShoot();
    sound.playGunshot(weaponDef.id);

    const shootDir = this.facingRight ? 1 : -1;
    const originX = this.playerX + (this.facingRight ? 0.8 : -0.8);
    const originY = this.playerY + 0.95;

    if (weaponDef.pellets > 1) {
      for (let i = 0; i < weaponDef.pellets; i++) {
        const spreadOffset = (i - (weaponDef.pellets - 1) / 2) * weaponDef.spread;
        this.spawnProjectile(originX, originY, weaponDef.bulletSpeed * shootDir, spreadOffset, baseDamage, weaponDef.range, weaponDef.color);
      }
    } else {
      const spreadOffset = (Math.random() - 0.5) * weaponDef.spread;
      this.spawnProjectile(originX, originY, weaponDef.bulletSpeed * shootDir, spreadOffset, baseDamage, weaponDef.range, weaponDef.color);
    }
  }

  private spawnProjectile(x: number, y: number, vx: number, spreadY: number, damage: number, range: number, color: number) {
    const proj: Projectile = {
      id: `p_${Math.random()}`,
      x,
      y,
      vx,
      vy: spreadY * 15,
      damage,
      rangeRemaining: range,
      color,
      isPlayerBullet: true,
    };
    this.projectiles.push(proj);

    const geo = new THREE.BoxGeometry(0.4, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0);
    this.scene.scene.add(mesh);
    this.projectileMeshes.push(mesh);
  }

  public selectCharacter(charId: CharacterId) {
    this.playerStats.selectedCharacter = charId;
    const def = CHARACTERS_CATALOG[charId];
    if (def) {
      this.playerMesh.setCharacterStyle(def);
    }
    savePlayerStats(this.playerStats);
    this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
  }

  public unlockCharacter(charId: CharacterId) {
    const def = CHARACTERS_CATALOG[charId];
    if (!def || this.playerStats.coins < def.unlockCost) return;

    this.playerStats.coins -= def.unlockCost;
    this.playerStats.unlockedCharacters[charId] = true;
    this.selectCharacter(charId);
    sound.playCoin();
  }

  public selectWeapon(weaponId: WeaponId) {
    this.playerStats.selectedWeapon = weaponId;
    this.playerMesh.rebuildWeapon(weaponId);
    savePlayerStats(this.playerStats);
    this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
  }

  public unlockWeapon(weaponId: WeaponId) {
    const def = WEAPONS_CATALOG[weaponId];
    if (!def || this.playerStats.coins < def.unlockCost) return;

    this.playerStats.coins -= def.unlockCost;
    this.playerStats.unlockedWeapons[weaponId] = true;
    this.selectWeapon(weaponId);
    sound.playCoin();
  }

  public upgradeWeapon(weaponId: WeaponId, stat: 'damageLvl' | 'fireRateLvl') {
    const current = this.playerStats.weaponUpgrades[weaponId]?.[stat] || 0;
    const cost = 120 + current * 90;
    if (this.playerStats.coins < cost || current >= 10) return;

    this.playerStats.coins -= cost;
    if (!this.playerStats.weaponUpgrades[weaponId]) {
      this.playerStats.weaponUpgrades[weaponId] = { damageLvl: 0, fireRateLvl: 0 };
    }
    this.playerStats.weaponUpgrades[weaponId][stat] += 1;
    savePlayerStats(this.playerStats);
    sound.playCoin();
    this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
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

  private loop(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (this.state === 'PLAYING') {
      this.update(dt, time * 0.001);
    }

    this.scene.updateCamera(this.playerX, this.playerY);
    this.scene.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private update(dt: number, timeSeconds: number) {
    const charDef = CHARACTERS_CATALOG[this.playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];

    // 1. Manual Player Movement Control
    const baseSpeed = 7.0 * charDef.speedMultiplier;
    const speedBonus = Math.min(2.5, (this.playerX / 1000) * 0.6);
    const speed = baseSpeed + speedBonus;

    const isMoving = Math.abs(this.inputMoveX) > 0.01;

    if (!this.isFallingInHole && isMoving) {
      const moveDelta = speed * this.inputMoveX * dt;
      let newPlayerX = this.playerX + moveDelta;

      // Solid Obstacle Hard Collision Check
      const playerRadius = 0.45;
      for (const obs of this.obstacles) {
        if (obs.def.type !== 'hole') {
          if (this.playerY < obs.def.height - 0.22) {
            const obsLeft = obs.def.x - obs.def.width / 2;
            const obsRight = obs.def.x + obs.def.width / 2;

            if (this.inputMoveX > 0 && this.playerX + playerRadius <= obsLeft && newPlayerX + playerRadius >= obsLeft) {
              newPlayerX = obsLeft - playerRadius;
            } else if (this.inputMoveX < 0 && this.playerX - playerRadius >= obsRight && newPlayerX - playerRadius <= obsRight) {
              newPlayerX = obsRight + playerRadius;
            }
          }
        }
      }

      this.playerX = Math.max(0, newPlayerX);

      if (this.playerX > this.maxDistanceReached) {
        this.maxDistanceReached = this.playerX;
        this.distanceRun = Math.floor(this.maxDistanceReached);
        this.onDistanceUpdate(this.distanceRun);
      }

      // Check Biome change
      let targetBiome: BiomeType = 'highway';
      if (this.distanceRun >= 4000) targetBiome = 'industrial';
      else if (this.distanceRun >= 3000) targetBiome = 'forest';
      else if (this.distanceRun >= 2000) targetBiome = 'suburbs';
      else if (this.distanceRun >= 1000) targetBiome = 'city';

      if (this.playerStats.currentBiome !== targetBiome) {
        this.playerStats.currentBiome = targetBiome;
        this.scene.setBiome(targetBiome);
      }
    }

    // 2. Generate Chunks Ahead
    const chunk = this.chunkGen.generateNextChunk(this.playerX);
    if (chunk) {
      this.spawnChunkEntities(chunk);
    }

    // 3. Player Physics & Gravity
    if (!this.isGrounded || this.isFallingInHole) {
      this.playerVy -= 32 * dt;
      this.playerY += this.playerVy * dt;
    }

    let isOverHole = false;
    for (const obs of this.obstacles) {
      if (obs.def.type === 'hole') {
        if (Math.abs(this.playerX - obs.def.x) < obs.def.width / 2) {
          isOverHole = true;
          break;
        }
      }
    }

    if (isOverHole && this.playerY <= 0.05) {
      this.isFallingInHole = true;
      this.isGrounded = false;
    }

    if (!this.isFallingInHole) {
      let groundHeight = 0;

      for (const obs of this.obstacles) {
        if (obs.def.type !== 'hole') {
          if (Math.abs(this.playerX - obs.def.x) < obs.def.width / 2 + 0.35) {
            if (this.playerY >= obs.def.height - 0.25 && this.playerVy <= 0) {
              groundHeight = obs.def.height;
              break;
            }
          }
        }
      }

      if (this.playerY <= groundHeight) {
        if (!this.isGrounded && this.playerVy < -2) {
          sound.playLand();
        }
        this.playerY = groundHeight;
        this.playerVy = 0;
        this.isGrounded = true;
      }
    } else {
      if (this.playerY < -3.5) {
        this.handleGameOver(true);
        return;
      }
    }

    // 4. Update Player Mesh & Animation
    this.playerMesh.group.position.set(this.playerX, this.playerY, 0);
    this.playerMesh.animate(dt, {
      isRunning: isMoving && this.isGrounded && !this.isFallingInHole,
      isJumping: this.playerVy > 0.5,
      isFalling: this.playerVy < -0.5,
      isDead: this.currentHearts <= 0,
      runTime: timeSeconds,
      facingRight: this.facingRight,
    });

    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // 5. Update Projectiles, Hits & Blood
    this.updateProjectiles(dt);

    // 6. Update Zombies, Ragdoll Physics & Collisions
    this.updateZombies(dt, timeSeconds);

    // 7. Update Blood Particles & Decals
    this.bloodSystem.update(dt);

    // 8. Update Coins & Magnet
    this.updateCoins(dt, timeSeconds);

    // 9. Cleanup Entities Behind Player
    this.cleanupBehindPlayer();
  }

  private spawnChunkEntities(chunk: {
    obstacles: ObstacleDef[];
    zombies: { type: ZombieType; x: number; y?: number }[];
    coins: CoinItem[];
  }) {
    chunk.obstacles.forEach((obsDef) => {
      const obsMesh = new ObstacleMeshInstance(obsDef);
      this.scene.scene.add(obsMesh.group);
      this.obstacles.push(obsMesh);
    });

    chunk.zombies.forEach((zInfo) => {
      const zMesh = new ZombieMeshInstance(zInfo.type, zInfo.x, zInfo.y || 0);
      this.scene.scene.add(zMesh.group);
      this.zombies.push(zMesh);
    });

    chunk.coins.forEach((cItem) => {
      const cMesh = new CoinMeshInstance(cItem);
      this.scene.scene.add(cMesh.group);
      this.coins.push(cMesh);
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const mesh = this.projectileMeshes[i];

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rangeRemaining -= Math.abs(p.vx * dt);

      mesh.position.set(p.x, p.y, 0);

      // Check hit against zombies (KILLS ZOMBIES + BLOOD SPLATTER + RAGDOLL!)
      let hit = false;
      for (const zombie of this.zombies) {
        if (zombie.isDead) continue;

        const dx = Math.abs(p.x - zombie.x);
        const dy = Math.abs(p.y - (zombie.y + zombie.def.height / 2));

        if (dx < zombie.def.width / 2 + 0.4 && dy < zombie.def.height / 2 + 0.3) {
          hit = true;
          const hitDirX = p.vx > 0 ? 1 : -1;
          const killed = zombie.takeDamage(p.damage, hitDirX);
          sound.playHit();

          // Spawn kinetic blood splatter
          this.bloodSystem.spawnBloodSplatter(zombie.x, zombie.y + 0.9, 0, hitDirX, killed ? 24 : 10);

          if (killed) {
            sound.playZombieDeath();
            this.runZombiesKilled++;
            this.playerStats.zombiesKilled++;
            this.playerStats.coins += zombie.def.coinReward;
            this.runCoins += zombie.def.coinReward;
            this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
          }
          break;
        }
      }

      // Check hit against destructible barrels
      if (!hit) {
        for (const obs of this.obstacles) {
          if (obs.def.destructible && obs.def.hp) {
            if (Math.abs(p.x - obs.def.x) < obs.def.width / 2 && Math.abs(p.y - (obs.def.y + obs.def.height / 2)) < obs.def.height / 2) {
              hit = true;
              obs.def.hp -= p.damage;
              sound.playHit();
              if (obs.def.hp <= 0) {
                this.scene.scene.remove(obs.group);
                this.obstacles = this.obstacles.filter((o) => o !== obs);
              }
              break;
            }
          }
        }
      }

      if (hit || p.rangeRemaining <= 0) {
        this.scene.scene.remove(mesh);
        this.projectiles.splice(i, 1);
        this.projectileMeshes.splice(i, 1);
      }
    }
  }

  private updateZombies(dt: number, timeSeconds: number) {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];

      if (!z.isDead) {
        const moveStep = z.def.speed * dt;
        let newZombieX = z.x - moveStep;

        // Obstacle interaction for living zombies
        for (const obs of this.obstacles) {
          if (obs.def.type !== 'hole') {
            const obsRight = obs.def.x + obs.def.width / 2;
            const distToObs = z.x - obsRight;

            // Jumper and Runner zombies detect obstacles ahead and leap over them!
            if ((z.def.type === 'jumper' || z.def.type === 'runner') && distToObs > 0 && distToObs < 2.8 && z.isGrounded) {
              z.vy = 10.8;
              z.isGrounded = false;
            }

            // If not airborne enough to clear obstacle, block horizontal movement!
            if (z.y < obs.def.height - 0.22) {
              if (z.x >= obsRight && newZombieX - z.def.width / 2 <= obsRight) {
                newZombieX = obsRight + z.def.width / 2;
              }
            }
          }
        }

        z.x = newZombieX;

        // Airborne Physics & Gravity for Jumping Zombies
        if (!z.isGrounded) {
          z.vy -= 26 * dt;
          z.y += z.vy * dt;

          let zombieGroundHeight = 0;
          for (const obs of this.obstacles) {
            if (obs.def.type !== 'hole') {
              if (Math.abs(z.x - obs.def.x) < obs.def.width / 2 + 0.35) {
                if (z.y >= obs.def.height - 0.25 && z.vy <= 0) {
                  zombieGroundHeight = obs.def.height;
                  break;
                }
              }
            }
          }

          if (z.y <= zombieGroundHeight) {
            z.y = zombieGroundHeight;
            z.vy = 0;
            z.isGrounded = true;
          }
        }

        // Check collision with player
        const dx = Math.abs(this.playerX - z.x);
        const dy = Math.abs(this.playerY - z.y);

        if (dx < 0.65 + z.def.width / 2 && dy < 1.4 && !this.isInvulnerable && !this.isFallingInHole) {
          this.applyPlayerDamage(z.def.damage);
        }
      }

      z.update(dt, timeSeconds);
    }
  }

  private updateCoins(dt: number, timeSeconds: number) {
    const magnetRadius = 2.5 + this.playerStats.coinMagnetLvl * 0.8;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (c.item.collected) continue;

      const dx = this.playerX - c.item.x;
      const dy = (this.playerY + 0.9) - c.item.y;
      const dist = Math.hypot(dx, dy);

      if (dist < magnetRadius) {
        c.item.x += (dx / dist) * 16 * dt;
        c.item.y += (dy / dist) * 16 * dt;
      }

      if (dist < 0.85) {
        c.item.collected = true;
        this.runCoins += c.item.value;
        this.playerStats.coins += c.item.value;
        sound.playCoin();
        this.scene.scene.remove(c.group);
        this.coins.splice(i, 1);
        this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
        continue;
      }

      c.update(dt, timeSeconds);
    }
  }

  private applyPlayerDamage(amount: number) {
    this.currentHearts = Math.max(0, this.currentHearts - amount);
    this.runDamageTaken += amount;
    this.isInvulnerable = true;
    this.invulnerableTimer = 1.2;

    this.playerMesh.triggerHitFlash();
    this.bloodSystem.spawnBloodSplatter(this.playerX, this.playerY + 0.9, 0, this.facingRight ? -1 : 1, 12);
    sound.playPlayerHurt();
    this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);

    if (this.currentHearts <= 0) {
      this.handleGameOver(false);
    }
  }

  private handleGameOver(fellInHole = false) {
    this.state = 'GAMEOVER';
    sound.stopMusic();
    sound.playGameOver();

    const timeSurvived = Math.round((performance.now() - this.runStartTime) / 1000);
    const newRecord = this.distanceRun > this.playerStats.bestDistance;

    if (newRecord) {
      this.playerStats.bestDistance = this.distanceRun;
    }
    this.playerStats.totalDistance += this.distanceRun;
    savePlayerStats(this.playerStats);

    const summary: RunSummary = {
      distance: this.distanceRun,
      zombiesKilled: this.runZombiesKilled,
      coinsCollected: this.runCoins,
      timeSurvived,
      damageTaken: this.runDamageTaken,
      newRecord,
    };

    this.onStateChange(this.state);
    this.onGameOver(summary);
  }

  private cleanupBehindPlayer() {
    const minX = this.playerX - 25;

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      // Keep ragdoll zombies on the road for at least 4.5s before cleanup
      const isOldRagdoll = this.zombies[i].isRagdoll && this.zombies[i].ragdollTime > 4.5;
      if (this.zombies[i].x < minX || isOldRagdoll) {
        this.scene.scene.remove(this.zombies[i].group);
        this.zombies.splice(i, 1);
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      if (this.obstacles[i].def.x < minX) {
        this.scene.scene.remove(this.obstacles[i].group);
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      if (this.coins[i].item.x < minX) {
        this.scene.scene.remove(this.coins[i].group);
        this.coins.splice(i, 1);
      }
    }

    this.bloodSystem.cleanupBehind(minX);
  }

  private clearWorld() {
    this.zombies.forEach((z) => this.scene.scene.remove(z.group));
    this.zombies = [];

    this.obstacles.forEach((o) => this.scene.scene.remove(o.group));
    this.obstacles = [];

    this.coins.forEach((c) => this.scene.scene.remove(c.group));
    this.coins = [];

    this.projectileMeshes.forEach((m) => this.scene.scene.remove(m));
    this.projectileMeshes = [];
    this.projectiles = [];
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopMusic();
    this.clearWorld();
    this.bloodSystem.clearAll();
    this.scene.scene.remove(this.playerMesh.group);
  }
}
