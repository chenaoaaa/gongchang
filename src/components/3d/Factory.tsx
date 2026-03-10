import { Text } from '@react-three/drei';
import sceneConfig from '../../config/scene.json';
import CompassLabels from './CompassLabels';

const Factory = () => {
  const { buildings, ground, environment } = sceneConfig;

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

      {/* 建筑物 + 顶部名称标签 */}
      {buildings.map((building) => {
        const [bx, by, bz] = building.position as [number, number, number];
        const [, bh] = building.size as [number, number, number];
        const topY = by + bh / 2 + 0.5; // 顶面往上偏移一点
        return (
          <group key={building.id}>
            {/* 建筑主体 */}
            <mesh
              position={building.position as [number, number, number]}
              rotation={building.rotation as [number, number, number]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={building.size as [number, number, number]} />
              <meshStandardMaterial color={building.color} />
            </mesh>

            {/* 顶部名称标签（平躺在屋顶上） */}
            <Text
              position={[bx, topY, bz]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={4}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={0.3}
              outlineColor="#000000"
            >
              {building.name}
            </Text>
          </group>
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

      {/* 简化的树木（使用圆柱体+球体表示） */}
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
    </group>
  );
};

export default Factory;
