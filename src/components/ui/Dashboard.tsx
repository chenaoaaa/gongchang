import { Card, Row, Col, Statistic } from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useDashboardStore } from '../../store/dashboardStore';
import { DASHBOARD_THRESHOLDS } from '../../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  const { data } = useDashboardStore();

  const isOrderRateLow = data.orderCompletionRate < DASHBOARD_THRESHOLDS.orderCompletionRate;
  const isOeeLow = data.oee < DASHBOARD_THRESHOLDS.oee;
  const hasAlerts = data.alertCount > 0;

  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="当日产能"
              value={data.dailyOutput}
              suffix="件"
              prefix={<RocketOutlined />}
              styles={{ content: { color: '#3f8600' } ,title: { color: '#3f8600' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="订单完成率"
              value={data.orderCompletionRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              styles={{
                content: { color: isOrderRateLow ? '#cf1322' : '#3f8600' },
                title: { color: isOrderRateLow ? '#cf1322' : '#3f8600' },
              }}
              className={isOrderRateLow ? 'blink' : ''}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="设备综合效率 OEE"
              value={data.oee}
              suffix="%"
              prefix={<DashboardOutlined />}
              styles={{
                content: { color: isOrderRateLow ? '#cf1322' : '#3f8600' },
                title: { color: isOrderRateLow ? '#cf1322' : '#3f8600' },
              }}
              className={isOeeLow ? 'blink' : ''}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="总能耗"
              value={data.totalEnergy}
              suffix="kWh"
              precision={1}
              prefix={<ThunderboltOutlined />}
              styles={{ content: { color: '#1677ff' } ,title: { color: '#1677ff' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="当前告警"
              value={data.alertCount}
              prefix={<WarningOutlined />}
              styles={{
                content: { color: hasAlerts ? '#cf1322' : '#666' },
                title: { color: hasAlerts ? '#cf1322' : '#666' },
              }}
              className={hasAlerts ? 'blink' : ''}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
