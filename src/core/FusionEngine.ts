/**
 * Production-grade FusionEngine for FusionPanda Master
 * Handles all fusion modes with type safety and synergy calculations.
 * Phase 2 of TS migration.
 */

import type { Panda } from './GameState';

export type FusionMode = 'basic' | 'advanced' | 'ritual';

export interface FusionResult {
  success: boolean;
  newPanda?: Panda;
  xpGained: number;
  critical: boolean;
  synergyBonus: number;
  message: string;
}

export class FusionEngine {
  private static readonly RARITY_WEIGHTS: Record<string, number> = {
    Common: 0.5,
    Rare: 0.3,
    Epic: 0.15,
    Legendary: 0.04,
    Mythic: 0.01,
  };

  private static readonly ELEMENT_SYNERGIES: Record<string, string[]> = {
    Fire: ['Wind', 'Earth'],
    Water: ['Fire', 'Lightning'],
    Earth: ['Water', 'Wind'],
    Wind: ['Earth', 'Lightning'],
    Lightning: ['Water', 'Fire'],
  };

  fuse(panda1: Panda, panda2: Panda, mode: FusionMode = 'basic'): FusionResult {
    if (!panda1 || !panda2) {
      return { success: false, xpGained: 0, critical: false, synergyBonus: 0, message: 'Invalid pandas' };
    }

    const synergy = this.calculateSynergy(panda1, panda2);
    const critical = Math.random() < (mode === 'ritual' ? 0.25 : 0.12);
    const baseXp = this.getBaseXp(mode) + Math.floor(synergy * 15);

    // Simplified new panda generation (production version would pull from full tables)
    const newRarity = this.determineRarity(panda1.rarity, panda2.rarity, mode, critical);
    const newElement = synergy > 1.2 ? panda1.element : panda2.element;

    const newPanda: Panda = {
      id: `panda_${Date.now()}`,
      name: `${panda1.name.split(' ')[0]}-${panda2.name.split(' ')[0]} ${newRarity}`,
      rarity: newRarity,
      element: newElement,
      power: Math.floor((panda1.power + panda2.power) * (0.6 + synergy * 0.3) * (critical ? 1.5 : 1)),
      level: 1,
      count: 1,
    };

    return {
      success: true,
      newPanda,
      xpGained: baseXp,
      critical,
      synergyBonus: Math.floor(synergy * 10),
      message: critical ? 'CRITICAL FUSION!' : 'Fusion successful',
    };
  }

  private calculateSynergy(p1: Panda, p2: Panda): number {
    let score = 1.0;
    if (p1.element === p2.element) score += 0.4;
    const synergies = FusionEngine.ELEMENT_SYNERGIES[p1.element] || [];
    if (synergies.includes(p2.element)) score += 0.6;
    if (p1.rarity !== p2.rarity) score += 0.2;
    return Math.min(score, 2.5);
  }

  private getBaseXp(mode: FusionMode): number {
    switch (mode) {
      case 'ritual': return 85;
      case 'advanced': return 45;
      default: return 25;
    }
  }

  private determineRarity(r1: string, r2: string, mode: FusionMode, critical: boolean): Panda['rarity'] {
    const weight = (FusionEngine.RARITY_WEIGHTS[r1] || 0.5) + (FusionEngine.RARITY_WEIGHTS[r2] || 0.5);
    let roll = Math.random() * weight * (mode === 'ritual' ? 1.6 : 1) * (critical ? 1.8 : 1);

    if (roll > 1.8) return 'Mythic';
    if (roll > 1.3) return 'Legendary';
    if (roll > 0.9) return 'Epic';
    if (roll > 0.5) return 'Rare';
    return 'Common';
  }
}
