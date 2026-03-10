/**
 * 人物控制说明面板
 * 
 * 功能:
 * - 显示键盘控制说明
 * - 显示人物当前位置
 * - 提供切换相机模式按钮
 * 
 * @author wb_chenao
 * @date 2026-03-06
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import './PlayerControls.css';

const PlayerControls = () => {
  return (
    <div className="player-controls">
      <Card 
        size="small" 
        title={
          <span>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            人物控制
          </span>
        }
        className="player-controls-card"
      >
        <div className="control-item">
          <strong>移动：</strong>
          <div className="keys">
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd>
            或方向键
          </div>
        </div>
        
        <div className="control-item">
          <strong>提示：</strong>
          <span className="tip">在"全景鸟瞰"视角下使用键盘控制人物移动</span>
        </div>
        
        <div className="control-item">
          <strong>切换：</strong>
          <span className="tip">点击右侧"视角切换"可切换到其他预设视角</span>
        </div>
      </Card>
    </div>
  );
};

export default PlayerControls;
