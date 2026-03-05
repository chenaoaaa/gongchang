/**
 * 设备状态管理Store
 * 
 * 功能:
 * - 管理11个设备的数据状态
 * - 提供设备增删改查操作
 * - 追踪当前选中的设备
 * 
 * 使用Zustand轻量级状态管理
 * 
 * @author wb_chenao
 * @date 2026-03-05
 */
import { create } from 'zustand';
import type { DeviceData } from '../utils/dataProcessor';
import devicesConfig from '../config/devices.json';

/** 设备Store状态接口定义 */
interface DeviceState {
  /** 设备列表(11个设备) */
  devices: DeviceData[];
  /** 当前选中的设备ID(null表示未选中) */
  selectedDeviceId: string | null;
  
  // ========== Actions ==========
  /** 批量设置设备列表 */
  setDevices: (devices: DeviceData[]) => void;
  /** 更新单个设备的部分属性 */
  updateDevice: (id: string, updates: Partial<DeviceData>) => void;
  /** 选中或取消选中设备 */
  selectDevice: (id: string | null) => void;
  /** 根据ID获取设备数据 */
  getDeviceById: (id: string) => DeviceData | undefined;
}

/**
 * 创建设备状态Store
 * 初始数据从devices.json配置文件加载
 */
export const useDeviceStore = create<DeviceState>((set, get) => ({
  // ========== 初始状态 ==========
  devices: devicesConfig.devices as DeviceData[],
  selectedDeviceId: null,

  // ========== 状态更新方法 ==========
  
  /** 批量替换设备列表 */
  setDevices: (devices) => set({ devices }),

  /**
   * 更新单个设备的属性(温度、状态等)
   * 使用不可变更新模式
   */
  updateDevice: (id, updates) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id ? { ...device, ...updates } : device
      ),
    })),

  /**
   * 选中设备(用于显示详情面板)
   * 传入null表示取消选中
   */
  selectDevice: (id) => set({ selectedDeviceId: id }),

  /**
   * 根据设备ID查找设备
   * 用于获取设备详细信息
   */
  getDeviceById: (id) => get().devices.find((device) => device.id === id),
}));
