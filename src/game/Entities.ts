import * as THREE from 'three';
import { WeaponId, ZombieType } from './types';

// ==========================================
// 1. 2D/3D POLYGON BLUE HERO WITH SHADOW
// ==========================================
export class PlayerEntity {
  public mesh: THREE.Group;
  public gunMesh: THREE.Group;
  public muzzleFlash: THREE.PointLight;
  public shadowMesh: THREE.Mesh;
  public targetAngle: number = 0;
  public currentAngle: number = 0;
  public isMoving: boolean = false;
  private animTimer: number = 0;
  private bodyMesh: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private headMesh: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;

  constructor() {
    this.mesh = new THREE.Group();

    // Polygon Style Flat-Shaded Materials
    const blueHeroMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Vibrant Royal Blue Polygon
      roughness: 0.35,
      metalness: 0.15,
      flatShading: true,
    });
    const darkBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.5,
      flatShading: true,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      flatShading: true,
    });

    // 1. Soft Dynamic Ground Drop Shadow Under Player
    const shadowGeo = new THREE.CircleGeometry(0.68, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x1e1b18,
      transparent: true,
      opacity: 0.45,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.mesh.add(this.shadowMesh);

    // 2. Polygonal Faceted Torso
    const bodyGeo = new THREE.CylinderGeometry(0.48, 0.38, 0.95, 6);
    this.bodyMesh = new THREE.Mesh(bodyGeo, blueHeroMat);
    this.bodyMesh.position.y = 0.95;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // Polygonal Belt
    const beltGeo = new THREE.CylinderGeometry(0.52, 0.46, 0.18, 6);
    const belt = new THREE.Mesh(beltGeo, darkBlueMat);
    belt.position.y = 0.58;
    this.mesh.add(belt);

    // 3. Faceted Polygonal Head
    const headGeo = new THREE.CylinderGeometry(0.38, 0.35, 0.65, 8);
    this.headMesh = new THREE.Mesh(headGeo, blueHeroMat);
    this.headMesh.position.y = 1.62;
    this.headMesh.castShadow = true;
    this.mesh.add(this.headMesh);

    // Polygonal Visor (High-contrast Cyan Plate)
    const visorGeo = new THREE.BoxGeometry(0.52, 0.2, 0.14);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.62, 0.34);
    this.mesh.add(visor);

    // Polygonal Backpack
    const packGeo = new THREE.BoxGeometry(0.5, 0.6, 0.28);
    const pack = new THREE.Mesh(packGeo, darkBlueMat);
    pack.position.set(0, 1.1, -0.32);
    pack.castShadow = true;
    this.mesh.add(pack);

    // 4. Polygonal Arms
    const armGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.7, 5);
    this.leftArm = new THREE.Mesh(armGeo, blueHeroMat);
    this.leftArm.position.set(-0.48, 1.1, 0.1);
    this.leftArm.rotation.x = -0.5;
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, blueHeroMat);
    this.rightArm.position.set(0.48, 1.1, 0.2);
    this.rightArm.rotation.x = -0.8;
    this.mesh.add(this.rightArm);

    // 5. Polygonal Legs
    const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.55, 5);
    this.leftLeg = new THREE.Mesh(legGeo, darkBlueMat);
    this.leftLeg.position.set(-0.22, 0.28, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, darkBlueMat);
    this.rightLeg.position.set(0.22, 0.28, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    // 6. Polygonal Weapon
    this.gunMesh = new THREE.Group();
    this.rebuildGun('pistol');
    this.gunMesh.position.set(0.32, 1.05, 0.45);
    this.mesh.add(this.gunMesh);

    // Muzzle Flash
    this.muzzleFlash = new THREE.PointLight(0xf59e0b, 0, 5);
    this.muzzleFlash.position.set(0.32, 1.05, 1.2);
    this.mesh.add(this.muzzleFlash);
  }

  public rebuildGun(weaponId: WeaponId) {
    while (this.gunMesh.children.length > 0) {
      this.gunMesh.remove(this.gunMesh.children[0]);
    }

    const gunMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2, flatShading: true });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2, flatShading: true });

    if (weaponId === 'shotgun') {
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 6), gunMat);
      b1.rotation.x = Math.PI / 2;
      b1.position.set(-0.05, 0, 0.3);
      const b2 = b1.clone();
      b2.position.x = 0.05;
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.4), goldMat);
      stock.position.set(0, -0.05, -0.2);
      this.gunMesh.add(b1, b2, stock);
    } else if (weaponId === 'rifle') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.95), gunMat);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.16), goldMat);
      mag.position.set(0, -0.18, 0.1);
      mag.rotation.x = 0.25;
      this.gunMesh.add(body, mag);
    } else if (weaponId === 'minigun') {
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.45, 8), gunMat);
      drum.rotation.x = Math.PI / 2;
      for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 5), goldMat);
        b.rotation.x = Math.PI / 2;
        const ang = (i * Math.PI) / 2;
        b.position.set(Math.cos(ang) * 0.12, Math.sin(ang) * 0.12, 0.35);
        this.gunMesh.add(b);
      }
      this.gunMesh.add(drum);
    } else if (weaponId === 'plasma') {
      const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6), gunMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = 0.3;
      this.gunMesh.add(core, barrel);
    } else if (weaponId === 'rocket') {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 1.1, 6), gunMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.z = 0.2;
      this.gunMesh.add(tube);
    } else {
      // 9mm Polygon Pistol
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.48), gunMat);
      slide.position.z = 0.15;
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.12), goldMat);
      grip.position.set(0, -0.14, 0);
      this.gunMesh.add(slide, grip);
    }
  }

  public update(dt: number) {
    let diff = this.targetAngle - this.currentAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.currentAngle += diff * Math.min(1, dt * 18);
    this.mesh.rotation.y = this.currentAngle;

    if (this.isMoving) {
      this.animTimer += dt * 16;
      this.leftLeg.rotation.x = Math.sin(this.animTimer) * 0.65;
      this.rightLeg.rotation.x = -Math.sin(this.animTimer) * 0.65;
      this.bodyMesh.position.y = 0.95 + Math.abs(Math.sin(this.animTimer * 2)) * 0.08;
      this.headMesh.position.y = 1.62 + Math.abs(Math.sin(this.animTimer * 2)) * 0.08;
      this.shadowMesh.scale.setScalar(1 + Math.sin(this.animTimer * 2) * 0.08);
    } else {
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      this.bodyMesh.position.y = 0.95 + Math.sin(Date.now() * 0.005) * 0.02;
    }

    if (this.muzzleFlash.intensity > 0) {
      this.muzzleFlash.intensity = Math.max(0, this.muzzleFlash.intensity - dt * 30);
    }
  }

  public triggerMuzzleFlash() {
    this.muzzleFlash.intensity = 4.5;
  }
}

