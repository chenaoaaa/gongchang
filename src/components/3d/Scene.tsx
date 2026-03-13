import { Canvas } from '@react-three/fiber';
import CameraController from './CameraController';
import Environment from './Environment';
import Factory from './Factory';
import HeatMap from './HeatMap';
import Character from './Character';
import CleaningRobot from './CleaningRobot';
import RobotPathEditor from './RobotPathEditor';
import { useDeviceStore } from '../../store/deviceStore';
import sceneConfig from '../../config/scene.json';

interface SceneProps {
  showHeatMap: boolean;
}

const Scene = ({ showHeatMap }: SceneProps) => {
  const { selectedDeviceId, selectDevice } = useDeviceStore();
  const { camera } = sceneConfig;

  // 点击背景关闭设备面板
  const handleBackgroundClick = () => {
    if (selectedDeviceId) {
      selectDevice(null);
    }
  };

  return (
    <Canvas
      shadows
      camera={{
        position: camera.initialPosition as [number, number, number],
        fov: camera.fov,
        near: camera.near,
        far: camera.far,
      }}
      onClick={handleBackgroundClick}
      style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #B0E2FF 60%, #E8F4FD 100%)' }}
    >
      {/* 相机控制 */}
      <CameraController />

      {/* 环境光照 */}
      <Environment />

      {/* 工厂建筑和环境 */}
      <Factory />

      {/* 人物角色 */}
      <Character />

      {/* 扫地机器人 */}
      <CleaningRobot />

      {/* 路径编辑器（编辑模式下激活） */}
      <RobotPathEditor />

      {/* 设备 */}
      {/* {devices.map((device) => (
        <Device
          key={device.id}
          data={device}
          onClick={(id) => selectDevice(id === selectedDeviceId ? null : id)}
          isSelected={selectedDeviceId === device.id}
        />
      ))} */}

      {/* 热力图 */}
      <HeatMap visible={showHeatMap} />
    </Canvas>
  );
};

export default Scene;
