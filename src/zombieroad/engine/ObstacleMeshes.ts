import * as THREE from 'three';
import { ObstacleDef, ObstacleType } from '../types';

export class ObstacleMeshInstance {
  public group: THREE.Group;
  public def: ObstacleDef;

  constructor(def: ObstacleDef) {
    this.def = def;
    this.group = new THREE.Group();
    this.group.position.set(def.x, def.y, 0);

    this.buildMesh();
  }

  private buildMesh() {
    const type = this.def.type;

    if (type === 'rock') {
      const geo = new THREE.DodecahedronGeometry(0.65, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.85,
        flatShading: true,
      });
      const rock = new THREE.Mesh(geo, mat);
      rock.position.y = 0.5;
      rock.rotation.set(0.2, 0.4, 0.1);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.group.add(rock);

      // Smaller adjacent stone
      const subRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), mat);
      subRock.position.set(0.4, 0.25, 0.2);
      this.group.add(subRock);
    } else if (type === 'car_wreck') {
      // Low-poly abandoned rusty car
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7, flatShading: true }); // Rusty Red
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, flatShading: true });
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

      // Lower chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.1), bodyMat);
      chassis.position.y = 0.45;
      chassis.castShadow = true;
      this.group.add(chassis);

      // Cabin roof
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.95), glassMat);
      cabin.position.set(-0.1, 0.85, 0);
      cabin.castShadow = true;
      this.group.add(cabin);

      // 4 Wheels
      for (const wx of [-0.65, 0.65]) {
        for (const wz of [-0.55, 0.55]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 8), tireMat);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(wx, 0.22, wz);
          this.group.add(wheel);
        }
      }
    } else if (type === 'bus_wreck') {
      // Destroyed Bus
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7, flatShading: true }); // Rusty Yellow
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const bus = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.3, 1.2), bodyMat);
      bus.position.y = 0.8;
      bus.castShadow = true;
      this.group.add(bus);

      const windows = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 1.22), glassMat);
      windows.position.set(0, 0.95, 0);
      this.group.add(windows);
    } else if (type === 'barrel') {
      // Rusty Barrel
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, flatShading: true });
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8), barrelMat);
      barrel.position.y = 0.4;
      barrel.castShadow = true;
      this.group.add(barrel);

      // Stacked second barrel
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.75, 8), barrelMat);
      b2.rotation.z = Math.PI / 2;
      b2.position.set(0.45, 0.28, 0.1);
      this.group.add(b2);
    } else if (type === 'crate') {
      // Wooden Supply Crate
      const crateMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8, flatShading: true });
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), crateMat);
      crate.position.y = 0.38;
      crate.castShadow = true;
      this.group.add(crate);
    } else if (type === 'fence') {
      // Road barrier / barricade
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8, flatShading: true });
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

      const beam1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.08), stripeMat);
      beam1.position.y = 0.7;
      const beam2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.08), stripeMat);
      beam2.position.y = 0.35;

      const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), woodMat);
      post1.position.set(-0.7, 0.45, 0);
      const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), woodMat);
      post2.position.set(0.7, 0.45, 0);

      this.group.add(beam1, beam2, post1, post2);
    } else if (type === 'hole') {
      // Deep Road Pit / Hole
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x090d16 }); // Abyss black hole
      const holeMesh = new THREE.Mesh(new THREE.BoxGeometry(this.def.width, 0.1, 4.0), holeMat);
      holeMesh.position.set(0, -0.05, 0);
      this.group.add(holeMesh);

      // Warning hazard cones at the rim
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, flatShading: true });
      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 6), coneMat);
      cone1.position.set(-this.def.width / 2 - 0.2, 0.22, -0.8);
      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 6), coneMat);
      cone2.position.set(this.def.width / 2 + 0.2, 0.22, -0.8);
      this.group.add(cone1, cone2);
    }
  }

  public update(dt: number) {
    this.group.position.x = this.def.x;
  }
}
