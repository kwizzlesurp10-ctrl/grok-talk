/**
 * Legacy Bridge — Production Content Integration Layer
 * Converts the new typed panda roster into the format expected by the current app.js game loop.
 * This allows the expanded content (20+ new pandas) to be used immediately.
 */

import { BASE_PANDAS } from './pandas';

export interface LegacyPanda {
  id: string;
  name: string;
  type: string;           // legacy field (maps from element)
  power: number;
  rarity: string;
  level?: number;
}

export function getLegacyPandas(): LegacyPanda[] {
  return BASE_PANDAS.map((p, index) => ({
    id: `legacy_${index}`,
    name: p.name,
    type: p.element,           // map element → type for compatibility
    power: p.power,
    rarity: p.rarity.toLowerCase(),
    level: 1,
  }));
}

// Helper for future: seed the game with richer starting pool
export const EXPANDED_INITIAL_POOL = getLegacyPandas().slice(0, 12);
