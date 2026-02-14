import React from 'react';
import { motion } from 'framer-motion';
import { PlayerStats } from '../../types';

interface RobotDisplayProps {
  stats: PlayerStats;
  tier: string;
  size?: 'sm' | 'md' | 'lg';
  isAnimating?: boolean;
  className?: string;
}

export const RobotDisplay: React.FC<RobotDisplayProps> = ({
  stats,
  tier,
  size = 'md',
  isAnimating = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return 'text-gray-400';
      case 'enhanced':
        return 'text-green-400';
      case 'advanced':
        return 'text-blue-400';
      case 'elite':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTierGlow = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return 'shadow-gray-400/50';
      case 'enhanced':
        return 'shadow-green-400/50';
      case 'advanced':
        return 'shadow-blue-400/50';
      case 'elite':
        return 'shadow-purple-400/50';
      default:
        return 'shadow-gray-400/50';
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        className={`
          ${sizeClasses[size]} relative
          border-2 border-gray-300 rounded-lg
          bg-gradient-to-br from-gray-100 to-gray-200
          ${getTierColor(tier)} shadow-lg ${getTierGlow(tier)}
          flex items-center justify-center
          overflow-hidden
        `}
        animate={
          isAnimating
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }
            : {}
        }
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Robot Body */}
        <div className="relative">
          {/* Main Chassis */}
          <motion.div
            className={`
              w-8 h-10 ${getTierColor(tier)}
              rounded-lg border-2 border-current
              relative
            `}
            style={{
              fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.25rem' : '1rem',
            }}
          >
            {/* Head */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className={`w-4 h-4 ${getTierColor(tier)} rounded border border-current`} />
              <div className="absolute top-1 left-1 w-1 h-1 bg-red-400 rounded-full" />
              <div className="absolute top-1 right-1 w-1 h-1 bg-red-400 rounded-full" />
            </div>

            {/* Arms */}
            <div className="absolute -left-2 top-2">
              <div className={`w-3 h-6 ${getTierColor(tier)} rounded border border-current`} />
            </div>
            <div className="absolute -right-2 top-2">
              <div className={`w-3 h-6 ${getTierColor(tier)} rounded border border-current`} />
            </div>

            {/* Legs */}
            <div className="absolute -bottom-6 left-1">
              <div className={`w-2 h-6 ${getTierColor(tier)} rounded border border-current`} />
            </div>
            <div className="absolute -bottom-6 right-1">
              <div className={`w-2 h-6 ${getTierColor(tier)} rounded border border-current`} />
            </div>

            {/* Chest Details */}
            <div className="absolute inset-2 flex flex-col items-center justify-center">
              <div className="w-2 h-1 bg-current rounded-full mb-1" />
              <div className="w-3 h-0.5 bg-current rounded" />
            </div>
          </motion.div>
        </div>

        {/* Tier Badge */}
        <div
          className={`
          absolute top-1 right-1 px-1 py-0.5 text-xs font-bold
          bg-black/20 text-white rounded
        `}
        >
          {tier.charAt(0)}
        </div>
      </motion.div>

      {/* Robot Stats */}
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
          <div>❤️ {stats.health}</div>
          <div>⚔️ {stats.attack}</div>
          <div>🛡️ {stats.defense}</div>
          <div>⚡ {stats.speed}</div>
        </div>
      </div>
    </div>
  );
};
