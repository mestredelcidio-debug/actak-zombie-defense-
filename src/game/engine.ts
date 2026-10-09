/**
 * Sector Quarantine: Core Game Engine
 * Orchestrates game loops, waves, physics updates, combat resolutions, and state transitions.
 */

import {
  BloodDecal,
  Bullet,
  EnvironmentalObject,
  FloatingText,
  GameMode,
  GamePhase,
  MissionLocation,
  Particle,
  PlayerProfile,
  PlayerStats,
  RagdollPart,
  WeaponId,
  WeaponStats,
  Zombie,
  ZombieType,
} from '../types/game';
import { sound } from '../utils/audio';
import { getCalculatedWeaponStats } from '../utils/storage';
import { physics } from './physics';
import { GameRenderer } from './renderer';

export interface GameEngineCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onWaveChange: (currentWave: number, totalWaves: number) => void;
  onZombiesRemainingChange: (remaining: number) => void;
  onBarricadeChange: (hp: number, maxHp: number) => void;
  onPlayerStatsChange: (stats: PlayerStats) => void;
  onMissionComplete: (stars: number, coinsEarned: number, scrapEarned: number, stats: { kills: number; headshots: number }) => void;
  onGameOver: (stats: { kills: number; headshots: number; waveReached: number }) => void;
}

export class GameEngine {
  public canvas: HTMLCanvasElement | null = null;
  public ctx: CanvasRenderingContext2D | null = null;
  public renderer: GameRenderer;
  private callbacks: GameEngineCallbacks;

  // Game State
  public phase: GamePhase = 'PAUSED';
  public mode: GameMode = 'CAMPAIGN';
  public location: MissionLocation;
  public profile: PlayerProfile;
  public currentWave = 1;
  public totalWaves = 3;
  public zombiesRemaining = 0;
  public totalKillsThisRun = 0;
  public headshotsThisRun = 0;
  public cleanupTimeTaken = 0;
  public damageTakenThisRun = 0;

  // Entities
  public player: PlayerStats;
  public currentWeapon: WeaponStats;
  public zombies: Zombie[] = [];
  public ragdolls: RagdollPart[][] = [];
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public decals: BloodDecal[] = [];
  public floatingTexts: FloatingText[] = [];
  public envObjects: EnvironmentalObject[] = [];

  // Defense Line & Barricade
  public barricadeHp = 500;
  public maxBarricadeHp = 500;

  // Timers & FX
  private spawnTimer = 0;
  private muzzleFlashTimer = 0;
  private screenShake = { x: 0, y: 0, intensity: 0 };
  private lastTime = 0;
  private animationFrameId: number | null = null;
  private autoFireTimer = 0;
  private isPointerDown = false;
  private pointerPos = { x: 210, y: 300 };

