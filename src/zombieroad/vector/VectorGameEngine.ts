import { BiomeType, CharacterDef, CharacterId, CoinItem, GameState, ObstacleDef, PlayerStats, Projectile, RunSummary, WeaponDef, WeaponId, ZombieType } from '../types';
import { CHARACTERS_CATALOG } from '../data/characters';
import { WEAPONS_CATALOG } from '../data/weapons';
import { VectorPlayer } from './VectorPlayer';
import { VectorZombie } from './VectorZombie';
import { VectorEnvironment } from './VectorEnvironment';
import { VectorBloodSystem } from './VectorBloodSystem';
import { ChunkGenerator } from '../engine/ChunkGenerator';
import { sound } from '../audio/SoundSystem';
import { loadSavedPlayerStats, savePlayerStats } from '../storage/saveData';

export class VectorGameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public dpr: number = 1;
  public viewWidth: number = 960;
  public viewHeight: number = 540;
  public groundY: number = 380;
  public camX: number = 0;

  public state: GameState = 'MENU';
  public player: VectorPlayer;
  public playerStats: PlayerStats;
  public environment: VectorEnvironment;
  public bloodSystem: VectorBloodSystem;
  public chunkGen: ChunkGenerator;

  // Active Entities
  public zombies: VectorZombie[] = [];
  public obstacles: ObstacleDef[] = [];
  public coins: CoinItem[] = [];
  public projectiles: (Projectile & { prevX?: number; prevY?: number })[] = [];

  // Run Progression State
  public currentHearts: number = 3;
  public maxHearts: number = 3;
  public distanceRun: number = 0;
  public maxDistanceReached: number = 0;
  public runCoins: number = 0;
  public runZombiesKilled: number = 0;
  public runDamageTaken: number = 0;
  public runStartTime: number = 0;

  // Mechanics & Input
  public inputMoveX: number = 0;
  public isInvulnerable: boolean = false;
  public invulnerableTimer: number = 0;
  public shootCooldown: number = 0;

  // Animation Loop
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private resizeHandler: () => void;

  // UI Event Callbacks
  public onStateChange: (state: GameState) => void = () => {};
  public onStatsUpdate: (stats: PlayerStats, hearts: number, maxHearts: number) => void = () => {};
  public onDistanceUpdate: (meters: number) => void = () => {};
  public onGameOver: (summary: RunSummary) => void = () => {};
  public onVictory: (summary: RunSummary) => void = () => {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.playerStats = loadSavedPlayerStats();
    sound.setSoundEnabled(this.playerStats.soundEnabled);
    sound.setMusicEnabled(this.playerStats.musicEnabled);

    this.environment = new VectorEnvironment();
    this.bloodSystem = new VectorBloodSystem();
    this.chunkGen = new ChunkGenerator();

    const charDef = CHARACTERS_CATALOG[this.playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];
    const weaponDef = WEAPONS_CATALOG[this.playerStats.selectedWeapon] || WEAPONS_CATALOG['pistol'];
    this.player = new VectorPlayer(charDef, weaponDef);

    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);

    this.resize();
    this.loop = this.loop.bind(this);
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.viewWidth = Math.max(320, rect.width || window.innerWidth);
    this.viewHeight = Math.max(240, rect.height || window.innerHeight);

    this.canvas.width = Math.floor(this.viewWidth * this.dpr);
    this.canvas.height = Math.floor(this.viewHeight * this.dpr);

    // Pixel-perfect crisp scaling (zero blur)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    this.groundY = this.viewHeight * 0.72;
  }

  public startRun() {
    this.clearWorld();
    this.bloodSystem.clearAll();

    const charDef = CHARACTERS_CATALOG[this.playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];
    const weaponDef = WEAPONS_CATALOG[this.playerStats.selectedWeapon] || WEAPONS_CATALOG['pistol'];
    this.player.charDef = charDef;
    this.player.weaponDef = weaponDef;

    this.maxHearts = charDef.maxHearts + this.playerStats.healthUpgradeLvl;
    this.currentHearts = this.maxHearts;

    this.player.x = 100;
    this.player.y = 0;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.facingRight = true;
    this.inputMoveX = 0;
    this.isInvulnerable = false;

    this.distanceRun = 0;
    this.maxDistanceReached = 0;
    this.runCoins = 0;
    this.runZombiesKilled = 0;
    this.runDamageTaken = 0;
    this.runStartTime = performance.now();
    this.shootCooldown = 0;

    this.chunkGen.reset(18);
    this.state = 'PLAYING';

    // Synchronize SoundSystem with saved sound & music preferences
    sound.setSoundEnabled(this.playerStats.soundEnabled);
    if (this.playerStats.musicEnabled) {
      sound.startMusic();
    } else {
      sound.stopMusic();
    }

    this.onStateChange(this.state);
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
      this.lastTime = performance.now();
      this.onStateChange(this.state);
    }
  }

  public setMoveInput(dir: number) {
    this.inputMoveX = Math.max(-1, Math.min(1, dir));
    if (this.inputMoveX > 0) this.player.facingRight = true;
    else if (this.inputMoveX < 0) this.player.facingRight = false;
  }

  public jump() {
    if (this.state !== 'PLAYING' || !this.player.isGrounded) return;
    this.player.vy = 12.8 * this.player.charDef.jumpForceMultiplier;
    this.player.isGrounded = false;
    sound.playJump();
  }

  public shoot() {
    if (this.state !== 'PLAYING' || this.shootCooldown > 0) return;

    const weapon = this.player.weaponDef;
    const upg = this.playerStats.weaponUpgrades[weapon.id] || { damageLvl: 0, fireRateLvl: 0 };
    const fireRate = weapon.fireRate * (1 + upg.fireRateLvl * 0.12);
    this.shootCooldown = 1 / fireRate;

    const damage = weapon.damage * this.player.charDef.damageMultiplier * (1 + upg.damageLvl * 0.15);
    const shootDir = this.player.facingRight ? 1 : -1;
    const originX = this.player.x + (this.player.facingRight ? 26 : -26);
    const originY = this.player.y + 36; // At weapon shoulder height

    // Find any living zombie on screen in front of the player
    const targetZombies = this.zombies.filter((z) => {
      if (z.isDead) return false;
      const dx = (z.x - originX) * shootDir;
      return dx > 0 && dx < this.viewWidth * 1.5;
    });

    targetZombies.sort((a, b) => Math.abs(a.x - originX) - Math.abs(b.x - originX));
    const target = targetZombies[0];

    const bulletSpeed = 1600; // Ultra fast and responsive
    let baseAngle = 0;

    if (target) {
      const targetCenterY = target.y + target.height * 0.55;
      const targetDx = Math.abs(target.x - originX);
      const targetDy = targetCenterY - originY;
      baseAngle = Math.atan2(targetDy, targetDx);
      baseAngle = Math.max(-0.4, Math.min(0.4, baseAngle));
    }

    this.player.triggerShoot(baseAngle);
    sound.playGunshot(weapon.id);

    if (weapon.pellets > 1) {
      for (let i = 0; i < weapon.pellets; i++) {
        const spreadOffset = (i - (weapon.pellets - 1) / 2) * (weapon.spread || 0.12);
        const finalAngle = baseAngle + spreadOffset;
        this.projectiles.push({
          id: `p_${Math.random()}`,
          x: originX,
          y: originY,
          prevX: originX,
          prevY: originY,
          vx: shootDir * bulletSpeed * Math.cos(finalAngle),
          vy: bulletSpeed * Math.sin(finalAngle),
          damage,
          rangeRemaining: 4500,
          color: weapon.color,
          isPlayerBullet: true,
        });
      }
    } else {
      const spreadOffset = (Math.random() - 0.5) * (weapon.spread || 0.02);
      const finalAngle = baseAngle + spreadOffset;
      this.projectiles.push({
        id: `p_${Math.random()}`,
        x: originX,
        y: originY,
        prevX: originX,
        prevY: originY,
        vx: shootDir * bulletSpeed * Math.cos(finalAngle),
        vy: bulletSpeed * Math.sin(finalAngle),
        damage,
        rangeRemaining: 4500,
        color: weapon.color,
        isPlayerBullet: true,
      });
    }
  }

  public selectCharacter(charId: CharacterId) {
    this.playerStats.selectedCharacter = charId;
    const def = CHARACTERS_CATALOG[charId];
    if (def) this.player.charDef = def;
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
    const def = WEAPONS_CATALOG[weaponId];
    if (def) this.player.weaponDef = def;
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

  public upgradeStat(stat: 'healthUpgradeLvl' | 'coinMagnetLvl') {
    const current = this.playerStats[stat];
    const cost = 150 + current * 120;
    if (this.playerStats.coins < cost || current >= 8) return;

    this.playerStats.coins -= cost;
    this.playerStats[stat] += 1;
    if (stat === 'healthUpgradeLvl') {
      this.maxHearts = this.player.charDef.maxHearts + this.playerStats.healthUpgradeLvl;
      this.currentHearts = Math.min(this.currentHearts + 1, this.maxHearts);
    }
    savePlayerStats(this.playerStats);
    sound.playCoin();
    this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
  }

  private loop(now: number) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public update(dt: number) {
    // 1. Procedural Chunk Generation
    const playerChunkCoord = Math.floor(this.player.x / 28);
    const aliveZombieCount = this.zombies.filter((z) => !z.isDead).length;

    // Generate new chunks as player advances
    if (aliveZombieCount < 6) {
      const generated = this.chunkGen.generateNextChunk(playerChunkCoord);
      if (generated) {
        for (const obs of generated.obstacles) {
          this.obstacles.push(obs);
        }
        for (const z of generated.zombies) {
          this.zombies.push(new VectorZombie(z.type as ZombieType, z.x * 28));
        }
        for (const c of generated.coins) {
          this.coins.push({
            id: `c_${Math.random()}`,
            x: c.x * 28,
            y: c.y * 38 + 15,
            value: c.value,
            collected: false,
          });
        }
      }
    }

    // 2. Track Distance in Meters
    this.distanceRun = Math.max(0, Math.floor((this.player.x - 100) / 28));
    if (this.distanceRun > this.maxDistanceReached) {
      this.maxDistanceReached = this.distanceRun;
      this.onDistanceUpdate(this.distanceRun);
    }

    // 3. Update Player Physics, Velocity and Obstacle Collisions
    const moveSpeed = this.player.charDef.speedMultiplier * 52;
    const isMoving = this.inputMoveX !== 0;

    let targetVx = this.inputMoveX * moveSpeed;
    this.player.vx += (targetVx - this.player.vx) * 12 * dt;

    // Gravity
    if (!this.player.isGrounded) {
      this.player.vy -= 34 * dt;
    }

    const nextPlayerX = Math.max(50, this.player.x + this.player.vx * dt);
    this.player.y += this.player.vy * dt * 28;

    // Obstacle Physical Collisions for Player
    let playerBlockedX = false;
    let groundHeight = 0;

    for (const obs of this.obstacles) {
      const obsX = obs.x * 28;
      const obsW = obs.width * 28;
      const obsH = obs.height * 38;

      const obsLeft = obsX - obsW / 2;
      const obsRight = obsX + obsW / 2;
      const obsTop = obsH;

      if (obs.type === 'hole') {
        if (nextPlayerX > obsLeft && nextPlayerX < obsRight && this.player.y <= 0) {
          this.applyPlayerDamage(3, -1);
          sound.playHit();
          break;
        }
        continue;
      }

      if (nextPlayerX + this.player.width / 2 > obsLeft && nextPlayerX - this.player.width / 2 < obsRight) {
        if (this.player.y >= obsTop - 8) {
          groundHeight = Math.max(groundHeight, obsTop);
        } else {
          playerBlockedX = true;
          if (this.player.vx > 0) this.player.x = obsLeft - this.player.width / 2;
          else if (this.player.vx < 0) this.player.x = obsRight + this.player.width / 2;
          this.player.vx = 0;
          break;
        }
      }
    }

    if (!playerBlockedX) {
      this.player.x = nextPlayerX;
    }

    if (this.player.y <= groundHeight) {
      if (!this.player.isGrounded && this.player.vy < -2) {
        sound.playLand();
      }
      this.player.y = groundHeight;
      this.player.vy = 0;
      this.player.isGrounded = true;
    }

    this.player.update(dt, isMoving);

    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) this.isInvulnerable = false;
    }

    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // 4. Update Projectiles & Dismemberment Swept Hits
    this.updateProjectiles(dt);

    // 5. Update Zombies: Crowd Separation, Hand Strike Attacks & Pursuit
    this.updateZombies(dt);

    // 6. Update Blood & Decals
    this.bloodSystem.update(dt, this.groundY);

    // 7. Update Coins
    this.updateCoins(dt);

    // 8. Update Camera to follow player smoothly
    const targetCamX = this.player.x - this.viewWidth / 3.5;
    this.camX += (targetCamX - this.camX) * 0.15;

    this.cleanupBehindPlayer();
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const prevX = p.x;
      const prevY = p.y;

      p.prevX = prevX;
      p.prevY = prevY;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const stepDist = Math.hypot(p.x - prevX, p.y - prevY);
      p.rangeRemaining -= stepDist;

      // Swept line-segment collision against all alive zombies
      let hit = false;
      const pMinX = Math.min(prevX, p.x);
      const pMaxX = Math.max(prevX, p.x);
      const pMinY = Math.min(prevY, p.y);
      const pMaxY = Math.max(prevY, p.y);

      for (const zombie of this.zombies) {
        if (zombie.isDead) continue;

        const zMinX = zombie.x - zombie.width / 2 - 14;
        const zMaxX = zombie.x + zombie.width / 2 + 14;
        const zMinY = zombie.y - 6;
        const zMaxY = zombie.y + zombie.height + 14;

        // Box overlap test between projectile segment bounds and zombie hit box
        const overlapsX = pMaxX >= zMinX && pMinX <= zMaxX;
        const overlapsY = pMaxY >= zMinY && pMinY <= zMaxY;

        if (overlapsX && overlapsY) {
          hit = true;
          const hitDirX = p.vx >= 0 ? 1 : -1;
          const isKilled = zombie.takeDamage(p.damage, hitDirX, this.bloodSystem);
          sound.playHit();

          // Spawn visceral blood spray
          const zHitY = zombie.y + zombie.height * 0.5;
          this.bloodSystem.spawnBloodBurst(zombie.x, this.groundY - zHitY, hitDirX, isKilled ? 24 : 12, isKilled);

          if (isKilled) {
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

      if (hit || p.rangeRemaining <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateZombies(dt: number) {
    const playerX = this.player.x;
    const playerHalfW = this.player.width / 2;
    const zHalfW = 11;
    const baseAttackRange = playerHalfW + zHalfW + 12; // ~35px melee strike range

    // Filter active alive zombies and sort by distance to player
    const aliveZombies = this.zombies.filter((z) => !z.isDead);

    // Group zombies on left and right side of player to assign individual attack queue slots
    const zombiesToRight = aliveZombies.filter((z) => z.x >= playerX).sort((a, b) => a.x - b.x);
    const zombiesToLeft = aliveZombies.filter((z) => z.x < playerX).sort((a, b) => b.x - a.x);

    // 1. Soft Crowd Separation: Push zombies away from each other
    for (let i = 0; i < aliveZombies.length; i++) {
      for (let j = i + 1; j < aliveZombies.length; j++) {
        const zA = aliveZombies[i];
        const zB = aliveZombies[j];
        const dist = Math.abs(zA.x - zB.x);
        const minComfortDist = 32;

        if (dist < minComfortDist) {
          const pushForce = ((minComfortDist - dist) / minComfortDist) * 36 * dt;
          if (zA.x < zB.x) {
            zA.x -= pushForce;
            zB.x += pushForce;
          } else {
            zA.x += pushForce;
            zB.x -= pushForce;
          }
        }
      }
    }

    // 2. Process zombies approaching from the Right
    zombiesToRight.forEach((z, index) => {
      const targetDist = baseAttackRange + index * 26;
      const distToPlayer = z.x - playerX;
      z.facingRight = false;

      if (distToPlayer <= targetDist + 6) {
        z.isAttacking = true;
        z.vx = 0;
      } else {
        z.isAttacking = false;
        z.vx = -z.def.speed * 18 * z.speedMultiplier;
      }
    });

    // 3. Process zombies approaching from the Left
    zombiesToLeft.forEach((z, index) => {
      const targetDist = baseAttackRange + index * 26;
      const distToPlayer = playerX - z.x;
      z.facingRight = true;

      if (distToPlayer <= targetDist + 6) {
        z.isAttacking = true;
        z.vx = 0;
      } else {
        z.isAttacking = false;
        z.vx = z.def.speed * 18 * z.speedMultiplier;
      }
    });

    // 4. Update individual zombie animation, physics, attacks and damage to player
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];

      if (z.isDead) {
        z.update(dt, this.groundY);
        continue;
      }

      // Attack hand strike execution
      z.updateAttack(dt, (attackDamage) => {
        if (!this.isInvulnerable) {
          const pushDir = z.x > this.player.x ? -1 : 1;
          this.applyPlayerDamage(attackDamage, pushDir);
          sound.playZombieSlash();
        }
      });

      // Move zombie horizontally
      if (!z.isAttacking) {
        const nextX = z.x + z.vx * dt;

        // Check obstacle collision for zombie
        let zBlocked = false;
        let zGroundH = 0;

        for (const obs of this.obstacles) {
          const obsX = obs.x * 28;
          const obsW = obs.width * 28;
          const obsH = obs.height * 38;
          const obsLeft = obsX - obsW / 2;
          const obsRight = obsX + obsW / 2;

          if (nextX + zHalfW > obsLeft && nextX - zHalfW < obsRight) {
            if (z.y >= obsH - 6) {
              zGroundH = Math.max(zGroundH, obsH);
            } else {
              zBlocked = true;
              if ((z.def.type === 'jumper' || z.def.type === 'runner') && z.isGrounded) {
                z.vy = 10.5;
                z.isGrounded = false;
                zBlocked = false;
              }
              break;
            }
          }
        }

        if (!zBlocked) {
          z.x = nextX;
        }

        // Apply vertical physics
        if (!z.isGrounded) {
          z.vy -= 28 * dt;
          z.y += z.vy * dt * 28;
        }

        if (z.y <= zGroundH) {
          z.y = zGroundH;
          z.vy = 0;
          z.isGrounded = true;
        }
      }

      z.update(dt, this.groundY);
    }
  }

  private updateCoins(dt: number) {
    const magnetDist = 80 + this.playerStats.coinMagnetLvl * 25;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (c.collected) continue;

      const dx = this.player.x - c.x;
      const dy = this.player.y + 25 - c.y;
      const dist = Math.hypot(dx, dy);

      if (dist < magnetDist) {
        c.x += (dx / dist) * 450 * dt;
        c.y += (dy / dist) * 450 * dt;
      }

      if (dist < 22) {
        c.collected = true;
        this.runCoins += c.value;
        this.playerStats.coins += c.value;
        sound.playCoin();
        this.coins.splice(i, 1);
        this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);
      }
    }
  }

  private applyPlayerDamage(amount: number, pushDirX = -1) {
    this.currentHearts = Math.max(0, this.currentHearts - amount);
    this.runDamageTaken += amount;
    this.isInvulnerable = true;
    this.invulnerableTimer = 1.2;

    this.player.triggerHitFlash();
    this.bloodSystem.spawnBloodBurst(this.player.x, this.groundY - this.player.y - 25, pushDirX, 10, false);
    sound.playPlayerHurt();

    // Push player back slightly on hit
    this.player.x = Math.max(50, this.player.x + pushDirX * 12);
    this.onStatsUpdate(this.playerStats, this.currentHearts, this.maxHearts);

    if (this.currentHearts <= 0) {
      this.handleGameOver();
    }
  }

  private handleGameOver() {
    this.state = 'GAMEOVER';
    sound.stopMusic();
    sound.playGameOver();

    const timeSurvived = Math.round((performance.now() - this.runStartTime) / 1000);
    const newRecord = this.distanceRun > this.playerStats.bestDistance;

    if (newRecord) this.playerStats.bestDistance = this.distanceRun;
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
    const minX = this.player.x - 450;

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      if (this.zombies[i].x < minX || (this.zombies[i].isDead && this.zombies[i].ragdollTime > 4.5)) {
        this.zombies.splice(i, 1);
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      if (this.obstacles[i].x * 28 < minX) {
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      if (this.coins[i].x < minX) {
        this.coins.splice(i, 1);
      }
    }

    // Clean blood drops behind
    for (let i = this.bloodSystem.drops.length - 1; i >= 0; i--) {
      if (this.bloodSystem.drops[i].x < minX) {
        this.bloodSystem.drops.splice(i, 1);
      }
    }
  }

  private clearWorld() {
    this.zombies = [];
    this.obstacles = [];
    this.coins = [];
    this.projectiles = [];
  }

  public render() {
    const ctx = this.ctx;
    const width = this.viewWidth;
    const height = this.viewHeight;
    const camX = this.camX;
    const groundY = this.groundY;

    // Reset transform to pixel-perfect crisp scale
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // 1. Render Urban Concrete Environment (Across entire screen)
    this.environment.render(ctx, camX, groundY, this.distanceRun, width, height);

    // 2. Render Blood Stains & Decals (Crisp vector ellipses)
    this.bloodSystem.render(ctx, camX, groundY);

    // 3. Render Solid Obstacles
    for (const obs of this.obstacles) {
      this.environment.renderObstacle(ctx, obs, camX, groundY);
    }

    // 4. Render Crisp Coins
    for (const c of this.coins) {
      const scrX = c.x - camX;
      if (scrX < -20 || scrX > width + 20) continue;
      const scrY = groundY - c.y;

      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(scrX, scrY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(scrX, scrY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Render Dead & Living Zombies with distinct outfits & fluid limbs
    for (const z of this.zombies) {
      z.render(ctx, camX, groundY);
    }

    // 6. Render Player Survivor with Pivot Limbs & Crisp Aiming Sight
    this.player.render(ctx, camX, groundY);

    // 7. Render Bullets (Clean crisp tracers with trailing streak)
    for (const p of this.projectiles) {
      const scrX = p.x - camX;
      const scrY = groundY - p.y;
      const prevScrX = (p.prevX ?? p.x) - camX;
      const prevScrY = groundY - (p.prevY ?? p.y);

      ctx.save();
      // Bullet tracer line
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(prevScrX, prevScrY);
      ctx.lineTo(scrX, scrY);
      ctx.stroke();

      // Bullet head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(scrX, scrY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  public dispose() {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopMusic();
    this.clearWorld();
  }
}
