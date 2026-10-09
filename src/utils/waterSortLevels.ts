import { LevelDef } from '../types/waterSort';

export const PRESET_LEVELS: LevelDef[] = [
  // NÍVEL 1 (Tutorial)
  {
    level: 1,
    name: 'NÍVEL 1',
    tubeCapacity: 4,
    tubes: [
      ['blue', 'red', 'blue', 'red'],
      ['red', 'blue', 'red', 'blue'],
      [],
    ],
  },
  // NÍVEL 2
  {
    level: 2,
    name: 'NÍVEL 2',
    tubeCapacity: 4,
    tubes: [
      ['yellow', 'blue', 'yellow', 'red'],
      ['red', 'yellow', 'blue', 'red'],
      ['blue', 'red', 'yellow', 'blue'],
      [],
      [],
    ],
  },
  // NÍVEL 3
  {
    level: 3,
    name: 'NÍVEL 3',
    tubeCapacity: 4,
    tubes: [
      ['purple', 'green', 'yellow', 'purple'],
      ['yellow', 'purple', 'green', 'yellow'],
      ['green', 'yellow', 'purple', 'green'],
      [],
      [],
    ],
  },
  // NÍVEL 4
  {
    level: 4,
    name: 'NÍVEL 4',
    tubeCapacity: 4,
    tubes: [
      ['blue', 'red', 'orange', 'green'],
      ['red', 'green', 'blue', 'orange'],
      ['green', 'orange', 'red', 'blue'],
      ['orange', 'blue', 'green', 'red'],
      [],
      [],
    ],
  },
  // NÍVEL 5
  {
    level: 5,
    name: 'NÍVEL 5',
    tubeCapacity: 4,
    tubes: [
      ['purple', 'cyan', 'pink', 'yellow'],
      ['yellow', 'pink', 'purple', 'cyan'],
      ['pink', 'cyan', 'yellow', 'purple'],
      ['cyan', 'yellow', 'pink', 'purple'],
      [],
      [],
    ],
  },
  // NÍVEL 6
  {
    level: 6,
    name: 'NÍVEL 6',
    tubeCapacity: 4,
    tubes: [
      ['red', 'blue', 'yellow', 'green'],
      ['green', 'purple', 'red', 'orange'],
      ['orange', 'blue', 'purple', 'yellow'],
      ['yellow', 'red', 'green', 'purple'],
      ['blue', 'orange', 'red', 'blue'],
      [],
      [],
    ],
  },
  // NÍVEL 7
  {
    level: 7,
    name: 'NÍVEL 7',
    tubeCapacity: 4,
    tubes: [
      ['cyan', 'pink', 'lime', 'purple'],
      ['purple', 'lime', 'cyan', 'pink'],
      ['lime', 'purple', 'pink', 'cyan'],
      ['pink', 'cyan', 'purple', 'lime'],
      [],
      [],
    ],
  },
  // NÍVEL 8
  {
    level: 8,
    name: 'NÍVEL 8',
    tubeCapacity: 4,
    tubes: [
      ['orange', 'blue', 'yellow', 'red'],
      ['purple', 'orange', 'green', 'blue'],
      ['red', 'purple', 'blue', 'yellow'],
      ['green', 'yellow', 'red', 'purple'],
      ['blue', 'green', 'orange', 'green'],
      [],
      [],
    ],
  },
  // NÍVEL 9
  {
    level: 9,
    name: 'NÍVEL 9',
    tubeCapacity: 4,
    tubes: [
      ['pink', 'violet', 'cyan', 'lime'],
      ['lime', 'pink', 'orange', 'violet'],
      ['cyan', 'orange', 'pink', 'cyan'],
      ['violet', 'lime', 'cyan', 'pink'],
      ['orange', 'violet', 'lime', 'orange'],
      [],
      [],
    ],
  },
  // NÍVEL 10
  {
    level: 10,
    name: 'NÍVEL 10',
    tubeCapacity: 4,
    tubes: [
      ['red', 'purple', 'yellow', 'blue'],
      ['blue', 'yellow', 'green', 'purple'],
      ['green', 'red', 'purple', 'yellow'],
      ['yellow', 'green', 'blue', 'red'],
      ['purple', 'blue', 'red', 'green'],
      [],
      [],
    ],
  },
  // NÍVEL 11 - NÍVEL ESPECIAL (Exatamente como o vídeo enviado pelo usuário!)
  {
    level: 11,
    name: 'NÍVEL 11',
    isSpecial: true,
    tubeCapacity: 5,
    tubes: [
      ['red', 'purple', 'blue', 'yellow', 'red'],
      ['red', 'purple', 'yellow', 'pink', 'purple'],
      ['red', 'yellow', 'blue', 'yellow', 'purple'],
      ['purple', 'pink', 'yellow', 'blue', 'red'],
      [],
      [],
    ],
  },
  // NÍVEL 12
  {
    level: 12,
    name: 'NÍVEL 12',
    tubeCapacity: 5,
    tubes: [
      ['cyan', 'orange', 'lime', 'pink', 'violet'],
      ['violet', 'pink', 'cyan', 'orange', 'lime'],
      ['lime', 'violet', 'orange', 'pink', 'cyan'],
      ['pink', 'lime', 'violet', 'cyan', 'orange'],
      ['orange', 'cyan', 'pink', 'violet', 'lime'],
      [],
      [],
    ],
  },
];

export function getLevel(levelNumber: number): LevelDef {
  const found = PRESET_LEVELS.find((l) => l.level === levelNumber);
  if (found) return found;

  // Procedural generator for infinite high levels
  const colorsPool = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', 'cyan', 'lime', 'violet'];
  const numColors = Math.min(8, 3 + Math.floor(levelNumber / 3));
  const activeColors = colorsPool.slice(0, numColors);
  const tubeCapacity = levelNumber > 10 ? 5 : 4;

  const allSegments: string[] = [];
  activeColors.forEach((color) => {
    for (let i = 0; i < tubeCapacity; i++) {
      allSegments.push(color);
    }
  });

  // Shuffle segments
  for (let i = allSegments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSegments[i], allSegments[j]] = [allSegments[j], allSegments[i]];
  }

  const tubes: string[][] = [];
  for (let i = 0; i < numColors; i++) {
    tubes.push(allSegments.slice(i * tubeCapacity, (i + 1) * tubeCapacity));
  }
  // Add 2 empty tubes
  tubes.push([], []);

  return {
    level: levelNumber,
    name: `NÍVEL ${levelNumber}`,
    isSpecial: levelNumber % 5 === 0,
    tubeCapacity,
    tubes,
  };
}
