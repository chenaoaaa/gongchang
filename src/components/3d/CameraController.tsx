import { OrbitControls } from '@react-three/drei';
import { CAMERA_LIMITS } from '../../utils/constants';
import sceneConfig from '../../config/scene.json';

const CameraController = () => {
  const { camera } = sceneConfig;

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      minPolarAngle={CAMERA_LIMITS.minPolarAngle}
      maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
      target={camera.target as [number, number, number]}
    />
  );
};

export default CameraController;
