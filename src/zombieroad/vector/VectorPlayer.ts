import { CharacterDef, WeaponDef } from '../types';

export class VectorPlayer {
  public x: number = 100;
  public y: number = 0; // Relative to ground level
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 24;
  public height: number = 56;
  public isGrounded: boolean = true;
  public facingRight: boolean = true;
  public isShooting: boolean = false;
  public shootTimer: number = 0;
  public muzzleTimer: number = 0;
  public aimAngle: number = 0;
  public hitFlashTimer: number = 0;
  public animTime: number = 0;

  public charDef: CharacterDef;
  public weaponDef: WeaponDef;

  constructor(charDef: CharacterDef, weaponDef: WeaponDef) {
    this.charDef = charDef;
    this.weaponDef = weaponDef;
  }

  public triggerShoot(aimAngle = 0) {
    this.shootTimer = 0.18;
    this.muzzleTimer = 0.08;
    this.aimAngle = Math.max(-0.4, Math.min(0.4, aimAngle));
  }

  public triggerHitFlash() {
    this.hitFlashTimer = 0.18;
  }

  public update(dt: number, isMoving: boolean) {
    if (this.shootTimer > 0) this.shootTimer -= dt;
    if (this.muzzleTimer > 0) this.muzzleTimer -= dt;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

    // Ease the muzzle back to a ready position after each shot.
    if (this.shootTimer <= 0) {
      this.aimAngle += (0 - this.aimAngle) * Math.min(1, dt * 8);
      if (Math.abs(this.aimAngle) < 0.01) this.aimAngle = 0;
    }

    if (isMoving && this.isGrounded) {
      this.animTime += dt * 9;
    } else if (!isMoving) {
      this.animTime = 0;
    }
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, groundY: number) {
    const scrX = this.x - camX;
    const scrY = groundY - this.y;

    ctx.save();
    ctx.translate(scrX, scrY);
    if (!this.facingRight) {
      ctx.scale(-1, 1);
    }

    const isHit = this.hitFlashTimer > 0;
    const jacketColor = isHit ? '#ffffff' : `#${this.charDef.jacketColor.toString(16).padStart(6, '0')}`;
    const pantsColor = isHit ? '#ffffff' : `#${this.charDef.pantsColor.toString(16).padStart(6, '0')}`;
    const hairColor = `#${this.charDef.hairColor.toString(16).padStart(6, '0')}`;
    const backpackColor = `#${this.charDef.backpackColor.toString(16).padStart(6, '0')}`;
    const skinColor = isHit ? '#ffffff' : '#f59e0b';
    const darkSkinColor = isHit ? '#ffffff' : '#d97706';
    const outlineColor = '#090d16';

    // 1. Drop Shadow under feet
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Leg stride animation
    let leftLegAngle = 0;
    let rightLegAngle = 0;
    let bodyBob = 0;

    if (!this.isGrounded) {
      // In the air: jump pose
      leftLegAngle = 0.35;
      rightLegAngle = -0.35;
      bodyBob = -2;
    } else if (this.animTime > 0) {
      // Running / Walking stride
      leftLegAngle = Math.sin(this.animTime) * 0.45;
      rightLegAngle = -Math.sin(this.animTime) * 0.45;
      bodyBob = Math.abs(Math.sin(this.animTime * 2)) * 2;
    }

    const hipY = -22 - bodyBob;
    const torsoY = hipY - 14;

    // 3. BACK LEG
    ctx.save();
    ctx.translate(-4, hipY);
    ctx.rotate(leftLegAngle);
    ctx.fillStyle = pantsColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 18, 2.5);
    ctx.fill();
    ctx.stroke();

    // Reinforced knee pad
    ctx.fillStyle = isHit ? '#ffffff' : '#475569';
    ctx.beginPath(); ctx.roundRect(-3.1, 8, 6.2, 4.5, 1.5); ctx.fill();
    ctx.strokeStyle = outlineColor; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = isHit ? '#ffffff' : '#94a3b8'; ctx.fillRect(-1.2, 9, 2.4, 1);

