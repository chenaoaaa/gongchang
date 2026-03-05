import sceneConfig from '../../config/scene.json';

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

      {/* 建筑物 */}
      {buildings.map((building) => (
        <mesh
          key={building.id}
          position={building.position as [number, number, number]}
          rotation={building.rotation as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={building.size as [number, number, number]} />
          <meshStandardMaterial color={building.color} />
        </mesh>
      ))}

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
    </group>
  );
};

export default Factory;
