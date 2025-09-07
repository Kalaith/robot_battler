import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Enemy } from '../types';
import { gameData } from '../data/gameData';

interface TournamentMatch {
  id: string;
  enemy: Enemy;
  completed: boolean;
  won: boolean;
  rewards: {
    gold: number;
    bonus: number;
  };
}

interface TournamentState {
  isActive: boolean;
  currentTournament: string | null;
  matches: TournamentMatch[];
  currentMatchIndex: number;
  wins: number;
  losses: number;
  totalRewards: number;
  
  // Actions
  startTournament: (type: 'rookie' | 'veteran' | 'champion') => void;
  completeMatch: (won: boolean) => void;
  endTournament: () => void;
  resetTournament: () => void;
  getCurrentMatch: () => TournamentMatch | null;
  getTournamentProgress: () => { completed: number; total: number; winRate: number };
}

const generateTournamentMatches = (type: 'rookie' | 'veteran' | 'champion'): TournamentMatch[] => {
  const tournaments = {
    rookie: {
      enemies: [0, 0, 1, 1, 2], // Easy to medium difficulty
      goldMultiplier: 1.2,
      bonusReward: 100
    },
    veteran: {
      enemies: [1, 1, 2, 2, 3], // Medium to hard difficulty
      goldMultiplier: 1.5,
      bonusReward: 250
    },
    champion: {
      enemies: [2, 2, 3, 3, 3], // Hard to elite difficulty
      goldMultiplier: 2.0,
      bonusReward: 500
    }
  };

  const config = tournaments[type];
  return config.enemies.map((enemyIndex, matchIndex) => {
    const enemy = gameData.enemies[enemyIndex];
    if (!enemy) {
      throw new Error(`Enemy not found at index ${enemyIndex}`);
    }
    return {
      id: `match-${matchIndex}`,
      enemy: { ...enemy } as Enemy,
      completed: false,
      won: false,
      rewards: {
        gold: Math.floor(enemy.gold * config.goldMultiplier),
        bonus: matchIndex === config.enemies.length - 1 ? config.bonusReward : 0
      }
    };
  });
};

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentTournament: null,
      matches: [],
      currentMatchIndex: 0,
      wins: 0,
      losses: 0,
      totalRewards: 0,

      startTournament: (type) => {
        const matches = generateTournamentMatches(type);
        set({
          isActive: true,
          currentTournament: type,
          matches,
          currentMatchIndex: 0,
          wins: 0,
          losses: 0,
          totalRewards: 0
        });
      },

      completeMatch: (won) => {
        const state = get();
        const currentMatch = state.matches[state.currentMatchIndex];
        if (!currentMatch) return;

        const updatedMatches = [...state.matches];
        updatedMatches[state.currentMatchIndex] = {
          ...currentMatch,
          completed: true,
          won
        };

        const newWins = won ? state.wins + 1 : state.wins;
        const newLosses = won ? state.losses : state.losses + 1;
        const newTotalRewards = won 
          ? state.totalRewards + currentMatch.rewards.gold + currentMatch.rewards.bonus
          : state.totalRewards;

        set({
          matches: updatedMatches,
          currentMatchIndex: state.currentMatchIndex + 1,
          wins: newWins,
          losses: newLosses,
          totalRewards: newTotalRewards
        });

        // Check if tournament is complete
        if (state.currentMatchIndex + 1 >= state.matches.length) {
          setTimeout(() => {
            get().endTournament();
          }, 1000);
        }
      },

      endTournament: () => {
        set({
          isActive: false,
          currentMatchIndex: 0
        });
      },

      resetTournament: () => {
        set({
          isActive: false,
          currentTournament: null,
          matches: [],
          currentMatchIndex: 0,
          wins: 0,
          losses: 0,
          totalRewards: 0
        });
      },

      getCurrentMatch: () => {
        const state = get();
        return state.matches[state.currentMatchIndex] || null;
      },

      getTournamentProgress: () => {
        const state = get();
        const completed = state.matches.filter(m => m.completed).length;
        const total = state.matches.length;
        const winRate = state.wins + state.losses > 0 ? (state.wins / (state.wins + state.losses)) * 100 : 0;
        
        return { completed, total, winRate };
      }
    }),
    {
      name: 'robot-battler-tournament'
    }
  )
);