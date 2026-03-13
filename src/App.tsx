/**
 * 智能工厂数字孪生管理平台主应用组件
 * 
 * 功能概述:
 * - 集成3D场景渲染和2D UI组件
 * - 管理设备数据自动更新(每5秒刷新)
 * - 处理键盘快捷键交互
 * - 实现告警检测和历史数据回溯
 * 
 * @author wb_chenao
 * @date 2026-03-05
 */
import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import Scene from './components/3d/Scene';
import Dashboard from './components/ui/Dashboard';
import TimeSlider from './components/ui/TimeSlider';
import Toolbar from './components/ui/Toolbar';
import AlertPanel from './components/ui/AlertPanel';
import { useDeviceStore } from './store/deviceStore';
import { useDashboardStore } from './store/dashboardStore';
import { useAlertStore } from './store/alertStore';
import { useTimeStore } from './store/timeStore';
import { useCharacterStore } from './store/characterStore';
import { useCleaningRobotStore } from './store/cleaningRobotStore';
import {
  generateDashboardData,
  generateHistoricalSnapshots,
  generateAlerts,
  getDeviceStatus,
  generateTemperature,
} from './utils/dataProcessor';
import { DATA_UPDATE_INTERVAL, KEYBOARD_SHORTCUTS, checkWebGLSupport } from './utils/constants';