// ==========================================
// 2. POLYGON GREEN ZOMBIES WITH DROP SHADOW
// ==========================================
export class EnemyEntity {
  public mesh: THREE.Group;
  public shadowMesh: THREE.Mesh;
  public type: ZombieType;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public damage: number;
  public radius: number;
  public rewardCoins: number;
  public rewardGems: number;
  public isDead: boolean = false;
  public isBoss: boolean = false;
  private bodyMesh: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private hitFlashTimer: number = 0;
  private originalColor: number;

  constructor(type: ZombieType, level: number) {
    this.type = type;
    this.mesh = new THREE.Group();

    let color = 0x22c55e; // Vibrant Flat Green Polygon
    let scale = 1.0;

    // LEVEL 1: Walker dies immediately in 1 shot! (Pistol does 20 dmg, hp = 18)
    // Progressive waves scale up HP so stronger weapons and upgrades feel impactful
    let hp = 16 + (level - 1) * 12;
    let speed = 2.2 + Math.random() * 0.4;
    let damage = 10 + (level - 1) * 2;
    let coins = 8 + (level - 1) * 3;
    let gems = 0;

    if (type === 'green_runner' || type === 'black_slime') {
      color = 0x4ade80; // Neon Runner
      scale = 0.85;
      hp = 14 + (level - 1) * 10;
      speed = 3.8;
      damage = 12 + (level - 1) * 2;
      coins = 12 + (level - 1) * 3;
    } else if (type === 'green_tank' || type === 'armored_slime') {
      color = 0x15803d; // Emerald Dark Tank
      scale = 1.45;
      hp = 60 + (level - 1) * 28;
      speed = 1.5;
      damage = 25 + (level - 1) * 4;
      coins = 30 + (level - 1) * 6;
      gems = 1;
    } else if (type === 'green_spitter' || type === 'red_spitter') {
      color = 0x84cc16; // Toxic Lime
      scale = 0.95;
      hp = 30 + (level - 1) * 14;
      speed = 2.0;
      damage = 16 + (level - 1) * 3;
      coins = 18 + (level - 1) * 4;
    } else if (type === 'green_boss' || type === 'giant_boss' || type === 'dark_lord_boss') {
      color = 0x166534; // Titan Colossus
      scale = 2.5;
      hp = 320 + (level - 1) * 120;
      speed = 1.3;
      damage = 40 + (level - 1) * 6;
      coins = 160 + (level - 1) * 25;
      gems = 5;
      this.isBoss = true;
    }

    this.originalColor = color;
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
    this.damage = damage;
    this.radius = 0.5 * scale;
    this.rewardCoins = coins;
    this.rewardGems = gems;

    const zombieMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      flatShading: true,
    });
    const darkGreenMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.6,
      flatShading: true,
    });

    // 1. Soft Dynamic Ground Drop Shadow
    const shadowGeo = new THREE.CircleGeometry(this.radius * 1.25, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x1e1b18,
      transparent: true,
      opacity: 0.45,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.mesh.add(this.shadowMesh);

    // 2. Polygonal Faceted Torso (Hexagonal Prism)
    const bodyGeo = new THREE.CylinderGeometry(0.42 * scale, 0.35 * scale, 0.85 * scale, 6);
    this.bodyMesh = new THREE.Mesh(bodyGeo, zombieMat);
    this.bodyMesh.position.y = 0.85 * scale;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // 3. Faceted Polygonal Head
    const headGeo = new THREE.DodecahedronGeometry(0.35 * scale, 0);
    const head = new THREE.Mesh(headGeo, zombieMat);
    head.position.y = 1.45 * scale;
    head.castShadow = true;
    this.mesh.add(head);

    // Glowing Red Polygon Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const eyeGeo = new THREE.BoxGeometry(0.12 * scale, 0.1 * scale, 0.08 * scale);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16 * scale, 1.48 * scale, 0.28 * scale);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.16 * scale;
    this.mesh.add(leftEye, rightEye);

    // 4. Polygonal Arms Reaching Forward
    const armGeo = new THREE.CylinderGeometry(0.1 * scale, 0.09 * scale, 0.65 * scale, 5);
    this.leftArm = new THREE.Mesh(armGeo, zombieMat);
    this.leftArm.position.set(-0.42 * scale, 1.1 * scale, 0.25 * scale);
    this.leftArm.rotation.x = -Math.PI / 2.2;
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, zombieMat);
    this.rightArm.position.set(0.42 * scale, 1.1 * scale, 0.25 * scale);
    this.rightArm.rotation.x = -Math.PI / 2.2;
    this.mesh.add(this.rightArm);

    // 5. Polygonal Legs
    const legGeo = new THREE.CylinderGeometry(0.13 * scale, 0.11 * scale, 0.5 * scale, 5);
    this.leftLeg = new THREE.Mesh(legGeo, darkGreenMat);
    this.leftLeg.position.set(-0.18 * scale, 0.25 * scale, 0);
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, darkGreenMat);
    this.rightLeg.position.set(0.18 * scale, 0.25 * scale, 0);
    this.mesh.add(this.rightLeg);

    // Boss Crown
    if (this.isBoss) {
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.55 * scale, 0.75 * scale, 5),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2, flatShading: true })
      );
      crown.position.y = 1.95 * scale;
      this.mesh.add(crown);
    }
  }

  public takeDamage(amount: number) {
    this.hp -= amount;
    this.hitFlashTimer = 0.12;
    (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);

    if (this.hp <= 0) {
      this.isDead = true;
    }
  }

  public update(dt: number, targetPos: THREE.Vector3) {
    const dx = targetPos.x - this.mesh.position.x;
    const dz = targetPos.z - this.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    this.mesh.rotation.y = angle;

    if (dist > 0.4) {
      this.mesh.position.x += (dx / dist) * this.speed * dt;
      this.mesh.position.z += (dz / dist) * this.speed * dt;
    }

    // Shuffling Zombie Walk Cycle
    const walkTimer = Date.now() * 0.008 * (this.speed / 2.5);
    this.leftLeg.rotation.x = Math.sin(walkTimer) * 0.5;
    this.rightLeg.rotation.x = -Math.sin(walkTimer) * 0.5;
    this.leftArm.rotation.x = -Math.PI / 2.2 + Math.sin(walkTimer) * 0.2;
    this.rightArm.rotation.x = -Math.PI / 2.2 - Math.sin(walkTimer) * 0.2;

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0) {
        (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(this.originalColor);
      }
    }
  }
}

