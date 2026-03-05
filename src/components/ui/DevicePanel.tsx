import { Card, Descriptions, Tag, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { DeviceData } from '../../utils/dataProcessor';
import './DevicePanel.css';

interface DevicePanelProps {
  data: DeviceData;
  onClose: () => void;
}

const DevicePanel = ({ data, onClose }: DevicePanelProps) => {
  // 状态标签颜色
  const getStatusTag = (status: string) => {
    const statusMap = {
      running: { color: 'success', text: '正常运行' },
      warning: { color: 'warning', text: '警告' },
      error: { color: 'error', text: '告警' },
      idle: { color: 'default', text: '停机' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.idle;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  return (
    <div className="device-panel">
      <Card
        title={
          <div className="device-panel-header">
            <span>{data.name}</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              size="small"
              style={{ color: '#fff' }}
            />
          </div>
        }
        className="device-panel-card"
      >
        <Descriptions column={1} size="small" className="device-panel-desc">
          <Descriptions.Item label="设备ID">{data.id}</Descriptions.Item>
          <Descriptions.Item label="运行状态">
            {getStatusTag(data.status)}
          </Descriptions.Item>
          <Descriptions.Item label="当前温度">
            <span
              style={{
                color:
                  data.temperature >= data.thresholds.tempError
                    ? '#ff4d4f'
                    : data.temperature >= data.thresholds.tempWarning
                    ? '#faad14'
                    : '#52c41a',
                fontWeight: 'bold',
              }}
            >
              {data.temperature.toFixed(1)}°C
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="运行时长">
            {data.runningHours.toFixed(1)} 小时
          </Descriptions.Item>
          <Descriptions.Item label="当日产量">{data.dailyOutput} 件</Descriptions.Item>
          <Descriptions.Item label="负责人">{data.supervisor}</Descriptions.Item>
        </Descriptions>

        {/* 阈值提示 */}
        <div className="device-panel-thresholds">
          <div className="threshold-item">
            <span>警告温度:</span>
            <span>{data.thresholds.tempWarning}°C</span>
          </div>
          <div className="threshold-item">
            <span>告警温度:</span>
            <span>{data.thresholds.tempError}°C</span>
          </div>
          <div className="threshold-item">
            <span>维护周期:</span>
            <span>{data.thresholds.maintenanceHours}h</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DevicePanel;
