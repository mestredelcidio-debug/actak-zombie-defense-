export interface TubeData {
  id: number;
  capacity: number; // usually 4 or 5 segments
  colors: string[]; // bottom to top
  isCompleted?: boolean;
}

export type GameState = 'START_MODAL' | 'PLAYING' | 'POURING' | 'VICTORY' | 'LEVEL_SELECT';

export interface LevelDef {
  level: number;
  isSpecial?: boolean;
  name?: string;
  tubeCapacity: number;
  tubes: string[][]; // initial state of tubes
}

export interface PourMove {
  fromTubeId: number;
  toTubeId: number;
  color: string;
  count: number;
}

export interface ColorDef {
  id: string;
  name: string;
  color: string;
  gradientTop: string;
  gradientBottom: string;
  glow: string;
}
