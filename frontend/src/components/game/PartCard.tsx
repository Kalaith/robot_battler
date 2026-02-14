import React from 'react';
import { motion } from 'framer-motion';
import { Armor, Chassis, Engine, RobotPart, ShopCategory, Weapon } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type PartByCategory = {
  chassis: Chassis;
  weapons: Weapon;
  armor: Armor;
  engines: Engine;
};

interface PartCardProps {
  part: PartByCategory[ShopCategory];
  category: ShopCategory;
  index: number;
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  onAction: () => void;
}

export const PartCard: React.FC<PartCardProps> = ({
  part,
  category,
  index,
  isOwned,
  isEquipped,
  canAfford,
  onAction,
}) => {
  const getTierColor = (tier: RobotPart['tier']) => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'enhanced':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'advanced':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'elite':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatIcon = (category: ShopCategory) => {
    switch (category) {
      case 'chassis':
        return '❤️';
      case 'weapons':
        return '⚔️';
      case 'armor':
        return '🛡️';
      case 'engines':
        return '⚡';
      default:
        return '📊';
    }
  };

  const getStatName = (category: ShopCategory) => {
    switch (category) {
      case 'chassis':
        return 'Health';
      case 'weapons':
        return 'Attack';
      case 'armor':
        return 'Defense';
      case 'engines':
        return 'Speed';
      default:
        return 'Stat';
    }
  };

  const getStatValue = () => {
    switch (category) {
      case 'chassis':
        return (part as Chassis).health;
      case 'weapons':
        return (part as Weapon).attack;
      case 'armor':
        return (part as Armor).defense;
      case 'engines':
        return (part as Engine).speed;
      default:
        return 0;
    }
  };

  const getButtonText = () => {
    if (isEquipped) return 'Equipped';
    if (isOwned) return 'Equip';
    if (canAfford) return 'Buy';
    return 'Not Enough Gold';
  };

  const getButtonVariant = () => {
    if (isEquipped) return 'success';
    if (isOwned) return 'secondary';
    if (canAfford) return 'primary';
    return 'outline';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        className={`relative overflow-hidden ${
          isEquipped
            ? 'ring-2 ring-green-500 bg-green-50'
            : isOwned
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : ''
        }`}
        hover
      >
        {/* Tier Badge */}
        <div
          className={`
          absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold border
          ${getTierColor(part.tier)}
        `}
        >
          {part.tier}
        </div>

        {/* Status Badge */}
        {(isEquipped || isOwned) && (
          <div
            className={`
            absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold
            ${isEquipped ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
          `}
          >
            {isEquipped ? 'EQUIPPED' : 'OWNED'}
          </div>
        )}

        <div className="pt-8">
          {/* Part Name */}
          <h3 className="text-lg font-bold text-gray-800 mb-3">{part.name}</h3>

          {/* Part Stats */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xl">{getStatIcon(category)}</span>
                <span className="font-medium">{getStatName(category)}:</span>
              </div>
              <span className="text-xl font-bold text-gray-800">+{getStatValue()}</span>
            </div>
          </div>

          {/* Part Cost */}
          <div className="mb-4">
            <div
              className={`
              text-center py-2 px-3 rounded-lg font-bold
              ${part.cost === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            `}
            >
              {part.cost === 0 ? 'FREE' : `${part.cost} Gold`}
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant={getButtonVariant()}
            fullWidth
            disabled={!canAfford && !isOwned}
            onClick={onAction}
          >
            {getButtonText()}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
