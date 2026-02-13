import React from 'react';
import { motion } from 'framer-motion';

interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'yellow' | 'red';
}

export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  label,
  size = 'md',
  color,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  // Auto-determine color based on percentage if not specified
  const getColor = () => {
    if (color) return color;
    if (percentage > 60) return 'green';
    if (percentage > 30) return 'yellow';
    return 'red';
  };

  const currentColor = getColor();

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="w-full">
      {label && (
        <div className={`flex justify-between mb-1 ${textSizeClasses[size]}`}>
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-600">
            {Math.max(0, current)}/{max}
          </span>
        </div>
      )}
      <div
        className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <motion.div
          className={`${colorClasses[currentColor]} ${sizeClasses[size]} rounded-full`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {!label && (
        <div
          className={`text-center mt-1 ${textSizeClasses[size]} text-gray-600`}
        >
          {Math.max(0, current)}/{max}
        </div>
      )}
    </div>
  );
};
