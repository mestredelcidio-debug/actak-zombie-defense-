import { ZombieDef, ZombieType } from '../types';
import { ZOMBIES_CATALOG } from '../data/zombies';
import { VectorBloodSystem } from './VectorBloodSystem';

export class VectorZombie {
  public x: number;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 24;
  public height: number = 56;
  public isGrounded: boolean = true;
  public isDead: boolean = false;
  public hp: number;
  public def: ZombieDef;
  public hitFlashTimer: number = 0;
  public animTime: number = 0;

  // Individual natural variation
  public speedMultiplier: number = 0.9 + Math.random() * 0.22;
  public walkCycleOffset: number = Math.random() * Math.PI * 2;

  // Attack States ("acerta com as mãos para me matar")
  public isAttacking: boolean = false;
  public attackTimer: number = 0;
  public attackInterval: number = 0.65; // Seconds between hand claw strikes
  public attackHitDelivered: boolean = false;
  public facingRight: boolean = false;
  public slashTrailProgress: number = 0;

  // Dismemberment & Ragdoll States
  public hasHead: boolean = true;
  public hasLeftArm: boolean = true;
  public hasRightArm: boolean = true;
  public isRagdoll: boolean = false;
  public ragdollTime: number = 0;
  public ragdollAngle: number = 0;
  public ragdollVAngle: number = 0;

  constructor(type: ZombieType, spawnX: number) {
    this.def = ZOMBIES_CATALOG[type];
    this.hp = this.def.maxHp;
    this.x = spawnX;
    this.animTime = this.walkCycleOffset;
    this.attackTimer = Math.random() * 0.2;

    if (this.def.type === 'runner') {
      this.attackInterval = 0.45;
    } else if (this.def.type === 'crawler') {
      this.attackInterval = 0.55;
      this.height = 42;
    } else if (this.def.type === 'brute') {
      this.attackInterval = 0.85;
      this.width = 28;
      this.height = 62;
    } else if (this.def.type === 'boss_mutant') {
      this.attackInterval = 0.8;
      this.width = 32;
      this.height = 68;
    }
  }

  public takeDamage(damage: number, hitDirX: number, bloodSys: VectorBloodSystem): boolean {
    this.hp -= damage;
    this.hitFlashTimer = 0.16;

    if (this.hp <= 0 && !this.isDead) {
      this.isDead = true;
      this.isAttacking = false;
      this.isRagdoll = true;
      this.vx = hitDirX * (2.8 + Math.random() * 3.5);
      this.vy = -(3.2 + Math.random() * 3.5);
      this.ragdollVAngle = -hitDirX * (4.0 + Math.random() * 4.0);

      // Sever limbs on death
      if (Math.random() < 0.6 && this.hasHead) {
        this.hasHead = false;
        bloodSys.spawnSeveredLimb(this.x, -this.y - 42, hitDirX, 'head', this.getOutfitColor());
      } else if (Math.random() < 0.65 && this.hasRightArm) {
        this.hasRightArm = false;
        bloodSys.spawnSeveredLimb(this.x, -this.y - 28, hitDirX, 'arm', this.getOutfitColor());
      }
      return true;
    }
    return false;
  }

  public updateAttack(dt: number, onHit: (damage: number) => void): boolean {
    if (this.isDead || !this.isAttacking) {
      this.slashTrailProgress = 0;
      return false;
    }

    this.attackTimer += dt;
    const cycle = this.attackTimer % this.attackInterval;
    const progress = cycle / this.attackInterval;

    // Strike down at 60% of the hand swing
    if (progress > 0.58 && !this.attackHitDelivered) {
      this.attackHitDelivered = true;
      this.slashTrailProgress = 1.0;
      onHit(this.def.damage);
      return true;
    }

    if (progress < 0.58) {
      this.attackHitDelivered = false;
    }

    if (this.slashTrailProgress > 0) {
      this.slashTrailProgress -= dt * 4.5;
    }

    return false;
  }

  public update(dt: number, groundY: number) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

    if (this.isDead && this.isRagdoll) {
      this.ragdollTime += dt;
      this.x += this.vx * dt * 28;
      this.vy += 22 * dt;
      this.y -= this.vy * dt * 28;
      this.ragdollAngle += this.ragdollVAngle * dt;

      if (this.y <= 0) {
        this.y = 0;
        this.vx *= 0.5;
        this.ragdollVAngle *= 0.3;
        if (Math.abs(this.vx) < 0.2) {
          this.vx = 0;
          this.ragdollVAngle = 0;
        }
      }
      return;
    }

