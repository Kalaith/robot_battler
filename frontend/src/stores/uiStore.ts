import { create } from 'zustand';
import { ShopCategory } from '../types';

interface UIState {
  activeShopCategory: ShopCategory;
  isSpecialOnCooldown: boolean;
  notifications: Notification[];

  // Actions
  setActiveShopCategory: (category: ShopCategory) => void;
  setSpecialCooldown: (onCooldown: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeShopCategory: 'chassis',
  isSpecialOnCooldown: false,
  notifications: [],

  setActiveShopCategory: category => set({ activeShopCategory: category }),

  setSpecialCooldown: onCooldown => set({ isSpecialOnCooldown: onCooldown }),

  addNotification: notification => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    set(state => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 3000);
    }
  },

  removeNotification: id => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));
