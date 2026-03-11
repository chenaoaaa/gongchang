import { create } from 'zustand';

interface CharacterState {
  /** 人物位置 [x, y, z] */
  position: [number, number, number];
  /** 人物朝向角度 (弧度) */
  rotation: number;
  /** 是否开启相机跟随模式 */
  followMode: boolean;
  /** 是否正在移动 */
  isMoving: boolean;

  setPosition: (pos: [number, number, number]) => void;
  setRotation: (rot: number) => void;
  toggleFollowMode: () => void;
  setFollowMode: (mode: boolean) => void;
  setIsMoving: (moving: boolean) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  position: [0, 0, 20],
  rotation: 0,
  followMode: false,
  isMoving: false,

  setPosition: (pos) => set({ position: pos }),
  setRotation: (rot) => set({ rotation: rot }),
  toggleFollowMode: () => set((state) => ({ followMode: !state.followMode })),
  setFollowMode: (mode) => set({ followMode: mode }),
  setIsMoving: (moving) => set({ isMoving: moving }),
}));
