export interface BloodDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export interface BloodStain {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  alpha: number;
}

export interface SeveredLimb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  type: 'head' | 'arm' | 'leg' | 'torso';
  color: string;
  width: number;
  height: number;
  isGrounded: boolean;
}

export class VectorBloodSystem {
  public drops: BloodDrop[] = [];
  public stains: BloodStain[] = [];
  public limbs: SeveredLimb[] = [];

  public spawnBloodBurst(x: number, y: number, hitDirX: number, count = 18, isFatal = false) {
    const total = isFatal ? count * 2 : count;
    const colors = ['#990000', '#b91c1c', '#7f1d1d', '#dc2626'];

    for (let i = 0; i < total; i++) {
      const speed = 2.5 + Math.random() * 8.5;
      const angle = (Math.random() - 0.5) * 1.4 + (hitDirX > 0 ? 0 : Math.PI);
      const vx = Math.cos(angle) * speed + hitDirX * 3.0;
      const vy = Math.sin(angle) * speed - (2.0 + Math.random() * 6.0); // Upward spray

      this.drops.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 15,
        vx,
        vy,
        radius: 2.0 + Math.random() * 3.5,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    if (isFatal) {
      this.addPermanentStain(x + hitDirX * 12, 5 + Math.random() * 6);
    }
  }

  public spawnSeveredLimb(x: number, y: number, hitDirX: number, type: 'head' | 'arm' | 'leg', color: string) {
    const vx = hitDirX * (3.5 + Math.random() * 5.0);
    const vy = -(4.0 + Math.random() * 6.0);
    const vAngle = (Math.random() - 0.5) * 12;

    this.limbs.push({
      x,
      y,
      vx,
      vy,
      angle: 0,
      vAngle,
      type,
      color,
      width: type === 'head' ? 14 : 7,
      height: type === 'head' ? 14 : 20,
      isGrounded: false,
    });
  }

  public addPermanentStain(x: number, groundY: number) {
    if (this.stains.length > 80) {
      this.stains.shift();
    }
    const colors = ['#7f1d1d', '#990000', '#450a0a'];
    this.stains.push({
      x,
      y: groundY,
      radiusX: 12 + Math.random() * 16,
      radiusY: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.85,
    });
  }

  public update(dt: number, groundY: number) {
    // 1. Update Blood Drops
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.vy += 28 * dt; // Gravity
      d.x += d.vx * dt * 60;
      d.y += d.vy * dt * 60;

      // Hit Ground
      if (d.y >= groundY) {
        d.y = groundY;
        this.addPermanentStain(d.x, groundY);
        this.drops.splice(i, 1);
        continue;
      }

      d.alpha -= dt * 0.8;
      if (d.alpha <= 0) {
        this.drops.splice(i, 1);
      }
    }

    // 2. Update Severed Limbs
    for (let i = this.limbs.length - 1; i >= 0; i--) {
      const limb = this.limbs[i];
      if (!limb.isGrounded) {
        limb.vy += 30 * dt;
        limb.x += limb.vx * dt * 60;
        limb.y += limb.vy * dt * 60;
        limb.angle += limb.vAngle * dt;

        if (limb.y >= groundY - 4) {
          limb.y = groundY - 4;
          if (Math.abs(limb.vy) > 2) {
            limb.vy = -limb.vy * 0.35;
            limb.vx *= 0.5;
            limb.vAngle *= 0.5;
          } else {
            limb.vy = 0;
            limb.vx = 0;
            limb.vAngle = 0;
            limb.isGrounded = true;
            this.addPermanentStain(limb.x, groundY);
          }
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, groundY: number) {
    // Render Stains on ground/walls
    for (const s of this.stains) {
      const scrX = s.x - camX;
      if (scrX < -60 || scrX > ctx.canvas.width + 60) continue;
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.ellipse(scrX, s.y, s.radiusX, s.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Blood Drops
    for (const d of this.drops) {
      const scrX = d.x - camX;
      if (scrX < -20 || scrX > ctx.canvas.width + 20) continue;
      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(scrX, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Severed Limbs
    for (const limb of this.limbs) {
      const scrX = limb.x - camX;
      if (scrX < -40 || scrX > ctx.canvas.width + 40) continue;
      ctx.save();
      ctx.translate(scrX, limb.y);
      ctx.rotate(limb.angle);

      // Blood stump circle
      ctx.fillStyle = '#990000';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Limb body
      ctx.fillStyle = limb.color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;

      if (limb.type === 'head') {
        ctx.beginPath();
        ctx.arc(0, 0, limb.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(-limb.width / 2, 0, limb.width, limb.height, 3);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  public clearAll() {
    this.drops = [];
    this.stains = [];
    this.limbs = [];
  }
}
