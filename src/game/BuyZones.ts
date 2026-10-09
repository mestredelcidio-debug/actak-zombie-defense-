import * as THREE from 'three';
import { BuyZoneDef, BuyZoneType } from './types';
import { sound } from './Audio';

export const INITIAL_BUY_ZONES: BuyZoneDef[] = [
  {
    id: 'BUILD_TURRET_1',
    title: 'TORRETA ESQUERDA',
    subtitle: 'Metralhadora Automática',
    cost: 80,
    currentPaid: 0,
    x: -3.8,
    z: -4.2,
    radius: 1.8,
    isUnlocked: false,
    category: 'turret',
    icon: '🔫',
    color: 0x3b82f6,
  },
  {
    id: 'BUILD_TURRET_2',
    title: 'TORRETA DIREITA',
    subtitle: 'Metralhadora Automática',
    cost: 140,
    currentPaid: 0,
    x: 3.8,
    z: -4.2,
    radius: 1.8,
    isUnlocked: false,
    category: 'turret',
    icon: '🔫',
    color: 0x3b82f6,
  },
  {
    id: 'RECRUIT_GUARD_1',
    title: 'CONTRATAR GUARDA AZUL',
    subtitle: 'Soldado com Fuzil',
    cost: 110,
    currentPaid: 0,
    x: -1.6,
    z: -5.0,
    radius: 1.8,
    isUnlocked: false,
    category: 'guard',
    icon: '👮',
    color: 0x2563eb,
  },
  {
    id: 'RECRUIT_GUARD_2',
    title: 'SEGUNDO GUARDA AZUL',
    subtitle: 'Soldado de Elite',
    cost: 220,
    currentPaid: 0,
    x: 1.6,
    z: -5.0,
    radius: 1.8,
    isUnlocked: false,
    category: 'guard',
    icon: '👮',
    color: 0x2563eb,
  },
  {
    id: 'UPGRADE_WEAPONS',
    title: 'BANCADA DE ARMAS',
    subtitle: 'Melhorar / Nova Arma',
    cost: 60,
    currentPaid: 0,
    x: -4.5,
    z: 3.0,
    radius: 2.0,
    isUnlocked: false,
    category: 'upgrade',
    icon: '⚡',
    color: 0xf59e0b,
  },
  {
    id: 'UPGRADE_HEALTH',
    title: 'POSTO MÉDICO',
    subtitle: 'Curar & Aumentar HP',
    cost: 50,
    currentPaid: 0,
    x: 4.5,
    z: 3.0,
    radius: 2.0,
    isUnlocked: false,
    category: 'upgrade',
    icon: '❤️',
    color: 0x10b981,
  },
  {
    id: 'UNLOCK_GATE_NORTH',
    title: 'LIBERAR PORTÃO NORTE',
    subtitle: 'Expansão da Ponte & Rio',
    cost: 250,
    currentPaid: 0,
    x: 0,
    z: -6.5,
    radius: 2.2,
    isUnlocked: false,
    category: 'gate',
    icon: '🌉',
    color: 0x8b5cf6,
  },
  {
    id: 'BUILD_TURRET_3',
    title: 'CANHÃO PESADO',
    subtitle: 'Artilharia de Retaguarda',
    cost: 400,
    currentPaid: 0,
    x: 0,
    z: 6.2,
    radius: 2.0,
    isUnlocked: false,
    category: 'turret',
    icon: '💥',
    color: 0xef4444,
  },
  {
    id: 'EXPAND_PERIMETER',
    title: 'EXPANDIR BASE',
    subtitle: 'Muralhas Fortificadas',
    cost: 600,
    currentPaid: 0,
    x: 0,
    z: 1.5,
    radius: 2.2,
    isUnlocked: false,
    category: 'expansion',
    icon: '🏰',
    color: 0x06b6d4,
  },
];

