import { create } from 'zustand';
import { CombatState, Enemy, BattleLogEntry, DamageResult, PlayerStats } from '../types';
import { runRobotIntent } from './gameStore';
import type { WebHatcheryGameState } from '../api/webhatcheryGameApi';

interface CombatStore extends CombatState {
  startBattle: (enemy: Enemy, playerStats: PlayerStats) => Promise<void>;
  endBattle: (victory: boolean) => Promise<{ victory: boolean; goldEarned: number }>;
  playerAttack: (playerStats: PlayerStats) => Promise<DamageResult | null>;
  playerDefend: () => Promise<number>;
  playerSpecial: (playerStats: PlayerStats) => Promise<DamageResult | null>;
  enemyTurn: (playerStats: PlayerStats) => Promise<DamageResult | null>;
  addBattleLog: (entry: BattleLogEntry) => void;
  clearBattleLog: () => void;
  resetCombat: () => Promise<void>;
}

const initialCombatState: CombatState = {
  playerHealth: 0,
  playerMaxHealth: 0,
  enemyHealth: 0,
  enemyMaxHealth: 0,
  currentEnemy: null,
  turn: 'player',
  battleLog: [],
  isActive: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const combatStateFromGame = (game: WebHatcheryGameState): CombatState => {
  const combat = game.save.state.combat;
  if (!isRecord(combat)) {
    return initialCombatState;
  }

  return combat as unknown as CombatState;
};

const lastDamageResult = (game: WebHatcheryGameState): DamageResult | null => {
  const combat = game.save.state.combat;
  if (!isRecord(combat) || !isRecord(combat.lastDamageResult)) {
    return null;
  }

  return combat.lastDamageResult as unknown as DamageResult;
};

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...initialCombatState,

  startBattle: async enemy => {
    set(combatStateFromGame(await runRobotIntent('start_battle', { enemy })));
  },

  endBattle: async victory => {
    const game = await runRobotIntent('end_battle', { victory });
    set(combatStateFromGame(game));

    const result = game.save.state.lastBattleResult;
    if (isRecord(result)) {
      return {
        victory: result.victory === true,
        goldEarned: typeof result.goldEarned === 'number' ? result.goldEarned : 0,
      };
    }

    return { victory, goldEarned: 0 };
  },

  playerAttack: async () => {
    const game = await runRobotIntent('player_attack');
    set(combatStateFromGame(game));
    return lastDamageResult(game);
  },

  playerDefend: async () => {
    const before = get().playerHealth;
    const game = await runRobotIntent('player_defend');
    const nextState = combatStateFromGame(game);
    set(nextState);
    return Math.max(0, nextState.playerHealth - before);
  },

  playerSpecial: async () => {
    const game = await runRobotIntent('player_special');
    set(combatStateFromGame(game));
    return lastDamageResult(game);
  },

  enemyTurn: async () => {
    const game = await runRobotIntent('enemy_turn');
    set(combatStateFromGame(game));
    return lastDamageResult(game);
  },

  addBattleLog: entry => {
    set(state => ({
      battleLog: [...state.battleLog, entry],
    }));
  },

  clearBattleLog: () => set({ battleLog: [] }),

  resetCombat: async () => {
    set(combatStateFromGame(await runRobotIntent('reset_combat')));
  },
}));