function App() {
  // ========== 本地状态管理 ==========
  /** 控制热力图显示/隐藏 */
  const [showHeatMap, setShowHeatMap] = useState(false);
  /** 控制告警面板显示/隐藏 */
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  // ========== Zustand Store状态 ==========
  /** 设备状态store: 管理11个设备的数据 */
  const { devices, updateDevice } = useDeviceStore();
  /** 仪表盘store: 管理5项关键指标数据 */
  const { setData, isPaused } = useDashboardStore();
  /** 告警store: 管理告警事件列表 */
  const { alerts, addAlert, clearAlerts } = useAlertStore();
  /** 时间store: 管理历史数据回溯 */
  const { setHistoricalData, setCurrentTime } = useTimeStore();
  /** 人物store: 管理人物位置和跟随模式 */
  const { followMode, toggleFollowMode } = useCharacterStore();
  /** 机器人store: 管理扫地机器人 */
  const robotMode = useCleaningRobotStore((s) => s.mode);
  const robotPath = useCleaningRobotStore((s) => s.path);
  const robotSpeed = useCleaningRobotStore((s) => s.speed);
  const robotShowPath = useCleaningRobotStore((s) => s.showPath);
  const setRobotMode = useCleaningRobotStore((s) => s.setMode);
  const setRobotSpeed = useCleaningRobotStore((s) => s.setSpeed);
  const clearRobotPath = useCleaningRobotStore((s) => s.clearPath);
  const removeLastPoint = useCleaningRobotStore((s) => s.removeLastPoint);
  const toggleRobotShowPath = useCleaningRobotStore((s) => s.toggleShowPath);

  // ========== Effect Hook: WebGL能力检测 ==========
  /**
   * 检测浏览器是否支持WebGL 3D渲染
   * 仅在组件挂载时执行一次
   * 如果不支持,显示错误提示
   */
  useEffect(() => {
    if (!checkWebGLSupport()) {
      message.error('您的浏览器不支持3D渲染，请使用Chrome或Firefox浏览器');
    }
  }, []);

  // ========== Effect Hook: 历史数据初始化 ==========
  /**
   * 生成并初始化24小时历史数据
   * - 共288个数据点(24h * 60min / 5min)
   * - 包含设备状态快照和仪表盘数据
   * 仅在组件挂载时执行一次
   */
  useEffect(() => {
    const snapshots = generateHistoricalSnapshots(devices);
    setHistoricalData(snapshots);
    setCurrentTime(Date.now());
  }, []);

  // ========== Effect Hook: 数据自动更新 ==========
  /**
   * 核心数据更新逻辑
   * 
   * 功能:
   * 1. 每5秒更新一次设备温度和状态
   * 2. 自动检测并生成告警(温度>60°C或运行>200h)
   * 3. 更新仪表盘指标数据
   * 
   * 依赖:
   * - isPaused: 暂停时停止更新
   * - updateDevice, addAlert, setData: 稳定的函数引用
   * 
   * 注意:
   * - 不直接依赖devices/alerts,避免无限循环
   * - 通过store.getState()获取最新数据
   */
  useEffect(() => {
    if (isPaused) return;

    const updateData = () => {
      // 从Zustand store直接获取最新状态(避免闭包陷阱)
      const currentDevices = useDeviceStore.getState().devices;
      const currentAlerts = useAlertStore.getState().alerts;

      // 遍历所有设备,更新温度和状态
      currentDevices.forEach((device) => {
        // 使用正弦波+噪声算法生成真实感温度
        const newTemperature = parseFloat(
          generateTemperature(device.temperature, Date.now()).toFixed(1)
        );
        // 根据温度和运行时长计算设备状态(running/warning/error/idle)
        const newStatus = getDeviceStatus(
          newTemperature,
          device.runningHours,
          device.thresholds
        );

        // 批量更新设备状态到store
        updateDevice(device.id, {
          temperature: newTemperature,
          status: newStatus,
        });
      });

      // 检测告警: 温度超阈值或需要维护
      const newAlerts = generateAlerts(
        currentDevices.map((d) => ({
          id: d.id,
          temperature: d.temperature,
          runningHours: d.runningHours,
          thresholds: d.thresholds,
        }))
      );

      // 将新告警添加到store(自动去重)
      newAlerts.forEach((alert) => addAlert(alert));

      // 更新仪表盘数据(产能/完成率/OEE/能耗/告警数)
      const dashboardData = generateDashboardData(
        currentAlerts.filter((a) => a.status === 'pending').length
      );
      setData(dashboardData);
    };

    // 立即执行一次,然后每5秒执行
    updateData();
    const timer = setInterval(updateData, DATA_UPDATE_INTERVAL);

    // 清理定时器,防止内存泄漏
    return () => clearInterval(timer);
  }, [isPaused, updateDevice, addAlert, setData]);

  // ========== Effect Hook: 键盘快捷键 ==========
  /**
   * 全局键盘快捷键监听
   * 
   * 快捷键列表:
   * - 空格键: 暂停/恢复数据更新
   * - R键: 重置相机视角
   * - H键: 切换热力图显示
   * - ESC键: 关闭设备详情面板和告警面板
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case KEYBOARD_SHORTCUTS.PAUSE: // 空格键
          useDashboardStore.getState().togglePause();
          break;
        case KEYBOARD_SHORTCUTS.RESET_CAMERA: // R键
          handleResetCamera();
          break;
        case KEYBOARD_SHORTCUTS.TOGGLE_HEATMAP: // H键
          setShowHeatMap((prev) => !prev);
          break;
        case KEYBOARD_SHORTCUTS.CLOSE_PANEL: // ESC键
          useDeviceStore.getState().selectDevice(null);
          setShowAlertPanel(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ========== 事件处理函数 ==========
  /**
   * 重置相机视角到初始位置
   * 当前通过刷新页面实现(简单但有效)
   * TODO: 未来可优化为动画平滑过渡
   */
  const handleResetCamera = useCallback(() => {
    message.info('相机视角已重置');
    window.location.reload();
  }, []);

  // ========== 渲染UI ==========
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D场景容器: 工厂建筑+设备+热力图 */}
      <Scene showHeatMap={showHeatMap} />

      {/* 顶部数据看板: 5项关键指标 */}
      {/* <Dashboard /> */}

      {/* 右上角工具栏: 暂停/重置/热力图/告警按钮 */}
      {/* <Toolbar
        showHeatMap={showHeatMap}
        onToggleHeatMap={() => setShowHeatMap((prev) => !prev)}
        onToggleAlertPanel={() => setShowAlertPanel((prev) => !prev)}
        onResetCamera={handleResetCamera}
      /> */}

      {/* 底部时间滑块: 24小时历史回溯+播放功能 */}
      {/* <TimeSlider /> */}

      {/* 右侧抽屉: 告警列表面板 */}
      {/* <AlertPanel visible={showAlertPanel} onClose={() => setShowAlertPanel(false)} /> */}

      {/* 人物跟随视角切换按钮 */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 100,
        }}
      >
        <button
          onClick={toggleFollowMode}
          style={{
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            background: followMode
              ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
              : 'linear-gradient(135deg, #2980b9, #3498db)',
            boxShadow: followMode
              ? '0 4px 15px rgba(231, 76, 60, 0.4)'
              : '0 4px 15px rgba(52, 152, 219, 0.4)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
        >
          {followMode ? '🔓 退出跟随' : '🚶 跟随人物'}
        </button>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>🎮 操作说明</div>
          <div>W/↑ 前进 &nbsp; S/↓ 后退</div>
          <div>A/← 左转 &nbsp; D/→ 右转</div>
        </div>
      </div>

      {/* 扫地机器人控制面板（左下角） */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 100,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: '16px 18px',
          color: '#fff',
          minWidth: 220,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          🤖 扫地机器人
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 20,
            background: robotMode === 'running' ? '#2ecc71' : robotMode === 'editing' ? '#f39c12' : '#7f8c8d',
            color: '#fff',
            marginLeft: 'auto',
          }}>
            {robotMode === 'running' ? '运行中' : robotMode === 'editing' ? '编辑路径' : robotMode === 'paused' ? '已暂停' : '待命'}
          </span>
        </div>

        {/* 控制按钮区 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {/* 开始/暂停 */}
          {robotMode !== 'editing' && (
            <button
              onClick={() => {
                if (robotMode === 'running') setRobotMode('paused');
                else if (robotPath.length >= 2) setRobotMode('running');
              }}
              disabled={robotPath.length < 2}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#fff',
                background: robotMode === 'running' ? '#e67e22' : '#2ecc71',
                opacity: robotPath.length < 2 ? 0.4 : 1,
              }}
            >
              {robotMode === 'running' ? '⏸ 暂停' : '▶ 启动'}
            </button>
          )}

          {/* 编辑路径 */}
          <button
            onClick={() => {
              if (robotMode === 'editing') {
                setRobotMode('idle');
              } else {
                setRobotMode('editing');
              }
            }}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#fff',
              background: robotMode === 'editing' ? '#e74c3c' : '#3498db',
            }}
          >
            {robotMode === 'editing' ? '✓ 完成' : '✏️ 编辑路径'}
          </button>

          {/* 停止回原点 */}
          {(robotMode === 'running' || robotMode === 'paused') && (
            <button
              onClick={() => {
                setRobotMode('idle');
                useCleaningRobotStore.getState().setProgress(0, 0);
              }}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#fff', background: '#e74c3c',
              }}
            >
              ⏹ 停止
            </button>
          )}
        </div>

        {/* 编辑模式工具 */}
        {robotMode === 'editing' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={removeLastPoint}
              disabled={robotPath.length === 0}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 12,
                opacity: robotPath.length === 0 ? 0.3 : 1,
              }}
            >
              ↩ 撤销
            </button>
            <button
              onClick={clearRobotPath}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: 12,
              }}
            >
              🗑 清空
            </button>
            <span style={{ fontSize: 11, color: '#aaa', alignSelf: 'center', marginLeft: 'auto' }}>
              {robotPath.length} 个点
            </span>
          </div>
        )}

        {/* 速度调节 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>
            速度: {robotSpeed} m/s
          </div>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={robotSpeed}
            onChange={(e) => setRobotSpeed(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4a90d9' }}
          />
        </div>

        {/* 显示开关 */}
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#ccc' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input type="checkbox" checked={robotShowPath} onChange={toggleRobotShowPath} />
            路径线
          </label>
        </div>

        {/* 编辑模式提示 */}
        {robotMode === 'editing' && (
          <div style={{
            marginTop: 10, padding: '8px 10px', borderRadius: 8,
            background: 'rgba(74, 144, 217, 0.15)', border: '1px solid rgba(74, 144, 217, 0.3)',
            fontSize: 11, color: '#8ab4e8', lineHeight: 1.5,
          }}>
            💡 点击地面添加路径点，机器人将沿路径行驶
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 导出主应用组件
 * @module App
 */
export default App;