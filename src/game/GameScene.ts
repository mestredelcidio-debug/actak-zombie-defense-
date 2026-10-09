import * as THREE from 'three';

export class GameScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public riverMesh: THREE.Mesh | null = null;
  public trees: THREE.Group[] = [];
  public northGateLeft: THREE.Mesh | null = null;
  public northGateRight: THREE.Mesh | null = null;
  public isNorthGateOpen: boolean = false;
  public isBaseExpanded: boolean = false;

  // Base area allowing free movement across the entire beige compound
  public baseArea: { minX: number; maxX: number; minZ: number; maxZ: number } = {
    minX: -16.0,
    maxX: 16.0,
    minZ: -12.5,
    maxZ: 14.5,
  };

  private riverMaterial: THREE.MeshStandardMaterial | null = null;
  private clock: THREE.Clock;

  constructor(container: HTMLDivElement) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7dd3fc); // Clean stylized sky
    this.scene.fog = new THREE.FogExp2(0xa5f3fc, 0.008);

    // Camera: Top-Down Isometric Perspective
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 20, 16);
    this.camera.lookAt(0, 0, 2);

    // High Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    container.appendChild(this.renderer.domElement);

    this.setupLights();
    this.buildEnvironment();
  }

  private setupLights() {
    // Ambient fill light
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x854d0e, 0.85);
    this.scene.add(hemiLight);

    // Warm sun light for crisp polygon shadows
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    dirLight.position.set(20, 32, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    const d = 32;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    this.scene.add(dirLight);

    // Soft sky rim light
    const skyRim = new THREE.DirectionalLight(0x38bdf8, 0.45);
    skyRim.position.set(-18, 14, -20);
    this.scene.add(skyRim);
  }

  private buildEnvironment() {
    // 1. Outside Surrounding Grass Terrain
    const outerGrassGeo = new THREE.PlaneGeometry(100, 100, 16, 16);
    const outerGrassMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80, // Vibrant stylized green outer meadow
      roughness: 0.8,
      flatShading: true,
    });
    const outerGrass = new THREE.Mesh(outerGrassGeo, outerGrassMat);
    outerGrass.rotation.x = -Math.PI / 2;
    outerGrass.position.y = -0.05;
    outerGrass.receiveShadow = true;
    this.scene.add(outerGrass);

    // 2. ENTIRE BASE FLOOR IN BEIGE (Chão Cor de Bege como solicitado pelo usuário)
    const baseGeo = new THREE.BoxGeometry(34, 0.22, 30);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xe6dcce, // Warm Tactical Sand-Beige Floor
      roughness: 0.85,
      flatShading: true,
    });
    const baseGround = new THREE.Mesh(baseGeo, baseMat);
    baseGround.position.set(0, 0, 1.5);
    baseGround.receiveShadow = true;
    this.scene.add(baseGround);

    // Decorative Beige Grid Tiles / Modular Pavers inside base
    const tileGroup = new THREE.Group();
    const tileMatLight = new THREE.MeshStandardMaterial({ color: 0xefe5d8, roughness: 0.8 });
    const tileMatDark = new THREE.MeshStandardMaterial({ color: 0xdfd2c0, roughness: 0.8 });

    for (let x = -14; x <= 14; x += 4) {
      for (let z = -10; z <= 12; z += 4) {
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 0.02, 3.6),
          (x + z) % 8 === 0 ? tileMatLight : tileMatDark
        );
        tile.position.set(x, 0.12, z + 1.5);
        tile.receiveShadow = true;
        tileGroup.add(tile);
      }
    }
    this.scene.add(tileGroup);

    // Central Runway Path (Accent Beige/Tan Cobblestone)
    const runwayGeo = new THREE.BoxGeometry(5.2, 0.04, 30);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0xd6c7b2, // Slightly darker accent beige walkway
      roughness: 0.75,
      flatShading: true,
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.position.set(0, 0.13, 1.5);
    runway.receiveShadow = true;
    this.scene.add(runway);

    // Cross Pathway for lateral movement
    const crossPathGeo = new THREE.BoxGeometry(32, 0.04, 4.8);
    const crossPath = new THREE.Mesh(crossPathGeo, runwayMat);
    crossPath.position.set(0, 0.13, 2.0);
    crossPath.receiveShadow = true;
    this.scene.add(crossPath);

    // 3. Fences & Perimeter Chokepoints
    this.buildFences();

    // 4. Northern Wooden Gate (Z = -6.5)
    this.buildNorthernWoodenGate();

    // 5. River & Bridge across top
    this.buildRiverAndBridge();

    // 6. Sandbag Fortifications & Watchtowers
    this.buildFortificationsAndProps();

    // 7. Low-Poly Trees and Boulders
    this.buildLowPolyNature();
  }

  private buildFences() {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, flatShading: true });
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      wireframe: true,
      roughness: 0.4,
      metalness: 0.7,
    });

    const createPost = (x: number, z: number, height = 2.2) => {
      const postGeo = new THREE.CylinderGeometry(0.14, 0.16, height, 6);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, height / 2, z);
      post.castShadow = true;
      post.receiveShadow = true;
      this.scene.add(post);
    };

    const createFenceSegment = (x1: number, z1: number, x2: number, z2: number) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const panelGeo = new THREE.BoxGeometry(0.08, 1.6, length);
      const panel = new THREE.Mesh(panelGeo, wireMat);
      panel.position.set((x1 + x2) / 2, 0.9, (z1 + z2) / 2);
      panel.rotation.y = angle + Math.PI / 2;
      panel.castShadow = true;
      panel.receiveShadow = true;
      this.scene.add(panel);

      const railGeo = new THREE.CylinderGeometry(0.04, 0.04, length, 5);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const topRail = new THREE.Mesh(railGeo, railMat);
      topRail.position.set((x1 + x2) / 2, 1.7, (z1 + z2) / 2);
      topRail.rotation.z = Math.PI / 2;
      topRail.rotation.y = angle;
      this.scene.add(topRail);

      createPost(x1, z1);
      createPost(x2, z2);
    };

    // North Fence with Gate Opening (between X: -3.0 and X: 3.0)
    createFenceSegment(-16, -6.5, -3.0, -6.5);
    createFenceSegment(3.0, -6.5, 16, -6.5);

    // South Fence
    createFenceSegment(-16, 15.5, 16, 15.5);

    // West Fence
    createFenceSegment(-16, -6.5, -16, 15.5);

    // East Fence
    createFenceSegment(16, -6.5, 16, 15.5);
  }

  private buildNorthernWoodenGate() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.8,
      flatShading: true,
    });
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3,
    });

    // Left Gate Door
    const gateGeo = new THREE.BoxGeometry(2.6, 2.2, 0.16);
    this.northGateLeft = new THREE.Mesh(gateGeo, woodMat);
    this.northGateLeft.position.set(-1.4, 1.1, -6.5);
    this.northGateLeft.castShadow = true;

    const band1 = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.18, 0.2), ironMat);
    band1.position.y = 0.5;
    const band2 = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.18, 0.2), ironMat);
    band2.position.y = -0.5;
    this.northGateLeft.add(band1, band2);
    this.scene.add(this.northGateLeft);

    // Right Gate Door
    this.northGateRight = new THREE.Mesh(gateGeo, woodMat);
    this.northGateRight.position.set(1.4, 1.1, -6.5);
    this.northGateRight.castShadow = true;

    const band3 = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.18, 0.2), ironMat);
    band3.position.y = 0.5;
    const band4 = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.18, 0.2), ironMat);
    band4.position.y = -0.5;
    this.northGateRight.add(band3, band4);
    this.scene.add(this.northGateRight);

    // Gate Arch Posts
    const archPostMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9, flatShading: true });
    const archPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.6, 8), archPostMat);
    archPost1.position.set(-3.0, 1.8, -6.5);
    archPost1.castShadow = true;

    const archPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.6, 8), archPostMat);
    archPost2.position.set(3.0, 1.8, -6.5);
    archPost2.castShadow = true;

    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.45, 0.45), archPostMat);
    beam.position.set(0, 3.6, -6.5);
    beam.castShadow = true;

    this.scene.add(archPost1, archPost2, beam);
  }

  private buildRiverAndBridge() {
    // Flowing River
    const riverGeo = new THREE.PlaneGeometry(100, 10, 16, 4);
    this.riverMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan river
      roughness: 0.1,
      metalness: 0.4,
      flatShading: true,
      transparent: true,
      opacity: 0.92,
    });
    this.riverMesh = new THREE.Mesh(riverGeo, this.riverMaterial);
    this.riverMesh.rotation.x = -Math.PI / 2;
    this.riverMesh.position.set(0, -0.02, -16.5);
    this.scene.add(this.riverMesh);

    // River banks
    const bankGeo = new THREE.BoxGeometry(100, 0.3, 1.2);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, flatShading: true });
    const bankNear = new THREE.Mesh(bankGeo, bankMat);
    bankNear.position.set(0, 0.05, -11.4);
    const bankFar = new THREE.Mesh(bankGeo, bankMat);
    bankFar.position.set(0, 0.05, -21.6);
    this.scene.add(bankNear, bankFar);

    // Wooden Bridge across river
    const bridgeGeo = new THREE.BoxGeometry(4.6, 0.3, 10.4);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0xa16207,
      roughness: 0.8,
      flatShading: true,
    });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(0, 0.16, -16.5);
    bridge.receiveShadow = true;
    bridge.castShadow = true;
    this.scene.add(bridge);

    // Bridge Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 10.4), railMat);
    leftRail.position.set(-2.2, 0.55, -16.5);
    leftRail.castShadow = true;

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 10.4), railMat);
    rightRail.position.set(2.2, 0.55, -16.5);
    rightRail.castShadow = true;

    this.scene.add(leftRail, rightRail);
  }

  private buildFortificationsAndProps() {
    const sandbagMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.95,
      flatShading: true,
    });

    const createSandbagStack = (x: number, z: number, rotY: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotY;

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3 - row; col++) {
          const bag = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.45), sandbagMat);
          bag.position.set((col - (2 - row) / 2) * 0.75, row * 0.32 + 0.18, 0);
          bag.castShadow = true;
          bag.receiveShadow = true;
          group.add(bag);
        }
      }
      this.scene.add(group);
    };

    createSandbagStack(-3.6, -6.0, 0.2);
    createSandbagStack(3.6, -6.0, -0.2);

    // Watchtower in corner
    const buildWatchtower = (x: number, z: number) => {
      const tower = new THREE.Group();
      tower.position.set(x, 0, z);

      const legMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
      for (let lx = -1; lx <= 1; lx += 2) {
        for (let lz = -1; lz <= 1; lz += 2) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.2, 6), legMat);
          leg.position.set(lx * 0.9, 2.1, lz * 0.9);
          leg.castShadow = true;
          tower.add(leg);
        }
      }

      const plat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 2.4), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }));
      plat.position.y = 4.2;
      plat.castShadow = true;
      plat.receiveShadow = true;
      tower.add(plat);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.4, 4), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, flatShading: true }));
      roof.position.y = 5.8;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      tower.add(roof);

      this.scene.add(tower);
    };

    buildWatchtower(-14.5, -5.2);
    buildWatchtower(14.5, -5.2);
  }

  private buildLowPolyNature() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9, flatShading: true });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, flatShading: true });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6, flatShading: true });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85, flatShading: true });

    const createTree = (x: number, z: number, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      tree.scale.setScalar(scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.0, 6), trunkMat);
      trunk.position.y = 1.0;
      trunk.castShadow = true;
      tree.add(trunk);

      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.2, 7), foliageMat1);
      cone1.position.y = 2.4;
      cone1.castShadow = true;
      tree.add(cone1);

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 7), foliageMat2);
      cone2.position.y = 3.6;
      cone2.castShadow = true;
      tree.add(cone2);

      this.trees.push(tree);
      this.scene.add(tree);
    };

    const createRock = (x: number, z: number, scale = 1.0) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 * scale, 0), rockMat);
      rock.position.set(x, 0.35 * scale, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    };

    const treeCoords = [
      [-19, -10, 1.3],
      [-21, -4, 1.1],
      [-20, 4, 1.4],
      [-19, 10, 1.2],
      [-20, 18, 1.5],
      [19, -10, 1.2],
      [21, -4, 1.4],
      [20, 4, 1.1],
      [19, 10, 1.3],
      [21, 18, 1.5],
      [-8, -25, 1.6],
      [-2, -26, 1.4],
      [6, -26, 1.7],
      [14, -24, 1.3],
      [-14, -22, 1.5],
      [-6, 18, 1.2],
      [6, 19, 1.3],
      [0, 20, 1.4],
    ];

    treeCoords.forEach(([x, z, s]) => createTree(x, z, s));

    createRock(-17, -8, 1.2);
    createRock(17, -7, 0.9);
    createRock(-17, 7, 1.4);
    createRock(17, 8, 1.1);
  }

  public openNorthGate() {
    this.isNorthGateOpen = true;
    if (this.northGateLeft && this.northGateRight) {
      this.northGateLeft.rotation.y = -Math.PI / 2.2;
      this.northGateLeft.position.x = -2.8;
      this.northGateRight.rotation.y = Math.PI / 2.2;
      this.northGateRight.position.x = 2.8;
    }
    this.baseArea.minZ = -18.0;
  }

  public expandBasePerimeter() {
    this.isBaseExpanded = true;
    this.baseArea.minX = -17.0;
    this.baseArea.maxX = 17.0;
    this.baseArea.maxZ = 16.0;
  }

  /**
   * Smoothly and continuously follows the player character wherever they move across the map
   */
  public updateCamera(playerPos: THREE.Vector3) {
    const targetX = playerPos.x;
    const targetY = 19.5;
    const targetZ = playerPos.z + 14.5;

    // Smooth lerp camera tracking (tela acompanha o personagem principal)
    this.camera.position.x += (targetX - this.camera.position.x) * 0.12;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.12;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.12;

    this.camera.lookAt(playerPos.x, 0.6, playerPos.z);
  }

  public update() {
    const elapsed = this.clock.getElapsedTime();
    if (this.riverMaterial) {
      this.riverMaterial.color.setHSL(0.55 + Math.sin(elapsed * 1.5) * 0.015, 0.85, 0.45);
    }

    this.trees.forEach((tree, idx) => {
      tree.rotation.z = Math.sin(elapsed * 2 + idx) * 0.03;
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