  constructor(
    location: MissionLocation,
    mode: GameMode,
    profile: PlayerProfile,
    callbacks: GameEngineCallbacks
  ) {
    this.location = location;
    this.mode = mode;
    this.profile = profile;
    this.callbacks = callbacks;
    this.renderer = new GameRenderer();

    // Weapon
    const primaryId: WeaponId = (Object.keys(profile.weapons) as WeaponId[]).find(
      (w) => profile.weapons[w].unlocked
    ) || 'pistol';
    this.currentWeapon = getCalculatedWeaponStats(primaryId, profile);

    // Engineer Perk boosts Barricade
    this.maxBarricadeHp = 500 + profile.perks.engineerLevel * 100;
    this.barricadeHp = this.maxBarricadeHp;

    // Medic Perk boosts Player Max HP
    const maxHp = 100 + profile.perks.medicLevel * 20;

    // Player
    this.player = {
      hp: maxHp,
      maxHp,
      stamina: 100,
      maxStamina: 100,
      x: 210,
      aimAngle: -Math.PI / 2,
      currentWeaponId: primaryId,
      ammoInMag: this.currentWeapon.magazineSize,
      reserveAmmo: this.currentWeapon.magazineSize * 4,
      isReloading: false,
      reloadProgress: 0,
      activeReloadSuccess: false,
    };

    this.totalWaves = mode === 'ENDLESS' ? 999 : location.wavesCount;
  }

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupEnvironmentalObjects();
    this.startDefenseWave(1);
    this.phase = 'DEFENSE';
    this.callbacks.onPhaseChange(this.phase);
    sound.startAmbient('defense');

    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    sound.stopAmbient();
  }

  /**
   * Set up interactive objects per level
   */
  private setupEnvironmentalObjects() {
    this.envObjects = [
      // Explosive Red Barrels
      {
        id: 'barrel_1',
        type: 'BARREL_EXPLOSIVE',
        x: 65,
        y: this.renderer.floorY - 110,
        width: 32,
        height: 48,
        hp: 40,
        maxHp: 40,
        isDestroyed: false,
      },
      {
        id: 'barrel_2',
        type: 'BARREL_EXPLOSIVE',
        x: 320,
        y: this.renderer.floorY - 110,
        width: 32,
        height: 48,
        hp: 40,
        maxHp: 40,
        isDestroyed: false,
      },
      // Electric Breaker Box
      {
        id: 'breaker_1',
        type: 'BREAKER_BOX',
        x: 185,
        y: this.renderer.floorY - 145,
        width: 34,
        height: 40,
        hp: 1,
        maxHp: 1,
        isDestroyed: false,
        cooldown: 0,
      },
      // Searchable Doors & Lockers for Cleanup Phase
      {
        id: 'door_left',
        type: 'SEARCH_DOOR',
        x: 35,
        y: this.renderer.floorY - 220,
        width: 44,
        height: 70,
        hp: 10,
        maxHp: 10,
        isDestroyed: false,
        isSearched: false,
        hasHiddenZombie: true,
        hiddenZombieType: 'SPRINTER',
      },
      {
        id: 'locker_center',
        type: 'SEARCH_LOCKER',
        x: 180,
        y: this.renderer.floorY - 225,
        width: 38,
        height: 65,
        hp: 10,
        maxHp: 10,
        isDestroyed: false,
        isSearched: false,
        hasHiddenZombie: true,
        hiddenZombieType: 'CRAWLER',
      },
      {
        id: 'door_right',
        type: 'SEARCH_DOOR',
        x: 330,
        y: this.renderer.floorY - 220,
        width: 44,
        height: 70,
        hp: 10,
        maxHp: 10,
        isDestroyed: false,
        isSearched: false,
        hasHiddenZombie: true,
        hiddenZombieType: 'STALKER',
      },
    ];
  }

  /**
   * Start Defense Wave
   */
  public startDefenseWave(wave: number) {
    this.currentWave = wave;
    this.phase = 'DEFENSE';
    this.callbacks.onPhaseChange(this.phase);
    this.callbacks.onWaveChange(this.currentWave, this.totalWaves);

    // Number of zombies to spawn in this wave
    const count = 5 + wave * 3 + (this.mode === 'ENDLESS' ? wave * 2 : 0);
    this.zombiesRemaining = count;
    this.callbacks.onZombiesRemainingChange(this.zombiesRemaining);

    // Pre-schedule wave spawns
    this.spawnTimer = 0.5;
  }

  /**
   * Enter the Cleanup Phase after surviving defense waves
   */
  public enterCleanupPhase() {
    this.phase = 'CLEANUP';
    this.callbacks.onPhaseChange(this.phase);
    sound.stopAmbient();
    sound.startAmbient('cleanup');

    this.cleanupTimeTaken = 0;

    // Reset unsearched doors and spawn lurking zombies in hiding spots
    const hiddenCount = Math.min(this.envObjects.filter((o) => o.type.startsWith('SEARCH_')).length, this.location.cleanupZombiesCount);
    this.zombiesRemaining = hiddenCount;
    this.callbacks.onZombiesRemainingChange(this.zombiesRemaining);

    this.addFloatingText(this.renderer.width / 2, 280, 'DEFENSE CLEAR - SWEEP BUILDING', '#facc15', true);
  }

  /**
   * Main Loop
   */
  private loop(timestamp: number) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap delta time
    this.lastTime = timestamp;

    if (this.phase !== 'PAUSED') {
      this.update(dt);
    }

    if (this.ctx) {
      this.renderer.render(
        this.ctx,
        this.phase,
        this.location.environmentTheme,
        this.player,
        this.currentWeapon,
        this.profile,
        this.zombies,
        this.ragdolls,
        this.bullets,
        this.particles,
        this.decals,
        this.floatingTexts,
        this.envObjects,
        this.barricadeHp,
        this.maxBarricadeHp,
        this.muzzleFlashTimer,
        this.screenShake,
        timestamp / 1000
      );
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Update Physics & Logic
   */
  private update(dt: number) {
    // Screen shake decay
    if (this.screenShake.intensity > 0) {
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.intensity = Math.max(0, this.screenShake.intensity - dt * 25);
    } else {
      this.screenShake.x = 0;
      this.screenShake.y = 0;
    }

    // Muzzle flash decay
    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt);
    }

    // Auto-fire or continuous fire while touching/holding
    if (this.isPointerDown && (this.profile.autoFireEnabled || this.currentWeapon.id === 'smg' || this.currentWeapon.id === 'assault_rifle')) {
      this.autoFireTimer += dt;
      if (this.autoFireTimer >= 1 / this.currentWeapon.fireRate) {
        this.autoFireTimer = 0;
        this.fireWeapon();
      }
    }

    // Reload progress
    if (this.player.isReloading) {
      this.player.reloadProgress += dt / this.currentWeapon.reloadTime;
      if (this.player.reloadProgress >= 1) {
        this.finishReload();
      }
    }

    // Cleanup phase timer
    if (this.phase === 'CLEANUP') {
      this.cleanupTimeTaken += dt;
    }

    // Breaker box cooldown
    for (const obj of this.envObjects) {
      if (obj.cooldown && obj.cooldown > 0) {
        obj.cooldown = Math.max(0, obj.cooldown - dt);
      }
    }

    // Spawning zombies in Defense Phase
    if (this.phase === 'DEFENSE') {
      this.spawnTimer -= dt;
      const activeZombies = this.zombies.filter((z) => !z.isDead).length;
      if (this.spawnTimer <= 0 && activeZombies < 7 && this.zombiesRemaining > activeZombies) {
        this.spawnZombie();
        this.spawnTimer = 1.2 + Math.random() * 1.5;
      }
    }

    // Update Live Zombies
    const barricadeY = this.renderer.floorY - 50;

    for (const z of this.zombies) {
      if (z.isDead || z.isHidden) continue;

      // Knockback velocity friction
      z.x += z.vx * dt;
      z.y += z.vy * dt;
      z.vx *= 0.88;
      z.vy *= 0.88;

      // Frenzy speed modifier (from Howler)
      const speedMultiplier = z.isFrenzied ? 1.5 : 1.0;
      if (z.frenzyTimer && z.frenzyTimer > 0) {
        z.frenzyTimer -= dt;
        if (z.frenzyTimer <= 0) z.isFrenzied = false;
      }

      // March downward toward barricade
      if (z.y < barricadeY - z.height) {
        z.y += z.speed * speedMultiplier * dt;
      } else {
        // At barricade: attack it!
        z.attackTimer -= dt;
        if (z.attackTimer <= 0) {
          z.attackTimer = z.attackCooldown;
          this.damageBarricade(z.damage);
          sound.playBarricadeSound('hit');
          this.triggerScreenShake(4);
        }
      }

      // Keep inside walls
      if (z.x < 15) z.x = 15;
      if (z.x > this.renderer.width - z.width - 15) z.x = this.renderer.width - z.width - 15;
    }

    // Update Ragdolls with physics
    for (let i = this.ragdolls.length - 1; i >= 0; i--) {
      physics.updateRagdoll(
        this.ragdolls[i],
        dt,
        this.renderer.floorY,
        10,
        this.renderer.width - 10
      );
    }
    // Cap active ragdolls to 12 for high performance
    if (this.ragdolls.length > 12) {
      this.ragdolls.shift();
    }

    // Update Bullets & Collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.trail.unshift({ x: b.x, y: b.y });
      if (b.trail.length > 4) b.trail.pop();

      // Check collision with Live Zombies
      let bulletSpent = false;

      for (const z of this.zombies) {
        if (z.isDead || z.isHidden) continue;

        if (
          b.x >= z.x &&
          b.x <= z.x + z.width &&
          b.y >= z.y &&
          b.y <= z.y + z.height
        ) {
          // Hit detected! Check if Headshot (top 24% of bounding box)
          const isHeadshot = b.y <= z.y + z.height * 0.26;
          this.handleZombieHit(z, b, isHeadshot);

          b.pierceRemaining--;
          if (b.pierceRemaining <= 0 || b.isExplosive) {
            bulletSpent = true;
          }
          break;
        }
      }

      // Check collision with Environmental Objects
      for (const obj of this.envObjects) {
        if (obj.isDestroyed) continue;
        if (
          b.x >= obj.x &&
          b.x <= obj.x + obj.width &&
          b.y >= obj.y &&
          b.y <= obj.y + obj.height
        ) {
          this.handleObjectHit(obj, b);
          bulletSpent = true;
          break;
        }
      }

      // Bounds check or spent
      if (bulletSpent || b.y < 0 || b.y > this.renderer.height || b.x < 0 || b.x > this.renderer.width) {
        if (b.isExplosive) {
          this.detonateExplosion(b.x, b.y, 110, b.damage);
        }
        this.bullets.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.type === 'shockwave') {
        p.size += dt * 140;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Damage Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      t.y -= dt * 25; // drift upward
      t.alpha = Math.max(0, t.life / 0.8);
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Check Wave Completion
    if (this.phase === 'DEFENSE') {
      const liveZombies = this.zombies.filter((z) => !z.isDead).length;
      if (this.zombiesRemaining <= 0 && liveZombies === 0) {
        if (this.currentWave < this.totalWaves) {
          // Advance to next wave
          this.startDefenseWave(this.currentWave + 1);
          sound.playUI('victory');
          this.addFloatingText(this.renderer.width / 2, 280, `WAVE ${this.currentWave} CLEARED!`, '#10b981', true);
        } else {
          // All defense waves finished! Transition to Cleanup Phase!
          this.enterCleanupPhase();
        }
      }
    } else if (this.phase === 'CLEANUP') {
      const liveRemaining = this.zombies.filter((z) => !z.isDead).length;
      if (this.zombiesRemaining <= 0 && liveRemaining === 0) {
        this.completeMission();
      }
    }
  }

  /**
   * Spawn a zombie according to current wave and difficulty
   */
  private spawnZombie() {
    const wave = this.currentWave;
    const types: ZombieType[] = ['SHAMBLER'];

    if (wave >= 2) types.push('SPRINTER');
    if (wave >= 3) types.push('CRAWLER', 'BRUTE');
    if (wave >= 4) types.push('VOLATILE', 'JUGGERNAUT');
    if (wave >= 5) types.push('HOWLER', 'STALKER');

    const type = types[Math.floor(Math.random() * types.length)];
    const spawnX = 35 + Math.random() * (this.renderer.width - 70);
    const spawnY = 80 + Math.random() * 40;

    let hp = 45;
    let speed = 40;
    let width = 28;
    let height = 48;
    let damage = 20;

    if (type === 'SPRINTER') {
      hp = 30;
      speed = 85;
      damage = 18;
    } else if (type === 'BRUTE') {
      hp = 180;
      speed = 24;
      width = 38;
      height = 56;
      damage = 45;
    } else if (type === 'CRAWLER') {
      hp = 35;
      speed = 35;
      height = 24;
      damage = 15;
    } else if (type === 'JUGGERNAUT') {
      hp = 120;
      speed = 32;
      damage = 30;
    } else if (type === 'VOLATILE') {
      hp = 50;
      speed = 50;
      damage = 60;
    } else if (type === 'HOWLER') {
      hp = 70;
      speed = 38;
      damage = 20;
    } else if (type === 'STALKER') {
      hp = 55;
      speed = 95;
      damage = 35;
    }

    const zombie: Zombie = {
      id: 'z_' + Math.random().toString(36).substring(2, 9),
      type,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      width,
      height,
      hp,
      maxHp: hp,
      speed,
      damage,
      attackCooldown: 1.2,
      attackTimer: 0.5,
      isDead: false,
    };

    this.zombies.push(zombie);
    sound.playZombieSound('growl');
  }

  /**
   * Handle Zombie Hit (Physics, Damage, Knockback, Decapitation)
   */
  private handleZombieHit(zombie: Zombie, bullet: Bullet, isHeadshot: boolean) {
    // Check Juggernaut Armor (front body shots ping off!)
    if (zombie.type === 'JUGGERNAUT' && !isHeadshot && !bullet.isExplosive) {
      sound.playHitArmor();
      this.addFloatingText(zombie.x + zombie.width / 2, zombie.y, 'ARMOR DEFLECTED', '#94a3b8');
      this.spawnSparks(bullet.x, bullet.y, 4);
      zombie.vx += (bullet.vx > 0 ? 1 : -1) * 20;
      return;
    }

    // Critical math
    const perkHeadshotBonus = 1 + this.profile.perks.sharpshooterLevel * 0.25;
    const isCrit = isHeadshot || Math.random() < bullet.critChance;
    const multiplier = isHeadshot ? 2.5 * perkHeadshotBonus : isCrit ? 1.5 : 1.0;
    const finalDamage = Math.round(bullet.damage * multiplier);

    zombie.hp -= finalDamage;
    sound.playHitFlesh(isCrit);

    // Kinetic Knockback Impulse
    const angle = Math.atan2(bullet.vy, bullet.vx);
    const force = (bullet.knockback * (isHeadshot ? 1.4 : 1.0)) / (zombie.type === 'BRUTE' ? 2.5 : 1.0);
    zombie.vx += Math.cos(angle) * force;
    zombie.vy += Math.sin(angle) * force;

    // Blood spray particles
    this.spawnBloodParticles(bullet.x, bullet.y, Math.cos(angle), Math.sin(angle), isHeadshot ? 12 : 6);

    // Floating text
    this.addFloatingText(
      zombie.x + zombie.width / 2,
      zombie.y - 10,
      isHeadshot ? `HEADSHOT -${finalDamage}` : `-${finalDamage}`,
      isHeadshot ? '#ef4444' : isCrit ? '#f59e0b' : '#facc15',
      isCrit
    );

    // Howler Screech triggered on damage
    if (zombie.type === 'HOWLER' && !zombie.isFrenzied && zombie.hp > 0) {
      zombie.isFrenzied = true;
      zombie.frenzyTimer = 5;
      sound.playZombieSound('shriek');
      // Frenzy nearby zombies
      this.zombies.forEach((oz) => {
        if (!oz.isDead) {
          oz.isFrenzied = true;
          oz.frenzyTimer = 4;
        }
      });
      this.addFloatingText(zombie.x, zombie.y - 25, 'HORDE ENRAGED!', '#e11d48', true);
    }

    // Check Death
    if (zombie.hp <= 0 && !zombie.isDead) {
      zombie.isDead = true;
      this.totalKillsThisRun++;
      if (isHeadshot) this.headshotsThisRun++;
      this.zombiesRemaining = Math.max(0, this.zombiesRemaining - 1);
      this.callbacks.onZombiesRemainingChange(this.zombiesRemaining);

      // Create Ragdoll Body
      const rag = physics.createZombieRagdoll(
        zombie,
        bullet.x,
        bullet.y,
        Math.cos(angle) * force * 1.5,
        Math.sin(angle) * force * 1.5,
        isHeadshot
      );
      this.ragdolls.push(rag);
      zombie.ragdoll = rag;

      // Add permanent blood decal on ground
      this.decals.push({
        x: zombie.x + zombie.width / 2,
        y: this.renderer.floorY - 10,
        radius: isHeadshot ? 22 : 14,
        color: '#7f1d1d',
        opacity: 0.75,
        splatterType: isHeadshot ? 'burst' : 'pool',
      });

      // Volatile exploder detonates on death!
      if (zombie.type === 'VOLATILE') {
        sound.playZombieSound('exploder_hiss');
        this.detonateExplosion(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, 130, 180);
      } else {
        sound.playZombieSound('death');
      }
    }
  }

  /**
   * Environmental Object Interaction / Trigger
   */
  private handleObjectHit(obj: EnvironmentalObject, bullet: Bullet) {
    if (obj.type === 'BARREL_EXPLOSIVE') {
      obj.hp -= bullet.damage;
      this.spawnSparks(bullet.x, bullet.y, 4);
      if (obj.hp <= 0 && !obj.isDestroyed) {
        obj.isDestroyed = true;
        this.detonateExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2, 140, 240);
      }
    } else if (obj.type === 'BREAKER_BOX') {
      if ((obj.cooldown ?? 0) <= 0) {
        obj.cooldown = 8;
        this.triggerElectricalArc(obj.x + obj.width / 2, obj.y + obj.height);
      }
    }
  }

  /**
   * Detonate Area-of-Effect Explosion with ragdoll blast impulse
   */
  public detonateExplosion(x: number, y: number, radius: number, damage: number) {
    sound.playExplosion();
    this.triggerScreenShake(14);

    // Shockwave particle
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.45,
      maxLife: 0.45,
      size: 15,
      color: '#f97316',
      alpha: 1,
      type: 'shockwave',
    });

    // Fire & smoke particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        size: 5 + Math.random() * 8,
        color: Math.random() > 0.4 ? '#ef4444' : '#f97316',
        alpha: 1,
        type: 'fire',
      });
    }

    // Apply explosive physics impulse to live zombies and ragdolls
    physics.applyExplosionImpulse(
      { x, y, radius, damage },
      this.zombies,
      this.ragdolls,
      (decal) => this.decals.push(decal),
      (pList) => this.particles.push(...pList)
    );

    // Chain reaction with nearby explosive barrels
    for (const obj of this.envObjects) {
      if (obj.type === 'BARREL_EXPLOSIVE' && !obj.isDestroyed) {
        const dist = Math.hypot(obj.x + obj.width / 2 - x, obj.y + obj.height / 2 - y);
        if (dist < radius) {
          obj.isDestroyed = true;
          setTimeout(() => {
            this.detonateExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2, 140, 240);
          }, 120);
        }
      }
    }
  }

  /**
   * Electrical Arc Shock
   */
  public triggerElectricalArc(x: number, y: number) {
    sound.playElectricZap();
    this.addFloatingText(x, y - 20, 'HIGH VOLTAGE STUN!', '#38bdf8', true);

    // Shockwave particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        life: 0.35,
        maxLife: 0.35,
        size: 3,
        color: '#38bdf8',
        alpha: 1,
        type: 'spark',
      });
    }

    // Electrocute and stun all active zombies
    for (const z of this.zombies) {
      if (z.isDead || z.isHidden) continue;
      z.hp -= 45;
      z.vx += (Math.random() - 0.5) * 120;
      z.vy -= 40;
      if (z.hp <= 0) {
        z.isDead = true;
        this.totalKillsThisRun++;
        this.zombiesRemaining = Math.max(0, this.zombiesRemaining - 1);
        this.callbacks.onZombiesRemainingChange(this.zombiesRemaining);
      }
    }
  }

  /**
   * Search an environmental hiding spot in Cleanup Phase
   */
  public searchSpot(objectId: string) {
    if (this.phase !== 'CLEANUP') return;

    const obj = this.envObjects.find((o) => o.id === objectId);
    if (!obj || obj.isSearched) return;

    obj.isSearched = true;
    sound.playUI('breach_door');

    // Lurking zombie ambush!
    if (obj.hasHiddenZombie && obj.hiddenZombieType) {
      this.triggerScreenShake(8);
      this.addFloatingText(obj.x + obj.width / 2, obj.y - 15, 'AMBUSH!', '#ef4444', true);
      sound.playZombieSound('shriek');

      const zombie: Zombie = {
        id: 'z_ambush_' + Math.random().toString(36).substring(2, 9),
        type: obj.hiddenZombieType,
        x: obj.x,
        y: obj.y + 10,
        vx: (Math.random() - 0.5) * 60,
        vy: 120, // lunges toward player!
        width: 28,
        height: 48,
        hp: 40,
        maxHp: 40,
        speed: 80,
        damage: 25,
        attackCooldown: 1.0,
        attackTimer: 0.3,
        isDead: false,
        isHidden: false,
      };

      this.zombies.push(zombie);
    } else {
      // Loot found!
      this.addFloatingText(obj.x + obj.width / 2, obj.y - 15, '+35 SCRAP FOUND', '#facc15');
      this.profile.scrap += 35;
      sound.playUI('purchase');
    }
  }

  /**
   * Touch input handling
   */
  public handlePointerDown(x: number, y: number) {
    this.isPointerDown = true;
    this.pointerPos = { x, y };
    this.updateAim(x, y);

    // Check if player tapped an environmental object directly (Barrel or Search Door)
    for (const obj of this.envObjects) {
      if (
        x >= obj.x - 10 &&
        x <= obj.x + obj.width + 10 &&
        y >= obj.y - 10 &&
        y <= obj.y + obj.height + 10
      ) {
        if (this.phase === 'CLEANUP' && obj.type.startsWith('SEARCH_')) {
          this.searchSpot(obj.id);
          return;
        } else if (obj.type === 'BREAKER_BOX') {
          if ((obj.cooldown ?? 0) <= 0) {
            obj.cooldown = 8;
            this.triggerElectricalArc(obj.x + obj.width / 2, obj.y + obj.height);
            return;
          }
        }
      }
    }

    // Fire weapon on single tap
    this.fireWeapon();
  }

  public handlePointerMove(x: number, y: number) {
    this.pointerPos = { x, y };
    this.updateAim(x, y);
  }

  public handlePointerUp() {
    this.isPointerDown = false;
    this.autoFireTimer = 0;
  }

  public movePlayer(deltaX: number) {
    this.player.x = Math.max(30, Math.min(this.renderer.width - 30, this.player.x + deltaX));
    this.updateAim(this.pointerPos.x, this.pointerPos.y);
  }

  private updateAim(targetX: number, targetY: number) {
    const px = this.player.x;
    const py = this.renderer.floorY - 50;
    const angle = Math.atan2(targetY - py, targetX - px);
    this.player.aimAngle = angle;
  }

  /**
   * Fire active weapon
   */
  public fireWeapon() {
    if (this.player.isReloading) return;

    if (this.player.ammoInMag <= 0) {
      sound.playReload('empty');
      this.startReload();
      return;
    }

    this.player.ammoInMag--;
    this.callbacks.onPlayerStatsChange(this.player);

    const px = this.player.x;
    const py = this.renderer.floorY - 50;
    const baseAngle = this.player.aimAngle;
    const w = this.currentWeapon;

    sound.playGunshot(w.id);
    this.muzzleFlashTimer = 0.08;
    this.triggerScreenShake(w.id === 'launcher' || w.id === 'shotgun' ? 6 : 2);

    // Calculate spread based on accuracy
    const spreadMax = (1 - w.accuracy) * 0.35;
    const pelletCount = w.pelletCount ?? 1;

    for (let i = 0; i < pelletCount; i++) {
      const spread = (Math.random() - 0.5) * spreadMax;
      const angle = baseAngle + spread;
      const speed = w.id === 'launcher' ? 550 : 1200;

      this.bullets.push({
        id: 'b_' + Math.random().toString(36).substring(2, 9),
        x: px + Math.cos(angle) * 30,
        y: py + Math.sin(angle) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: w.damage,
        knockback: w.knockback,
        critChance: w.critChance,
        isExplosive: !!w.isExplosive,
        pierceRemaining: w.pierceCount ?? 1,
        trail: [],
      });
    }

    // Auto reload if empty
    if (this.player.ammoInMag <= 0) {
      this.startReload();
    }
  }

  /**
   * Reload Mechanic & Tactical Active Reload
   */
  public triggerReloadOrActiveSweetSpot() {
    if (!this.player.isReloading) {
      this.startReload();
      return;
    }

    // Active reload sweet spot window: 0.45 to 0.70
    const progress = this.player.reloadProgress;
    if (progress >= 0.45 && progress <= 0.75) {
      // SUCCESS! Instant reload!
      this.player.activeReloadSuccess = true;
      sound.playReload('active_success');
      this.addFloatingText(this.player.x, this.renderer.floorY - 90, 'PERFECT ACTIVE RELOAD! +20% SPEED', '#38bdf8', true);
      this.finishReload();
    } else {
      // Missed active reload penalty
      sound.playReload('empty');
      this.player.reloadProgress = 0;
      this.addFloatingText(this.player.x, this.renderer.floorY - 90, 'RELOAD JAMMED!', '#ef4444');
    }
  }

  public startReload() {
    if (this.player.isReloading || this.player.ammoInMag === this.currentWeapon.magazineSize) return;
    this.player.isReloading = true;
    this.player.reloadProgress = 0;
    this.player.activeReloadSuccess = false;
    sound.playReload('start');
    this.callbacks.onPlayerStatsChange(this.player);
  }

  private finishReload() {
    this.player.isReloading = false;
    this.player.reloadProgress = 0;
    this.player.ammoInMag = this.currentWeapon.magazineSize;
    sound.playReload('complete');
    this.callbacks.onPlayerStatsChange(this.player);
  }

  /**
   * Switch Weapon
   */
  public switchWeapon(id: WeaponId) {
    if (id === this.currentWeapon.id) return;
    this.currentWeapon = getCalculatedWeaponStats(id, this.profile);
    this.player.currentWeaponId = id;
    this.player.ammoInMag = this.currentWeapon.magazineSize;
    this.player.isReloading = false;
    sound.playReload('complete');
    this.callbacks.onPlayerStatsChange(this.player);
  }

  /**
   * Damage Barricade & Player Health
   */
  private damageBarricade(damage: number) {
    if (this.barricadeHp > 0) {
      this.barricadeHp = Math.max(0, this.barricadeHp - damage);
      this.callbacks.onBarricadeChange(this.barricadeHp, this.maxBarricadeHp);

      if (this.barricadeHp <= 0) {
        this.addFloatingText(this.renderer.width / 2, this.renderer.floorY - 60, 'BARRICADE BREACHED!', '#ef4444', true);
      }
    } else {
      // Direct damage to player
      this.player.hp = Math.max(0, this.player.hp - damage);
      this.damageTakenThisRun += damage;
      this.callbacks.onPlayerStatsChange(this.player);

      if (this.player.hp <= 0) {
        this.gameOver();
      }
    }
  }

  /**
   * Repair Barricade
   */
  public repairBarricade() {
    if (this.barricadeHp >= this.maxBarricadeHp) return;
    const repairAmount = 60 + this.profile.perks.engineerLevel * 25;
    this.barricadeHp = Math.min(this.maxBarricadeHp, this.barricadeHp + repairAmount);
    sound.playBarricadeSound('repair');
    this.callbacks.onBarricadeChange(this.barricadeHp, this.maxBarricadeHp);
    this.addFloatingText(this.renderer.width / 2, this.renderer.floorY - 60, `+${repairAmount} BARRICADE REPAIRED`, '#10b981');
  }

  private triggerScreenShake(intensity: number) {
    this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
  }

  private spawnSparks(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.4,
        size: 2,
        color: '#facc15',
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private spawnBloodParticles(x: number, y: number, dirX: number, dirY: number, count: number) {
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 1.2;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: (dirX + spread) * speed,
        vy: (dirY + spread) * speed,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        size: 2 + Math.random() * 3,
        color: '#991b1b',
        alpha: 1,
        type: 'blood',
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string, isCrit = false) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0.8,
      isCrit,
    });
  }

  /**
   * Complete Mission Victory
   */
  private completeMission() {
    this.phase = 'VICTORY';
    this.callbacks.onPhaseChange(this.phase);
    sound.playUI('victory');

    // Calculate stars
    let stars = 1;
    if (this.barricadeHp >= this.maxBarricadeHp * 0.7) stars++;
    if (this.headshotsThisRun >= 5) stars++;

    // Scavenger perk bonus
    const scavengerMultiplier = 1 + this.profile.perks.scavengerLevel * 0.2;
    const coinsEarned = Math.round(this.location.rewardCoins * scavengerMultiplier);
    const scrapEarned = Math.round(this.location.rewardScrap * scavengerMultiplier);

    this.callbacks.onMissionComplete(stars, coinsEarned, scrapEarned, {
      kills: this.totalKillsThisRun,
      headshots: this.headshotsThisRun,
    });
  }

  /**
   * Game Over
   */
  private gameOver() {
    this.phase = 'DEFEAT';
    this.callbacks.onPhaseChange(this.phase);
    sound.playUI('defeat');
    this.callbacks.onGameOver({
      kills: this.totalKillsThisRun,
      headshots: this.headshotsThisRun,
      waveReached: this.currentWave,
    });
  }
}
