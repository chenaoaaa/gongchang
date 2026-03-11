/**
 * Park.tsx — 静态小公园（无任何动态特效/动画）
 * 尺寸: [40, 10, 50]（宽 x 高 x 深）
 */

import { useMemo } from 'react';
import { RoundedBox, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// ══════════════════════════════════════════════════
//  工具：种子伪随机
// ══════════════════════════════════════════════════
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ══════════════════════════════════════════════════
//  石桥
// ══════════════════════════════════════════════════
const Bridge = ({
  position,
  rotation = [0, 0, 0] as [number, number, number],
  length = 10,
  width = 3.2,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  width?: number;
}) => {
  const railCount = Math.floor(length / 1.4) + 1;

  const slabColors = useMemo(() => {
    const r = seededRandom(99);
    return Array.from({ length: Math.floor(length / 1.2) }, () => {
      const v = 0.5 + r() * 0.18;
      return new THREE.Color(v * 1.02, v * 0.97, v * 0.92);
    });
  }, [length]);

  return (
    <group position={position} rotation={rotation}>
      {/* 两端桥墩 */}
      {([-length / 2 + 0.4, length / 2 - 0.4] as number[]).map((bx) => (
        <mesh key={bx} position={[bx, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.8, 1.2, 8, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#8d7a6a" roughness={0.9} />
        </mesh>
      ))}
      {/* 桥面石板 */}
      {slabColors.map((color, i) => (
        <mesh key={i} position={[-length / 2 + i * 1.2 + 0.6, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.22, width - 0.1]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      ))}
      {/* 左侧护栏柱 */}
      {Array.from({ length: railCount }, (_, i) => (
        <mesh key={`l${i}`} position={[-length / 2 + (i * length) / (railCount - 1), 0.45, -(width / 2 - 0.2)]} castShadow>
          <cylinderGeometry args={[0.08, 0.10, 0.7, 8]} />
          <meshStandardMaterial color="#9e8f7f" roughness={0.85} />
        </mesh>
      ))}
      {/* 右侧护栏柱 */}
      {Array.from({ length: railCount }, (_, i) => (
        <mesh key={`r${i}`} position={[-length / 2 + (i * length) / (railCount - 1), 0.45, width / 2 - 0.2]} castShadow>
          <cylinderGeometry args={[0.08, 0.10, 0.7, 8]} />
          <meshStandardMaterial color="#9e8f7f" roughness={0.85} />
        </mesh>
      ))}
      {/* 护栏横杆 */}
      <mesh position={[0, 0.82, -(width / 2 - 0.2)]} castShadow>
        <boxGeometry args={[length - 0.2, 0.1, 0.13]} />
        <meshStandardMaterial color="#8d7a6a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.82, width / 2 - 0.2]} castShadow>
        <boxGeometry args={[length - 0.2, 0.1, 0.13]} />
        <meshStandardMaterial color="#8d7a6a" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ══════════════════════════════════════════════════
//  石凳
// ══════════════════════════════════════════════════
const Bench = ({
  position,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) => (
  <group position={position} rotation={rotation}>
    {([-0.85, 0.85] as number[]).map((x) => (
      <group key={x} position={[x, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.14, 0.6, 0.45]} />
          <meshStandardMaterial color="#9e9088" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.22, 0.08, 0.55]} />
          <meshStandardMaterial color="#9e9088" roughness={0.88} />
        </mesh>
      </group>
    ))}
    {([-0.12, 0, 0.12] as number[]).map((z) => (
      <mesh key={z} position={[0, 0.64, z]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.065, 0.1]} />
        <meshStandardMaterial color="#8d6e45" roughness={0.75} />
      </mesh>
    ))}
    {([-0.85, 0.85] as number[]).map((x) => (
      <mesh key={`b${x}`} position={[x, 0.95, -0.18]} castShadow>
        <boxGeometry args={[0.07, 0.65, 0.07]} />
        <meshStandardMaterial color="#9e9088" roughness={0.9} />
      </mesh>
    ))}
    {([0.82, 1.1] as number[]).map((y) => (
      <mesh key={y} position={[0, y, -0.18]} castShadow>
        <boxGeometry args={[1.82, 0.065, 0.09]} />
        <meshStandardMaterial color="#8d6e45" roughness={0.75} />
      </mesh>
    ))}
  </group>
);

// ══════════════════════════════════════════════════
//  景观灯柱（无点光源，避免额外渲染开销）
// ══════════════════════════════════════════════════
const LampPost = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.18, 0.22, 0.16, 8]} />
      <meshStandardMaterial color="#607d8b" roughness={0.7} metalness={0.4} />
    </mesh>
    <mesh position={[0, 2.2, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.07, 4.3, 8]} />
      <meshStandardMaterial color="#546e7a" roughness={0.6} metalness={0.5} />
    </mesh>
    <mesh position={[0.28, 4.3, 0]} rotation={[0, 0, -0.2]} castShadow>
      <cylinderGeometry args={[0.025, 0.03, 0.65, 6]} />
      <meshStandardMaterial color="#546e7a" roughness={0.6} metalness={0.5} />
    </mesh>
    <mesh position={[0.55, 4.25, 0]} castShadow>
      <coneGeometry args={[0.22, 0.3, 8, 1, true]} />
      <meshStandardMaterial color="#455a64" roughness={0.5} metalness={0.6} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0.55, 4.32, 0]}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial color="#fffde7" emissive="#ffe082" emissiveIntensity={1.2} roughness={0.1} />
    </mesh>
  </group>
);

