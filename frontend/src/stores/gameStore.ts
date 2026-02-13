import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerRobot, GameScreen, PlayerStats } from '../types';
import { gameData } from '../data/gameData';

interface GameState {
  gold: number;
  wins: number;
  currentScreen: GameScreen;
  player: PlayerRobot;

  // Actions
  setScreen: (screen: GameScreen) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addWin: () => void;
  getPlayerStats: () => PlayerStats;
  buyPart: (
    category: keyof PlayerRobot['ownedParts'],
    index: number
  ) => boolean;
  equipPart: (category: keyof PlayerRobot['ownedParts'], index: number) => void;
  resetGame: () => void;
}

const initialPlayer: PlayerRobot = {
  chassis: 0,
  weapons: 0,
  armor: 0,
  engines: 0,
  ownedParts: {
    chassis: [0],
    weapons: [0],
    armor: [0],
    engines: [0],
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gold: gameData.game_balance.starting_gold,
      wins: 0,
      currentScreen: 'main-menu',
      player: initialPlayer,

      setScreen: (screen) => set({ currentScreen: screen }),

      addGold: (amount) => set((state) => ({ gold: state.gold + amount })),

      spendGold: (amount) => {
        const state = get();
        if (state.gold >= amount) {
          set({ gold: state.gold - amount });
          return true;
        }
        return false;
      },

      addWin: () => set((state) => ({ wins: state.wins + 1 })),

      getPlayerStats: () => {
        const { player } = get();
        const chassis = gameData.robot_parts.chassis[player.chassis];
        const weapon = gameData.robot_parts.weapons[player.weapons];
        const armor = gameData.robot_parts.armor[player.armor];
        const engine = gameData.robot_parts.engines[player.engines];

        if (!chassis || !weapon || !armor || !engine) {
          throw new Error('Invalid robot configuration');
        }

        return {
          health: chassis.health,
          attack: weapon.attack,
          defense: armor.defense,
          speed: engine.speed,
        };
      },

      buyPart: (category, index) => {
        const state = get();
        const part = gameData.robot_parts[category][index];

        if (!part) return false;

        if (
          state.gold >= part.cost &&
          !state.player.ownedParts[category].includes(index)
        ) {
          set((state) => ({
            gold: state.gold - part.cost,
            player: {
              ...state.player,
              ownedParts: {
                ...state.player.ownedParts,
                [category]: [...state.player.ownedParts[category], index],
              },
            },
          }));
          return true;
        }
        return false;
      },

      equipPart: (category, index) => {
        const state = get();
        if (state.player.ownedParts[category].includes(index)) {
          set((state) => ({
            player: {
              ...state.player,
              [category]: index,
            },
          }));
        }
      },

      resetGame: () =>
        set({
          gold: gameData.game_balance.starting_gold,
          wins: 0,
          currentScreen: 'main-menu',
          player: initialPlayer,
        }),
    }),
    {
      name: 'robot-battler-game',
    }
  )
);
