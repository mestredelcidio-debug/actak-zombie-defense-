import { CoinItem, ObstacleDef, ObstacleType, ZombieType } from '../types';

export interface GeneratedChunk {
  startX: number;
  endX: number;
  obstacles: ObstacleDef[];
  zombies: { type: ZombieType; x: number; y?: number }[];
  coins: CoinItem[];
}

export class ChunkGenerator {
  private lastGeneratedX: number = 18;
  private chunkIndex: number = 0;

  public reset(startX = 18) {
    this.lastGeneratedX = startX;
    this.chunkIndex = 0;
  }

  public generateNextChunk(playerX: number): GeneratedChunk | null {
    if (this.lastGeneratedX - playerX > 65) return null;

    this.chunkIndex++;
    const chunkLength = 26 + Math.random() * 8;
    const startX = this.lastGeneratedX;
    const endX = startX + chunkLength;
    this.lastGeneratedX = endX;

    const obstacles: ObstacleDef[] = [];
    const zombies: { type: ZombieType; x: number; y?: number }[] = [];
    const coins: CoinItem[] = [];

    const distance = Math.max(0, playerX);

    // Mini-Boss Encounter every 500m
    const isBossArena = distance > 400 && Math.floor(distance / 500) > Math.floor((distance - chunkLength) / 500);

    if (isBossArena) {
      zombies.push({ type: 'boss_mutant', x: startX + 16, y: 0 });
      zombies.push({ type: 'runner', x: startX + 10, y: 0 });
      zombies.push({ type: 'common', x: startX + 22, y: 0 });
      this.generateCoinArc(startX + 4, 8, coins);
      return { startX, endX, obstacles, zombies, coins };
    }

    // Pacing Types: Tranquil, Attention, Danger
    const pacingRoll = Math.random();
    let pacing: 'tranquil' | 'attention' | 'danger' = 'tranquil';

    if (distance < 150) {
      pacing = pacingRoll < 0.4 ? 'tranquil' : 'attention';
    } else if (distance < 500) {
      pacing = pacingRoll < 0.2 ? 'tranquil' : pacingRoll < 0.6 ? 'attention' : 'danger';
    } else {
      pacing = pacingRoll < 0.1 ? 'tranquil' : pacingRoll < 0.45 ? 'attention' : 'danger';
    }

    if (pacing === 'tranquil') {
      // 1. Tranquil stretch with coin arc & 1-2 casual zombies
      this.generateCoinArc(startX + 4, 8, coins);
      zombies.push({ type: 'common', x: startX + 14, y: 0 });
      if (Math.random() < 0.5) {
        zombies.push({ type: 'crawler', x: startX + 20, y: 0 });
      }
    } else if (pacing === 'attention') {
      // 2. Obstacle Barrier with Zombies on BOTH sides:
      // - NEAR SIDE (Same side as player): 1 zombie coming directly at you!
      // - OBSTACLE: Rock or Wooden Crate
      // - FAR SIDE: Jumper/Common zombie behind obstacle
      const obsX = startX + 10;
      const hasRock = Math.random() < 0.5;

      // Zombie on Near Side (coming immediately for player!)
      zombies.push({ type: 'common', x: obsX - 4.5, y: 0 });

      // Obstacle
      obstacles.push({
        id: `obs_${obsX}`,
        type: hasRock ? 'rock' : 'crate',
        x: obsX,
        y: 0,
        width: 1.0,
        height: 0.8,
        jumpable: true,
        destructible: false,
      });

      this.generateCoinArc(obsX - 1.5, 5, coins);

      // Zombie on Far Side (Leaping over or advancing)
      zombies.push({ type: distance > 250 ? 'jumper' : 'common', x: obsX + 5.5, y: 0 });
    } else {
      // 3. DANGER STRETCH with Multi-Zone Horde
      const dangerType = Math.random();

      if (dangerType < 0.35) {
        // Pit Hole + Runner on Near Side + Jumper over Hole!
        const holeX = startX + 11;
        const holeWidth = 2.6;

        // Near side threat
        zombies.push({ type: 'runner', x: holeX - 5.0, y: 0 });

        obstacles.push({
          id: `hole_${holeX}`,
          type: 'hole',
          x: holeX,
          y: 0,
          width: holeWidth,
          height: 0.1,
          jumpable: true,
          destructible: false,
        });

        for (let i = 0; i < 4; i++) {
          coins.push({
            id: `c_hole_${holeX}_${i}`,
            x: holeX - 1.2 + i * 0.8,
            y: 1.4 + Math.sin((i / 3) * Math.PI) * 0.6,
            value: 1,
            collected: false,
          });
        }

        // Far side jumper leaps over hole towards player
        zombies.push({ type: 'jumper', x: holeX + holeWidth / 2 + 4.5, y: 0 });
      } else if (dangerType < 0.7) {
        // Abandoned Car Wreck with Squad on BOTH sides!
        const carX = startX + 10;

        // 1-2 Zombies on player's side of the car
        zombies.push({ type: 'common', x: carX - 4.0, y: 0 });
        if (distance > 300) {
          zombies.push({ type: 'crawler', x: carX - 6.5, y: 0 });
        }

        // Car Barrier
        obstacles.push({
          id: `car_${carX}`,
          type: 'car_wreck',
          x: carX,
          y: 0,
          width: 2.2,
          height: 1.0,
          jumpable: true,
          destructible: false,
        });

        this.generateCoinArc(carX - 1.5, 5, coins);

        // Runner & Jumper on the other side leaping over car!
        zombies.push({ type: 'jumper', x: carX + 5.0, y: 0 });
        zombies.push({ type: 'runner', x: carX + 8.5, y: 0 });
      } else {
        // Construction Brute + Barrels Barrier
        const barrelX = startX + 9;

        // Near side runner
        zombies.push({ type: 'runner', x: barrelX - 4.5, y: 0 });

        obstacles.push({
          id: `bar_${barrelX}`,
          type: 'barrel',
          x: barrelX,
          y: 0,
          width: 0.8,
          height: 0.8,
          jumpable: true,
          destructible: true,
          hp: 25,
        });

        // Heavy Builder Brute on far side
        zombies.push({ type: 'brute', x: barrelX + 5.5, y: 0 });
      }
    }

    return { startX, endX, obstacles, zombies, coins };
  }

  private generateCoinArc(startX: number, count: number, outCoins: CoinItem[]) {
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      outCoins.push({
        id: `coin_${startX}_${i}`,
        x: startX + i * 1.0,
        y: 0.6 + Math.sin(progress * Math.PI) * 1.2,
        value: 1,
        collected: false,
      });
    }
  }
}
