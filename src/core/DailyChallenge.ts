/**
 * Production-grade DailyChallenge system
 * Handles gated rewards, lifetime XP thresholds, fire fusion counts, and reset logic.
 * Phase 5 of TS migration.
 */

import type { PlayerStats } from './GameState';

export interface DailyChallengeState {
  completed: boolean;
  rewardPanda: string;
  requiredLifetimeXp: number;
  requiredFireFusions: number;
  currentLifetimeXp: number;
  currentFireFusions: number;
}

export class DailyChallenge {
  private static readonly DEFAULT_REQUIREMENTS = {
    lifetimeXp: 2500,
    fireFusions: 12,
  };

  private state: DailyChallengeState;

  constructor(initial?: Partial<DailyChallengeState>) {
    this.state = {
      completed: false,
      rewardPanda: 'Blaze Guardian',
      requiredLifetimeXp: DailyChallenge.DEFAULT_REQUIREMENTS.lifetimeXp,
      requiredFireFusions: DailyChallenge.DEFAULT_REQUIREMENTS.fireFusions,
      currentLifetimeXp: 0,
      currentFireFusions: 0,
      ...initial,
    };
  }

  updateProgress(stats: PlayerStats): void {
    this.state.currentLifetimeXp = stats.lifetimeXp;
    this.state.currentFireFusions = stats.fireFusions;
  }

  canClaim(): boolean {
    if (this.state.completed) return false;
    return (
      this.state.currentLifetimeXp >= this.state.requiredLifetimeXp &&
      this.state.currentFireFusions >= this.state.requiredFireFusions
    );
  }

  claimReward(): { success: boolean; panda?: string; message: string } {
    if (!this.canClaim()) {
      return { success: false, message: 'Requirements not met' };
    }
    this.state.completed = true;
    return {
      success: true,
      panda: this.state.rewardPanda,
      message: `Claimed ${this.state.rewardPanda}!`,
    };
  }

  resetIfNeeded(lastReset: string): boolean {
    const last = new Date(lastReset);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince >= 1) {
      this.state.completed = false;
      this.state.currentLifetimeXp = 0;
      this.state.currentFireFusions = 0;
      return true;
    }
    return false;
  }

  getState(): Readonly<DailyChallengeState> {
    return this.state;
  }
}
