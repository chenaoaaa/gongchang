import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import CameraController from './CameraController';
import Environment from './Environment';
import Factory from './Factory';
import Device from './Device';
import HeatMap from './HeatMap';
import { useDeviceStore } from '../../store/deviceStore';
import { useTimeStore } from '../../store/timeStore';
import sceneConfig from '../../config/scene.json';

interface SceneProps {
  showHeatMap: boolean;
}

const Scene = ({ showHeatMap }: SceneProps) => {
  const { devices, selectedDeviceId, selectDevice } = useDeviceStore();
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
      style={{ background: '#0a0a1a' }}
    >
      {/* 相机控制 */}
      <CameraController />

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
    </Canvas>
  );
};

export default Scene;
