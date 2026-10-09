import * as THREE from 'three';
import { CoinItem } from '../types';

export class CoinMeshInstance {
  public group: THREE.Group;
  public item: CoinItem;
  private coinMesh: THREE.Mesh;

  constructor(item: CoinItem) {
    this.item = item;
    this.group = new THREE.Group();
    this.group.position.set(item.x, item.y, 0);

    // 3D Faceted Gold Coin
    const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Gold
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
      flatShading: true,
    });
    this.coinMesh = new THREE.Mesh(coinGeo, coinMat);
    this.coinMesh.rotation.x = Math.PI / 2;
    this.coinMesh.castShadow = true;
    this.group.add(this.coinMesh);

    // Star icon / Emboss ring
    const ringGeo = new THREE.TorusGeometry(0.16, 0.03, 6, 12);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, metalness: 0.9, roughness: 0.1 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    this.coinMesh.add(ring);
  }

  public update(dt: number, time: number) {
    this.group.position.x = this.item.x;
    this.group.position.y = this.item.y + Math.sin(time * 4 + this.item.x) * 0.08;
    this.coinMesh.rotation.z += dt * 3.5;
  }
}
