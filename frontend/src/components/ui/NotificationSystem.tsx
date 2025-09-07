import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  const getNotificationStyles = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'info':
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getNotificationIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              p-4 rounded-lg shadow-lg border-2 font-medium
              flex items-start gap-3 cursor-pointer
              ${getNotificationStyles(notification.type)}
            `}
            onClick={() => removeNotification(notification.id)}
          >
            <span className="text-lg flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="flex-1">
              <p className="text-sm leading-tight">{notification.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="text-lg hover:opacity-75 transition-opacity"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};