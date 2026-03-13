/**
 * CleaningRobot.tsx — 中型扫地机器人 3D 组件
 *
 * 功能:
 *  - 机器人 3D 模型（圆盘底座 + 外壳 + 刷子 + 指示灯）
 *  - 沿自定义路径匀速移动，朝向行进方向
 *  - 清扫痕迹（半透明条带）
 *  - 路径可视化（虚线 + 路径点标记）
 *
 * 性能:
 *  - 使用 ref 直接操作 position/rotation，不触发 re-render
 *  - 通过 getState() 读取 store，避免 useFrame 内 setState
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCleaningRobotStore } from '../../store/cleaningRobotStore';
import type { PathPoint } from '../../store/cleaningRobotStore';

// ─── 常量 ────────────────────────────────────────
const ROBOT_Y = 0.15;       // 机器人底面离地高度
const BRUSH_SPEED = 8;      // 刷子旋转速度（弧度/秒）

// ─── 工具函数 ────────────────────────────────────

/** 计算路径总长度和每段累计长度 */
function computePathMeta(path: PathPoint[]) {
  const segLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x;
    const dz = path[i + 1].z - path[i].z;
    const len = Math.sqrt(dx * dx + dz * dz);
    segLengths.push(len);
    totalLength += len;
  }
  return { segLengths, totalLength };
}

/** 在路径上按 segIndex + segT 插值出世界坐标和朝向 */
function getPositionOnPath(
  path: PathPoint[],
  segIndex: number,
  segT: number
): { x: number; z: number; angle: number } {
  if (path.length < 2) return { x: 0, z: 0, angle: 0 };

  const i = Math.min(segIndex, path.length - 2);
  const t = THREE.MathUtils.clamp(segT, 0, 1);
  const a = path[i];
  const b = path[i + 1];

  const x = a.x + (b.x - a.x) * t;
  const z = a.z + (b.z - a.z) * t;
  const angle = Math.atan2(b.x - a.x, b.z - a.z);

  return { x, z, angle };
}

// ─── 机器人 3D 模型 ──────────────────────────────

