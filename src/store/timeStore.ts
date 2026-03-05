import { create } from 'zustand';
import type { HistoricalSnapshot } from '../utils/dataProcessor';

interface TimeState {
  currentTime: number; // 当前选中的时间戳
  isPlaying: boolean;
  historicalData: HistoricalSnapshot[];
  playbackSpeed: number; // 播放速度倍率
  
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setHistoricalData: (data: HistoricalSnapshot[]) => void;
  setPlaybackSpeed: (speed: number) => void;
  getCurrentSnapshot: () => HistoricalSnapshot | undefined;
}

export const useTimeStore = create<TimeState>((set, get) => ({
  currentTime: Date.now(),
  isPlaying: false,
  historicalData: [],
  playbackSpeed: 1,

  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setHistoricalData: (data) => set({ historicalData: data }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  getCurrentSnapshot: () => {
    const { currentTime, historicalData } = get();
    // 找到最接近当前时间的快照
    return historicalData.find((snapshot) => {
      const snapshotTime = new Date(snapshot.timestamp).getTime();
      return Math.abs(snapshotTime - currentTime) < 150000; // 2.5分钟容差
    });
  },
}));
