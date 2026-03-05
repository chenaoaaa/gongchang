import sceneConfig from '../../config/scene.json';

const Environment = () => {
  const { lights } = sceneConfig;

  return (
    <>
      {/* 环境光 */}
      <ambientLight
        intensity={lights.ambient.intensity}
        color={lights.ambient.color}
      />

      {/* 平行光（模拟太阳光） */}
      <directionalLight
        position={lights.directional.position as [number, number, number]}
        intensity={lights.directional.intensity}
        color={lights.directional.color}
        castShadow={lights.directional.castShadow}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {/* 半球光（天空和地面反射） */}
      <hemisphereLight
        skyColor={lights.hemisphere.skyColor}
        groundColor={lights.hemisphere.groundColor}
        intensity={lights.hemisphere.intensity}
      />
    </>
  );
};

export default Environment;
