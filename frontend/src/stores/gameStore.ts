import { create } from 'zustand';
import { PlayerRobot, GameScreen, PlayerStats } from '../types';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import { useWebHatcherySessionStore } from './webhatcherySessionStore';

interface GameState {
  gold: number;
  wins: number;
  currentScreen: GameScreen;
  player: PlayerRobot;
  playerStats: PlayerStats;
  isLoading: boolean;
  error: string | null;
  initializeBackend: () => Promise<void>;
  setScreen: (screen: GameScreen) => void;
  addGold: (amount: number) => Promise<void>;
  spendGold: (amount: number) => Promise<boolean>;
  addWin: () => Promise<void>;
  getPlayerStats: () => PlayerStats;
  buyPart: (category: keyof PlayerRobot['ownedParts'], index: number) => Promise<boolean>;
  equipPart: (category: keyof PlayerRobot['ownedParts'], index: number) => Promise<void>;
  resetGame: () => Promise<void>;
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

const initialStats: PlayerStats = {
  health: 50,
  attack: 20,
  defense: 8,
  speed: 10,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const applyBackendStateToGameStore = (game: WebHatcheryGameState): void => {
  const state = game.save.state;
  if (!isRecord(state) || !isRecord(state.player) || !isRecord(state.playerStats)) {
    useGameStore.setState({ isLoading: false, error: 'Backend returned an invalid robot state.' });
    return;
  }

  useGameStore.setState({
    gold: typeof state.gold === 'number' ? state.gold : 100,
    wins: typeof state.wins === 'number' ? state.wins : 0,
    player: state.player as unknown as PlayerRobot,
    playerStats: state.playerStats as unknown as PlayerStats,
    isLoading: false,
    error: null,
  });
};

const loadBackendGame = async (): Promise<WebHatcheryGameState> => {
  const session = useWebHatcherySessionStore.getState();
  try {
    return await session.loadGame();
  } catch {
    return await session.continueAsGuest();
  }
};

export const runRobotIntent = async (
  intent: string,
  payload: Record<string, unknown> = {},
): Promise<WebHatcheryGameState> => {
  if (!useWebHatcherySessionStore.getState().gameState) {
    applyBackendStateToGameStore(await loadBackendGame());
  }

  const game = await webhatcheryGameApi.applyIntent(intent, payload);
  useWebHatcherySessionStore.setState({ gameState: game, user: game.user });
  applyBackendStateToGameStore(game);
  return game;
};

export const useGameStore = create<GameState>()(
  (_set, get) => ({
      gold: 100,
      wins: 0,
      currentScreen: 'main-menu' as GameScreen,
      player: initialPlayer,
      playerStats: initialStats,
      isLoading: false,
      error: null as string | null,

      initializeBackend: async () => {
        useGameStore.setState({ isLoading: true, error: null });
        try {
          applyBackendStateToGameStore(await loadBackendGame());
        } catch (error) {
          useGameStore.setState({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unable to load robot data.',
          });
        }
      },

      setScreen: screen => useGameStore.setState({ currentScreen: screen }),

      addGold: async (amount: number) => {
        try {
          await runRobotIntent('add_gold', { amount });
        } catch (error) {
          useGameStore.setState({ error: error instanceof Error ? error.message : 'Unable to add gold.' });
        }
      },

      spendGold: async (amount: number) => {
        try {
          await runRobotIntent('spend_gold', { amount });
          return true;
        } catch (error) {
          useGameStore.setState({ error: error instanceof Error ? error.message : 'Not enough gold.' });
          return false;
        }
      },

      addWin: async () => {
        try {
          await runRobotIntent('add_win');
        } catch (error) {
          useGameStore.setState({ error: error instanceof Error ? error.message : 'Unable to add win.' });
        }
      },

      getPlayerStats: () => get().playerStats,

      buyPart: async (category: keyof PlayerRobot['ownedParts'], index: number) => {
        try {
          await runRobotIntent('buy_part', { category, index });
          return true;
        } catch (error) {
          useGameStore.setState({ error: error instanceof Error ? error.message : 'Unable to buy part.' });
          return false;
        }
      },

      equipPart: async (category: keyof PlayerRobot['ownedParts'], index: number) => {
        try {
          await runRobotIntent('equip_part', { category, index });
        } catch (error) {
          useGameStore.setState({ error: error instanceof Error ? error.message : 'Unable to equip part.' });
        }
      },

      resetGame: async () => {
        try {
          await runRobotIntent('reset_game');
          useGameStore.setState({ currentScreen: 'main-menu' });
        } catch (error) {
          useGameStore.setState({ error: error instanceof Error ? error.message : 'Unable to reset game.' });
        }
      },
    })
);
