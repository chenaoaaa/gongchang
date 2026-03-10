/**
 * 相机控制器组件
 * 
 * 功能:
 * - 支持轨道控制（旋转/平移/缩放）
 * - 支持预设视角切换
 * - 平滑动画过渡
 * 
 * @author wb_chenao
 * @date 2026-03-06
 */
import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { CAMERA_LIMITS } from '../../utils/constants';
import { useCameraStore } from '../../store/cameraStore';
import * as THREE from 'three';

const CameraController = () => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  // 从store获取当前视角配置
  const { currentViewId, getViewById, setTransitioning } = useCameraStore();

  // 监听视角切换，执行平滑动画
  useEffect(() => {
    const view = getViewById(currentViewId);
    if (!view || !controlsRef.current) return;

    // 标记开始过渡
    setTransitioning(true);

    // 目标位置和目标点
    const targetPosition = new THREE.Vector3(...view.position);
    const targetLookAt = new THREE.Vector3(...view.target);

    // 当前位置
    const startPosition = camera.position.clone();
    const startLookAt = controlsRef.current.target.clone();

    // 动画参数
    const duration = 1500; // 1.5秒
    const startTime = Date.now();

    // 缓动函数 (ease-in-out)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // 动画循环
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const t = easeInOutCubic(progress);

      // 插值计算当前位置
      camera.position.lerpVectors(startPosition, targetPosition, t);
      controlsRef.current.target.lerpVectors(startLookAt, targetLookAt, t);
      controlsRef.current.update();

      // 继续动画或结束
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTransitioning(false);
      }
    };

    animate();
  }, [currentViewId, camera, getViewById, setTransitioning]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      minPolarAngle={CAMERA_LIMITS.minPolarAngle}
      maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
    />
  );
};

export default CameraController;
