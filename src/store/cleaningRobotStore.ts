/**
 * cleaningRobotStore.ts — 扫地机器人状态管理
 *
 * 管理:
 *  - 巡逻路径点列表（世界坐标 XZ 平面）
 *  - 当前运行进度（路径段索引 + 段内插值 t）
 *  - 运行/暂停/编辑路径 等模式
 */

import { create } from 'zustand';

export interface PathPoint {
  x: number;
  z: number;
}

type RobotMode = 'idle' | 'running' | 'paused' | 'editing';

interface CleaningRobotState {
  /** 巡逻路径点（世界 XZ 坐标） */
  path: PathPoint[];
  /** 当前段索引（从第 segIndex 点 → segIndex+1 点） */
  segIndex: number;
  /** 段内插值进度 [0, 1] */
  segT: number;
  /** 运行模式 */
  mode: RobotMode;
  /** 移动速度（单位/秒） */
  speed: number;
  /** 是否显示路径线 */
  showPath: boolean;
  /** 是否显示清扫痕迹 */
  showTrail: boolean;

  // ── Actions ────────────────────────────────
  setPath: (path: PathPoint[]) => void;
  addPathPoint: (point: PathPoint) => void;
  removeLastPoint: () => void;
  clearPath: () => void;
  setMode: (mode: RobotMode) => void;
  setProgress: (segIndex: number, segT: number) => void;
  setSpeed: (speed: number) => void;
  toggleShowPath: () => void;
  toggleShowTrail: () => void;
}

// 默认路径：沿道路绕一圈
const DEFAULT_PATH: PathPoint[] = [
  { x: 0,   z: 20  },
  { x: 40,  z: 20  },
  { x: 40,  z: -5  },
  { x: -30, z: -5  },
  { x: -30, z: 20  },
  { x: -60, z: 20  },
  { x: -60, z: 40  },
  { x: 0,   z: 40  },
  { x: 0,   z: 20  },
];

export const useCleaningRobotStore = create<CleaningRobotState>((set) => ({
  path: DEFAULT_PATH,
  segIndex: 0,
  segT: 0,
  mode: 'idle',
  speed: 8,
  showPath: true,
  showTrail: true,

  setPath: (path) => set({ path, segIndex: 0, segT: 0 }),
  addPathPoint: (point) => set((s) => ({ path: [...s.path, point] })),
  removeLastPoint: () =>
    set((s) => ({ path: s.path.slice(0, -1), segIndex: 0, segT: 0 })),
  clearPath: () => set({ path: [], segIndex: 0, segT: 0, mode: 'idle' }),
  setMode: (mode) => set({ mode }),
  setProgress: (segIndex, segT) => set({ segIndex, segT }),
  setSpeed: (speed) => set({ speed }),
  toggleShowPath: () => set((s) => ({ showPath: !s.showPath })),
  toggleShowTrail: () => set((s) => ({ showTrail: !s.showTrail })),
}));
