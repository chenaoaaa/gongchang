import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCharacterStore } from '../../store/characterStore';

const MOVE_SPEED = 0.15;

/** 记录当前按键状态 */
const keys: Record<string, boolean> = {};

const Character = () => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const walkPhaseRef = useRef(0);

  const { position, rotation, setPosition, setRotation, setIsMoving } = useCharacterStore();

  // 内部用 ref 保存位置和旋转，避免每帧触发 re-render
  const posRef = useRef<[number, number, number]>([...position]);
  const rotRef = useRef(rotation);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    let moved = false;

    // 前进/后退：W / S 键（沿当前朝向）
    if (keys['w'] || keys['arrowup']) {
      posRef.current = [
        posRef.current[0] - Math.sin(rotRef.current) * MOVE_SPEED,
        posRef.current[1],
        posRef.current[2] - Math.cos(rotRef.current) * MOVE_SPEED,
      ];
      moved = true;
    }
    if (keys['s'] || keys['arrowdown']) {
      posRef.current = [
        posRef.current[0] + Math.sin(rotRef.current) * MOVE_SPEED,
        posRef.current[1],
        posRef.current[2] + Math.cos(rotRef.current) * MOVE_SPEED,
      ];
      moved = true;
    }

    // 左右横移：A / D 键（垂直于当前朝向的侧向平移）
    // 侧向向量 = 朝向向量旋转 90°：(-cos, 0, sin)
    if (keys['a'] || keys['arrowleft']) {
      posRef.current = [
        posRef.current[0] - Math.cos(rotRef.current) * MOVE_SPEED,
        posRef.current[1],
        posRef.current[2] + Math.sin(rotRef.current) * MOVE_SPEED,
      ];
      moved = true;
    }
    if (keys['d'] || keys['arrowright']) {
      posRef.current = [
        posRef.current[0] + Math.cos(rotRef.current) * MOVE_SPEED,
        posRef.current[1],
        posRef.current[2] - Math.sin(rotRef.current) * MOVE_SPEED,
      ];
      moved = true;
    }

    // 更新 3D 对象位置和旋转
    // 模型面部建模在 +Z 方向，加 Math.PI 翻转使面部朝行进方向（-Z）
    groupRef.current.position.set(...posRef.current);
    groupRef.current.rotation.y = rotRef.current + Math.PI;

    // 走路动画（腿和手臂摆动）
    if (moved) {
      walkPhaseRef.current += 0.12;
      const swing = Math.sin(walkPhaseRef.current) * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.6;
    } else {
      // 静止时回归中立姿势
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.8;
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.8;
    }

    // 每帧同步状态到 store（供相机跟随使用）
    setPosition([...posRef.current]);
    setRotation(rotRef.current);
    setIsMoving(moved);
  });

  // 人物颜色配置
  const skinColor = '#FDBCB4';
  const shirtColor = '#2980b9';
  const pantsColor = '#2c3e50';
  const shoeColor = '#1a1a1a';
  const hairColor = '#3d2b1f';

  return (
    <group ref={groupRef} position={position}>
      {/* 头部 */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.65, 0.6]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* 头发 */}
      <mesh position={[0, 3.78, 0]} castShadow>
        <boxGeometry args={[0.65, 0.2, 0.65]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>

      {/* 眼睛左 */}
      <mesh position={[-0.15, 3.42, 0.31]}>
        <boxGeometry args={[0.12, 0.1, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* 眼睛右 */}
      <mesh position={[0.15, 3.42, 0.31]}>
        <boxGeometry args={[0.12, 0.1, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 嘴巴 */}
      <mesh position={[0, 3.22, 0.31]}>
        <boxGeometry args={[0.2, 0.06, 0.05]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>

      {/* 脖子 */}
      <mesh position={[0, 2.95, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.25, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* 上身（衬衫） */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <boxGeometry args={[0.75, 1.0, 0.45]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* 腰带 */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.77, 0.12, 0.47]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {/* 左臂（以肩膀为轴旋转） */}
      <group ref={leftArmRef} position={[-0.5, 2.55, 0]}>
        {/* 上臂 */}
        <mesh position={[-0.18, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.22]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        {/* 前臂 */}
        <mesh position={[-0.18, -0.82, 0]} castShadow>
          <boxGeometry args={[0.19, 0.45, 0.19]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* 手 */}
        <mesh position={[-0.18, -1.12, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* 右臂 */}
      <group ref={rightArmRef} position={[0.5, 2.55, 0]}>
        <mesh position={[0.18, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.22]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0.18, -0.82, 0]} castShadow>
          <boxGeometry args={[0.19, 0.45, 0.19]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0.18, -1.12, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* 左腿（以髋部为轴旋转） */}
      <group ref={leftLegRef} position={[-0.2, 1.65, 0]}>
        {/* 大腿 */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.28, 0.72, 0.28]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* 小腿 */}
        <mesh position={[0, -1.0, 0]} castShadow>
          <boxGeometry args={[0.24, 0.52, 0.24]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* 鞋 */}
        <mesh position={[0, -1.43, 0.06]} castShadow>
          <boxGeometry args={[0.27, 0.18, 0.38]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
      </group>

      {/* 右腿 */}
      <group ref={rightLegRef} position={[0.2, 1.65, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.28, 0.72, 0.28]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -1.0, 0]} castShadow>
          <boxGeometry args={[0.24, 0.52, 0.24]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -1.43, 0.06]} castShadow>
          <boxGeometry args={[0.27, 0.18, 0.38]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
      </group>
    </group>
  );
};

export default Character;
