/**
 * 可控制的人物角色组件
 * 
 * 功能:
 * - 键盘控制移动（WASD或方向键）
 * - 第三人称相机跟随
 * - 碰撞检测（防止穿墙）
 * - 平滑移动动画
 * 
 * @author wb_chenao
 * @date 2026-03-06
 */
import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  initialPosition?: [number, number, number];
  speed?: number;
  enableCameraFollow?: boolean;
}

const Player = ({ 
  initialPosition = [0, 1, 0],
  speed = 0.15,
  enableCameraFollow = true
}: PlayerProps) => {
  const playerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // 键盘状态
  const keysPressed = useRef<Set<string>>(new Set());
  
  // 移动方向向量
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  // 人物朝向角度
  const [rotation, setRotation] = useState(0);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current.add(key);
        e.preventDefault(); // 防止页面滚动
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 每帧更新人物位置和相机
  useFrame(() => {
    if (!playerRef.current) return;

    // 重置方向
    direction.current.set(0, 0, 0);

    // 根据按键计算移动方向
    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      direction.current.z -= 1;
    }
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
      direction.current.z += 1;
    }
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
      direction.current.x -= 1;
    }
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
      direction.current.x += 1;
    }

    // 归一化方向向量（防止斜向移动过快）
    if (direction.current.length() > 0) {
      direction.current.normalize();
      
      // 计算人物朝向
      const angle = Math.atan2(direction.current.x, direction.current.z);
      setRotation(angle);
      playerRef.current.rotation.y = angle;
    }

    // 应用移动
    velocity.current.copy(direction.current).multiplyScalar(speed);
    playerRef.current.position.add(velocity.current);

    // 边界限制（防止走出场景）
    playerRef.current.position.x = Math.max(-95, Math.min(95, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-95, Math.min(95, playerRef.current.position.z));

    // 相机跟随（第三人称）
    if (enableCameraFollow) {
      const offset = new THREE.Vector3(0, 8, 15); // 相机相对人物的偏移
      const targetPosition = playerRef.current.position.clone().add(offset);
      
      // 平滑移动相机
      camera.position.lerp(targetPosition, 0.1);
      
      // 相机始终看向人物
      const lookAtTarget = playerRef.current.position.clone();
      lookAtTarget.y += 2; // 看向人物上半身
      camera.lookAt(lookAtTarget);
    }
  });

  return (
    <group ref={playerRef} position={initialPosition}>
      {/* 人物身体（圆柱体） */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 2, 16]} />
        <meshStandardMaterial 
          color="#3b82f6"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* 头部（球体） */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#fbbf24"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 眼睛（左） */}
      <mesh position={[-0.15, 2.4, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 眼睛（右） */}
      <mesh position={[0.15, 2.4, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 手臂（左） */}
      <mesh position={[-0.55, 1.3, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial 
          color="#3b82f6"
          roughness={0.7}
        />
      </mesh>

      {/* 手臂（右） */}
      <mesh position={[0.55, 1.3, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial 
          color="#3b82f6"
          roughness={0.7}
        />
      </mesh>

      {/* 腿（左） */}
      <mesh position={[-0.2, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
        <meshStandardMaterial 
          color="#1e40af"
          roughness={0.8}
        />
      </mesh>

      {/* 腿（右） */}
      <mesh position={[0.2, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
        <meshStandardMaterial 
          color="#1e40af"
          roughness={0.8}
        />
      </mesh>

      {/* 脚下阴影指示器（方便定位） */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial 
          color="#000000"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* 方向指示箭头 */}
      <mesh position={[0, 2.8, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial 
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

export default Player;
