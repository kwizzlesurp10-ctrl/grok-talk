/**
 * Production-grade CollectionManager
 * Manages panda collection, search, filtering, power tracking, and persistence helpers.
 * Phase 3 of TS migration.
 */

import type { Panda } from './GameState';

export interface CollectionFilters {
  search?: string;
  rarity?: Panda['rarity'];
  element?: string;
  minPower?: number;
}

export class CollectionManager {
  private collection: Map<string, Panda>;

  constructor(initialPandas: Panda[] = []) {
    this.collection = new Map(initialPandas.map(p => [p.id, p]));
  }

  addOrIncrement(panda: Panda): Panda {
    const existing = this.collection.get(panda.id);
    if (existing) {
      existing.count += 1;
      existing.power = Math.max(existing.power, panda.power);
      return existing;
    }
    this.collection.set(panda.id, { ...panda });
    return panda;
  }

  getAll(): Panda[] {
    return Array.from(this.collection.values());
  }

  search(filters: CollectionFilters): Panda[] {
    let results = this.getAll();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.element.toLowerCase().includes(term)
      );
    }

    if (filters.rarity) {
      results = results.filter(p => p.rarity === filters.rarity);
    }

    if (filters.element) {
      results = results.filter(p => p.element === filters.element);
    }

    if (filters.minPower !== undefined) {
      results = results.filter(p => p.power >= filters.minPower!);
    }

    return results.sort((a, b) => b.power - a.power);
  }

  getTotalPower(): number {
    return this.getAll().reduce((sum, p) => sum + p.power * p.count, 0);
  }

  getCountByRarity(): Record<Panda['rarity'], number> {
    const counts: Record<Panda['rarity'], number> = {
      Common: 0, Rare: 0, Epic: 0, Legendary: 0, Mythic: 0
    };
    for (const p of this.getAll()) {
      counts[p.rarity] += p.count;
    }
    return counts;
  }

  // Production helper for localStorage migration
  toJSON(): string {
    return JSON.stringify(this.getAll());
  }

  static fromJSON(json: string): CollectionManager {
    const data: Panda[] = JSON.parse(json);
    return new CollectionManager(data);
  }
}
