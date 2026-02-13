import { GameData } from '../types';

export const gameData: GameData = {
  robot_parts: {
    chassis: [
      { name: 'Basic Frame', health: 50, cost: 0, tier: 'Basic' },
      { name: 'Reinforced Frame', health: 80, cost: 100, tier: 'Enhanced' },
      { name: 'Combat Frame', health: 120, cost: 300, tier: 'Advanced' },
      { name: 'Titan Frame', health: 180, cost: 800, tier: 'Elite' },
    ],
    weapons: [
      { name: 'Basic Laser', attack: 20, cost: 0, tier: 'Basic' },
      { name: 'Plasma Cannon', attack: 35, cost: 150, tier: 'Enhanced' },
      { name: 'Ion Blaster', attack: 50, cost: 400, tier: 'Advanced' },
      { name: 'Quantum Destroyer', attack: 70, cost: 1000, tier: 'Elite' },
    ],
    armor: [
      { name: 'Light Plating', defense: 8, cost: 0, tier: 'Basic' },
      { name: 'Steel Armor', defense: 15, cost: 120, tier: 'Enhanced' },
      { name: 'Composite Armor', defense: 25, cost: 350, tier: 'Advanced' },
      { name: 'Nanotech Armor', defense: 40, cost: 900, tier: 'Elite' },
    ],
    engines: [
      { name: 'Standard Engine', speed: 10, cost: 0, tier: 'Basic' },
      { name: 'Turbo Engine', speed: 18, cost: 100, tier: 'Enhanced' },
      { name: 'Hyperdrive', speed: 28, cost: 300, tier: 'Advanced' },
      { name: 'Warp Core', speed: 40, cost: 700, tier: 'Elite' },
    ],
  },
  enemies: [
    {
      name: 'Scrap Bot',
      health: 50,
      attack: 15,
      defense: 5,
      speed: 10,
      gold: 25,
      difficulty: 'Easy',
    },
    {
      name: 'Guard Bot',
      health: 80,
      attack: 25,
      defense: 12,
      speed: 15,
      gold: 50,
      difficulty: 'Medium',
    },
    {
      name: 'War Bot',
      health: 120,
      attack: 35,
      defense: 20,
      speed: 12,
      gold: 100,
      difficulty: 'Hard',
    },
    {
      name: 'Titan Bot',
      health: 200,
      attack: 50,
      defense: 30,
      speed: 8,
      gold: 200,
      difficulty: 'Elite',
    },
  ],
  game_balance: {
    starting_gold: 100,
    damage_variance: 0.2,
    critical_hit_chance: 0.1,
    dodge_chance_per_speed: 0.02,
  },
};
