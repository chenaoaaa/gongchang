import { create } from 'zustand';
import type { AlertEvent } from '../utils/dataProcessor';

interface AlertState {
  alerts: AlertEvent[];
  addAlert: (alert: AlertEvent) => void;
  removeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  clearAlerts: () => void;
  getAlertsByDevice: (deviceId: string) => AlertEvent[];
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],

  addAlert: (alert) =>
    set((state) => {
      // 避免重复添加相同的告警
      const exists = state.alerts.some((a) => a.id === alert.id);
      if (exists) return state;
      return { alerts: [...state.alerts, alert] };
    }),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),

  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, status: 'resolved' as const } : alert
      ),
    })),

  clearAlerts: () => set({ alerts: [] }),

  getAlertsByDevice: (deviceId) =>
    get().alerts.filter((alert) => alert.deviceId === deviceId),
}));
