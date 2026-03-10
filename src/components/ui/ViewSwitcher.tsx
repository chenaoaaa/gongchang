/**
 * 视角切换面板组件
 * 
 * 功能:
 * - 显示所有预设视角列表
 * - 支持点击切换视角
 * - 高亮当前激活的视角
 * 
 * @author wb_chenao
 * @date 2026-03-06
 */
import { Button, Tooltip } from 'antd';
import { CameraOutlined, EyeOutlined } from '@ant-design/icons';
import { useCameraStore } from '../../store/cameraStore';
import './ViewSwitcher.css';

const ViewSwitcher = () => {
  const { views, currentViewId, setView, isTransitioning } = useCameraStore();

  return (
    <div className="view-switcher">
      <div className="view-switcher-header">
        <CameraOutlined style={{ marginRight: 8 }} />
        <span>视角切换</span>
      </div>
      
      <div className="view-switcher-list">
        {views.map((view) => (
          <Tooltip 
            key={view.id} 
            title={view.description} 
            placement="left"
          >
            <Button
              type={currentViewId === view.id ? 'primary' : 'default'}
              icon={<EyeOutlined />}
              onClick={() => setView(view.id)}
              disabled={isTransitioning}
              className={`view-button ${currentViewId === view.id ? 'active' : ''}`}
              block
            >
              {view.name}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default ViewSwitcher;
