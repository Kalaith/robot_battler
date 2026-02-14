import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useCombatStore } from '../stores/combatStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatDisplay } from '../components/ui/StatDisplay';
import { RobotDisplay } from '../components/game/RobotDisplay';
import { gameData } from '../data/gameData';
import { Enemy } from '../types';

export const EnemySelection: React.FC = () => {
  const { setScreen, getPlayerStats } = useGameStore();
  const { startBattle } = useCombatStore();
  const playerStats = getPlayerStats();

  const handleFight = (enemy: Enemy) => {
    startBattle(enemy, playerStats);
    setScreen('combat-screen');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      case 'elite':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🔴';
      case 'elite':
        return '🟣';
      default:
        return '⚪';
    }
  };

  const getEnemyTier = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'Basic';
      case 'medium':
        return 'Enhanced';
      case 'hard':
        return 'Advanced';
      case 'elite':
        return 'Elite';
      default:
        return 'Basic';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🥊 Choose Your Opponent</h1>
          <p className="text-lg text-gray-600">
            Select an enemy to battle! Higher difficulty enemies give more gold.
          </p>
        </motion.header>

        {/* Enemy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {gameData.enemies.map((enemy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card hover className="text-center h-full flex flex-col">
                {/* Difficulty Badge */}
                <div
                  className={`
                  inline-block px-3 py-1 rounded-full text-sm font-bold mb-4
                  ${getDifficultyColor(enemy.difficulty)}
                `}
                >
                  {getDifficultyIcon(enemy.difficulty)} {enemy.difficulty}
                </div>

                {/* Enemy Robot Display */}
                <div className="mb-4">
                  <RobotDisplay
                    stats={{
                      health: enemy.health,
                      attack: enemy.attack,
                      defense: enemy.defense,
                      speed: enemy.speed,
                    }}
                    tier={getEnemyTier(enemy.difficulty)}
                    size="md"
                  />
                </div>

                {/* Enemy Name */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">{enemy.name}</h3>

                {/* Enemy Stats */}
                <div className="space-y-2 mb-4 flex-1">
                  <StatDisplay label="HP" value={enemy.health} icon="❤️" size="sm" />
                  <StatDisplay label="ATK" value={enemy.attack} icon="⚔️" size="sm" />
                  <StatDisplay label="DEF" value={enemy.defense} icon="🛡️" size="sm" />
                  <StatDisplay label="SPD" value={enemy.speed} icon="⚡" size="sm" />
                </div>

                {/* Reward */}
                <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
                  <div className="text-yellow-700 font-bold">🪙 Reward: {enemy.gold} Gold</div>
                </div>

                {/* Fight Button */}
                <Button variant="primary" fullWidth onClick={() => handleFight(enemy)}>
                  ⚔️ Fight!
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button variant="secondary" onClick={() => setScreen('main-menu')}>
            ← Back to Menu
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
