import * as THREE from 'three';
import { BiomeConfig, BiomeType } from '../types';
import { BIOMES_CATALOG } from '../data/biomes';

export class ZombieRoadScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private currentBiome: BiomeConfig;

  // Road & Ground tiles for continuous rolling forward
  private roadTiles: THREE.Mesh[] = [];
  private groundTiles: THREE.Mesh[] = [];

  // Parallax Scenery Groups (Layers 2, 3, 4)
  private layer2Props: THREE.Group[] = []; // Near roadside
  private layer3Props: THREE.Group[] = []; // Mid trees & structures
  private layer4Buildings: THREE.Group[] = []; // Distant skyline

  private roadMaterial: THREE.MeshStandardMaterial;
  private groundMaterial: THREE.MeshStandardMaterial;

  constructor(container: HTMLDivElement, biomeType: BiomeType = 'highway') {
    this.currentBiome = BIOMES_CATALOG[biomeType];
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.currentBiome.skyColor);
    this.scene.fog = new THREE.FogExp2(this.currentBiome.fogColor, 0.015);

    // 2D Side-Scrolling Camera (Positioned laterally to the side!)
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    this.camera.position.set(3.5, 2.5, 9.5); // Lateral side view
    this.camera.lookAt(3.5, 1.5, 0);

    // High Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    container.appendChild(this.renderer.domElement);

    // Dynamic Cinematic Lighting
    this.hemiLight = new THREE.HemisphereLight(this.currentBiome.lightColor, this.currentBiome.ambientColor, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(this.currentBiome.lightColor, this.currentBiome.lightIntensity);
    this.dirLight.position.set(15, 18, 12);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    const d = 25;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Materials
    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: this.currentBiome.roadColor,
      roughness: 0.85,
      flatShading: true,
    });
    this.groundMaterial = new THREE.MeshStandardMaterial({
      color: this.currentBiome.groundColor,
      roughness: 0.9,
      flatShading: true,
    });

    this.buildInfiniteRoadAndGround();
    this.buildParallaxBackgroundLayers();
  }

  public setBiome(biomeType: BiomeType) {
    this.currentBiome = BIOMES_CATALOG[biomeType];
    this.scene.background = new THREE.Color(this.currentBiome.skyColor);
    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(this.currentBiome.fogColor);
    }
    this.hemiLight.color.setHex(this.currentBiome.lightColor);
    this.hemiLight.groundColor.setHex(this.currentBiome.ambientColor);
    this.dirLight.color.setHex(this.currentBiome.lightColor);
    this.dirLight.intensity = this.currentBiome.lightIntensity;
    this.roadMaterial.color.setHex(this.currentBiome.roadColor);
    this.groundMaterial.color.setHex(this.currentBiome.groundColor);
  }

  private buildInfiniteRoadAndGround() {
    // 6 road segments spanning 180 meters
    const tileWidth = 30;
    for (let i = -2; i < 6; i++) {
      const xPos = i * tileWidth;

      // Roadway (Z = -2 to +2)
      const roadGeo = new THREE.BoxGeometry(tileWidth, 0.4, 4.4);
      const road = new THREE.Mesh(roadGeo, this.roadMaterial);
      road.position.set(xPos, -0.2, 0);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roadTiles.push(road);

      // Yellow Dashed Center Line
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      for (let s = -tileWidth / 2 + 2; s < tileWidth / 2; s += 4) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.16), lineMat);
        line.position.set(xPos + s, 0.01, 0);
        this.scene.add(line);
      }

      // Ground (Wide terrain under road)
      const groundGeo = new THREE.BoxGeometry(tileWidth, 0.38, 28);
      const ground = new THREE.Mesh(groundGeo, this.groundMaterial);
      ground.position.set(xPos, -0.22, -6);
      ground.receiveShadow = true;
      this.scene.add(ground);
      this.groundTiles.push(ground);
    }
  }

  private buildParallaxBackgroundLayers() {
    // Layer 2: Near Roadside Props (Streetlights, Signs, Rocks)
    for (let i = 0; i < 18; i++) {
      const prop = this.createRoadsideProp();
      prop.position.set(i * 12 - 20, 0, -2.8);
      this.scene.add(prop);
      this.layer2Props.push(prop);
    }

    // Layer 3: Mid Trees, Fences & Ruined Silhouettes
    for (let i = 0; i < 16; i++) {
      const treeGroup = this.createMidgroundScenery();
      treeGroup.position.set(i * 15 - 30, 0, -8.0);
      this.scene.add(treeGroup);
      this.layer3Props.push(treeGroup);
    }

    // Layer 4: Distant Skyline Buildings & Mountains
    for (let i = 0; i < 14; i++) {
      const building = this.createSkylineBuilding();
      building.position.set(i * 18 - 40, 0, -22.0);
      this.scene.add(building);
      this.layer4Buildings.push(building);
    }
  }

  private createRoadsideProp(): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });

    // Streetlight
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.0, 6), mat);
    pole.position.y = 2.0;
    pole.castShadow = true;
    group.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.08), mat);
    arm.position.set(0.4, 3.9, 0);
    group.add(arm);

    const bulb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    bulb.position.set(0.8, 3.8, 0);
    group.add(bulb);

    return group;
  }

  private createMidgroundScenery(): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9, flatShading: true });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6, flatShading: true });

    // Low-Poly Dead/Twisted Tree
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.0, 5), trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);

    const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.0, 5), foliageMat);
    f1.position.y = 3.2;
    f1.castShadow = true;
    const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.6, 5), foliageMat);
    f2.position.y = 4.4;
    f2.castShadow = true;
    group.add(f1, f2);

    return group;
  }

  private createSkylineBuilding(): THREE.Group {
    const group = new THREE.Group();
    const buildMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      flatShading: true,
    });

    const h = 8 + Math.random() * 12;
    const w = 4 + Math.random() * 4;
    const d = 4 + Math.random() * 3;

    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildMat);
    bMesh.position.y = h / 2;
    group.add(bMesh);

    return group;
  }

  /**
   * Lateral Side-Scrolling Camera Update (Locks seamlessly to player X position)
   */
  public updateCamera(playerX: number, playerY: number) {
    const targetCamX = playerX + 3.8;
    const targetCamY = Math.max(2.4, playerY * 0.4 + 2.4);

    this.camera.position.x = targetCamX;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.15;
    this.camera.lookAt(targetCamX - 0.5, 1.4, 0);

    // Keep light aligned with player to prevent shadow clipping
    this.dirLight.position.x = playerX + 15;
    this.dirLight.target.position.set(playerX, 0, 0);
    this.dirLight.target.updateMatrixWorld();

    // Recycle road tiles as player moves forward
    const tileWidth = 30;
    this.roadTiles.forEach((tile) => {
      if (tile.position.x < playerX - tileWidth * 1.5) {
        tile.position.x += tileWidth * this.roadTiles.length;
      }
    });

    this.groundTiles.forEach((tile) => {
      if (tile.position.x < playerX - tileWidth * 1.5) {
        tile.position.x += tileWidth * this.groundTiles.length;
      }
    });

    // Parallax Recycling
    this.layer2Props.forEach((prop) => {
      if (prop.position.x < playerX - 30) {
        prop.position.x += 12 * this.layer2Props.length;
      }
    });

    this.layer3Props.forEach((prop) => {
      if (prop.position.x < playerX - 45) {
        prop.position.x += 15 * this.layer3Props.length;
      }
    });

    this.layer4Buildings.forEach((b) => {
      if (b.position.x < playerX - 60) {
        b.position.x += 18 * this.layer4Buildings.length;
      }
    });
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public onResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