const RobotModel = () => {
  const leftBrushRef = useRef<THREE.Mesh>(null);
  const rightBrushRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.Mesh>(null);

  // 运行时刷子旋转 + 指示灯闪烁
  useFrame((_, delta) => {
    const { mode } = useCleaningRobotStore.getState();
    if (mode === 'running') {
      if (leftBrushRef.current) leftBrushRef.current.rotation.y += BRUSH_SPEED * delta;
      if (rightBrushRef.current) rightBrushRef.current.rotation.y -= BRUSH_SPEED * delta;
    }
    // 指示灯闪烁
    if (lightRef.current) {
      const mat = lightRef.current.material as THREE.MeshStandardMaterial;
      if (mode === 'running') {
        mat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.006) * 0.5;
      } else {
        mat.emissiveIntensity = 0.2;
      }
    }
  });

  return (
    <group>
      {/* 底座圆盘 */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.25, 24]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* 上壳体 */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.5, 0.4, 24]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 顶部盖板 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1.1, 0.12, 24]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* 顶部指示灯 */}
      <mesh ref={lightRef} position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 前方传感器（深色条） */}
      <mesh position={[0, 0.35, 1.35]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.8, 0.12, 0.15]} />
        <meshStandardMaterial color="#222" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* 左旋转刷 */}
      <group position={[-1.1, 0.02, 1.0]}>
        <mesh ref={leftBrushRef}>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 6]} />
          <meshStandardMaterial color="#f5a623" roughness={0.8} />
        </mesh>
        {/* 刷毛（3 条） */}
        {[0, 2.094, 4.189].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.3, -0.02, Math.sin(angle) * 0.3]}>
            <boxGeometry args={[0.06, 0.04, 0.35]} />
            <meshStandardMaterial color="#8B6914" />
          </mesh>
        ))}
      </group>

      {/* 右旋转刷 */}
      <group position={[1.1, 0.02, 1.0]}>
        <mesh ref={rightBrushRef}>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 6]} />
          <meshStandardMaterial color="#f5a623" roughness={0.8} />
        </mesh>
        {[0, 2.094, 4.189].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.3, -0.02, Math.sin(angle) * 0.3]}>
            <boxGeometry args={[0.06, 0.04, 0.35]} />
            <meshStandardMaterial color="#8B6914" />
          </mesh>
        ))}
      </group>

      {/* 后轮（2个） */}
      <mesh position={[-0.9, 0.08, -0.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.9, 0.08, -0.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* 前轮（万向轮） */}
      <mesh position={[0, 0.06, 1.2]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

// ─── 路径可视化 ──────────────────────────────────

const PathVisualization = ({ path }: { path: PathPoint[] }) => {
  // 路径线
  const linePoints = useMemo(() => {
    return path.map((p) => new THREE.Vector3(p.x, 0.08, p.z));
  }, [path]);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(linePoints);
    return geo;
  }, [linePoints]);

  if (path.length < 2) return null;

  return (
    <group>
      {/* 路径线 */}
      <primitive object={(() => {
        const mat = new THREE.LineDashedMaterial({ color: '#4a90d9', dashSize: 1.2, gapSize: 0.6 });
        const line = new THREE.LineSegments(lineGeo, mat);
        line.computeLineDistances();
        return line;
      })()} />

      {/* 路径点标记 */}
      {path.map((p, i) => (
        <mesh key={i} position={[p.x, 0.12, p.z]}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshStandardMaterial
            color={i === 0 ? '#2ecc71' : i === path.length - 1 ? '#e74c3c' : '#4a90d9'}
            emissive={i === 0 ? '#2ecc71' : i === path.length - 1 ? '#e74c3c' : '#4a90d9'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── 清扫痕迹 ────────────────────────────────────

const CleaningTrail = () => {
  const trailRef = useRef<THREE.BufferGeometry>(null);
  const positionsRef = useRef<number[]>([]);
  const MAX_TRAIL_POINTS = 500;

  useFrame(() => {
    const { mode, path, segIndex, segT, showTrail } = useCleaningRobotStore.getState();
    if (!showTrail || mode !== 'running' || path.length < 2) return;

    const { x, z } = getPositionOnPath(path, segIndex, segT);
    const positions = positionsRef.current;

    // 每隔一定距离记录一个点
    const lastX = positions.length >= 3 ? positions[positions.length - 3] : Infinity;
    const lastZ = positions.length >= 3 ? positions[positions.length - 1] : Infinity;
    const dist = Math.sqrt((x - lastX) ** 2 + (z - lastZ) ** 2);

    if (dist > 0.5 || positions.length === 0) {
      positions.push(x, 0.03, z);
      if (positions.length > MAX_TRAIL_POINTS * 3) {
        positions.splice(0, 3);
      }
    }

    if (trailRef.current && positions.length >= 6) {
      trailRef.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      trailRef.current.computeBoundingSphere();
    }
  });

  return (
    <points>
      <bufferGeometry ref={trailRef} />
      <pointsMaterial
        color="#7ec8e3"
        size={0.8}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

// ─── 主组件 ──────────────────────────────────────

const CleaningRobot = () => {
  const groupRef = useRef<THREE.Group>(null);
  const smoothAngle = useRef(0);

  // 路径显示 & 路径数据（selector 减少 re-render）
  const showPath = useCleaningRobotStore((s) => s.showPath);
  const path = useCleaningRobotStore((s) => s.path);

  // 路径元数据
  const pathMeta = useMemo(() => computePathMeta(path), [path]);

  // 运动动画
  useFrame((_, delta) => {
    const store = useCleaningRobotStore.getState();
    if (store.mode !== 'running' || store.path.length < 2) {
      // 即使不运行也要更新位置显示
      if (groupRef.current && store.path.length >= 2) {
        const pos = getPositionOnPath(store.path, store.segIndex, store.segT);
        groupRef.current.position.set(pos.x, ROBOT_Y, pos.z);
      }
      return;
    }

    const { segLengths } = pathMeta;
    if (segLengths.length === 0) return;

    let { segIndex, segT } = store;
    const segLen = segLengths[segIndex] || 1;

    // 按实际距离匀速推进 t
    const dt = (store.speed * delta) / segLen;
    segT += dt;

    // 越过当前段 → 进入下一段
    while (segT >= 1 && segIndex < store.path.length - 2) {
      segT -= 1;
      segIndex += 1;
    }

    // 到达终点 → 循环
    if (segIndex >= store.path.length - 2 && segT >= 1) {
      segIndex = 0;
      segT = 0;
    }

    // 更新 store 进度（直接 set，不会触发 React re-render）
    store.setProgress(segIndex, segT);

    // 更新 3D 位置 & 朝向
    const pos = getPositionOnPath(store.path, segIndex, segT);
    if (groupRef.current) {
      groupRef.current.position.set(pos.x, ROBOT_Y, pos.z);

      // 平滑旋转
      let dAngle = pos.angle - smoothAngle.current;
      while (dAngle > Math.PI) dAngle -= Math.PI * 2;
      while (dAngle < -Math.PI) dAngle += Math.PI * 2;
      smoothAngle.current += dAngle * 0.15;
      groupRef.current.rotation.y = smoothAngle.current;
    }
  });

  // 初始位置
  const initPos = path.length >= 2
    ? getPositionOnPath(path, 0, 0)
    : { x: 0, z: 0, angle: 0 };

  return (
    <group>
      {/* 机器人模型（跟随路径移动） */}
      <group
        ref={groupRef}
        position={[initPos.x, ROBOT_Y, initPos.z]}
        rotation={[0, initPos.angle, 0]}
      >
        <RobotModel />
      </group>

      {/* 路径可视化 */}
      {showPath && <PathVisualization path={path} />}

      {/* 清扫痕迹 */}
      <CleaningTrail />
    </group>
  );
};

export default CleaningRobot;
