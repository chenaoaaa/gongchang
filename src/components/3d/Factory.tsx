import sceneConfig from '../../config/scene.json';
import CompassLabels from './CompassLabels';
import Park from './Park';
import Building from './Building';

// ─── 墙色映射：将 scene.json 中的颜色关键字映射为真实色值 ───
const WALL_COLOR_MAP: Record<string, string> = {
  red:    '#C94B1F',   // T1 — 橙红（参考图片）
  orange: '#D0622A',   // T2 — 深橙
  yellow: '#C9821F',   // T3~T8, 食堂 — 深黄棕
  green:  '#4A7C59',
  blue:   '#2C5F8A',
  white:  '#E8E4DE',
  gray:   '#8A8A8A',
};

function resolveColor(color: string): string {
  return WALL_COLOR_MAP[color] ?? color;
}

const Factory = () => {
  const { buildings, ground, environment, park } = sceneConfig;

  return (
    <group>
      {/* 地面 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow={ground.receiveShadow}
      >
        <planeGeometry args={ground.size as [number, number]} />
        <meshStandardMaterial color={ground.color} />
      </mesh>

      {/* 建筑物（四面立面还原） */}
      {buildings.map((building) => {
        const [w, h, d] = building.size as [number, number, number];
        // 根据宽度和高度决定窗户行数
        const rows = h >= 10 ? 2 : 1;

        return (
          <Building
            key={building.id}
            id={building.id}
            name={building.name}
            position={building.position as [number, number, number]}
            size={[w, h, d]}
            wallColor={resolveColor(building.color)}
            windowRows={rows}
            showLabel
          />
        );
      })}

      {/* 道路 */}
      {environment.roads.map((road) => (
        <mesh
          key={road.id}
          position={road.position as [number, number, number]}
          receiveShadow
        >
          <boxGeometry args={road.size as [number, number, number]} />
          <meshStandardMaterial color={road.color} />
        </mesh>
      ))}

      {/* 树木 */}
      {environment.trees.map((tree, index) => (
        <group
          key={`tree-${index}`}
          position={tree.position as [number, number, number]}
          scale={tree.scale}
        >
          {/* 树干 */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          {/* 树冠 */}
          <mesh position={[0, 4, 0]} castShadow>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
        </group>
      ))}

      {/* 东南西北方向指示牌 */}
      <CompassLabels />

      {/* 小公园 */}
      <Park position={park.position as [number, number, number]} />
    </group>
  );
};

export default Factory;
