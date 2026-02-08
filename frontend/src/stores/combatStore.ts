import { create } from 'zustand';
import { CombatState, Enemy, BattleLogEntry, DamageResult, PlayerStats } from '../types';
import { gameData } from '../data/gameData';

interface DefenderStats {
  defense: number;
}

interface CombatStore extends CombatState {
  // Actions
  startBattle: (enemy: Enemy, playerStats: PlayerStats) => void;
  endBattle: (victory: boolean) => { victory: boolean; goldEarned: number };
  playerAttack: (playerStats: PlayerStats) => DamageResult | null;
  playerDefend: () => number;
  playerSpecial: (playerStats: PlayerStats) => DamageResult | null;
  enemyTurn: (playerStats: PlayerStats) => DamageResult | null;
  addBattleLog: (entry: BattleLogEntry) => void;
  clearBattleLog: () => void;
  calculateDamage: (attackerStats: unknown, defenderStats: DefenderStats, baseAttack: number) => DamageResult;
  resetCombat: () => void;
}

const initialCombatState: CombatState = {
  playerHealth: 0,
  playerMaxHealth: 0,
  enemyHealth: 0,
  enemyMaxHealth: 0,
  currentEnemy: null,
  turn: 'player',
  battleLog: [],
  isActive: false
};

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...initialCombatState,

  startBattle: (enemy, playerStats) => {
    set({
      currentEnemy: enemy,
      playerHealth: playerStats.health,
      playerMaxHealth: playerStats.health,
      enemyHealth: enemy.health,
      enemyMaxHealth: enemy.health,
      turn: 'player',
      battleLog: [{ message: `Battle started against ${enemy.name}!`, type: 'info' }],
      isActive: true
    });
  },

  endBattle: (victory) => {
    const state = get();
    const goldEarned = victory && state.currentEnemy ? state.currentEnemy.gold : 0;
    
    set({
      isActive: false,
      turn: 'player'
    });

    return { victory, goldEarned };
  },

  playerAttack: (playerStats) => {
    const state = get();
    if (state.turn !== 'player' || !state.currentEnemy || !state.isActive) return null;

    const result = state.calculateDamage(playerStats, state.currentEnemy, playerStats.attack);
    const newEnemyHealth = Math.max(0, state.enemyHealth - result.damage);

    const message = result.critical 
      ? `Critical hit! You dealt ${result.damage} damage to ${state.currentEnemy.name}!`
      : `You dealt ${result.damage} damage to ${state.currentEnemy.name}!`;

    set((state) => ({
      enemyHealth: newEnemyHealth,
      turn: newEnemyHealth <= 0 ? 'player' : 'enemy',
      battleLog: [...state.battleLog, { message, type: 'damage' }]
    }));

    return result;
  },

  playerDefend: () => {
    const state = get();
    if (state.turn !== 'player' || !state.isActive) return 0;

    const healAmount = Math.floor(state.playerMaxHealth * 0.1);
    const newPlayerHealth = Math.min(state.playerMaxHealth, state.playerHealth + healAmount);

    set((state) => ({
      playerHealth: newPlayerHealth,
      turn: 'enemy',
      battleLog: [...state.battleLog, { 
        message: `You defended and recovered ${healAmount} health!`, 
        type: 'healing' 
      }]
    }));

    return healAmount;
  },

  playerSpecial: (playerStats) => {
    const state = get();
    if (state.turn !== 'player' || !state.currentEnemy || !state.isActive) return null;

    const result = state.calculateDamage(playerStats, state.currentEnemy, Math.floor(playerStats.attack * 1.5));
    const newEnemyHealth = Math.max(0, state.enemyHealth - result.damage);

    set((state) => ({
      enemyHealth: newEnemyHealth,
      turn: newEnemyHealth <= 0 ? 'player' : 'enemy',
      battleLog: [...state.battleLog, { 
        message: `Special attack! You dealt ${result.damage} damage to ${state.currentEnemy?.name}!`, 
        type: 'damage' 
      }]
    }));

    return result;
  },

  enemyTurn: (playerStats) => {
    const state = get();
    if (state.turn !== 'enemy' || !state.currentEnemy || !state.isActive) return null;

    const result = state.calculateDamage(state.currentEnemy, playerStats, state.currentEnemy.attack);
    const newPlayerHealth = Math.max(0, state.playerHealth - result.damage);

    const message = result.critical
      ? `Critical hit! ${state.currentEnemy.name} dealt ${result.damage} damage to you!`
      : `${state.currentEnemy.name} dealt ${result.damage} damage to you!`;

    set((state) => ({
      playerHealth: newPlayerHealth,
      turn: newPlayerHealth <= 0 ? 'enemy' : 'player',
      battleLog: [...state.battleLog, { message, type: 'damage' }]
    }));

    return result;
  },

  addBattleLog: (entry) => {
    set((state) => ({
      battleLog: [...state.battleLog, entry]
    }));
  },

  clearBattleLog: () => set({ battleLog: [] }),

  calculateDamage: (attackerStats, defenderStats, baseAttack) => {
    void attackerStats; // attacker currently doesn't affect damage beyond baseAttack
    const variance = 1 + (Math.random() - 0.5) * 2 * gameData.game_balance.damage_variance;
    const criticalHit = Math.random() < gameData.game_balance.critical_hit_chance;
    const critMultiplier = criticalHit ? 2 : 1;
    
    let damage = Math.floor(baseAttack * variance * critMultiplier);
    damage = Math.max(1, damage - defenderStats.defense);
    
    return { damage, critical: criticalHit };
  },

  resetCombat: () => set(initialCombatState)
}));
