/**
 * Sector Quarantine: Canvas 2D Graphics & Lighting Renderer
 * Optimized 60 FPS renderer with dynamic 2D lighting, flashlight cone, blood decals, and ragdolls.
 */

import {
  BloodDecal,
  Bullet,
  EnvironmentalObject,
  FloatingText,
  GamePhase,
  Particle,
  PlayerProfile,
  PlayerStats,
  RagdollPart,
  WeaponStats,
  Zombie,
} from '../types/game';

export class GameRenderer {
  public width = 420;
  public height = 750;
  public floorY = 640;

  /**
   * Main Render Pipeline
   */
  public render(
    ctx: CanvasRenderingContext2D,
    phase: GamePhase,
    theme: string,
    player: PlayerStats,
    weapon: WeaponStats,
    profile: PlayerProfile,
    zombies: Zombie[],
    ragdolls: RagdollPart[][],
    bullets: Bullet[],
    particles: Particle[],
    decals: BloodDecal[],
    floatingTexts: FloatingText[],
    envObjects: EnvironmentalObject[],
    barricadeHp: number,
    maxBarricadeHp: number,
    muzzleFlashTimer: number,
    screenShake: { x: number; y: number },
    time: number
  ) {
    ctx.save();
    // Screen shake
    ctx.translate(screenShake.x, screenShake.y);

    // 1. Draw Environmental Background & Architecture
    this.drawBackground(ctx, theme, time);

    // 2. Persistent Blood & Scorch Decals
    this.drawDecals(ctx, decals);

    // 3. Environmental Objects (Barrels, Breakers, Doors)
    this.drawEnvironmentalObjects(ctx, envObjects, phase, time);

    // 4. Ragdoll Corpses (Render behind live zombies)
    this.drawRagdolls(ctx, ragdolls);

    // 5. Live Zombies
    this.drawZombies(ctx, zombies, time);

    // 6. Barricade Line
    this.drawBarricade(ctx, barricadeHp, maxBarricadeHp, time);

    // 7. Player Operator
    this.drawPlayer(ctx, player, weapon, profile, muzzleFlashTimer, time);

    // 8. Projectiles & Shells
    this.drawBullets(ctx, bullets);

    // 9. Particle Effects (Blood, Smoke, Sparks, Shocks)
    this.drawParticles(ctx, particles);

    // 10. Dynamic Lighting & Flashlight Cone (Cleanup Phase tension)
    this.drawDynamicLighting(ctx, phase, player, muzzleFlashTimer, time);

    // 11. Floating Combat Damage Numbers
    this.drawFloatingTexts(ctx, floatingTexts);

    ctx.restore();
  }

  /**
   * 1. Thematic Backgrounds
   */
  private drawBackground(ctx: CanvasRenderingContext2D, theme: string, time: number) {
    // Deep ceiling/wall backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.floorY);
    bgGrad.addColorStop(0, '#090a0f');
    bgGrad.addColorStop(0.7, '#11131a');
    bgGrad.addColorStop(1, '#181b24');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Floor texture
    const floorGrad = ctx.createLinearGradient(0, this.floorY, 0, this.height);
    floorGrad.addColorStop(0, '#1c1f26');
    floorGrad.addColorStop(1, '#0e1014');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, this.floorY, this.width, this.height - this.floorY);