// ══════════════════════════════════════════════════
//  入口牌坊
// ══════════════════════════════════════════════════
const ParkGate = ({ z }: { z: number }) => (
  <group position={[0, 0, z]}>
    {([-2.8, 2.8] as number[]).map((x) => (
      <group key={x} position={[x, 0, 0]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
          <meshStandardMaterial color="#9e9080" roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.0, 0]} castShadow>
          <boxGeometry args={[0.42, 3.5, 0.42]} />
          <meshStandardMaterial color="#b0a48c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.9, 0]} castShadow>
          <boxGeometry args={[0.58, 0.22, 0.58]} />
          <meshStandardMaterial color="#9e9080" roughness={0.7} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, 4.2, 0]} castShadow>
      <boxGeometry args={[6.5, 0.38, 0.38]} />
      <meshStandardMaterial color="#7d6b52" roughness={0.75} />
    </mesh>
    <mesh position={[0, 4.22, 0.22]} castShadow>
      <boxGeometry args={[3.8, 0.68, 0.08]} />
      <meshStandardMaterial color="#5c4a2a" roughness={0.6} />
    </mesh>
    <Billboard position={[0, 4.22, 0.32]}>
      <Text
        fontSize={0.55}
        color="#ffd54f"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.04}
        outlineColor="#3e2a00"
      >
        文化公园
      </Text>
    </Billboard>
  </group>
);

// ══════════════════════════════════════════════════
//  主公园组件
// ══════════════════════════════════════════════════
interface ParkProps {
  position?: [number, number, number];
}

const Park = ({ position = [0, 0, 0] }: ParkProps) => {
  const PARK_W = 40;
  const PARK_D = 50;
  const POOL_D = 18;

  return (
    <group position={position}>

      {/* ── 草地（单层，用有厚度的盒子彻底避免 z-fighting） ── */}
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <boxGeometry args={[PARK_W, 0.1, PARK_D]} />
        <meshStandardMaterial color="#4a7c3f" roughness={0.95} />
      </mesh>

      {/* ── 围栏（四边圆角矮墙） ── */}
      {([
        { pos: [0, 0.45, -PARK_D / 2] as [number,number,number], args: [PARK_W, 0.9, 0.32] as [number,number,number] },
        { pos: [0, 0.45,  PARK_D / 2] as [number,number,number], args: [PARK_W, 0.9, 0.32] as [number,number,number] },
        { pos: [-PARK_W / 2, 0.45, 0] as [number,number,number], args: [0.32, 0.9, PARK_D] as [number,number,number] },
        { pos: [ PARK_W / 2, 0.45, 0] as [number,number,number], args: [0.32, 0.9, PARK_D] as [number,number,number] },
      ]).map(({ pos, args }, i) => (
        <RoundedBox key={i} args={args} radius={0.06} smoothness={2}
          position={pos} castShadow receiveShadow>
          <meshStandardMaterial color="#c8b8a0" roughness={0.88} />
        </RoundedBox>
      ))}

      {/* ── 石桥（横跨水池） ── */}
      <Bridge
        position={[0, 0.22, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={POOL_D + 1.5}
        width={3.2}
      />


      {/* ── 石凳 ── */}
      <Bench position={[-8,  0, -10]} rotation={[0,  Math.PI * 0.35, 0]} />
      <Bench position={[8,   0, -10]} rotation={[0, -Math.PI * 0.35, 0]} />
      <Bench position={[-8,  0,  10]} rotation={[0, -Math.PI * 0.35, 0]} />
      <Bench position={[8,   0,  10]} rotation={[0,  Math.PI * 0.35, 0]} />
      <Bench position={[-15, 0,   0]} rotation={[0, 0, 0]} />
      <Bench position={[15,  0,   0]} rotation={[0, Math.PI, 0]} />

      {/* ── 景观灯柱 ── */}
      <LampPost position={[-9, 0, -9]} />
      <LampPost position={[9,  0, -9]} />
      <LampPost position={[-9, 0,  9]} />
      <LampPost position={[9,  0,  9]} />

      {/* ── 入口牌坊 ── */}
      <ParkGate z={PARK_D / 2 - 0.3} />

    </group>
  );
};

export default Park;
