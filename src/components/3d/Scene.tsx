import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import CameraController from './CameraController';
import Environment from './Environment';
import Factory from './Factory';
import Device from './Device';
import HeatMap from './HeatMap';
import Player from './Player';
import { useDeviceStore } from '../../store/deviceStore';
import { useCameraStore } from '../../store/cameraStore';
import sceneConfig from '../../config/scene.json';

interface SceneProps {
  showHeatMap: boolean;
}

const Scene = ({ showHeatMap }: SceneProps) => {
  const { devices, selectedDeviceId, selectDevice } = useDeviceStore();
  const { currentViewId } = useCameraStore();
  const { camera } = sceneConfig;

  // 点击背景关闭设备面板
  const handleBackgroundClick = () => {
    if (selectedDeviceId) {
      selectDevice(null);
    }
  };

  // 判断是否在预设视角模式（如果是，禁用人物相机跟随）
  const isPlayerCameraEnabled = currentViewId === 'overview';

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
      style={{ background: '#0a0a1a' }}
    >
      {/* 相机控制（仅在非人物模式下启用） */}
      {!isPlayerCameraEnabled && <CameraController />}

      {/* 环境光照 */}
      <Environment />

      {/* 工厂建筑和环境 */}
      <Factory />

      {/* 设备 */}
      {devices.map((device) => (
        <Device
          key={device.id}
          data={device}
          onClick={(id) => selectDevice(id === selectedDeviceId ? null : id)}
          isSelected={selectedDeviceId === device.id}
        />
      ))}

      {/* 热力图 */}
      <HeatMap visible={showHeatMap} />

      {/* 可控制的人物角色 */}
      <Player 
        initialPosition={[0, 0, 0]}
        speed={0.15}
        enableCameraFollow={isPlayerCameraEnabled}
      />
    </Canvas>
  );
};

export default Scene;
