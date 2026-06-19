/**
 * Production-grade GameState types for FusionPanda Master
 * Phase 1 of full TypeScript migration (v4.4.0 target)
 */

export interface CustomMove {
  name: string;
  prompt: string;
  isSpecial: boolean;
  element: string;
  seed: string;
}

export interface Panda {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  element: string;
  power: number;
  level: number;
  count: number;
  customMoves?: CustomMove[];
}

export interface PlayerStats {
  level: number;
  xp: number;
  lifetimeXp: number;
  fusionsPerformed: number;
  fireFusions: number;
  customMoveSlots?: number;
}


export interface GameState {
  pandas: Panda[];
  player: PlayerStats;
  collection: Record<string, Panda>;
  discovered: Set<string>;
  lastDailyReset: string;
}

export const DEFAULT_STATE: GameState = {
  pandas: [],
  player: {
    level: 1,
    xp: 0,
    lifetimeXp: 0,
    fusionsPerformed: 0,
    fireFusions: 0,
  },
  collection: {},
  discovered: new Set(),
  lastDailyReset: new Date().toISOString(),
};

export class GameStateManager {
  private state: GameState;

  constructor(initial?: Partial<GameState>) {
    this.state = { ...DEFAULT_STATE, ...initial };
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  addPanda(panda: Panda): void {
    this.state.pandas.push(panda);
    this.state.collection[panda.id] = panda;
    this.state.discovered.add(panda.name);
  }

  // Future: full fusion logic, XP, daily gates, etc. will be typed here
  calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
}
