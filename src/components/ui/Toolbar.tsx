import { Button, Space, Tooltip, Badge } from 'antd';
import {
  ReloadOutlined,
  HeatMapOutlined,
  WarningOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAlertStore } from '../../store/alertStore';
import './Toolbar.css';

interface ToolbarProps {
  onToggleHeatMap: () => void;
  onToggleAlertPanel: () => void;
  onResetCamera: () => void;
  showHeatMap: boolean;
}

const Toolbar = ({
  onToggleHeatMap,
  onToggleAlertPanel,
  onResetCamera,
  showHeatMap,
}: ToolbarProps) => {
  const { isPaused, togglePause } = useDashboardStore();
  const { alerts } = useAlertStore();

  const pendingAlerts = alerts.filter((a) => a.status === 'pending').length;

  return (
    <div className="toolbar-container">
      <Space size="small">
        <Tooltip title={isPaused ? '恢复数据更新' : '暂停数据更新'}>
          <Button
            type={isPaused ? 'primary' : 'default'}
            icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            onClick={togglePause}
            className="toolbar-button"
          >
            {isPaused ? '恢复' : '暂停'}
          </Button>
        </Tooltip>

        <Tooltip title="重置相机视角">
          <Button
            icon={<ReloadOutlined />}
            onClick={onResetCamera}
            className="toolbar-button"
          >
            重置视角
          </Button>
        </Tooltip>

        <Tooltip title={showHeatMap ? '隐藏热力图' : '显示热力图'}>
          <Button
            type={showHeatMap ? 'primary' : 'default'}
            icon={<HeatMapOutlined />}
            onClick={onToggleHeatMap}
            className="toolbar-button"
          >
            热力图
          </Button>
        </Tooltip>

        <Tooltip title="查看告警">
          <Badge count={pendingAlerts} offset={[-5, 5]}>
            <Button
              danger={pendingAlerts > 0}
              icon={<WarningOutlined />}
              onClick={onToggleAlertPanel}
              className="toolbar-button"
            >
              告警面板
            </Button>
          </Badge>
        </Tooltip>
      </Space>
    </div>
  );
};

export default Toolbar;