// ==========================================
// 3. WEAPONS MERCHANT NPC (VENDEDOR DE ARMAS)
// ==========================================
export class MerchantEntity {
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  public radius: number = 2.4;
  private labelSprite: THREE.Sprite;

  constructor(x: number, z: number) {
    this.position = new THREE.Vector3(x, 0, z);
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    // 1. Merchant Booth Counter
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8, flatShading: true });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.1), tableMat);
    counter.position.set(0, 0.45, 0);
    counter.castShadow = true;
    counter.receiveShadow = true;
    this.mesh.add(counter);

    // Striped Canopy Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7, flatShading: true });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 1.4), roofMat);
    roof.position.set(0, 2.3, 0);
    roof.castShadow = true;

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    for (let px = -1.1; px <= 1.1; px += 2.2) {
      for (let pz = -0.5; pz <= 0.5; pz += 1.0) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 6), poleMat);
        pole.position.set(px, 1.35, pz);
        this.mesh.add(pole);
      }
    }
    this.mesh.add(roof);

    // Weapons Display on Counter
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const displayGun1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.8), gunMat);
    displayGun1.rotation.y = Math.PI / 4;
    displayGun1.position.set(-0.6, 0.96, 0);
    const displayGun2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.95), gunMat);
    displayGun2.rotation.y = -Math.PI / 5;
    displayGun2.position.set(0.6, 0.96, 0);
    this.mesh.add(displayGun1, displayGun2);

    // 2. Vendor Character (Behind Counter)
    const vendorGroup = new THREE.Group();
    vendorGroup.position.set(0, 0, -0.6);

    const coatMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6, flatShading: true });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, flatShading: true });
    const beretMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5, flatShading: true });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.95, 6), coatMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    vendorGroup.add(torso);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), skinMat);
    head.position.y = 1.62;
    head.castShadow = true;
    const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.18, 6), beretMat);
    beret.position.y = 1.95;
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    glasses.position.set(0, 1.62, 0.34);
    vendorGroup.add(head, beret, glasses);

    this.mesh.add(vendorGroup);

    // Ground Shadow
    const shadowGeo = new THREE.CircleGeometry(1.6, 20);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1e1b18, transparent: true, opacity: 0.45 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.mesh.add(shadow);

    // 3. Floating Interactive 3D Billboard Label
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(30, 40, 452, 176, 28);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = '900 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛒 VENDEDOR DE ARMAS', 256, 110);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('[ LOJA DE ARMAS ]', 256, 165);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const labelMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.labelSprite = new THREE.Sprite(labelMat);
    this.labelSprite.scale.set(3.4, 1.7, 1);
    this.labelSprite.position.set(0, 3.2, 0);
    this.mesh.add(this.labelSprite);
  }

  public update(time: number) {
    this.labelSprite.position.y = 3.2 + Math.sin(time * 3) * 0.1;
  }
}

