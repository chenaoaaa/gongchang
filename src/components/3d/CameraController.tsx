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
  const { position, followMode } = useCharacterStore();

  // 跟随模式下角色目标位置的平滑插值
  const smoothTarget = useRef(new THREE.Vector3(...position));

  // 记录跟随模式激活时相机与目标的偏移向量（保留用户调整的视角）
  const followInitialized = useRef(false);

  useFrame(() => {
    if (!followMode || !controlsRef.current) return;

    const charPos = new THREE.Vector3(...position);

    // 平滑插值目标到人物位置
    smoothTarget.current.lerp(charPos, 0.12);

    // 计算当前相机到旧 target 的偏移（保持视角方向不变）
    const oldTarget = controlsRef.current.target.clone() as THREE.Vector3;
    const camOffset = threeCamera.position.clone().sub(oldTarget);

    // 更新 target 到人物，相机跟着平移（保持相同偏移，即用户的视角方向不变）
    const newTarget = smoothTarget.current.clone();
    threeCamera.position.copy(newTarget.clone().add(camOffset));
    controlsRef.current.target.copy(newTarget);
    controlsRef.current.update();
  });

  // 切换到跟随模式时，将相机重置到人物背后的默认视角
  useEffect(() => {
    if (followMode) {
      const [px, py, pz] = position;
      smoothTarget.current.set(px, py, pz);

      if (!followInitialized.current && controlsRef.current) {
        // 初次进入跟随模式：将相机放到人物背后偏上方
        const offsetDistance = 18;
        const offsetHeight = 12;
        threeCamera.position.set(
          px,
          py + offsetHeight,
          pz + offsetDistance
        );
        controlsRef.current.target.set(px, py, pz);
        controlsRef.current.update();
        followInitialized.current = true;
      }
    } else {
      followInitialized.current = false;
    }
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
      // 跟随模式下也允许鼠标交互（上下左右环顾四周）
      enabled={true}
    />
  );
};

export default CameraController;