    // Walking animation
    if (!this.isAttacking) {
      this.animTime += dt * (this.def.type === 'runner' ? 12 : 7);
    }
  }

  private getOutfitColor(): string {
    switch (this.def.type) {
      case 'runner':
        return '#dc2626';
      case 'jumper':
        return '#7e22ce';
      case 'crawler':
        return '#65a30d';
      case 'brute':
        return '#b45309';
      case 'boss_mutant':
        return '#991b1b';
      default:
        return '#3b82f6';
    }
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, groundY: number) {
    const scrX = this.x - camX;
    const scrY = groundY - this.y;

    if (scrX < -150 || scrX > ctx.canvas.width + 150) return;

    ctx.save();
    ctx.translate(scrX, scrY);

    if (this.isRagdoll) {
      ctx.rotate(this.ragdollAngle);
    } else if (this.facingRight) {
      ctx.scale(-1, 1);
    }

    const isHit = this.hitFlashTimer > 0;
    const type = this.def.type;

    let shirtColor = isHit ? '#ffffff' : '#3b82f6';
    let pantsColor = isHit ? '#ffffff' : '#1e293b';
    let skinColor = isHit ? '#ffffff' : '#4ade80';
    const outlineColor = '#090d16';

    if (type === 'runner') {
      shirtColor = isHit ? '#ffffff' : '#dc2626';
      skinColor = isHit ? '#ffffff' : '#22c55e';
    } else if (type === 'jumper') {
      shirtColor = isHit ? '#ffffff' : '#7e22ce';
      skinColor = isHit ? '#ffffff' : '#a855f7';
    } else if (type === 'crawler') {
      shirtColor = isHit ? '#ffffff' : '#65a30d';
      skinColor = isHit ? '#ffffff' : '#84cc16';
    } else if (type === 'brute') {
      shirtColor = isHit ? '#ffffff' : '#b45309';
      pantsColor = isHit ? '#ffffff' : '#334155';
      skinColor = isHit ? '#ffffff' : '#15803d';
    } else if (type === 'boss_mutant') {
      shirtColor = isHit ? '#ffffff' : '#991b1b';
      pantsColor = isHit ? '#ffffff' : '#450a0a';
      skinColor = isHit ? '#ffffff' : '#166534';
    }

    // Drop Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width * 0.65, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Leg stride
    let leftLegAngle = 0;
    let rightLegAngle = 0;
    let bodyBob = 0;

    if (!this.isRagdoll && !this.isAttacking) {
      leftLegAngle = Math.sin(this.animTime) * 0.42;
      rightLegAngle = -Math.sin(this.animTime) * 0.42;
      bodyBob = Math.abs(Math.sin(this.animTime * 2)) * 2;
    }

    const hipY = -22 - bodyBob;
    const torsoY = hipY - 14;

    // 1. BACK LEG
    ctx.save();
    ctx.translate(3, hipY);
    ctx.rotate(leftLegAngle);
    ctx.fillStyle = pantsColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 18, 2.5);
    ctx.fill();
    ctx.stroke();

    // Bare/torn foot
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.roundRect(-4, 15, 8.5, 5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. BACK ARM (Outstretched or striking)
    if (this.hasLeftArm) {
      let armAngle = 0.55;
      if (this.isAttacking) {
        const attackCycle = (this.attackTimer % this.attackInterval) / this.attackInterval;
        armAngle = -0.3 + Math.sin(attackCycle * Math.PI) * 1.4;
      }

      ctx.save();
      ctx.translate(4, torsoY - 4);
      ctx.rotate(-armAngle);
      ctx.fillStyle = shirtColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-3, 0, 6, 15, 2);
      ctx.fill();
      ctx.stroke();

      // Hand / Claws
      ctx.translate(0, 14);
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. TORSO
    ctx.save();
    ctx.translate(0, torsoY);
    ctx.fillStyle = shirtColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-7.5, -9, 15, 21, 3);
    ctx.fill();
    ctx.stroke();

    // Torn fabric, exposed wound and ragged hem make the silhouette less generic.
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-6, 8); ctx.lineTo(-3, 11); ctx.lineTo(-1, 8);
    ctx.lineTo(2, 12); ctx.lineTo(5, 8); ctx.lineTo(7, 10);
    ctx.lineTo(7, 12); ctx.lineTo(-7, 12); ctx.closePath();
    ctx.fill();

    // Blood stain and wound detail
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(-1, 2, 3.5, 4.5, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -2); ctx.lineTo(-1, 1); ctx.lineTo(-3, 4);
    ctx.stroke();
    ctx.restore();

    // 4. FRONT LEG
    ctx.save();
    ctx.translate(-3, hipY);
    ctx.rotate(rightLegAngle);
    ctx.fillStyle = pantsColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 18, 2.5);
    ctx.fill();
    ctx.stroke();

    // Torn foot
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.roundRect(-4, 15, 8.5, 5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. HEAD
    if (this.hasHead) {
      ctx.save();
      ctx.translate(0, torsoY - 14);

      // Head
      ctx.fillStyle = skinColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-6.5, -14, 13, 14, 4);
      ctx.fill();
      ctx.stroke();

      // Sunken/Red glowing eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-4, -9, 2.5, 2.5);
      ctx.fillRect(1, -9, 2.5, 2.5);

      // Snarl mouth
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(-3, -3, 6, 2.5);
      ctx.restore();
    }

    // 6. FRONT ARM (Outstretched claw)
    if (this.hasRightArm) {
      let armAngle = 0.7;
      if (this.isAttacking) {
        const attackCycle = (this.attackTimer % this.attackInterval) / this.attackInterval;
        armAngle = -0.2 + Math.sin(attackCycle * Math.PI) * 1.5;
      }

      ctx.save();
      ctx.translate(-3, torsoY - 4);
      ctx.rotate(-armAngle);
      ctx.fillStyle = shirtColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-3, 0, 6, 16, 2);
      ctx.fill();
      ctx.stroke();

      // Claw hand
      ctx.translate(0, 15);
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sharp claw fingers
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-1, 3);
      ctx.lineTo(-3, 6);
      ctx.moveTo(1, 3);
      ctx.lineTo(2, 6);
      ctx.stroke();
      ctx.restore();
    }

    // 7. CLAW SLASH VISUAL EFFECT
    if (this.slashTrailProgress > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(239, 68, 68, ${this.slashTrailProgress})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-14, torsoY + 2, 16, -0.6, 0.8);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-18, torsoY + 5, 14, -0.5, 0.7);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