// ==========================================
// 4. POLYGON BLUE ALLIED GUARD SOLDIER
// ==========================================
export class BlueGuardEntity {
  public mesh: THREE.Group;
  public gunMesh: THREE.Group;
  public position: THREE.Vector3;
  public shootTimer: number = 0;
  public fireRate: number = 2.8;
  public damage: number = 22;
  public range: number = 15;
  private muzzleLight: THREE.PointLight;

  constructor(x: number, z: number) {
    this.position = new THREE.Vector3(x, 0, z);
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, flatShading: true });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5, flatShading: true });
    const beretMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3, flatShading: true });

    // Ground Shadow
    const shadowGeo = new THREE.CircleGeometry(0.65, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1e1b18, transparent: true, opacity: 0.45 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.mesh.add(shadow);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 0.85, 6), blueMat);
    body.position.y = 0.85;
    body.castShadow = true;
    this.mesh.add(body);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), blueMat);
    head.position.y = 1.45;
    head.castShadow = true;
    const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.18, 6), beretMat);
    beret.position.y = 1.78;
    this.mesh.add(head, beret);

    this.gunMesh = new THREE.Group();
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.85), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    rifle.position.z = 0.2;
    this.gunMesh.add(rifle);
    this.gunMesh.position.set(0.28, 0.95, 0.35);
    this.mesh.add(this.gunMesh);

    this.muzzleLight = new THREE.PointLight(0x60a5fa, 0, 4);
    this.muzzleLight.position.set(0.28, 0.95, 1.1);
    this.mesh.add(this.muzzleLight);

    const baseGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.18, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = 0.09;
    pedestal.receiveShadow = true;
    this.mesh.add(pedestal);
  }

  public update(dt: number, target: EnemyEntity | null, onShoot: (origin: THREE.Vector3, dir: THREE.Vector3, damage: number) => void) {
    if (this.muzzleLight.intensity > 0) {
      this.muzzleLight.intensity = Math.max(0, this.muzzleLight.intensity - dt * 25);
    }

    if (target && !target.isDead) {
      const dx = target.mesh.position.x - this.mesh.position.x;
      const dz = target.mesh.position.z - this.mesh.position.z;
      const angle = Math.atan2(dx, dz);
      this.mesh.rotation.y = angle;

      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1 / this.fireRate;
        const origin = this.mesh.position.clone();
        origin.y = 0.95;
        const dir = target.mesh.position.clone().sub(origin).normalize();
        this.muzzleLight.intensity = 3.5;
        onShoot(origin, dir, this.damage);
      }
    }
  }
}

