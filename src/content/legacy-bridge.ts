import { BASE_PANDAS } from './pandas';

export interface PandaDefinition {
  id: string;
  name: string;
  emoji: string;
  type: string;
  power: number;
  rarity: string;
  color: string;
  image?: string;
}

export function getLegacyPandas(): PandaDefinition[] {
  return BASE_PANDAS.map((p, index) => ({
    id: `legacy_${index}`,
    name: p.name,
    emoji: '🐼',
    type: p.element,
    power: p.power,
    rarity: p.rarity.toLowerCase(),
    color: '#64748b',
    image: `assets/pandas/${p.name.toLowerCase().replace(/ /g, '_')}.jpg`
  }));
}

export const EXPANDED_INITIAL_POOL = getLegacyPandas().slice(0, 12);

