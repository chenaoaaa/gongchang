/**
 * Building.tsx — 四面还原建筑（高性能版）
 *
 * 结构:
 *  - 四面立面（前/后/左/右），每面 BuildingFacade = 1 墙体 mesh + N 玻璃 mesh
 *  - 内部封闭体（单个实心 box，防穿模，1 draw call）
 *  - 屋顶（1 mesh）+ 女儿墙（4 mesh）
 *  - 名称标签
 */

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import BuildingFacade from './BuildingFacade';

// ─── 类型定义 ──────────────────────────────────
interface BuildingProps {
  id: string;
  name: string;
  position: [number, number, number];
  /** [width, height, depth] */
  size: [number, number, number];
  wallColor?: string;
  windowRows?: number;
  showLabel?: boolean;
}

const ROOF_COLOR = '#555555';
const WALL_THICKNESS = 0.35;
const PARAPET_HEIGHT = 0.5;
const PARAPET_THICK = 0.25;

const Building = ({
  name,
  position,
  size,
  wallColor = '#C94B1F',
  windowRows = 2,
  showLabel = true,
}: BuildingProps) => {
  const [bx, by, bz] = position;
  const [width, height, depth] = size;

  // baseY：建筑底部（by 是 scene.json 中心点）
  const baseY = by - height / 2;

  // 女儿墙颜色（比墙色略深，useMemo 避免每次渲染重新计算）
  const parapetColor = useMemo(() => {
    const c = new THREE.Color(wallColor);
    c.multiplyScalar(0.75);
    return '#' + c.getHexString();
  }, [wallColor]);

  // 窗户列数自适应
  const frontCols = Math.max(2, Math.round(width / 5));
  const sideCols = Math.max(2, Math.round(depth / 5));

  const commonFacade = { wallColor, windowRows, thickness: WALL_THICKNESS };

  return (
    <group position={[bx, baseY, bz]}>
      {/* ═══ 内部封闭体（防穿模，单个 box） ═══ */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#1e1a18" side={THREE.BackSide} />
      </mesh>

      {/* ═══ 四面立面 ═══ */}
      <group position={[0, 0, depth / 2]}>
        <BuildingFacade {...commonFacade} width={width} height={height} windowCols={frontCols} />
      </group>
      <group position={[0, 0, -depth / 2]} rotation={[0, Math.PI, 0]}>
        <BuildingFacade {...commonFacade} width={width} height={height} windowCols={frontCols} />
      </group>
      <group position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <BuildingFacade {...commonFacade} width={depth} height={height} windowCols={sideCols} />
      </group>
      <group position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <BuildingFacade {...commonFacade} width={depth} height={height} windowCols={sideCols} />
      </group>

      {/* ═══ 屋顶 ═══ */}
      <mesh position={[0, height + 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.3, depth]} />
        <meshStandardMaterial color={ROOF_COLOR} roughness={0.9} />
      </mesh>

      {/* ═══ 女儿墙（四周压顶）：偏移量足够大，远离立面，不 z-fight ═══ */}
      <mesh position={[0, height + PARAPET_HEIGHT / 2 + 0.3, depth / 2 + PARAPET_THICK / 2]}>
        <boxGeometry args={[width, PARAPET_HEIGHT, PARAPET_THICK]} />
        <meshStandardMaterial color={parapetColor} />
      </mesh>
      <mesh position={[0, height + PARAPET_HEIGHT / 2 + 0.3, -depth / 2 - PARAPET_THICK / 2]}>
        <boxGeometry args={[width, PARAPET_HEIGHT, PARAPET_THICK]} />
        <meshStandardMaterial color={parapetColor} />
      </mesh>
      <mesh position={[width / 2 + PARAPET_THICK / 2, height + PARAPET_HEIGHT / 2 + 0.3, 0]}>
        <boxGeometry args={[PARAPET_THICK, PARAPET_HEIGHT, depth + PARAPET_THICK * 2]} />
        <meshStandardMaterial color={parapetColor} />
      </mesh>
      <mesh position={[-width / 2 - PARAPET_THICK / 2, height + PARAPET_HEIGHT / 2 + 0.3, 0]}>
        <boxGeometry args={[PARAPET_THICK, PARAPET_HEIGHT, depth + PARAPET_THICK * 2]} />
        <meshStandardMaterial color={parapetColor} />
      </mesh>

      {/* ═══ 名称标签 ═══ */}
      {showLabel && (
        <Text
          position={[0, height + 0.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.3}
          outlineColor="#000000"
        >
          {name}
        </Text>
      )}
    </group>
  );
};

export { Building };
export type { BuildingProps };
export default Building;
