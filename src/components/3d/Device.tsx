import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import type { DeviceData } from '../../utils/dataProcessor';
import { getDeviceStatusColor } from '../../utils/constants';
import DevicePanel from '../ui/DevicePanel';

interface DeviceProps {
  data: DeviceData;
  onClick: (id: string) => void;
  isSelected: boolean;
}

const Device = ({ data, onClick, isSelected }: DeviceProps) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);
  
  // 获取状态颜色
  const statusColor = getDeviceStatusColor(data.status);
  
  // 告警闪烁动画
  useFrame((state) => {
    if (meshRef.current && (data.status === 'error' || data.status === 'warning')) {
      const opacity = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      if (meshRef.current.material && 'opacity' in meshRef.current.material) {
        (meshRef.current.material as any).opacity = opacity;
        (meshRef.current.material as any).transparent = true;
      }
    }
  });

  // 根据设备类型返回不同的几何体
  const getGeometry = () => {
    switch (data.type) {
      case 'cnc_machine':
        return <boxGeometry args={[2, 2, 2]} />;
      case 'robot_arm':
        return (
          <group>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.4, 2, 0.4]} />
            </mesh>
          </group>
        );
      case 'conveyor':
        return <boxGeometry args={[4, 0.5, 1]} />;
      case 'agv':
        return <boxGeometry args={[1, 0.8, 1.5]} />;
      case 'welding_station':
        return <boxGeometry args={[1.5, 1.8, 1.5]} />;
      case 'inspection':
        return <boxGeometry args={[1.2, 1.5, 1.2]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <group position={data.position} rotation={data.rotation}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(data.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        {getGeometry()}
        <meshStandardMaterial
          color={statusColor}
          emissive={hovered ? statusColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* 设备信息面板 */}
      {isSelected && (
        <Html position={[0, 3, 0]} center distanceFactor={10}>
          <DevicePanel data={data} onClose={() => onClick('')} />
        </Html>
      )}

      {/* 设备ID标签 */}
      {hovered && !isSelected && (
        <Html position={[0, 2, 0]} center distanceFactor={15}>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Device;
