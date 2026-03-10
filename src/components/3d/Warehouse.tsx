/**
 * 真实仓库建筑组件
 * 
 * 功能:
 * - 程序化建模，包含墙体、屋顶、门窗细节
 * - 真实的材质纹理（金属板、卷帘门等）
 * - 支持点击交互
 * 
 * @author wb_chenao
 * @date 2026-03-06
 */
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface WarehouseProps {
  position: [number, number, number];
  size: [number, number, number]; // [宽度, 高度, 深度]
  onClick?: () => void;
}

/**
 * 生成金属波纹板纹理
 */
const createMetalPanelTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 基础金属色
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#b0b0b0');
  gradient.addColorStop(0.5, '#888888');
  gradient.addColorStop(1, '#a0a0a0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制波纹板竖条纹
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  // 添加锈迹斑点
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 8 + 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  
  return texture;
};

/**
 * 生成卷帘门纹理
 */
const createRollerDoorTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 卷帘门底色
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制横向卷帘条纹
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 3;
  for (let i = 0; i < canvas.height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
    
    // 添加高光
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, i + 2);
    ctx.lineTo(canvas.width, i + 2);
    ctx.stroke();
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
  }

  // 添加门把手
  const handleX = canvas.width / 2;
  const handleY = canvas.height / 2;
  ctx.fillStyle = '#1a202c';
  ctx.fillRect(handleX - 30, handleY - 5, 60, 10);
  ctx.fillStyle = '#cbd5e0';
  ctx.fillRect(handleX - 28, handleY - 3, 56, 6);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * 生成混凝土地基纹理
 */
const createConcreteTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // 混凝土底色
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 添加噪点
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.3)`;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

const Warehouse = ({ position, size, onClick }: WarehouseProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [width, height, depth] = size;

  // 创建纹理（使用useMemo避免重复创建）
  const metalTexture = useMemo(() => createMetalPanelTexture(), []);
  const doorTexture = useMemo(() => createRollerDoorTexture(), []);
  const concreteTexture = useMemo(() => createConcreteTexture(), []);

  return (
    <group ref={groupRef} position={position}>
      {/* 混凝土地基 */}
      <mesh position={[0, -height / 2 + 0.3, 0]} receiveShadow>
        <boxGeometry args={[width + 0.5, 0.6, depth + 0.5]} />
        <meshStandardMaterial 
          map={concreteTexture}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* 主体墙面（金属波纹板） */}
      {/* 后墙（分段以容纳窗户） */}
      {/* 后墙 - 底部 */}
      <mesh position={[0, -height / 4, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height / 2, 0.2]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* 后墙 - 顶部 */}
      <mesh position={[0, height / 3, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height / 3, 0.2]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* 后墙 - 窗户之间的竖条 */}
      {[-1, 0, 1].map((i) => (
        <mesh 
          key={`back-wall-bar-${i}`}
          position={[i * width / 4, height / 3 - 1, -depth / 2]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[width / 4, 2, 0.2]} />
          <meshStandardMaterial 
            map={metalTexture}
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* 左墙（分段以容纳窗户） */}
      {/* 左墙 - 底部实心部分 */}
      <mesh position={[-width / 2, -height / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, height / 2, depth]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* 左墙 - 顶部实心部分 */}
      <mesh position={[-width / 2, height / 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, height / 3, depth]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* 左墙 - 窗户之间的竖条 */}
      {[0, 1, 2, 3].map((i) => (
        <mesh 
          key={`left-wall-bar-${i}`}
          position={[-width / 2, height / 4, -depth / 2 + i * (depth / 4)]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[0.2, 2.5, depth / 4]} />
          <meshStandardMaterial 
            map={metalTexture}
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* 右墙 - 底部实心部分 */}
      <mesh position={[width / 2, -height / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, height / 2, depth]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* 右墙 - 顶部实心部分 */}
      <mesh position={[width / 2, height / 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, height / 3, depth]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* 右墙 - 窗户之间的竖条 */}
      {[0, 1, 2, 3].map((i) => (
        <mesh 
          key={`right-wall-bar-${i}`}
          position={[width / 2, height / 4, -depth / 2 + i * (depth / 4)]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[0.2, 2.5, depth / 4]} />
          <meshStandardMaterial 
            map={metalTexture}
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* 前墙（带卷帘门） */}
      {/* 前墙左侧 */}
      <mesh position={[-width / 3, 0, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width / 3, height, 0.2]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* 前墙右侧 */}
      <mesh position={[width / 3, 0, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width / 3, height, 0.2]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* 前墙顶部 */}
      <mesh position={[0, height / 3, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width / 3 - 0.4, height / 3, 0.2]} />
        <meshStandardMaterial 
          map={metalTexture}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* 卷帘门 */}
      <mesh 
        position={[0, -height / 6, depth / 2 + 0.1]} 
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[width / 3 - 0.4, height * 2 / 3, 0.15]} />
        <meshStandardMaterial 
          map={doorTexture}
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>

      {/* 屋顶（紧贴墙顶，无缝隙） */}
      <mesh position={[0, height / 2, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[width + 0.5, 0.3, depth + 0.5]} />
        <meshStandardMaterial 
          color="#8b8b8b"
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      {/* 屋顶排气口 */}
      <mesh position={[width / 4, height / 2 + 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 1, 8]} />
        <meshStandardMaterial 
          color="#4a5568"
          roughness={0.8}
          metalness={0.3}
        />
      </mesh>

      {/* 仓库标识牌 */}
      <mesh position={[0, height / 2 - 1, depth / 2 + 0.2]}>
        <boxGeometry args={[8, 2, 0.1]} />
        <meshStandardMaterial 
          color="#1e40af"
          emissive="#1e40af"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 门框 */}
      <mesh position={[-width / 6 - 0.2, -height / 6, depth / 2 + 0.05]}>
        <boxGeometry args={[0.3, height * 2 / 3 + 0.2, 0.3]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>
      <mesh position={[width / 6 + 0.2, -height / 6, depth / 2 + 0.05]}>
        <boxGeometry args={[0.3, height * 2 / 3 + 0.2, 0.3]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>
      <mesh position={[0, height / 6 + 0.1, depth / 2 + 0.05]}>
        <boxGeometry args={[width / 3, 0.3, 0.3]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* 外部照明灯 */}
      <group position={[0, height / 2 - 0.5, depth / 2 + 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.5, 0.8, 8]} />
          <meshStandardMaterial 
            color="#1a202c"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
        <pointLight 
          position={[0, -0.5, 0]}
          color="#fbbf24"
          intensity={2}
          distance={15}
        />
      </group>
    </group>
  );
};

export default Warehouse;
