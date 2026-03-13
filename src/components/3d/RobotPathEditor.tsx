/**
 * RobotPathEditor.tsx — 路径编辑器（3D 场景内交互）
 *
 * 功能:
 *  - 编辑模式下：点击地面添加路径点
 *  - 显示预览光标（鼠标悬停地面时）
 *  - 路径点可拖拽（后续扩展）
 *
 * 原理:
 *  - 在地面铺一个透明的大 plane 接受 pointer 事件
 *  - onPointerMove 更新光标位置
 *  - onClick 追加路径点
 */

import { useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { useCleaningRobotStore } from '../../store/cleaningRobotStore';

const RobotPathEditor = () => {
  const mode = useCleaningRobotStore((s) => s.mode);
  const addPathPoint = useCleaningRobotStore((s) => s.addPathPoint);

  const [cursorPos, setCursorPos] = useState<[number, number, number] | null>(null);
  const isEditing = mode === 'editing';

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isEditing) return;
    e.stopPropagation();
    setCursorPos([e.point.x, 0.15, e.point.z]);
  };

  const handlePointerLeave = () => {
    setCursorPos(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isEditing) return;
    e.stopPropagation();
    addPathPoint({ x: e.point.x, z: e.point.z });
  };

  return (
    <group>
      {/* 透明地面拦截 pointer 事件 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        visible={false}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 光标预览（编辑模式下鼠标悬停位置） */}
      {isEditing && cursorPos && (
        <group position={cursorPos}>
          {/* 外环 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.7, 20]} />
            <meshBasicMaterial color="#4a90d9" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* 中心点 */}
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#4a90d9" emissive="#4a90d9" emissiveIntensity={0.6} />
          </mesh>
          {/* 十字线 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 1.2]} />
            <meshBasicMaterial color="#4a90d9" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
            <planeGeometry args={[0.08, 1.2]} />
            <meshBasicMaterial color="#4a90d9" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default RobotPathEditor;
