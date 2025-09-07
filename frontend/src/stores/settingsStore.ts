import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoSave: boolean;
  combatSpeed: 'slow' | 'normal' | 'fast';
  showDamageNumbers: boolean;
  confirmActions: boolean;
  
  // Actions
  toggleSound: () => void;
  toggleAnimations: () => void;
  toggleAutoSave: () => void;
  setCombatSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  toggleDamageNumbers: () => void;
  toggleConfirmActions: () => void;
  resetSettings: () => void;
}

const defaultSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  autoSave: true,
  combatSpeed: 'normal' as const,
  showDamageNumbers: true,
  confirmActions: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      
      toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
      
      setCombatSpeed: (speed) => set({ combatSpeed: speed }),
      
      toggleDamageNumbers: () => set((state) => ({ showDamageNumbers: !state.showDamageNumbers })),
      
      toggleConfirmActions: () => set((state) => ({ confirmActions: !state.confirmActions })),
      
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'robot-battler-settings'
    }
  )
);