    // Floor baseline hairline
    ctx.strokeStyle = '#272b38';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.floorY);
    ctx.lineTo(this.width, this.floorY);
    ctx.stroke();

    // Architectural backdrop details per theme
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Distant pillars / doorways
    for (let x = 40; x < this.width; x += 90) {
      ctx.strokeRect(x, 120, 50, this.floorY - 120);
      // Warning stripes or cross beams
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.lineTo(x + 50, 180);
      ctx.stroke();
    }

    // Emergency lights flickering in the background
    const flicker = Math.sin(time * 6) > 0.3 ? 0.35 : 0.15;
    ctx.fillStyle = theme === 'hospital' ? `rgba(239, 68, 68, ${flicker})` : `rgba(245, 158, 11, ${flicker * 0.7})`;
    ctx.beginPath();
    ctx.arc(60, 100, 6, 0, Math.PI * 2);
    ctx.arc(this.width - 60, 100, 6, 0, Math.PI * 2);
    ctx.fill();

    // Ceiling conduits / pipes
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(this.width, 50);
    ctx.moveTo(0, 65);
    ctx.lineTo(this.width, 65);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 2. Persistent Decals
   */
  private drawDecals(ctx: CanvasRenderingContext2D, decals: BloodDecal[]) {
    for (const d of decals) {
      ctx.save();
      ctx.globalAlpha = d.opacity;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.radius, d.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Satellite droplets
      if (d.splatterType === 'burst') {
        ctx.beginPath();
        ctx.arc(d.x + d.radius * 0.7, d.y - 4, 3, 0, Math.PI * 2);
        ctx.arc(d.x - d.radius * 0.8, d.y + 3, 2.5, 0, Math.PI * 2);
        ctx.arc(d.x + 5, d.y + d.radius * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /**
   * 3. Environmental Objects
   */
  private drawEnvironmentalObjects(
    ctx: CanvasRenderingContext2D,
    objects: EnvironmentalObject[],
    phase: GamePhase,
    time: number
  ) {
    for (const obj of objects) {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      if (obj.type === 'BARREL_EXPLOSIVE') {
        if (!obj.isDestroyed) {
          // Red steel drum
          const grad = ctx.createLinearGradient(0, 0, obj.width, 0);
          grad.addColorStop(0, '#b91c1c');
          grad.addColorStop(0.5, '#ef4444');
          grad.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, obj.width, obj.height);

          // Steel bands
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, 8, obj.width, 4);
          ctx.fillRect(0, obj.height - 12, obj.width, 4);

          // Danger symbol (Yellow hazard diamond)
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(obj.width / 2, 18);
          ctx.lineTo(obj.width / 2 + 8, 26);
          ctx.lineTo(obj.width / 2, 34);
          ctx.lineTo(obj.width / 2 - 8, 26);
          ctx.closePath();
          ctx.fill();

          // Pulsing target ring for mobile tap affordance
          const pulse = (Math.sin(time * 5) + 1) * 0.5;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(-4, -4, obj.width + 8, obj.height + 8);
        } else {
          // Melted scorched barrel remains
          ctx.fillStyle = '#27272a';
          ctx.fillRect(4, obj.height - 12, obj.width - 8, 12);
        }
      } else if (obj.type === 'BREAKER_BOX') {
        // High voltage electric box
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(0, 0, obj.width, obj.height);
        ctx.strokeStyle = '#e4e4e7';
        ctx.strokeRect(0, 0, obj.width, obj.height);

        // Lightning bolt icon
        ctx.fillStyle = (obj.cooldown ?? 0) <= 0 ? '#38bdf8' : '#71717a';
        ctx.beginPath();
        ctx.moveTo(obj.width / 2 + 3, 6);
        ctx.lineTo(obj.width / 2 - 4, 16);
        ctx.lineTo(obj.width / 2 + 1, 16);
        ctx.lineTo(obj.width / 2 - 2, 26);
        ctx.lineTo(obj.width / 2 + 5, 14);
        ctx.lineTo(obj.width / 2, 14);
        ctx.closePath();
        ctx.fill();

        // Active electric arc sparks
        if ((obj.cooldown ?? 0) <= 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(obj.width / 2, obj.height);
          ctx.lineTo(obj.width / 2 + (Math.random() - 0.5) * 12, obj.height + 15);
          ctx.lineTo(obj.width / 2, obj.height + 25);
          ctx.stroke();
        }
      } else if (obj.type.startsWith('SEARCH_')) {
        // Cleanup Phase search points: Door, Locker, Desk
        const isSearched = obj.isSearched;
        ctx.fillStyle = isSearched ? '#27272a' : '#3f3f46';
        ctx.fillRect(0, 0, obj.width, obj.height);
        ctx.strokeStyle = isSearched ? '#52525b' : '#a1a1aa';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, obj.width, obj.height);

        // Door knob / handle
        ctx.fillStyle = '#f4f4f5';
        ctx.fillRect(obj.width - 8, obj.height / 2 - 4, 4, 8);

        // Pulse search ring during cleanup if not searched yet
        if (phase === 'CLEANUP' && !isSearched) {
          const p = (Math.sin(time * 4) + 1) * 0.5;
          ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 + p * 0.6})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(-5, -5, obj.width + 10, obj.height + 10);

          // "TAP TO SEARCH" tag
          ctx.fillStyle = '#facc15';
          ctx.font = '10px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('INSPECT', obj.width / 2, -10);
        }
      }

      ctx.restore();
    }
  }

  /**
   * 4. Multi-Node Ragdoll Physics Bodies
   */
  private drawRagdolls(ctx: CanvasRenderingContext2D, ragdolls: RagdollPart[][]) {
    for (const rag of ragdolls) {
      for (const part of rag) {
        ctx.save();
        ctx.translate(part.x, part.y);
        ctx.rotate(part.angle);

        if (part.type === 'head') {
          // Zombie head
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(0, 0, part.radius, 0, Math.PI * 2);
          ctx.fill();

          // Blood neck stump if decapitated
          if (part.isDecapitated) {
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.arc(0, part.radius - 2, 4, 0, Math.PI);
            ctx.fill();
          }
        } else if (part.type === 'torso') {
          // Zombie torso / jacket
          ctx.fillStyle = '#334155';
          ctx.fillRect(-part.radius, -part.radius * 1.2, part.radius * 2, part.radius * 2.2);

          // Blood stains
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.arc(2, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (part.type.startsWith('arm')) {
          ctx.fillStyle = '#475569';
          ctx.fillRect(-part.radius, -part.radius * 1.5, part.radius * 2, part.radius * 3);
        } else if (part.type.startsWith('leg')) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-part.radius, -part.radius * 1.6, part.radius * 2, part.radius * 3.2);
        }

        ctx.restore();
      }
    }
  }

  /**
   * 5. Live Zombies with procedural animations
   */
  private drawZombies(ctx: CanvasRenderingContext2D, zombies: Zombie[], time: number) {
    for (const z of zombies) {
      if (z.isDead || z.isHidden) continue;

      ctx.save();
      ctx.translate(z.x, z.y);

      // Walk wobble cycle based on time and speed
      const wobble = Math.sin(time * (z.speed * 0.12) + z.x) * 4;
      const tilt = (z.vx / 100) * 0.15;
      ctx.rotate(tilt);

      const cx = z.width / 2;
      const cy = z.height / 2;

      // Color scheme based on archetype
      let skinColor = '#52525b';
      let clothesColor = '#3f3f46';
      let eyeGlow = '#ef4444';

      if (z.type === 'SPRINTER') {
        skinColor = '#64748b';
        clothesColor = '#0f172a';
        eyeGlow = '#f97316';
      } else if (z.type === 'BRUTE') {
        skinColor = '#334155';
        clothesColor = '#18181b';
        eyeGlow = '#dc2626';
      } else if (z.type === 'VOLATILE') {
        skinColor = '#15803d';
        clothesColor = '#14532d';
        eyeGlow = '#84cc16';
      } else if (z.type === 'JUGGERNAUT') {
        skinColor = '#475569';
        clothesColor = '#020617';
        eyeGlow = '#38bdf8';
      } else if (z.type === 'HOWLER') {
        skinColor = '#701a75';
        clothesColor = '#4c0519';
        eyeGlow = '#e11d48';
      }

      // Crawler is low to ground
      const isCrawler = z.type === 'CRAWLER';
      const drawHeight = isCrawler ? z.height * 0.55 : z.height;

      // Legs (shuffling animation)
      if (!isCrawler) {
        ctx.fillStyle = '#1e293b';
        const legSwing = Math.sin(time * 12) * 5;
        ctx.fillRect(cx - 8, drawHeight - 16 + legSwing, 6, 16);
        ctx.fillRect(cx + 2, drawHeight - 16 - legSwing, 6, 16);
      }

      // Torso
      ctx.fillStyle = clothesColor;
      ctx.fillRect(cx - 10, cy - 8 + (isCrawler ? 4 : 0), 20, 22);

      // Armored vest for Juggernaut
      if (z.type === 'JUGGERNAUT') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx - 12, cy - 8, 24, 18);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 12, cy - 8, 24, 18);
      }

      // Volatile toxic pustules
      if (z.type === 'VOLATILE') {
        const pPulse = (Math.sin(time * 8) + 1) * 0.5;
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 6, 4 + pPulse * 2, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy, 5 + pPulse * 2, 0, Math.PI * 2);
        ctx.arc(cx, cy + 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arms reaching forward
      ctx.fillStyle = skinColor;
      const reach = Math.sin(time * 8) * 4;
      ctx.fillRect(cx - 14, cy - 4, 6, 16 + reach);
      ctx.fillRect(cx + 8, cy - 4, 6, 16 - reach);

      // Head
      ctx.fillStyle = skinColor;
      const headY = isCrawler ? cy - 2 : cy - 22 + wobble * 0.3;
      ctx.beginPath();
      ctx.arc(cx, headY, z.type === 'BRUTE' ? 12 : 9, 0, Math.PI * 2);
      ctx.fill();

      // Juggernaut Helmet
      if (z.type === 'JUGGERNAUT') {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx, headY - 2, 10, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Glowing Infected Eyes
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(cx - 3, headY - 1, 1.8, 0, Math.PI * 2);
      ctx.arc(cx + 3, headY - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Howler Screech shockwave rings
      if (z.type === 'HOWLER' && z.isFrenzied) {
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, headY, 16 + (time * 40 % 24), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Health Bar (Discrete, only shown when damaged)
      if (z.hp < z.maxHp) {
        const hpBarW = 28;
        const hpPercent = Math.max(0, z.hp / z.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(cx - hpBarW / 2, headY - 16, hpBarW, 4);

        ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(cx - hpBarW / 2, headY - 16, hpBarW * hpPercent, 4);
      }

      ctx.restore();
    }
  }

  /**
   * 6. Barricade Line
   */
  private drawBarricade(
    ctx: CanvasRenderingContext2D,
    hp: number,
    maxHp: number,
    time: number
  ) {
    const y = this.floorY - 45;
    const hpRatio = hp / maxHp;

    ctx.save();
    // Steel and wood crossbeams
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, y, this.width, 14);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, y + 20, this.width, 14);

    // Vertical metal reinforcing posts
    ctx.fillStyle = '#334155';
    for (let x = 30; x < this.width; x += 60) {
      ctx.fillRect(x, y - 10, 10, 50);
      // Bolts
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x + 5, y - 4, 2, 0, Math.PI * 2);
      ctx.arc(x + 5, y + 16, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Razor wire on top if high HP
    if (hpRatio > 0.4) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < this.width; x += 12) {
        ctx.arc(x, y - 8, 6, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    // Barricade damage cracks if low HP
    if (hpRatio < 0.5) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, y);
      ctx.lineTo(135, y + 25);
      ctx.moveTo(280, y + 5);
      ctx.lineTo(300, y + 30);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 7. Player Operator & Weapon Aiming
   */
  private drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerStats,
    weapon: WeaponStats,
    profile: PlayerProfile,
    muzzleFlashTimer: number,
    time: number
  ) {
    const px = player.x;
    const py = this.floorY - 18;

    ctx.save();
    ctx.translate(px, py);

    // Outfit palette
    let vestColor = '#18181b';
    let camoColor = '#27272a';
    if (profile.cosmeticOutfit === 'hazmat_amber') {
      vestColor = '#d97706';
      camoColor = '#b45309';
    } else if (profile.cosmeticOutfit === 'urban_camo') {
      vestColor = '#475569';
      camoColor = '#64748b';
    } else if (profile.cosmeticOutfit === 'ghost_recon') {
      vestColor = '#0f172a';
      camoColor = '#1e293b';
    }

    // Legs
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-10, -18, 7, 20);
    ctx.fillRect(3, -18, 7, 20);

    // Torso / tactical vest
    ctx.fillStyle = camoColor;
    ctx.fillRect(-12, -42, 24, 26);
    ctx.fillStyle = vestColor;
    ctx.fillRect(-9, -40, 18, 22);

    // Radio antenna & patch
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(7, -42);
    ctx.lineTo(9, -52);
    ctx.stroke();

    // Head / Tactical Helmet
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(0, -49, 10, 0, Math.PI * 2);
    ctx.fill();

    // Tactical Visor / Goggles
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, -51, 12, 4);

    // Aiming arm & weapon rotation
    ctx.save();
    ctx.translate(0, -32); // shoulder pivot
    ctx.rotate(player.aimAngle);

    // Weapon barrel / receiver
    ctx.fillStyle = '#09090b';
    const gunLen = weapon.id === 'sniper' ? 38 : weapon.id === 'shotgun' ? 30 : weapon.id === 'launcher' ? 28 : 22;
    ctx.fillRect(0, -3, gunLen, 6);

    // Laser sight targeting line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(gunLen, 0);
    ctx.lineTo(gunLen + 320, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reticle dot at laser tip
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(gunLen + 320, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle Flash
    if (muzzleFlashTimer > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(gunLen + 6, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(gunLen + 4, 0, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    ctx.restore();
  }

  /**
   * 8. Bullets & Tracers
   */
  private drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]) {
    for (const b of bullets) {
      ctx.save();
      // Tracer line
      if (b.trail.length > 1) {
        ctx.strokeStyle = b.isExplosive ? 'rgba(249, 115, 22, 0.7)' : 'rgba(250, 204, 21, 0.6)';
        ctx.lineWidth = b.isExplosive ? 3.5 : 2;
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let i = 1; i < b.trail.length; i++) {
          ctx.lineTo(b.trail[i].x, b.trail[i].y);
        }
        ctx.stroke();
      }

      // Bullet head
      ctx.fillStyle = b.isExplosive ? '#f97316' : '#fef08a';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.isExplosive ? 4.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * 9. Particles
   */
  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * 10. Dynamic Lighting & Flashlight Cone
   */
  private drawDynamicLighting(
    ctx: CanvasRenderingContext2D,
    phase: GamePhase,
    player: PlayerStats,
    muzzleFlashTimer: number,
    time: number
  ) {
    if (phase !== 'CLEANUP' && muzzleFlashTimer <= 0) return;

    ctx.save();
    // In Cleanup Phase, we create a spooky dark overlay, carved out by flashlight cone
    if (phase === 'CLEANUP') {
      // Offscreen darkness mask
      const darkCanvas = document.createElement('canvas');
      darkCanvas.width = this.width;
      darkCanvas.height = this.height;
      const dctx = darkCanvas.getContext('2d');
      if (dctx) {
        // Deep ambient shadow
        dctx.fillStyle = 'rgba(5, 7, 12, 0.88)';
        dctx.fillRect(0, 0, this.width, this.height);

        // Flashlight beam cutout using destination-out
        dctx.globalCompositeOperation = 'destination-out';

        const px = player.x;
        const py = this.floorY - 50;
        const angle = player.aimAngle;
        const coneLength = 480;
        const coneAngle = 0.55; // ~32 degree beam

        dctx.beginPath();
        dctx.moveTo(px, py);
        dctx.arc(px, py, coneLength, angle - coneAngle / 2, angle + coneAngle / 2);
        dctx.closePath();
        dctx.fill();

        // Player immediate proximity circle
        dctx.beginPath();
        dctx.arc(px, py, 75, 0, Math.PI * 2);
        dctx.fill();

        // Apply dark mask onto main canvas
        ctx.drawImage(darkCanvas, 0, 0);
      }
    }

    // Flashlight illumination beam glow
    if (phase === 'CLEANUP') {
      const px = player.x;
      const py = this.floorY - 50;
      const angle = player.aimAngle;

      const grad = ctx.createRadialGradient(px, py, 40, px + Math.cos(angle) * 350, py + Math.sin(angle) * 350, 240);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.15)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.arc(px, py, 460, angle - 0.28, angle + 0.28);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * 11. Floating Combat Texts
   */
  private drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
    for (const t of texts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.font = t.isCrit ? 'bold 15px "Plus Jakarta Sans", sans-serif' : '13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';

      // Drop shadow for legibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}
