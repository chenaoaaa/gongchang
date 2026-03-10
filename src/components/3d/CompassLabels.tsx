import { Text } from '@react-three/drei';

/**
 * 东南西北方向指示牌组件
 *
 * 约定方向（俯视图）：
 *   -Z = 北(N)    +Z = 南(S)
 *   +X = 东(E)    -X = 西(W)
 *
 * 指示牌垂直竖立，固定朝向场景中心
 */

const POLE_HEIGHT = 12;
const EDGE_OFFSET = 95;

interface DirectionLabel {
  text: string;
  sub: string;
  position: [number, number, number];
  /** 牌面绕 Y 轴旋转角度，使其朝向场景中心 */
  rotationY: number;
  color: string;
  bgColor: string;
}

const directions: DirectionLabel[] = [
  {
    text: '北',
    sub: 'N',
    position: [0, 0, -EDGE_OFFSET],
    rotationY: 0,             // 面朝 +Z（朝向场景内）
    color: '#ffffff',
    bgColor: '#c0392b',
  },
  {
    text: '南',
    sub: 'S',
    position: [0, 0, EDGE_OFFSET],
    rotationY: Math.PI,       // 面朝 -Z（朝向场景内）
    color: '#ffffff',
    bgColor: '#2c3e50',
  },
  {
    text: '东',
    sub: 'E',
    position: [EDGE_OFFSET, 0, 0],
    rotationY: -Math.PI / 2,  // 面朝 -X（朝向场景内）
    color: '#ffffff',
    bgColor: '#2c3e50',
  },
  {
    text: '西',
    sub: 'W',
    position: [-EDGE_OFFSET, 0, 0],
    rotationY: Math.PI / 2,   // 面朝 +X（朝向场景内）
    color: '#ffffff',
    bgColor: '#2c3e50',
  },
];

const CompassLabels = () => {
  return (
    <group>
      {directions.map((dir) => (
        <group key={dir.sub} position={dir.position}>

          {/* 旗杆 */}
          <mesh position={[0, POLE_HEIGHT / 2, 0]}>
            <cylinderGeometry args={[0.3, 0.4, POLE_HEIGHT, 8]} />
            <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* 底座 */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[1.2, 1.5, 0.6, 16]} />
            <meshStandardMaterial color="#5d6d7e" metalness={0.4} roughness={0.6} />
          </mesh>

          {/* 牌子整体（固定朝向场景中心） */}
          <group position={[0, POLE_HEIGHT + 4, 0]} rotation={[0, dir.rotationY, 0]}>

            {/* 边框（稍大，在后面） */}
            <mesh position={[0, 0, -0.1]}>
              <boxGeometry args={[9.6, 7.6, 0.2]} />
              <meshStandardMaterial color="#ecf0f1" />
            </mesh>

            {/* 主背景板（在前面，用 box 有厚度，不会 z-fighting） */}
            <mesh>
              <boxGeometry args={[9, 7, 0.3]} />
              <meshStandardMaterial color={dir.bgColor} />
            </mesh>

            {/* ===== 正面文字 ===== */}
            <Text
              position={[0, 0.8, 0.25]}
              fontSize={4}
              color={dir.color}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {dir.text}
            </Text>
            <Text
              position={[0, -2, 0.25]}
              fontSize={1.8}
              color={dir.color}
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.8}
            >
              {dir.sub}
            </Text>
            <mesh>
              <boxGeometry args={[9, 7, 0.3]} />
              <meshStandardMaterial color={dir.bgColor} />
            </mesh>

            {/* ===== 背面文字（绕 Y 轴翻转 180°，防止镜像） ===== */}
            <Text
              position={[0, 0.8, -0.25]}
              rotation={[0, Math.PI, 0]}
              fontSize={4}
              color={dir.color}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {dir.text}
            </Text>
            <Text
              position={[0, -2, -0.25]}
              rotation={[0, Math.PI, 0]}
              fontSize={1.8}
              color={dir.color}
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.8}
            >
              {dir.sub}
            </Text>

          </group>

        </group>
      ))}
    </group>
  );
};

export default CompassLabels;
