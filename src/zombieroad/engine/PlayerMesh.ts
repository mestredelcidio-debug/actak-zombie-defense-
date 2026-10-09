import * as THREE from 'three';
import { CharacterDef, WeaponDef } from '../types';

export class PlayerMesh {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;
  public gunMesh: THREE.Group;
  public muzzleFlash: THREE.PointLight;
  private bodyGroup: THREE.Group;
  private torso: THREE.Mesh;
  private head: THREE.Mesh;
  private hair: THREE.Mesh;
  private backpack: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftBoot: THREE.Mesh;
  private rightBoot: THREE.Mesh;
  private hitFlashTimer: number = 0;
  private shootAnimTimer: number = 0;
  private originalJacketColor: number;

  constructor(charDef: CharacterDef) {
    this.group = new THREE.Group();
    this.originalJacketColor = charDef.jacketColor;

    // Materials (Stylized Flat Shaded Low-Poly)
    const jacketMat = new THREE.MeshStandardMaterial({
      color: charDef.jacketColor,
      roughness: 0.5,
      metalness: 0.1,
      flatShading: true,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: charDef.pantsColor,
      roughness: 0.6,
      flatShading: true,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Warm stylized skin
      roughness: 0.5,
      flatShading: true,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: charDef.hairColor,
      roughness: 0.7,
      flatShading: true,
    });
    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      flatShading: true,
    });
    const packMat = new THREE.MeshStandardMaterial({
      color: charDef.backpackColor,
      roughness: 0.6,
      flatShading: true,
    });
    const kneeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      flatShading: true,
    });

    // 1. Soft Dynamic Ground Drop Shadow Under Feet
    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);

    // Body container
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // 2. Polygonal Torso with Survivor Jacket (Facing +X)
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.7, 0.35);
    this.torso = new THREE.Mesh(torsoGeo, jacketMat);
    this.torso.position.y = 0.95;
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    // Tactical Belt
    const beltGeo = new THREE.BoxGeometry(0.58, 0.12, 0.38);
    const belt = new THREE.Mesh(beltGeo, bootMat);
    belt.position.y = 0.64;
    this.bodyGroup.add(belt);

    // 3. Low-Poly Head & Hair
    const headGeo = new THREE.DodecahedronGeometry(0.24, 0);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.45;
    this.head.castShadow = true;
    this.bodyGroup.add(this.head);

    // Eyes looking forward (+X direction)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), eyeMat);
    eye.position.set(0.2, 1.48, 0.1);
    this.bodyGroup.add(eye);

    const hairGeo = new THREE.BoxGeometry(0.38, 0.18, 0.38);
    this.hair = new THREE.Mesh(hairGeo, hairMat);
    this.hair.position.set(-0.02, 1.58, 0);
    this.bodyGroup.add(this.hair);

    // 4. Survivor Backpack (Attached to back at -X)
    const packGeo = new THREE.BoxGeometry(0.35, 0.45, 0.22);
    this.backpack = new THREE.Mesh(packGeo, packMat);
    this.backpack.position.set(-0.28, 0.98, 0);
    this.backpack.castShadow = true;
    this.bodyGroup.add(this.backpack);

    // Bedroll on top of backpack
    const rollGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.38, 6);
    const roll = new THREE.Mesh(rollGeo, hairMat);
    roll.rotation.x = Math.PI / 2;
    roll.position.set(-0.28, 1.25, 0);
    this.bodyGroup.add(roll);

    // 5. Polygonal Arms (Left Arm at -Z background, Right Arm at +Z foreground)
    const armGeo = new THREE.BoxGeometry(0.14, 0.5, 0.14);

    this.leftArm = new THREE.Mesh(armGeo, jacketMat);
    this.leftArm.position.set(0, 0.95, -0.26);
    this.leftArm.castShadow = true;
    this.bodyGroup.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, jacketMat);
    this.rightArm.position.set(0, 0.95, 0.26);
    this.rightArm.castShadow = true;
    this.bodyGroup.add(this.rightArm);

    // 6. Polygonal Cargo Legs with Knee Pads & Boots
    const legGeo = new THREE.BoxGeometry(0.18, 0.52, 0.18);

    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(0, 0.36, -0.14);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0, 0.36, 0.14);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // Knee pads
    const padGeo = new THREE.BoxGeometry(0.2, 0.14, 0.08);
    const leftPad = new THREE.Mesh(padGeo, kneeMat);
    leftPad.position.set(0.09, 0.36, -0.14);
    const rightPad = new THREE.Mesh(padGeo, kneeMat);
    rightPad.position.set(0.09, 0.36, 0.14);
    this.group.add(leftPad, rightPad);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.22, 0.16, 0.2);
    this.leftBoot = new THREE.Mesh(bootGeo, bootMat);
    this.leftBoot.position.set(0.04, 0.08, -0.14);
    this.group.add(this.leftBoot);

    this.rightBoot = new THREE.Mesh(bootGeo, bootMat);
    this.rightBoot.position.set(0.04, 0.08, 0.14);
    this.group.add(this.rightBoot);

    // 7. Weapon Model in Right Hand
    this.gunMesh = new THREE.Group();
    this.rebuildWeapon('pistol');
    this.gunMesh.position.set(0.35, 0.9, 0.24);
    this.bodyGroup.add(this.gunMesh);

    // Muzzle Flash Light
    this.muzzleFlash = new THREE.PointLight(0xf59e0b, 0, 5);
    this.muzzleFlash.position.set(0.85, 0.9, 0.24);
    this.bodyGroup.add(this.muzzleFlash);

    // Initial orientation: Facing forward (+X direction, Rightward)
    this.group.rotation.y = 0;
  }

  public rebuildWeapon(weaponId: string) {
    while (this.gunMesh.children.length > 0) {
      this.gunMesh.remove(this.gunMesh.children[0]);
    }

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2, flatShading: true });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7, flatShading: true });
    const cyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    if (weaponId === 'shotgun') {
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 6), metalMat);
      b1.rotation.z = Math.PI / 2;
      b1.position.set(0.2, 0, 0);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.08), woodMat);
      stock.position.set(-0.15, -0.04, 0);
      this.gunMesh.add(b1, stock);
    } else if (weaponId === 'rifle') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.08), woodMat);
      body.position.set(0.15, 0, 0);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 6), metalMat);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(0.55, 0.02, 0);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.06), metalMat);
      mag.position.set(0.18, -0.12, 0);
      mag.rotation.z = -0.3;
      this.gunMesh.add(body, barrel, mag);
    } else if (weaponId === 'smg') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.08), metalMat);
      body.position.set(0.1, 0, 0);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.05), metalMat);
      mag.position.set(0.08, -0.14, 0);
      this.gunMesh.add(body, mag);
    } else if (weaponId === 'plasma') {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.6, 6), metalMat);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(0.22, 0, 0);
      const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), cyanMat);
      core.position.set(0.05, 0, 0);
      this.gunMesh.add(barrel, core);
    } else {
      // Pistol
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.07), metalMat);
      slide.position.set(0.08, 0, 0);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.06), woodMat);
      grip.position.set(-0.04, -0.08, 0);
      this.gunMesh.add(slide, grip);
    }
  }

  public setCharacterStyle(charDef: CharacterDef) {
    this.originalJacketColor = charDef.jacketColor;
    (this.torso.material as THREE.MeshStandardMaterial).color.setHex(charDef.jacketColor);
    (this.hair.material as THREE.MeshStandardMaterial).color.setHex(charDef.hairColor);
    (this.backpack.material as THREE.MeshStandardMaterial).color.setHex(charDef.backpackColor);
  }

  public setFacingDirection(facingRight: boolean) {
    this.group.rotation.y = facingRight ? 0 : Math.PI;
  }

  public triggerHitFlash() {
    this.hitFlashTimer = 0.18;
    (this.torso.material as THREE.MeshStandardMaterial).color.setHex(0xff0000);
  }

  public triggerShoot() {
    this.shootAnimTimer = 0.28;
    this.muzzleFlash.intensity = 5.0;
  }

  public animate(
    dt: number,
    state: { isRunning: boolean; isJumping: boolean; isFalling: boolean; isDead: boolean; runTime: number; facingRight: boolean }
  ) {
    // Face correct direction
    this.setFacingDirection(state.facingRight);

    // Hit flash fade
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0) {
        (this.torso.material as THREE.MeshStandardMaterial).color.setHex(this.originalJacketColor);
      }
    }

    // Shoot animation timer (Raises arm/gun aimed forward)
    if (this.shootAnimTimer > 0) {
      this.shootAnimTimer -= dt;
    }

    // Muzzle flash decay
    if (this.muzzleFlash.intensity > 0) {
      this.muzzleFlash.intensity = Math.max(0, this.muzzleFlash.intensity - dt * 35);
    }

    if (state.isDead) {
      // Fall backwards
      this.group.rotation.z = Math.min(Math.PI / 2, this.group.rotation.z + dt * 6);
      this.bodyGroup.position.y = Math.max(-0.4, this.bodyGroup.position.y - dt * 2);
      return;
    }

    this.group.rotation.z = 0;

    // Determine arm pose: if shooting, raise right arm forward aimed at enemies!
    const isShooting = this.shootAnimTimer > 0;

    if (state.isJumping) {
      // Jump pose: legs tucked forward
      this.leftLeg.rotation.z = 0.7;
      this.rightLeg.rotation.z = 0.5;
      this.leftArm.rotation.z = -0.5;
      this.rightArm.rotation.z = isShooting ? -Math.PI / 2 : 0.6;
      this.gunMesh.position.set(isShooting ? 0.45 : 0.35, isShooting ? 1.05 : 0.9, 0.24);
      this.bodyGroup.position.y = 0.08;
      this.shadowMesh.scale.setScalar(0.7);
    } else if (state.isFalling) {
      this.leftLeg.rotation.z = -0.3;
      this.rightLeg.rotation.z = -0.4;
      this.leftArm.rotation.z = -0.7;
      this.rightArm.rotation.z = isShooting ? -Math.PI / 2 : 0.5;
      this.gunMesh.position.set(isShooting ? 0.45 : 0.35, isShooting ? 1.05 : 0.9, 0.24);
      this.bodyGroup.position.y = 0;
      this.shadowMesh.scale.setScalar(0.65);
    } else if (state.isRunning) {
      // Fast fluid side-scroll run cycle (Swing along X axis)
      const t = state.runTime * 14;
      const legAngle = Math.sin(t) * 0.75;

      this.leftLeg.rotation.z = legAngle;
      this.rightLeg.rotation.z = -legAngle;

      this.leftArm.rotation.z = -legAngle * 0.7;

      if (isShooting) {
        // Arm raised high aiming straight forward at zombies!
        this.rightArm.rotation.z = -Math.PI / 2.1;
        this.gunMesh.position.set(0.48, 1.02, 0.24);
      } else {
        this.rightArm.rotation.z = 0.35 + Math.sin(t) * 0.15;
        this.gunMesh.position.set(0.35, 0.9, 0.24);
      }

      this.bodyGroup.position.y = Math.abs(Math.sin(t * 2)) * 0.08;
      this.torso.rotation.z = 0.06;
      this.shadowMesh.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    } else {
      // Idle Breathing
      this.leftLeg.rotation.z = 0;
      this.rightLeg.rotation.z = 0;
      this.leftArm.rotation.z = 0;

      if (isShooting) {
        // Arm raised aiming directly forward!
        this.rightArm.rotation.z = -Math.PI / 2.1;
        this.gunMesh.position.set(0.48, 1.02, 0.24);
      } else {
        this.rightArm.rotation.z = 0.25;
        this.gunMesh.position.set(0.35, 0.9, 0.24);
      }

      this.bodyGroup.position.y = Math.sin(Date.now() * 0.004) * 0.02;
      this.shadowMesh.scale.setScalar(1.0);
    }
  }
}
