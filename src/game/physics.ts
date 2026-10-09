/**
 * Sector Quarantine: Physics Engine
 * Handles ragdoll simulation, kinetic knockback, raycasts, radial explosive impulses, and joint constraints.
 */

import { BloodDecal, Particle, RagdollPart, Zombie } from '../types/game';

export interface ExplosionResult {
  x: number;
  y: number;
  radius: number;
  damage: number;
}

export class PhysicsEngine {
  public gravity = 980; // pixels / s^2
  public groundY = 640; // baseline floor level

  /**
   * Initializes a multi-node ragdoll when a zombie is neutralized
   */
  public createZombieRagdoll(
    zombie: Zombie,
    hitX: number,
    hitY: number,
    impulseX: number,
    impulseY: number,
    isHeadshot: boolean
  ): RagdollPart[] {
    const cx = zombie.x + zombie.width / 2;
    const cy = zombie.y + zombie.height / 2;

    // Head node
    const head: RagdollPart = {
      x: cx,
      y: cy - 24,
      vx: impulseX * (isHeadshot ? 1.8 : 0.9) + (Math.random() - 0.5) * 80,
      vy: impulseY * (isHeadshot ? 1.6 : 0.8) - (isHeadshot ? 220 : 60),
      angle: 0,
      vAngle: (Math.random() - 0.5) * 12,
      radius: 9,
      type: 'head',
      isDecapitated: isHeadshot,
    };

    // Torso node
    const torso: RagdollPart = {
      x: cx,
      y: cy - 4,
      vx: impulseX * 0.9 + (Math.random() - 0.5) * 40,
      vy: impulseY * 0.8 - 40,
      angle: 0,
      vAngle: (Math.random() - 0.5) * 5,
      radius: 12,
      type: 'torso',
    };

    // Left arm
    const armL: RagdollPart = {
      x: cx - 14,
      y: cy - 8,
      vx: impulseX * 0.8 - 50 + (Math.random() - 0.5) * 50,
      vy: impulseY * 0.8 - 70,
      angle: -0.4,
      vAngle: (Math.random() - 0.5) * 8,
      radius: 6,
      type: 'arm_l',
    };

    // Right arm
    const armR: RagdollPart = {
      x: cx + 14,
      y: cy - 8,
      vx: impulseX * 0.8 + 50 + (Math.random() - 0.5) * 50,
      vy: impulseY * 0.8 - 70,
      angle: 0.4,
      vAngle: (Math.random() - 0.5) * 8,
      radius: 6,
      type: 'arm_r',
    };

    // Left leg
    const legL: RagdollPart = {
      x: cx - 8,
      y: cy + 18,
      vx: impulseX * 0.6 - 30,
      vy: impulseY * 0.5 - 20,
      angle: -0.2,
      vAngle: (Math.random() - 0.5) * 6,
      radius: 7,
      type: 'leg_l',
    };

    // Right leg
    const legR: RagdollPart = {
      x: cx + 8,
      y: cy + 18,
      vx: impulseX * 0.6 + 30,
      vy: impulseY * 0.5 - 20,
      angle: 0.2,
      vAngle: (Math.random() - 0.5) * 6,
      radius: 7,
      type: 'leg_r',
    };

    return [head, torso, armL, armR, legL, legR];
  }

  /**
   * Updates all active ragdoll parts in the world
   */
  public updateRagdoll(parts: RagdollPart[], dt: number, floorY: number, leftWall: number, rightWall: number) {
    for (const part of parts) {
      // Apply gravity
      part.vy += this.gravity * dt;

      // Update positions
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.angle += part.vAngle * dt;

      // Air friction
      part.vx *= 0.985;
      part.vAngle *= 0.97;

      // Floor collision
      const bottomLimit = floorY - part.radius;
      if (part.y >= bottomLimit) {
        part.y = bottomLimit;
        // Bounce and ground friction
        if (part.vy > 40) {
          part.vy = -part.vy * 0.28;
          part.vx *= 0.65;
        } else {
          part.vy = 0;
          part.vx *= 0.5;
          part.vAngle *= 0.4;
        }
      }

      // Wall bounds
      if (part.x <= leftWall + part.radius) {
        part.x = leftWall + part.radius;
        part.vx = Math.abs(part.vx) * 0.4;
      } else if (part.x >= rightWall - part.radius) {
        part.x = rightWall - part.radius;
        part.vx = -Math.abs(part.vx) * 0.4;
      }
    }

    // Light distance relaxation between torso and connected limbs (if not decapitated)
    const torso = parts.find((p) => p.type === 'torso');
    if (!torso) return;

    for (const part of parts) {
      if (part === torso) continue;
      if (part.type === 'head' && part.isDecapitated) continue; // head detached, fly free

      const targetDist = part.type === 'head' ? 18 : part.type.startsWith('arm') ? 16 : 22;
      const dx = part.x - torso.x;
      const dy = part.y - torso.y;
      const dist = Math.hypot(dx, dy);

      if (dist > targetDist && dist > 0.001) {
        const factor = (dist - targetDist) / dist * 0.35;
        part.x -= dx * factor;
        part.y -= dy * factor;
      }
    }
  }

  /**
   * Applies an explosive radial impulse to live entities and ragdolls
   */
  public applyExplosionImpulse(
    explosion: ExplosionResult,
    zombies: Zombie[],
    ragdolls: RagdollPart[][],
    spawnDecal: (decal: BloodDecal) => void,
    spawnParticles: (p: Particle[]) => void
  ) {
    const { x, y, radius, damage } = explosion;

    // Apply to live zombies
    for (const z of zombies) {
      if (z.isDead) continue;
      const zcx = z.x + z.width / 2;
      const zcy = z.y + z.height / 2;
      const dx = zcx - x;
      const dy = zcy - y;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        const falloff = 1 - dist / radius;
        const blastDamage = Math.round(damage * (0.4 + falloff * 0.6));
        z.hp -= blastDamage;

        // Knockback vector
        const angle = Math.atan2(dy, dx);
        const force = 300 * falloff;
        z.vx += Math.cos(angle) * force;
        z.vy -= Math.abs(Math.sin(angle)) * force * 0.7;

        if (z.hp <= 0) {
          z.isDead = true;
          const rag = this.createZombieRagdoll(
            z,
            zcx,
            zcy,
            Math.cos(angle) * (240 + force),
            -180 - Math.abs(Math.sin(angle)) * force,
            falloff > 0.6
          );
          ragdolls.push(rag);
          z.ragdoll = rag;

          // Blood splat
          spawnDecal({
            x: zcx + (Math.random() - 0.5) * 30,
            y: zcy + 10,
            radius: 20 + Math.random() * 25,
            color: '#7f1d1d',
            opacity: 0.8,
            splatterType: 'burst',
          });
        }
      }
    }

    // Apply impulse to existing ragdolls
    for (const rag of ragdolls) {
      for (const part of rag) {
        const dx = part.x - x;
        const dy = part.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const falloff = 1 - dist / radius;
          const force = 400 * falloff;
          const angle = Math.atan2(dy, dx);
          part.vx += Math.cos(angle) * force;
          part.vy -= Math.abs(Math.sin(angle)) * force * 0.8 + 120 * falloff;
          part.vAngle += (Math.random() - 0.5) * 15 * falloff;
        }
      }
    }
  }
}

export const physics = new PhysicsEngine();
