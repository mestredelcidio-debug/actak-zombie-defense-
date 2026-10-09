import * as THREE from 'three';

export interface BloodParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface BloodDecal {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
}

export class BloodSystem {
  public scene: THREE.Scene;
  private particles: BloodParticle[] = [];
  private decals: BloodDecal[] = [];
  private bloodMaterial: THREE.MeshBasicMaterial;
  private decalMaterial: THREE.MeshBasicMaterial;
  private particleGeo: THREE.DodecahedronGeometry;
  private decalGeo: THREE.CircleGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.bloodMaterial = new THREE.MeshBasicMaterial({ color: 0x990000 }); // Deep crimson blood
    this.decalMaterial = new THREE.MeshBasicMaterial({ color: 0x660000, transparent: true, opacity: 0.75 });
    this.particleGeo = new THREE.DodecahedronGeometry(0.08, 0);
    this.decalGeo = new THREE.CircleGeometry(0.35, 8);
  }

  /**
   * Spawns a spray of blood droplets on bullet hit or zombie death
   */
  public spawnBloodSplatter(x: number, y: number, z = 0, hitDirX = 1, count = 14) {
    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(this.particleGeo, this.bloodMaterial);
      const scale = 0.6 + Math.random() * 0.9;
      pMesh.scale.setScalar(scale);
      pMesh.position.set(x, y, z + (Math.random() - 0.5) * 0.4);
      this.scene.add(pMesh);

      // Kinetic spray in bullet impact direction + upward fountain
      const speedX = hitDirX * (3 + Math.random() * 6) + (Math.random() - 0.5) * 4;
      const speedY = 2.5 + Math.random() * 5.5;
      const speedZ = (Math.random() - 0.5) * 3;

      this.particles.push({
        mesh: pMesh,
        vx: speedX,
        vy: speedY,
        vz: speedZ,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.6 + Math.random() * 0.4,
        size: scale,
      });
    }

    // Spawn ground blood stain decal
    this.spawnGroundDecal(x + hitDirX * 0.4, z);
  }

  public spawnGroundDecal(x: number, z: number) {
    if (this.decals.length > 25) {
      const oldest = this.decals.shift();
      if (oldest) {
        this.scene.remove(oldest.mesh);
      }
    }

    const decal = new THREE.Mesh(this.decalGeo, this.decalMaterial.clone());
    decal.rotation.x = -Math.PI / 2;
    decal.position.set(x + (Math.random() - 0.5) * 0.3, 0.02, z + (Math.random() - 0.5) * 0.3);
    const scale = 0.7 + Math.random() * 0.6;
    decal.scale.set(scale, scale * (0.8 + Math.random() * 0.5), 1);
    decal.rotation.z = Math.random() * Math.PI * 2;
    this.scene.add(decal);

    this.decals.push({
      mesh: decal,
      life: 8.0,
      maxLife: 8.0,
    });
  }

  public update(dt: number) {
    // 1. Update Blood Droplets with Gravity and Road Collision
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      p.vy -= 22 * dt; // Gravity
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;

      // Hit ground
      if (p.mesh.position.y <= 0.02) {
        p.mesh.position.y = 0.02;
        p.vx *= 0.4;
        p.vz *= 0.4;
        p.vy = 0;
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 2. Fade old ground decals
    for (let i = this.decals.length - 1; i >= 0; i--) {
      const d = this.decals[i];
      d.life -= dt;
      if (d.life < 2.0) {
        (d.mesh.material as THREE.MeshBasicMaterial).opacity = (d.life / 2.0) * 0.75;
      }
      if (d.life <= 0) {
        this.scene.remove(d.mesh);
        this.decals.splice(i, 1);
      }
    }
  }

  public cleanupBehind(minX: number) {
    for (let i = this.decals.length - 1; i >= 0; i--) {
      if (this.decals[i].mesh.position.x < minX) {
        this.scene.remove(this.decals[i].mesh);
        this.decals.splice(i, 1);
      }
    }
  }

  public clearAll() {
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.particles = [];
    this.decals.forEach((d) => this.scene.remove(d.mesh));
    this.decals = [];
  }
}