    // Back Boot
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-4, 15, 9, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. BACKPACK
    ctx.save();
    ctx.fillStyle = backpackColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-13, torsoY - 4, 8, 16, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. TORSO
    ctx.save();
    ctx.translate(0, torsoY);
    ctx.fillStyle = jacketColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-8, -10, 16, 22, 3);
    ctx.fill();
    ctx.stroke();

    // Reinforced tactical vest panels and stitched seams
    ctx.fillStyle = isHit ? '#ffffff' : '#334155';
    ctx.beginPath();
    ctx.moveTo(-6, -8); ctx.lineTo(-2, -6); ctx.lineTo(-2, 5); ctx.lineTo(-6, 7); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -8); ctx.lineTo(2, -6); ctx.lineTo(2, 5); ctx.lineTo(6, 7); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isHit ? '#ffffff' : '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-1, -6); ctx.lineTo(-1, 5); ctx.moveTo(1, -6); ctx.lineTo(1, 5); ctx.stroke();

    // Radio pouch and utility pocket
    ctx.fillStyle = isHit ? '#ffffff' : '#1e293b';
    ctx.fillRect(-7, -2, 4, 6); ctx.fillRect(3, -1, 4, 5);
    ctx.fillStyle = isHit ? '#ffffff' : '#94a3b8';
    ctx.fillRect(-6, -1, 2, 1); ctx.fillRect(4, 0, 2, 1);

    // Belt & Buckle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, 7, 16, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-2, 7.5, 4, 3);
    ctx.restore();

    // 6. FRONT LEG
    ctx.save();
    ctx.translate(4, hipY);
    ctx.rotate(rightLegAngle);
    ctx.fillStyle = pantsColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 18, 2.5);
    ctx.fill();
    ctx.stroke();

    // Reinforced knee pad
    ctx.fillStyle = isHit ? '#ffffff' : '#475569';
    ctx.beginPath(); ctx.roundRect(-3.1, 8, 6.2, 4.5, 1.5); ctx.fill();
    ctx.strokeStyle = outlineColor; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = isHit ? '#ffffff' : '#94a3b8'; ctx.fillRect(-1.2, 9, 2.4, 1);

    // Front Boot
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-4, 15, 9, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 7. HEAD & FACE
    ctx.save();
    ctx.translate(0, torsoY - 14);

    // Neck
    ctx.fillStyle = darkSkinColor;
    ctx.fillRect(-2, -2, 4, 4);

    // Head
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-6.5, -15, 13, 15, 4);
    ctx.fill();
    ctx.stroke();

    // Hair / Helmet
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.roundRect(-7, -16, 14, 6, 2.5);
    ctx.fill();

    if (this.charDef.id === 'soldier') {
      ctx.fillStyle = '#365314';
      ctx.beginPath();
      ctx.roundRect(-8, -17, 16, 8, 3);
      ctx.fill();
      ctx.stroke();
    } else if (this.charDef.id === 'medic') {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-7.5, -17, 15, 6, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-1, -15, 2, 4);
      ctx.fillRect(-2, -14, 4, 2);
    }

    // Eye
    ctx.fillStyle = '#090d16';
    ctx.fillRect(2, -9, 2, 2.2);
    ctx.restore();

    // 8. ARMS AND WEAPON
    const recoilX = this.muzzleTimer > 0 ? -3 : 0;
    const weaponY = torsoY - 4;

    ctx.save();
    ctx.translate(recoilX, 0);

    // Back Arm holding gun grip
    ctx.save();
    ctx.translate(-2, weaponY);
    ctx.fillStyle = jacketColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(0, -2, 10, 5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Weapon
    ctx.save();
    ctx.translate(4, weaponY);
    // The weapon follows the target's vertical angle; mirror the angle when facing left.
    ctx.rotate(this.facingRight ? this.aimAngle : -this.aimAngle);
    const wDef = this.weaponDef;

    if (wDef.id === 'shotgun') {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.6;
      ctx.fillRect(0, -3, 24, 5);
      ctx.strokeRect(0, -3, 24, 5);
      ctx.fillStyle = '#78350f'; // Wood stock
      ctx.fillRect(-6, -2, 6, 4);
      ctx.fillRect(6, 0, 7, 3);
    } else if (wDef.id === 'rifle') {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.6;
      ctx.fillRect(0, -4, 25, 6);
      ctx.strokeRect(0, -4, 25, 6);
      ctx.fillRect(6, 2, 5, 6); // Magazine
      ctx.fillRect(-6, -3, 6, 5); // Stock
    } else if (wDef.id === 'smg') {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.6;
      ctx.fillRect(0, -3, 17, 5);
      ctx.strokeRect(0, -3, 17, 5);
      ctx.fillRect(7, 2, 4, 7); // Extended mag
    } else if (wDef.id === 'plasma') {
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.6;
      ctx.fillRect(0, -4, 23, 7);
      ctx.strokeRect(0, -4, 23, 7);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, -2, 12, 3); // Cyan plasma core
    } else {
      // Default Pistol
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.6;
      ctx.fillRect(0, -3, 13, 5);
      ctx.strokeRect(0, -3, 13, 5);
      ctx.fillRect(1, 2, 4, 4); // Grip
    }

    // Front forearm cuff links the sleeve to the weapon grip
    ctx.fillStyle = jacketColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(1, -1, 8, 4, 1.5); ctx.fill(); ctx.stroke();

    // Front Hand holding gun
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(6, 1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Muzzle Flash
    if (this.muzzleTimer > 0) {
      const barrelEndX = wDef.id === 'rifle' ? 26 : wDef.id === 'shotgun' ? 25 : wDef.id === 'plasma' ? 24 : 14;
      ctx.save();
      ctx.translate(barrelEndX, -1);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(3, -2);
      ctx.lineTo(9, 0);
      ctx.lineTo(3, 2);
      ctx.lineTo(0, 8);
      ctx.lineTo(-3, 2);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-3, -2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // Weapon restore
    ctx.restore(); // Recoil restore

    ctx.restore(); // Overall player restore
  }
}
