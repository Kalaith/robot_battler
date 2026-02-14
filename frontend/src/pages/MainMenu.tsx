import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { RobotDisplay } from '../components/game/RobotDisplay';
import { Button } from '../components/ui/Button';
import { StatDisplay } from '../components/ui/StatDisplay';
import { Card } from '../components/ui/Card';
import { gameData } from '../data/gameData';

export const MainMenu: React.FC = () => {
  const { gold, wins, player, getPlayerStats, setScreen } = useGameStore();
  const playerStats = getPlayerStats();

  const getCurrentTier = () => {
    const chassis = gameData.robot_parts.chassis[player.chassis];
    return chassis?.tier || 'Basic';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-2">⚔️ Robot Battler</h1>
          <p className="text-lg text-gray-600">
            Build, customize, and battle with your mechanical warriors!
          </p>
        </motion.header>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8">
            <div className="flex justify-center gap-8">
              <StatDisplay
                label="Gold"
                value={gold}
                icon={<span className="text-yellow-500">🪙</span>}
                size="lg"
                highlight
              />
              <StatDisplay
                label="Wins"
                value={wins}
                icon={<span className="text-green-500">🏆</span>}
                size="lg"
                highlight
              />
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Robot Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Robot</h2>

              <div className="mb-6">
                <RobotDisplay stats={playerStats} tier={getCurrentTier()} size="lg" />
              </div>

              <div className="space-y-3">
                <StatDisplay label="Health" value={playerStats.health} icon="❤️" />
                <StatDisplay label="Attack" value={playerStats.attack} icon="⚔️" />
                <StatDisplay label="Defense" value={playerStats.defense} icon="🛡️" />
                <StatDisplay label="Speed" value={playerStats.speed} icon="⚡" />
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col justify-center space-y-4"
          >
            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                What would you like to do?
              </h3>

              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setScreen('enemy-selection')}
                >
                  ⚔️ Quick Battle
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setScreen('tournament')}
                >
                  🏆 Tournament Mode
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setScreen('parts-shop')}
                >
                  🔧 Parts Shop
                </Button>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">💡 Quick Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Win battles to earn gold</li>
                <li>• Upgrade parts to increase stats</li>
                <li>• Higher tier parts are more powerful</li>
                <li>• Balance all stats for optimal performance</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
