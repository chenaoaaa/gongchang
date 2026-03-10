/**
 * 相机视角管理Store
 * 
 * 功能:
 * - 管理预设相机视角
 * - 支持平滑切换视角
 * - 追踪当前激活的视角
 * 
 * @author wb_chenao
 * @date 2026-03-06
 */
import { create } from 'zustand';

/** 相机视角配置接口 */
export interface CameraView {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  description?: string;
}

/** 相机状态接口 */
interface CameraState {
  /** 当前激活的视角ID */
  currentViewId: string;
  
  /** 预设视角列表 */
  views: CameraView[];
  
  /** 是否正在切换视角（用于动画控制） */
  isTransitioning: boolean;
  
  /** 切换到指定视角 */
  setView: (viewId: string) => void;
  
  /** 设置过渡状态 */
  setTransitioning: (transitioning: boolean) => void;
  
  /** 根据ID获取视角配置 */
  getViewById: (viewId: string) => CameraView | undefined;
}

/** 预设视角配置 */
const PRESET_VIEWS: CameraView[] = [
  {
    id: 'overview',
    name: '全景鸟瞰',
    position: [80, 60, 80],
    target: [20, 0, 20],
    description: '工厂整体俯视视角',
  },
  {
    id: 'factory1-external',
    name: '主厂房-外部',
    position: [20, 15, 55],
    target: [20, 5, 20],
    description: '主厂房正面视角',
  },
  {
    id: 'factory1-internal',
    name: '主厂房-内部',
    position: [20, 8, 20],
    target: [20, 2, 10],
    description: '主厂房内部视角',
  },
  {
    id: 'factory1-top',
    name: '主厂房-顶视',
    position: [20, 25, 20],
    target: [20, 0, 20],
    description: '主厂房正上方俯视',
  },
  {
    id: 'factory2-external',
    name: '副厂房-外部',
    position: [70, 15, 50],
    target: [70, 5, 20],
    description: '副厂房正面视角',
  },
  {
    id: 'factory2-internal',
    name: '副厂房-内部',
    position: [70, 8, 20],
    target: [70, 2, 10],
    description: '副厂房内部视角',
  },
  {
    id: 'warehouse',
    name: '仓库视角',
    position: [20, 12, 80],
    target: [20, 4, 60],
    description: '仓库正面视角',
  },
  {
    id: 'office',
    name: '办公楼视角',
    position: [70, 18, 80],
    target: [70, 8, 60],
    description: '办公楼正面视角',
  },
];

/**
 * 相机视角管理Store
 */
export const useCameraStore = create<CameraState>((set, get) => ({
  // ========== 初始状态 ==========
  currentViewId: 'overview',
  views: PRESET_VIEWS,
  isTransitioning: false,

  // ========== Actions ==========
  
  /**
   * 切换到指定视角
   * @param viewId - 视角ID
   */
  setView: (viewId: string) => {
    const view = get().views.find(v => v.id === viewId);
    if (view) {
      set({ currentViewId: viewId });
    } else {
      console.warn(`视角ID不存在: ${viewId}`);
    }
  },

  /**
   * 设置过渡状态
   * @param transitioning - 是否正在过渡
   */
  setTransitioning: (transitioning: boolean) => {
    set({ isTransitioning: transitioning });
  },

  /**
   * 根据ID获取视角配置
   * @param viewId - 视角ID
   * @returns 视角配置对象
   */
  getViewById: (viewId: string) => {
    return get().views.find(v => v.id === viewId);
  },
}));
