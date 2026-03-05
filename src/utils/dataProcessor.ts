import { MOCK_CONFIG, HISTORICAL_DATA } from './constants';

// 设备状态类型
export type DeviceStatus = 'running' | 'warning' | 'error' | 'idle';

// 设备数据接口
export interface DeviceData {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  modelPath: string;
  status: DeviceStatus;
  temperature: number;
  runningHours: number;
  dailyOutput: number;
  supervisor: string;
  thresholds: {
    tempWarning: number;
    tempError: number;
    maintenanceHours: number;
  };
}

// 仪表盘数据接口
export interface DashboardData {
  dailyOutput: number;
  orderCompletionRate: number;
  oee: number;
  totalEnergy: number;
  alertCount: number;
}

// 历史数据快照接口
export interface HistoricalSnapshot {
  timestamp: string;
  dashboard: DashboardData;
  devices: Array<{
    id: string;
    temperature: number;
    status: DeviceStatus;
    runningHours: number;
    dailyOutput: number;
  }>;
}

// 告警事件接口
export interface AlertEvent {
  id: string;
  deviceId: string;
  type: 'high_temperature' | 'maintenance_required';
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
  status: 'pending' | 'resolved';
  suggestion: string;
}

/**
 * 生成正弦波 + 随机噪声的温度数据
 */
export const generateTemperature = (
  baseTemp: number,
  time: number,
  amplitude: number = MOCK_CONFIG.temperature.noiseAmplitude
): number => {
  const sineWave = Math.sin(time / 1000) * 5;
  const noise = (Math.random() - 0.5) * amplitude;
  return Math.max(
    MOCK_CONFIG.temperature.min,
    Math.min(MOCK_CONFIG.temperature.max, baseTemp + sineWave + noise)
  );
};

/**
 * 根据时间段生成产能数据
 */
export const generateProductionRate = (hour: number): number => {
  const { dayShift, nightShift, lunchBreak } = MOCK_CONFIG.production;
  
  // 午休时段降低产能
  if (hour >= lunchBreak.start && hour < lunchBreak.end) {
    const baseRate = (dayShift.min + dayShift.max) / 2;
    return Math.floor(baseRate * (1 - lunchBreak.reduction));
  }
  
  // 白天高产能期
  if (hour >= 8 && hour < 18) {
    return Math.floor(
      dayShift.min + Math.random() * (dayShift.max - dayShift.min)
    );
  }
  
  // 夜间低产能期
  return Math.floor(
    nightShift.min + Math.random() * (nightShift.max - nightShift.min)
  );
};

/**
 * 生成OEE数据
 */
export const generateOEE = (hasAlert: boolean = false): number => {
  const config = hasAlert ? MOCK_CONFIG.oee.alert : MOCK_CONFIG.oee.normal;
  return Math.floor(config.min + Math.random() * (config.max - config.min));
};

/**
 * 生成仪表盘Mock数据
 */
export const generateDashboardData = (alertCount: number = 0): DashboardData => {
  const hour = new Date().getHours();
  const productionRate = generateProductionRate(hour);
  
  return {
    dailyOutput: Math.floor(productionRate * 8), // 累计产量
    orderCompletionRate: Math.floor(80 + Math.random() * 15), // 80-95%
    oee: generateOEE(alertCount > 0),
    totalEnergy: Math.floor(1200 + Math.random() * 500), // 1200-1700 kWh
    alertCount
  };
};

/**
 * 根据温度和运行时长判断设备状态
 */
export const getDeviceStatus = (
  temperature: number,
  runningHours: number,
  thresholds: DeviceData['thresholds']
): DeviceStatus => {
  if (temperature >= thresholds.tempError) {
    return 'error';
  }
  if (temperature >= thresholds.tempWarning || runningHours >= thresholds.maintenanceHours) {
    return 'warning';
  }
  if (runningHours < 10) {
    return 'idle';
  }
  return 'running';
};

/**
 * 生成历史数据快照
 */
export const generateHistoricalSnapshots = (
  devices: DeviceData[]
): HistoricalSnapshot[] => {
  const snapshots: HistoricalSnapshot[] = [];
  const now = Date.now();
  const { timeRange, interval, totalPoints } = HISTORICAL_DATA;
  
  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(now - timeRange + i * interval).toISOString();
    const hour = new Date(timestamp).getHours();
    
    // 随机选择2-3个设备在某些时间点触发告警
    const shouldTriggerAlert = Math.random() > 0.9;
    const alertDeviceIds = shouldTriggerAlert
      ? devices.slice(0, Math.floor(Math.random() * 2) + 2).map(d => d.id)
      : [];
    
    const devicesSnapshot = devices.map(device => {
      const isAlerting = alertDeviceIds.includes(device.id);
      const baseTemp = isAlerting ? 58 : device.temperature;
      const temperature = parseFloat(
        generateTemperature(baseTemp, i * interval).toFixed(1)
      );
      const status = getDeviceStatus(temperature, device.runningHours, device.thresholds);
      
      return {
        id: device.id,
        temperature,
        status,
        runningHours: device.runningHours + (i * interval) / (1000 * 60 * 60), // 累加运行时长
        dailyOutput: Math.floor(device.dailyOutput * (0.8 + Math.random() * 0.4))
      };
    });
    
    const alertCount = devicesSnapshot.filter(d => d.status === 'error' || d.status === 'warning').length;
    
    snapshots.push({
      timestamp,
      dashboard: generateDashboardData(alertCount),
      devices: devicesSnapshot
    });
  }
  
  return snapshots;
};

/**
 * 检测并生成告警事件
 */
export const generateAlerts = (
  devices: Array<{ id: string; temperature: number; runningHours: number; thresholds: DeviceData['thresholds'] }>
): AlertEvent[] => {
  const alerts: AlertEvent[] = [];
  const now = new Date().toISOString();
  
  devices.forEach(device => {
    // 高温告警
    if (device.temperature >= device.thresholds.tempError) {
      alerts.push({
        id: `alert_${device.id}_temp_${Date.now()}`,
        deviceId: device.id,
        type: 'high_temperature',
        level: 'error',
        message: '设备温度超过安全阈值',
        currentValue: device.temperature,
        threshold: device.thresholds.tempError,
        timestamp: now,
        status: 'pending',
        suggestion: '请立即检查冷却系统,必要时停机检修'
      });
    }
    // 温度警告
    else if (device.temperature >= device.thresholds.tempWarning) {
      alerts.push({
        id: `alert_${device.id}_temp_warn_${Date.now()}`,
        deviceId: device.id,
        type: 'high_temperature',
        level: 'warning',
        message: '设备温度接近安全阈值',
        currentValue: device.temperature,
        threshold: device.thresholds.tempWarning,
        timestamp: now,
        status: 'pending',
        suggestion: '请监控温度变化,准备降温措施'
      });
    }
    
    // 维护提醒
    if (device.runningHours >= device.thresholds.maintenanceHours) {
      alerts.push({
        id: `alert_${device.id}_maint_${Date.now()}`,
        deviceId: device.id,
        type: 'maintenance_required',
        level: 'warning',
        message: '设备运行时长已达维护周期',
        currentValue: device.runningHours,
        threshold: device.thresholds.maintenanceHours,
        timestamp: now,
        status: 'pending',
        suggestion: '请安排设备保养,检查关键部件磨损情况'
      });
    }
  });
  
  return alerts;
};

/**
 * 格式化时间显示
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};