export class BuyZoneManager {
  public zones: BuyZoneDef[];
  public zoneMeshes: Map<string, THREE.Group> = new Map();
  public canvasTextures: Map<string, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture }> = new Map();

  constructor(savedZonesState?: Record<string, boolean>) {
    this.zones = INITIAL_BUY_ZONES.map((z) => ({
      ...z,
      isUnlocked: savedZonesState ? !!savedZonesState[z.id] : false,
      currentPaid: savedZonesState && savedZonesState[z.id] ? z.cost : 0,
    }));
  }

  public initMeshes(scene: THREE.Scene) {
    this.zones.forEach((zone) => {
      const group = new THREE.Group();
      group.position.set(zone.x, 0.04, zone.z);

      // 1. Flat Shaded Circular Pad Base
      const padGeo = new THREE.CircleGeometry(zone.radius * 0.85, 32);
      const padMat = new THREE.MeshStandardMaterial({
        color: zone.color,
        roughness: 0.4,
        metalness: 0.1,
        transparent: true,
        opacity: zone.isUnlocked ? 0.25 : 0.65,
      });
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.rotation.x = -Math.PI / 2;
      padMesh.receiveShadow = true;
      group.add(padMesh);

      // 2. Glowing Outer Ring
      const ringGeo = new THREE.RingGeometry(zone.radius * 0.85, zone.radius * 0.95, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: zone.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: zone.isUnlocked ? 0.3 : 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.01;
      group.add(ringMesh);

      // 3. Floating 3D Billboard Canvas
      const { canvas, texture } = this.createLabelCanvas(zone);
      this.canvasTextures.set(zone.id, { canvas, texture });

      const labelMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(labelMat);
      sprite.scale.set(3.2, 1.6, 1);
      sprite.position.set(0, 1.4, 0);
      group.add(sprite);

      scene.add(group);
      this.zoneMeshes.set(zone.id, group);

      if (zone.isUnlocked && (zone.category === 'gate' || zone.category === 'expansion')) {
        group.visible = false;
      }
    });
  }

  private createLabelCanvas(zone: BuyZoneDef): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    this.updateCanvasContent(canvas, texture, zone);
    return { canvas, texture };
  }

  public updateCanvasContent(canvas: HTMLCanvasElement, texture: THREE.CanvasTexture, zone: BuyZoneDef) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (zone.isUnlocked) {
      // Completed Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(40, 60, 432, 136, 28);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✓ ${zone.title}`, 256, 120);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('CONCLUÍDO', 256, 160);
    } else {
      const remaining = Math.max(0, zone.cost - zone.currentPaid);
      const progress = zone.currentPaid / zone.cost;

      // Dark card container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(24, 30, 464, 196, 32);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Icon & Title
      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${zone.icon} ${zone.title}`, 256, 80);

      // Price Tag (Big Yellow / Amber)
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 46px monospace';
      ctx.fillText(`$ ${remaining.toLocaleString()}`, 256, 140);

      // Progress Bar
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(50, 165, 412, 22, 11);
      ctx.fill();

      if (progress > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.roundRect(50, 165, 412 * progress, 22, 11);
        ctx.fill();
      }
    }

    texture.needsUpdate = true;
  }

  public updatePlayerInteraction(
    playerX: number,
    playerZ: number,
    playerCoins: number,
    dt: number,
    onSpendMoney: (amount: number) => void,
    onZoneUnlocked: (zone: BuyZoneDef) => void
  ) {
    for (const zone of this.zones) {
      if (zone.isUnlocked && (zone.category === 'gate' || zone.category === 'expansion' || zone.category === 'turret' || zone.category === 'guard')) {
        continue;
      }

      const dist = Math.hypot(playerX - zone.x, playerZ - zone.z);
      if (dist <= zone.radius) {
        const remaining = zone.cost - zone.currentPaid;
        if (remaining > 0 && playerCoins > 0) {
          const transferRate = Math.max(1, Math.round(90 * dt));
          const toSpend = Math.min(transferRate, remaining, playerCoins);

          if (toSpend > 0) {
            zone.currentPaid += toSpend;
            onSpendMoney(toSpend);
            sound.playCoin();

            const label = this.canvasTextures.get(zone.id);
            if (label) {
              this.updateCanvasContent(label.canvas, label.texture, zone);
            }

            if (zone.currentPaid >= zone.cost) {
              zone.isUnlocked = true;
              sound.playUpgrade();
              onZoneUnlocked(zone);

              if (label) {
                this.updateCanvasContent(label.canvas, label.texture, zone);
              }

              const meshGroup = this.zoneMeshes.get(zone.id);
              if (meshGroup) {
                if (zone.category === 'gate' || zone.category === 'expansion') {
                  meshGroup.visible = false;
                }
              }
            }
          }
        }
      }
    }
  }

  public animate(elapsed: number) {
    this.zones.forEach((zone) => {
      const group = this.zoneMeshes.get(zone.id);
      if (group && group.visible) {
        const ring = group.children[1] as THREE.Mesh;
        if (ring) {
          ring.scale.setScalar(1 + Math.sin(elapsed * 4 + zone.x) * 0.06);
        }
        const sprite = group.children[2] as THREE.Sprite;
        if (sprite) {
          sprite.position.y = 1.4 + Math.sin(elapsed * 2.5 + zone.z) * 0.08;
        }
      }
    });
  }
}
