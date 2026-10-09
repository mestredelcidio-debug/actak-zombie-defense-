import * as THREE from 'three';
import { ZombieDef, ZombieType } from '../types';
import { ZOMBIES_CATALOG } from '../data/zombies';

export class ZombieMeshInstance {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;
  public def: ZombieDef;
  public hp: number;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public isGrounded: boolean = true;
  public isDead: boolean = false;

  // Ragdoll Physics State
  public isRagdoll: boolean = false;
  public ragdollVx: number = 0;
  public ragdollVy: number = 0;
  public ragdollVz: number = 0;
  public ragdollRotVx: number = 0;
  public ragdollRotVz: number = 0;
  public ragdollTime: number = 0;

  // Humanoid Limbs & Joints
  private bodyGroup: THREE.Group;
  private torso: THREE.Mesh;
  private head: THREE.Mesh;
  private hair?: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftBoot?: THREE.Mesh;
  private rightBoot?: THREE.Mesh;
  private hitFlashTimer: number = 0;
  private originalJacketColor: number;
  private animOffset: number;

  constructor(type: ZombieType, spawnX: number, spawnY = 0) {
    this.def = ZOMBIES_CATALOG[type];
    this.hp = this.def.maxHp;
    this.x = spawnX;
    this.y = spawnY;
    this.animOffset = Math.random() * 10;

    this.group = new THREE.Group();
    this.group.position.set(this.x, this.y, 0);

    const scale = type === 'boss_mutant' ? 1.75 : type === 'brute' ? 1.4 : type === 'crawler' ? 0.8 : 1.0;

    // 5 DISTINCT CLOTHING & COLOR PALETTES FOR EACH ZOMBIE TYPE
    let jacketColor = 0x2563eb; // 1. Common: Denim Blue Torn Shirt
    let pantsColor = 0x78350f;  // Brown cargo
    let skinColor = 0x94a3b8;   // Pale infected flesh
    let bootColor = 0x1e293b;

    if (type === 'runner') {
      // 2. Runner: Bright Crimson Red Athletic Tracksuit + Headband
      jacketColor = 0xdc2626;
      pantsColor = 0x991b1b;
      skinColor = 0x86efac; // Toxic green
      bootColor = 0xffffff; // White running shoes
    } else if (type === 'jumper') {
      // 3. Jumper: Vivid Violet/Purple Urban Hoodie + Cyan Accents
      jacketColor = 0x9333ea;
      pantsColor = 0x1e1b4b;
      skinColor = 0xa7f3d0;
      bootColor = 0x06b6d4; // Cyan sneakers
    } else if (type === 'crawler') {
      // 4. Crawler / Lab Medic: Blood-stained White/Teal Doctor Lab Coat
      jacketColor = 0xe2e8f0; // White lab coat
      pantsColor = 0x059669; // Teal surgical scrubs
      skinColor = 0xa3a3a3;
      bootColor = 0x0f172a;
    } else if (type === 'brute') {
      // 5. Brute / Builder: High-Vis Neon Yellow/Orange Construction Vest & Hardhat
      jacketColor = 0xeab308; // High-vis yellow safety vest
      pantsColor = 0x1c1917; // Heavy work pants
      skinColor = 0x64748b;
      bootColor = 0xb45309; // Heavy steel-toe work boots
    } else if (type === 'boss_mutant') {
      // Boss: Crimson armored Colossus
      jacketColor = 0x7f1d1d;
      pantsColor = 0x450a0a;
      skinColor = 0x475569;
      bootColor = 0x000000;
    }

    this.originalJacketColor = jacketColor;

    const jacketMat = new THREE.MeshStandardMaterial({ color: jacketColor, roughness: 0.6, flatShading: true });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7, flatShading: true });
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5, flatShading: true });
    const bootMat = new THREE.MeshStandardMaterial({ color: bootColor, roughness: 0.4, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Glowing red eyes

    // 1. Drop Shadow
    const shadowGeo = new THREE.CircleGeometry(0.55 * scale, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);

    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    if (type === 'crawler') {
      // Doctor / Lab Medic Crawler on belly
      const torsoGeo = new THREE.BoxGeometry(0.68, 0.32, 0.36);
      this.torso = new THREE.Mesh(torsoGeo, jacketMat);
      this.torso.position.set(0, 0.22, 0);
      this.bodyGroup.add(this.torso);

      // Blood stains on lab coat
      const bloodPatch = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.38), new THREE.MeshBasicMaterial({ color: 0x990000 }));
      bloodPatch.position.set(-0.1, 0.25, 0);
      this.bodyGroup.add(bloodPatch);

      const headGeo = new THREE.DodecahedronGeometry(0.2, 0);
      this.head = new THREE.Mesh(headGeo, skinMat);
      this.head.position.set(-0.35, 0.28, 0);
      this.bodyGroup.add(this.head);

      // Green surgical mask
      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.22), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      mask.position.set(-0.45, 0.25, 0);
      this.bodyGroup.add(mask);

      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), eyeMat);
      eye.position.set(-0.5, 0.32, 0.08);
      this.bodyGroup.add(eye);

      const armGeo = new THREE.BoxGeometry(0.42, 0.12, 0.12);
      this.leftArm = new THREE.Mesh(armGeo, skinMat);
      this.leftArm.position.set(-0.2, 0.12, -0.24);
      this.rightArm = new THREE.Mesh(armGeo, skinMat);
      this.rightArm.position.set(-0.2, 0.12, 0.24);
      this.bodyGroup.add(this.leftArm, this.rightArm);

      this.leftLeg = new THREE.Mesh(armGeo, pantsMat);
      this.leftLeg.position.set(0.32, 0.1, -0.16);
      this.rightLeg = new THREE.Mesh(armGeo, pantsMat);
      this.rightLeg.position.set(0.32, 0.1, 0.16);
      this.group.add(this.leftLeg, this.rightLeg);
    } else {
      // 2. Torso with Distinct Uniform / Clothes
      const torsoGeo = new THREE.BoxGeometry(0.55 * scale, 0.7 * scale, 0.35 * scale);
      this.torso = new THREE.Mesh(torsoGeo, jacketMat);
      this.torso.position.y = 0.95 * scale;
      this.torso.castShadow = true;
      this.bodyGroup.add(this.torso);

      // Reflective stripe for Construction Brute
      if (type === 'brute') {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.58 * scale, 0.12 * scale, 0.38 * scale),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        stripe.position.y = 0.95 * scale;
        this.bodyGroup.add(stripe);
      }

      // 3. Humanoid Head & Custom Headwear
      const headGeo = new THREE.DodecahedronGeometry(0.24 * scale, 0);
      this.head = new THREE.Mesh(headGeo, skinMat);
      this.head.position.y = 1.45 * scale;
      this.head.castShadow = true;
      this.bodyGroup.add(this.head);

      if (type === 'brute') {
        // Yellow Construction Hard Hat Helmet
        const helmet = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32 * scale, 0.36 * scale, 0.22 * scale, 8),
          new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, flatShading: true })
        );
        helmet.position.y = 1.62 * scale;
        helmet.castShadow = true;
        this.bodyGroup.add(helmet);
      } else if (type === 'runner') {
        // Red Sports Headband
        const headband = new THREE.Mesh(
          new THREE.BoxGeometry(0.38 * scale, 0.08 * scale, 0.38 * scale),
          new THREE.MeshBasicMaterial({ color: 0xdc2626 })
        );
        headband.position.set(0, 1.54 * scale, 0);
        this.bodyGroup.add(headband);
      } else if (type === 'jumper') {
        // Purple Hoodie Cap
        const hood = new THREE.Mesh(
          new THREE.BoxGeometry(0.42 * scale, 0.28 * scale, 0.42 * scale),
          jacketMat
        );
        hood.position.set(0.04 * scale, 1.52 * scale, 0);
        this.bodyGroup.add(hood);
      } else {
        // Messy civilian hair
        const hairGeo = new THREE.BoxGeometry(0.36 * scale, 0.16 * scale, 0.38 * scale);
        this.hair = new THREE.Mesh(hairGeo, bootMat);
        this.hair.position.set(0.02 * scale, 1.58 * scale, 0);
        this.bodyGroup.add(this.hair);
      }

      // Red Glowing Eyes looking left towards survivor
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.06 * scale, 0.06 * scale), eyeMat);
      eye.position.set(-0.2 * scale, 1.48 * scale, 0.1 * scale);
      this.bodyGroup.add(eye);

      // 4. Arms
      const armGeo = new THREE.BoxGeometry(0.14 * scale, 0.5 * scale, 0.14 * scale);
      this.leftArm = new THREE.Mesh(armGeo, skinMat);
      this.leftArm.position.set(0, 0.95 * scale, -0.26 * scale);
      this.leftArm.castShadow = true;
      this.bodyGroup.add(this.leftArm);

      this.rightArm = new THREE.Mesh(armGeo, skinMat);
      this.rightArm.position.set(0, 0.95 * scale, 0.26 * scale);
      this.rightArm.castShadow = true;
      this.bodyGroup.add(this.rightArm);

      // 5. Legs & Boots
      const legGeo = new THREE.BoxGeometry(0.18 * scale, 0.52 * scale, 0.18 * scale);
      this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
      this.leftLeg.position.set(0, 0.36 * scale, -0.14 * scale);
      this.leftLeg.castShadow = true;
      this.group.add(this.leftLeg);

      this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
      this.rightLeg.position.set(0, 0.36 * scale, 0.14 * scale);
      this.rightLeg.castShadow = true;
      this.group.add(this.rightLeg);

      const bootGeo = new THREE.BoxGeometry(0.22 * scale, 0.16 * scale, 0.2 * scale);
      this.leftBoot = new THREE.Mesh(bootGeo, bootMat);
      this.leftBoot.position.set(-0.04 * scale, 0.08 * scale, -0.14 * scale);
      this.group.add(this.leftBoot);

      this.rightBoot = new THREE.Mesh(bootGeo, bootMat);
      this.rightBoot.position.set(-0.04 * scale, 0.08 * scale, 0.14 * scale);
      this.group.add(this.rightBoot);

      // Boss Spikes
      if (type === 'boss_mutant') {
        const spikeGeo = new THREE.ConeGeometry(0.2, 0.6, 4);
        for (let s = 0; s < 3; s++) {
          const spike = new THREE.Mesh(spikeGeo, new THREE.MeshStandardMaterial({ color: 0x991b1b, flatShading: true }));
          spike.rotation.z = Math.PI / 4;
          spike.position.set(0.25, 0.8 + s * 0.4, 0);
          this.bodyGroup.add(spike);
        }
      }
    }

    // Default orientation: Facing LEFT (-X direction) towards the survivor
    this.group.rotation.y = Math.PI;
  }

  public takeDamage(damage: number, hitDirX = 1): boolean {
    this.hp -= damage;
    this.hitFlashTimer = 0.15;
    (this.torso.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);

    if (this.hp <= 0) {
      this.isDead = true;
      this.activateRagdoll(hitDirX);
      return true;
    }
    return false;
  }

  public activateRagdoll(hitDirX = 1) {
    this.isRagdoll = true;
    this.ragdollTime = 0;

    this.ragdollVx = hitDirX * (4.5 + Math.random() * 4.5);
    this.ragdollVy = 4.0 + Math.random() * 3.5;
    this.ragdollVz = (Math.random() - 0.5) * 2.0;

    this.ragdollRotVx = (Math.random() - 0.5) * 8;
    this.ragdollRotVz = -hitDirX * (6 + Math.random() * 6);
  }

  public update(dt: number, time: number) {
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0) {
        (this.torso.material as THREE.MeshStandardMaterial).color.setHex(this.originalJacketColor);
      }
    }

    if (this.isRagdoll) {
      this.ragdollTime += dt;

      this.ragdollVy -= 24 * dt;
      this.x += this.ragdollVx * dt;
      this.y += this.ragdollVy * dt;

      this.group.rotation.x += this.ragdollRotVx * dt;
      this.group.rotation.z += this.ragdollRotVz * dt;

      if (this.y <= 0.15) {
        this.y = 0.15;
        if (Math.abs(this.ragdollVy) > 1.5) {
          this.ragdollVy = -this.ragdollVy * 0.35;
          this.ragdollVx *= 0.65;
          this.ragdollRotVz *= 0.6;
        } else {
          this.ragdollVy = 0;
          this.ragdollVx *= 0.8;
          this.ragdollRotVz *= 0.7;
          this.ragdollRotVx *= 0.7;
        }
      }

      this.leftArm.rotation.z = Math.sin(this.ragdollTime * 8) * 1.2 - 0.4;
      this.rightArm.rotation.z = -Math.sin(this.ragdollTime * 8) * 1.2 + 0.4;
      this.leftLeg.rotation.z = Math.cos(this.ragdollTime * 6) * 0.8;
      this.rightLeg.rotation.z = -Math.cos(this.ragdollTime * 6) * 0.8;

      this.group.position.set(this.x, this.y, 0);
      this.shadowMesh.scale.setScalar(Math.max(0.2, 1 - this.y * 0.4));
      return;
    }

    this.group.position.set(this.x, this.y, 0);

    const animSpeed = this.def.type === 'runner' ? 16 : this.def.type === 'brute' ? 6 : 9;
    const t = (time + this.animOffset) * animSpeed;

    if (this.def.type === 'crawler') {
      this.leftArm.position.x = -0.2 + Math.sin(t) * 0.15;
      this.rightArm.position.x = -0.2 - Math.sin(t) * 0.15;
      this.leftLeg.position.x = 0.3 - Math.sin(t) * 0.12;
      this.rightLeg.position.x = 0.3 + Math.sin(t) * 0.12;
    } else {
      const legAngle = Math.sin(t) * 0.65;
      this.leftLeg.rotation.z = legAngle;
      this.rightLeg.rotation.z = -legAngle;
      this.leftArm.rotation.z = 0.6 + Math.sin(t * 0.7) * 0.2;
      this.rightArm.rotation.z = 0.6 - Math.sin(t * 0.7) * 0.2;
      this.bodyGroup.position.y = Math.abs(Math.sin(t * 2)) * 0.06;
    }
  }
}
