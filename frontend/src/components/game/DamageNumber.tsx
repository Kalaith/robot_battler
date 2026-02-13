import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DamageNumberProps {
  damage: number;
  isCritical: boolean;
  isHealing: boolean;
  position: { x: number; y: number };
  onComplete: () => void;
}

export const DamageNumber: React.FC<DamageNumberProps> = ({
  damage,
  isCritical,
  isHealing,
  position,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getTextColor = () => {
    if (isHealing) return 'text-green-400';
    if (isCritical) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTextSize = () => {
    if (isCritical) return 'text-3xl';
    return 'text-xl';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            x: position.x,
            y: position.y,
            scale: 0.5,
            opacity: 0,
          }}
          animate={{
            x: position.x + (Math.random() - 0.5) * 40,
            y: position.y - 80,
            scale: isCritical ? 1.5 : 1,
            opacity: 1,
          }}
          exit={{
            y: position.y - 120,
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
          className={`
            fixed pointer-events-none z-50 font-bold
            ${getTextColor()}
            ${getTextSize()}
            drop-shadow-lg
          `}
          style={{
            textShadow: isCritical
              ? '2px 2px 4px rgba(0,0,0,0.8)'
              : '1px 1px 2px rgba(0,0,0,0.6)',
            fontFamily: 'monospace',
          }}
        >
          {isHealing ? '+' : ''}
          {damage}
          {isCritical && (
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.5, repeat: 1 }}
              className="ml-1 text-yellow-300"
            >
              ⚡
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
