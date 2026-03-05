import { Slider, Card, Button, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useTimeStore } from '../../store/timeStore';
import { HISTORICAL_DATA } from '../../utils/constants';
import { formatTime } from '../../utils/dataProcessor';
import { useState, useEffect } from 'react';
import './TimeSlider.css';

const TimeSlider = () => {
  const { currentTime, isPlaying, setCurrentTime, setIsPlaying, historicalData } =
    useTimeStore();
  const [sliderValue, setSliderValue] = useState(0);

  const now = Date.now();
  const startTime = now - HISTORICAL_DATA.timeRange;

  // 转换时间戳为滑块值 (0-288)
  const timeToValue = (time: number) => {
    return Math.floor((time - startTime) / HISTORICAL_DATA.interval);
  };

  // 转换滑块值为时间戳
  const valueToTime = (value: number) => {
    return startTime + value * HISTORICAL_DATA.interval;
  };

  useEffect(() => {
    setSliderValue(timeToValue(currentTime));
  }, [currentTime]);

  // 播放功能
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setSliderValue((prev) => {
        const next = prev + 1;
        if (next >= HISTORICAL_DATA.totalPoints) {
          setIsPlaying(false);
          return HISTORICAL_DATA.totalPoints - 1;
        }
        setCurrentTime(valueToTime(next));
        return next;
      });
    }, 1000); // 每秒前进一个数据点 (5分钟)

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  const handleSliderAfterChange = (value: number) => {
    const time = valueToTime(value);
    setCurrentTime(time);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const isRealtime = sliderValue >= HISTORICAL_DATA.totalPoints - 1;

  return (
    <div className="time-slider-container">
      <Card className="time-slider-card">
        <Space orientation="vertical" style={{ width: '100%' }} size="small">
          <div className="time-slider-header">
            <span className="time-slider-label">历史数据回溯</span>
            <span className="time-slider-time">
              {formatTime(new Date(valueToTime(sliderValue)).toISOString())}
              {isRealtime && <span className="realtime-badge">实时</span>}
            </span>
          </div>

          <div className="time-slider-controls">
            <Button
              type="primary"
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={togglePlay}
              size="small"
              disabled={isRealtime}
            >
              {isPlaying ? '暂停' : '播放'}
            </Button>

            <Slider
              min={0}
              max={HISTORICAL_DATA.totalPoints - 1}
              value={sliderValue}
              onChange={handleSliderChange}
              onChangeComplete={handleSliderAfterChange}
              tooltip={{
                formatter: (value) =>
                  value !== undefined
                    ? formatTime(new Date(valueToTime(value)).toISOString())
                    : '',
              }}
              style={{ flex: 1, marginLeft: 16, marginRight: 8 }}
            />
          </div>

          <div className="time-slider-info">
            <span>过去24小时</span>
            <span>步长: 5分钟</span>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default TimeSlider;
