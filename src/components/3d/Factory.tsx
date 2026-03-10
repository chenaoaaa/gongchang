/**
 * 工厂场景组件
 * 
 * 功能:
 * - 渲染地面、建筑物、道路、树木等场景元素
 * - 支持点击建筑物切换视角
 * - 厂房使用半透明材质便于查看内部设备
 * - 仓库使用真实建模
 * 
 * @author wb_chenao
 * @date 2026-03-06
 */
import sceneConfig from '../../config/scene.json';
import { useCameraStore } from '../../store/cameraStore';
import Warehouse from './Warehouse';

const Factory = () => {
  const { buildings, ground, environment } = sceneConfig;
  const { setView } = useCameraStore();

  /**
   * 处理建筑物点击事件 - 切换到建筑物内部或外部视角
   * @param buildingId - 建筑物ID
   */
  const handleBuildingClick = (buildingId: string) => {
    // 根据建筑ID映射到对应的预设视角
    const viewMap: Record<string, string> = {
      'factory-1': 'factory1-internal',
      'factory-2': 'factory2-internal',
      'warehouse': 'warehouse',
      'office': 'office',
    };

    const viewId = viewMap[buildingId];
    if (viewId) {
      setView(viewId);
    }
  };

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

      {/* 建筑物 - 支持点击切换视角 */}
      {buildings.map((building) => {
        // 仓库使用专用真实建模组件
        if (building.type === 'warehouse') {
          return (
            <Warehouse
              key={building.id}
              position={building.position as [number, number, number]}
              size={building.size as [number, number, number]}
              onClick={() => handleBuildingClick(building.id)}
            />
          );
        }

        // 其他建筑使用简单盒子
        return (
          <mesh
            key={building.id}
            position={building.position as [number, number, number]}
            rotation={building.rotation as [number, number, number]}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              handleBuildingClick(building.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <boxGeometry args={building.size as [number, number, number]} />
            <meshStandardMaterial 
              color={building.color}
              transparent={building.type === 'factory'}
              opacity={building.type === 'factory' ? 0.3 : 1}
              side={2} // THREE.DoubleSide - 双面渲染
            />
          </mesh>
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
    </group>
  );
};

export default Factory;
