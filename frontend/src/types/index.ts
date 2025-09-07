export interface RobotPart {
  name: string;
  cost: number;
  tier: 'Basic' | 'Enhanced' | 'Advanced' | 'Elite';
}

export interface Chassis extends RobotPart {
  health: number;
}

export interface Weapon extends RobotPart {
  attack: number;
}

export interface Armor extends RobotPart {
  defense: number;
}

export interface Engine extends RobotPart {
  speed: number;
}

export interface RobotParts {
  chassis: Chassis[];
  weapons: Weapon[];
  armor: Armor[];
  engines: Engine[];
}

export interface Enemy {
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
}

export interface GameBalance {
  starting_gold: number;
  damage_variance: number;
  critical_hit_chance: number;
  dodge_chance_per_speed: number;
}

export interface PlayerRobot {
  chassis: number;
  weapons: number;
  armor: number;
  engines: number;
  ownedParts: {
    chassis: number[];
    weapons: number[];
    armor: number[];
    engines: number[];
  };
}

export interface PlayerStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface CombatState {
  playerHealth: number;
  playerMaxHealth: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  currentEnemy: Enemy | null;
  turn: 'player' | 'enemy';
  battleLog: BattleLogEntry[];
  isActive: boolean;
}

export interface BattleLogEntry {
  message: string;
  type: 'info' | 'damage' | 'healing';
}

export interface DamageResult {
  damage: number;
  critical: boolean;
}

export interface GameData {
  robot_parts: RobotParts;
  enemies: Enemy[];
  game_balance: GameBalance;
}

export type GameScreen = 'main-menu' | 'enemy-selection' | 'combat-screen' | 'parts-shop' | 'battle-result' | 'tournament';
export type ShopCategory = 'chassis' | 'weapons' | 'armor' | 'engines';