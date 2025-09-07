import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleLogEntry } from '../../types';

interface BattleLogProps {
  entries: BattleLogEntry[];
  maxHeight?: string;
}

export const BattleLog: React.FC<BattleLogProps> = ({
  entries,
  maxHeight = 'max-h-48'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const getEntryStyles = (type: BattleLogEntry['type']) => {
    switch (type) {
      case 'damage':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'healing':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type: BattleLogEntry['type']) => {
    switch (type) {
      case 'damage': return '⚔️';
      case 'healing': return '💚';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
        📋 Battle Log
      </h4>
      
      <div 
        ref={scrollRef}
        className={`${maxHeight} overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
      >
        <AnimatePresence initial={false}>
          {entries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                p-3 rounded-lg border text-sm font-medium
                flex items-start gap-2
                ${getEntryStyles(entry.type)}
              `}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getTypeIcon(entry.type)}
              </span>
              <span className="flex-1">{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <span className="text-2xl">⚔️</span>
            <p className="mt-2">Battle log will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
};