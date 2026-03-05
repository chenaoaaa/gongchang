/**
 * 全局常量配置文件
 * 
 * 包含:
 * - 颜色映射定义
 * - 性能参数配置
 * - 业务阈值设置
 * - 工具函数
 * 
 * @author wb_chenao
 * @date 2026-03-05
 */

// ========== 颜色配置 ==========

/** 设备状态颜色映射 - 用于3D模型材质 */
export const DEVICE_STATUS_COLORS = {
  running: '#00FF00',  // 绿色 - 正常运行
  warning: '#FFD700',  // 黄色 - 警告(温度接近阈值)
  error: '#FF0000',    // 红色 - 告警(温度超阈值)
  idle: '#888888'      // 灰色 - 停机/空闲
} as const;

/** 热力图温度颜色映射 */
export const HEATMAP_COLORS = {
  cold: '#3498db',    // 蓝色 (15-25℃) 低温区
  normal: '#2ecc71',  // 绿色 (25-35℃) 适中区
  warm: '#f39c12',    // 黄色 (35-45℃) 警告区
  hot: '#e74c3c'      // 红色 (45℃+) 高温区
} as const;

/** 告警级别颜色 */
export const ALERT_LEVEL_COLORS = {
  info: '#3498db',     // 信息
  warning: '#f39c12',  // 警告
  error: '#e74c3c',    // 错误
  critical: '#c0392b'  // 严重
} as const;

// ========== 时间配置 ==========

/** 数据更新间隔 (毫秒) - 每5秒刷新一次设备数据 */
export const DATA_UPDATE_INTERVAL = 5000;

/** 历史数据配置 */
export const HISTORICAL_DATA = {
  timeRange: 24 * 60 * 60 * 1000, // 24小时时间范围
  interval: 5 * 60 * 1000,         // 5分钟采样间隔
  totalPoints: 288                 // 总数据点数: 24h / 5min = 288
} as const;

// ========== 性能配置 ==========

/** 性能阈值 - 用于优化和降级 */
export const PERFORMANCE = {
  targetFps: 30,                   // 目标帧率
  lowFpsThreshold: 20,             // 低帧率阈值(触发降级)
  maxTriangles: 100000,            // 最大三角形面数
  maxTextureSize: 10 * 1024 * 1024 // 最大纹理尺寸: 10MB
} as const;

// ========== 相机配置 ==========

/** 相机控制限制 - OrbitControls配置 */
export const CAMERA_LIMITS = {
  minDistance: 20,                  // 最小缩放距离(防止穿透建筑)
  maxDistance: 200,                 // 最大缩放距离(防止场景过小)
  minPolarAngle: Math.PI / 18,      // 最小垂直角度: ~10°(防止穿地)
  maxPolarAngle: Math.PI * 0.44     // 最大垂直角度: ~80°(防止倒置)
} as const;

// ========== 设备类型配置 ==========

/** 设备类型枚举 - 用于模型选择和逻辑判断 */
export const DEVICE_TYPES = {
  CNC_MACHINE: 'cnc_machine',       // 数控机床
  ROBOT_ARM: 'robot_arm',           // 工业机器人
  CONVEYOR: 'conveyor',             // 传送带
  AGV: 'agv',                       // AGV小车
  WELDING_STATION: 'welding_station', // 焊接工作站
  INSPECTION: 'inspection'          // 质检设备
} as const;

// ========== 业务阈值配置 ==========

/** 温度阈值 - 用于判断设备状态 */
export const TEMPERATURE_THRESHOLDS = {
  normal: 50,   // 正常温度上限(°C)
  warning: 50,  // 警告温度阈值(°C)
  error: 60     // 错误温度阈值(°C) - 超过会触发告警
} as const;

/** 维护周期阈值 (小时) - 设备运行超过此时长需要维护 */
export const MAINTENANCE_HOURS = 200;

/** 仪表盘指标阈值 - 低于阈值会触发警告 */
export const DASHBOARD_THRESHOLDS = {
  orderCompletionRate: 85,  // 订单完成率阈值 (%)
  oee: 70                   // 设备综合效率阈值 (%)
} as const;

// ========== 交互配置 ==========

/** 键盘快捷键定义 */
export const KEYBOARD_SHORTCUTS = {
  PAUSE: ' ',           // 空格键 - 暂停/恢复数据更新
  RESET_CAMERA: 'r',    // R键 - 重置相机视角
  TOGGLE_HEATMAP: 'h',  // H键 - 切换热力图显示
  CLOSE_PANEL: 'Escape' // ESC键 - 关闭信息面板
} as const;

/** 响应式断点 - 用于布局适配 */
export const BREAKPOINTS = {
  large: 1600,   // 大屏幕阈值(px)
  medium: 1200,  // 中等屏幕阈值(px)
  small: 1366    // 小屏幕阈值(px)
} as const;

// ========== UI配置 ==========

/** 时间格式 - 用于时间滑块显示 */
export const TIME_FORMAT = 'MM-DD HH:mm';

/** 告警闪烁动画配置 */
export const BLINK_CONFIG = {
  frequency: 2,   // 每秒闪烁次数
  duration: 1000  // 动画周期(ms)
} as const;

// ========== Mock数据配置 ==========

/** Mock数据生成规则 - 模拟真实工厂运行数据 */
export const MOCK_CONFIG = {
  /** 温度数据配置 */
  temperature: {
    min: 40,            // 最低温度(°C)
    max: 55,            // 最高温度(°C)
    noiseAmplitude: 3   // 随机噪声幅度(°C)
  },
  /** 产能数据配置 */
  production: {
    dayShift: { min: 800, max: 1200 },     // 白班产量范围(8:00-18:00)
    nightShift: { min: 300, max: 500 },    // 夜班产量范围(18:00-8:00)
    lunchBreak: { start: 12, end: 13, reduction: 0.3 } // 午休时段产能降低30%
  },
  /** OEE(设备综合效率)配置 */
  oee: {
    normal: { min: 65, max: 85 },  // 正常状态OEE范围(%)
    alert: { min: 55, max: 65 }    // 告警状态OEE范围(%)
  }
} as const;

// ========== 工具函数 ==========

/**
 * 检测浏览器是否支持WebGL
 * @returns {boolean} 是否支持WebGL渲染
 */
export const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

/**
 * 根据设备状态获取对应的颜色
 * @param {string} status - 设备状态: running | warning | error | idle
 * @returns {string} 十六进制颜色值
 */
export const getDeviceStatusColor = (status: keyof typeof DEVICE_STATUS_COLORS): string => {
  return DEVICE_STATUS_COLORS[status] || DEVICE_STATUS_COLORS.idle;
};

/**
 * 根据温度获取热力图颜色
 * @param {number} temperature - 温度值(°C)
 * @returns {string} 十六进制颜色值
 * 
 * 颜色映射规则:
 * - < 25°C: 蓝色(冷)
 * - 25-35°C: 绿色(正常)
 * - 35-45°C: 黄色(偏热)
 * - >= 45°C: 红色(高温)
 */
export const getHeatmapColor = (temperature: number): string => {
  if (temperature < 25) return HEATMAP_COLORS.cold;
  if (temperature < 35) return HEATMAP_COLORS.normal;
  if (temperature < 45) return HEATMAP_COLORS.warm;
  return HEATMAP_COLORS.hot;
};
