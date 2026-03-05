import { Drawer, List, Badge, Tag, Typography, Space, Button } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAlertStore } from '../../store/alertStore';
import { useDeviceStore } from '../../store/deviceStore';
import { formatTime } from '../../utils/dataProcessor';
import './AlertPanel.css';

const { Text, Title } = Typography;

interface AlertPanelProps {
  visible: boolean;
  onClose: () => void;
}

const AlertPanel = ({ visible, onClose }: AlertPanelProps) => {
  const { alerts, resolveAlert } = useAlertStore();
  const { getDeviceById } = useDeviceStore();

  // 按时间倒序排序
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
  };

  const getLevelTag = (level: string) => {
    const levelMap = {
      critical: { color: 'error', text: '严重' },
      error: { color: 'error', text: '错误' },
      warning: { color: 'warning', text: '警告' },
      info: { color: 'info', text: '信息' },
    };
    const levelInfo = levelMap[level as keyof typeof levelMap] || levelMap.info;
    return <Tag color={levelInfo.color}>{levelInfo.text}</Tag>;
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      high_temperature: '高温告警',
      maintenance_required: '维护提醒',
    };
    return typeMap[type] || type;
  };

  return (
    <Drawer
      title={
        <Space>
          <WarningOutlined />
          <span>告警面板</span>
          <Badge count={alerts.filter((a) => a.status === 'pending').length} />
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      size="large"
      styles={{ body: { width: 400 } }}
      className="alert-panel-drawer"
    >
      {alerts.length === 0 ? (
        <div className="alert-empty">
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <Text style={{ marginTop: 16, color: 'rgba(255, 255, 255, 0.65)' }}>
            暂无告警
          </Text>
        </div>
      ) : (
        <List
          dataSource={sortedAlerts}
          renderItem={(alert) => {
            const device = getDeviceById(alert.deviceId);
            return (
              <List.Item
                className="alert-item"
                style={{
                  borderLeft: `4px solid ${
                    alert.level === 'error' || alert.level === 'critical'
                      ? '#ff4d4f'
                      : '#faad14'
                  }`,
                }}
              >
                <div className="alert-item-content">
                  <div className="alert-header">
                    <Space>
                      {getLevelIcon(alert.level)}
                      <Text strong style={{ color: '#fff' }}>
                        {device?.name || alert.deviceId}
                      </Text>
                    </Space>
                    <Space>
                      {getLevelTag(alert.level)}
                      {alert.status === 'resolved' && (
                        <Tag color="success">已处理</Tag>
                      )}
                    </Space>
                  </div>

                  <div className="alert-info">
                    <Text className="alert-type">{getTypeText(alert.type)}</Text>
                    <Text className="alert-message">{alert.message}</Text>
                    <Text className="alert-value">
                      当前值: <strong>{alert.currentValue.toFixed(1)}</strong> | 阈值:{' '}
                      {alert.threshold}
                    </Text>
                    <Text className="alert-time">{formatTime(alert.timestamp)}</Text>
                  </div>

                  <div className="alert-suggestion">
                    <Text type="secondary">建议措施:</Text>
                    <Text>{alert.suggestion}</Text>
                  </div>

                  {alert.status === 'pending' && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => resolveAlert(alert.id)}
                      style={{ marginTop: 8 }}
                    >
                      标记已处理
                    </Button>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Drawer>
  );
};

export default AlertPanel;
