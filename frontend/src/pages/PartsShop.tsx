import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PartCard } from '../components/game/PartCard';
import { StatDisplay } from '../components/ui/StatDisplay';
import { gameData } from '../data/gameData';
import { ShopCategory } from '../types';

export const PartsShop: React.FC = () => {
  const { gold, player, setScreen, buyPart, equipPart } = useGameStore();
  const { activeShopCategory, setActiveShopCategory, addNotification } = useUIStore();

  const categories: { key: ShopCategory; label: string; icon: string }[] = [
    { key: 'chassis', label: 'Chassis', icon: '🤖' },
    { key: 'weapons', label: 'Weapons', icon: '⚔️' },
    { key: 'armor', label: 'Armor', icon: '🛡️' },
    { key: 'engines', label: 'Engines', icon: '⚡' },
  ];

  const handlePartAction = (category: ShopCategory, index: number) => {
    const isOwned = player.ownedParts[category].includes(index);
    const isEquipped = player[category] === index;
    const part = gameData.robot_parts[category][index];
    
    if (!part || isEquipped) {
      return; // Already equipped or invalid part
    }
    
    if (isOwned) {
      // Equip the part
      equipPart(category, index);
      addNotification({
        message: `Equipped ${part.name}!`,
        type: 'success'
      });
    } else {
      // Try to buy the part
      const success = buyPart(category, index);
      if (success) {
        equipPart(category, index);
        addNotification({
          message: `Bought and equipped ${part.name}!`,
          type: 'success'
        });
      } else {
        addNotification({
          message: 'Not enough gold!',
          type: 'error'
        });
      }
    }
  };

  const getOwnedCount = (category: ShopCategory) => {
    return player.ownedParts[category].length;
  };

  const getTotalValue = (category: ShopCategory) => {
    return player.ownedParts[category].reduce((total, index) => {
      const part = gameData.robot_parts[category][index];
      return total + (part?.cost || 0);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔧 Parts Shop
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Upgrade your robot with better parts to increase your battle performance!
          </p>
          
          {/* Gold Display */}
          <Card className="inline-block bg-yellow-50 border-yellow-200">
            <StatDisplay
              label="Available Gold"
              value={gold}
              icon={<span className="text-yellow-500">🪙</span>}
              size="lg"
              highlight
            />
          </Card>
        </motion.header>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category, index) => (
                <motion.button
                  key={category.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => setActiveShopCategory(category.key)}
                  className={`
                    px-6 py-3 rounded-lg font-bold text-lg transition-all duration-200
                    flex items-center gap-2
                    ${activeShopCategory === category.key
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.label}</span>
                  <span className="text-sm opacity-75">
                    ({getOwnedCount(category.key)}/{gameData.robot_parts[category.key].length})
                  </span>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Category Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-blue-50 border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <StatDisplay
                label="Parts Owned"
                value={`${getOwnedCount(activeShopCategory)}/${gameData.robot_parts[activeShopCategory].length}`}
                icon="📦"
              />
              <StatDisplay
                label="Total Invested"
                value={`${getTotalValue(activeShopCategory)} Gold`}
                icon="🪙"
              />
              <StatDisplay
                label="Current Equipped"
                value={gameData.robot_parts[activeShopCategory][player[activeShopCategory]]?.name || 'None'}
                icon="✨"
              />
            </div>
          </Card>
        </motion.div>

        {/* Parts Grid */}
        <motion.div
          key={activeShopCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
        >
          {gameData.robot_parts[activeShopCategory].map((part, index) => (
            <PartCard
              key={index}
              part={part}
              category={activeShopCategory}
              index={index}
              isOwned={player.ownedParts[activeShopCategory].includes(index)}
              isEquipped={player[activeShopCategory] === index}
              canAfford={gold >= part.cost}
              onAction={() => handlePartAction(activeShopCategory, index)}
            />
          ))}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setScreen('main-menu')}
          >
            ← Back to Menu
          </Button>
        </motion.div>

        {/* Shop Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <Card className="bg-purple-50 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3 text-center">
              💡 Shopping Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
              <ul className="space-y-2">
                <li>• Higher tier parts cost more but provide better stats</li>
                <li>• You keep owned parts even if you equip different ones</li>
                <li>• Balance all stats for optimal robot performance</li>
              </ul>
              <ul className="space-y-2">
                <li>• Win battles to earn more gold for upgrades</li>
                <li>• Elite tier parts provide the highest bonuses</li>
                <li>• Experiment with different part combinations</li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};