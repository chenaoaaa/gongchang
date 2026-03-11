import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCharacterStore } from '../../store/characterStore';
import { CAMERA_LIMITS } from '../../utils/constants';
import sceneConfig from '../../config/scene.json';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrbitControlsImpl = any;

const CameraController = () => {
  const { camera } = sceneConfig;
  const { camera: threeCamera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { position, rotation, followMode } = useCharacterStore();

  // 跟随相机的目标插值（平滑过渡）
  const smoothTarget = useRef(new THREE.Vector3(...position));
  const smoothCamPos = useRef(new THREE.Vector3(...(sceneConfig.camera.initialPosition as [number, number, number])));

  useFrame(() => {
    if (!followMode) return;

    const charPos = new THREE.Vector3(...position);

    // 相机偏移：人物背后偏上方（第三人称视角）
    const offsetDistance = 18;
    const offsetHeight = 12;
    const camX = charPos.x + Math.sin(rotation) * offsetDistance;
    const camZ = charPos.z + Math.cos(rotation) * offsetDistance;
    const camY = charPos.y + offsetHeight;
    const targetCamPos = new THREE.Vector3(camX, camY, camZ);

    // 平滑插值
    smoothCamPos.current.lerp(targetCamPos, 0.08);
    smoothTarget.current.lerp(charPos, 0.1);

    threeCamera.position.copy(smoothCamPos.current);

    if (controlsRef.current) {
      // 更新 OrbitControls 的 target（视线焦点对准人物）
      controlsRef.current.target.copy(smoothTarget.current);
      controlsRef.current.update();
    }
  });

  // 切换模式时重置平滑值
  useEffect(() => {
    if (!followMode) {
      smoothTarget.current.set(0, 0, 0);
    } else {
      const [px, py, pz] = position;
      smoothTarget.current.set(px, py, pz);
    }
    // position 是每帧都变化的，只需在 followMode 改变时初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followMode]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      minPolarAngle={CAMERA_LIMITS.minPolarAngle}
      maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
      target={camera.target as [number, number, number]}
      // 跟随模式下禁用手动交互，防止冲突
      enabled={!followMode}
    />
  );
};

export default CameraController;