// ==========================================
// 5. AUTOMATED TURRET WITH SHADOW
// ==========================================
export class TurretEntity {
  public mesh: THREE.Group;
  public headGroup: THREE.Group;
  public position: THREE.Vector3;
  public shootTimer: number = 0;
  public fireRate: number = 4.5;
  public damage: number = 20;
  public range: number = 16;
  public isCannon: boolean = false;
  private muzzleLight: THREE.PointLight;

  constructor(x: number, z: number, isCannon = false) {
    this.position = new THREE.Vector3(x, 0, z);
    this.isCannon = isCannon;
    if (isCannon) {
      this.fireRate = 1.5;
      this.damage = 60;
      this.range = 18;
    }

    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3, flatShading: true });
    const cyanMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.6 });

    const shadowGeo = new THREE.CircleGeometry(1.0, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1e1b18, transparent: true, opacity: 0.45 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.mesh.add(shadow);

    const baseGeo = new THREE.CylinderGeometry(0.75, 0.9, 0.4, 8);
    const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
    baseMesh.position.y = 0.2;
    baseMesh.castShadow = true;
    this.mesh.add(baseMesh);

    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.6;

    const podGeo = new THREE.BoxGeometry(0.7, 0.45, 0.7);
    const pod = new THREE.Mesh(podGeo, metalMat);
    pod.castShadow = true;
    this.headGroup.add(pod);

    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.1), cyanMat);
    eye.position.set(0, 0.08, 0.36);
    this.headGroup.add(eye);

    if (isCannon) {
      const cannonBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 1.2, 6), metalMat);
      cannonBarrel.rotation.x = Math.PI / 2;
      cannonBarrel.position.set(0, 0, 0.7);
      this.headGroup.add(cannonBarrel);
    } else {
      const bGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6);
      const leftBarrel = new THREE.Mesh(bGeo, metalMat);
      leftBarrel.rotation.x = Math.PI / 2;
      leftBarrel.position.set(-0.2, -0.05, 0.5);
      const rightBarrel = leftBarrel.clone();
      rightBarrel.position.x = 0.2;
      this.headGroup.add(leftBarrel, rightBarrel);
    }

    this.mesh.add(this.headGroup);

    this.muzzleLight = new THREE.PointLight(0xf59e0b, 0, 4);
    this.muzzleLight.position.set(0, 0.6, 1.2);
    this.mesh.add(this.muzzleLight);
  }

  public update(dt: number, target: EnemyEntity | null, onShoot: (origin: THREE.Vector3, dir: THREE.Vector3, damage: number, isExplosive?: boolean) => void) {
    if (this.muzzleLight.intensity > 0) {
      this.muzzleLight.intensity = Math.max(0, this.muzzleLight.intensity - dt * 25);
    }

    if (target && !target.isDead) {
      const dx = target.mesh.position.x - this.mesh.position.x;
      const dz = target.mesh.position.z - this.mesh.position.z;
      const angle = Math.atan2(dx, dz);
      this.headGroup.rotation.y = angle;

      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1 / this.fireRate;
        const origin = this.mesh.position.clone();
        origin.y = 0.6;
        const dir = target.mesh.position.clone().sub(origin).normalize();
        this.muzzleLight.intensity = 4.0;
        onShoot(origin, dir, this.damage, this.isCannon);
      }
    }
  }
}

