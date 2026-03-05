import { create } from 'zustand';
import type { DashboardData } from '../utils/dataProcessor';

interface DashboardState {
  data: DashboardData;
  isPaused: boolean;
  setData: (data: DashboardData) => void;
  togglePause: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: {
    dailyOutput: 0,
    orderCompletionRate: 0,
    oee: 0,
    totalEnergy: 0,
    alertCount: 0,
  },
  isPaused: false,

  setData: (data) => set({ data }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
}));