// ==========================================
// 6. DROPS (CASH STACKS & GEMS)
// ==========================================
export class DropEntity {
  public mesh: THREE.Group;
  public type: 'coin' | 'gem';
  public value: number;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public isCollected: boolean = false;

  constructor(pos: THREE.Vector3, type: 'coin' | 'gem', value: number) {
    this.type = type;
    this.value = value;
    this.position = pos.clone();
    this.velocity = new THREE.Vector3((Math.random() - 0.5) * 3, 3.5 + Math.random() * 2, (Math.random() - 0.5) * 3);

    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    if (type === 'coin') {
      const cashGeo = new THREE.BoxGeometry(0.42, 0.16, 0.26);
      const cashMat = new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        roughness: 0.35,
        metalness: 0.1,
        flatShading: true,
      });
      const stack = new THREE.Mesh(cashGeo, cashMat);
      stack.castShadow = true;

      const bandGeo = new THREE.BoxGeometry(0.14, 0.17, 0.27);
      const bandMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const band = new THREE.Mesh(bandGeo, bandMat);

      this.mesh.add(stack, band);
    } else {
      const gemGeo = new THREE.OctahedronGeometry(0.24, 0);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.2,
        flatShading: true,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      this.mesh.add(gem);
    }
  }

  public update(dt: number, playerPos: THREE.Vector3, magnetRadius: number): boolean {
    if (this.position.y > 0.15 || this.velocity.y > 0) {
      this.velocity.y -= 16 * dt;
      this.position.addScaledVector(this.velocity, dt);
      this.velocity.x *= 0.92;
      this.velocity.z *= 0.92;
      if (this.position.y < 0.15) {
        this.position.y = 0.15;
        this.velocity.set(0, 0, 0);
      }
    }

    this.mesh.rotation.y += dt * 4;

    const dist = this.position.distanceTo(playerPos);
    if (dist < magnetRadius) {
      const pullSpeed = (1 - dist / magnetRadius) * 20 + 12;
      const dir = playerPos.clone().sub(this.position).normalize();
      this.position.addScaledVector(dir, pullSpeed * dt);
    }

    this.mesh.position.copy(this.position);

    if (dist < 0.85) {
      this.isCollected = true;
      return true;
    }
    return false;
  }
}

// ==========================================
// 7. BULLET PROJECTILE
// ==========================================
export class ProjectileEntity {
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector3;
  public damage: number;
  public isCrit: boolean;
  public isExplosive: boolean;
  public life: number = 2.0;
  public radius: number = 0.25;

  constructor(origin: THREE.Vector3, direction: THREE.Vector3, damage: number, speed: number, isCrit: boolean, isExplosive = false) {
    this.damage = damage;
    this.isCrit = isCrit;
    this.isExplosive = isExplosive;
    this.velocity = direction.clone().normalize().multiplyScalar(speed);

    const geo = isExplosive ? new THREE.DodecahedronGeometry(0.22, 0) : new THREE.CylinderGeometry(0.05, 0.05, 0.45, 5);
    const mat = new THREE.MeshBasicMaterial({
      color: isCrit ? 0xef4444 : isExplosive ? 0xf97316 : 0xfacc15,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(origin);
    this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  }

  public update(dt: number) {
    this.mesh.position.addScaledVector(this.velocity, dt);
    this.life -= dt;
  }
}
