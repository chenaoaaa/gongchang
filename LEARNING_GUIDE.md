# Three.js 学习路径 - 基于智能工厂数字孪生项目

## 📚 学习目标

通过这个实战项目，你将掌握：
- ✅ Three.js 核心概念（场景、相机、渲染器、几何体、材质）
- ✅ React Three Fiber (R3F) 声明式开发
- ✅ 3D交互设计（点击、悬停、动画）
- ✅ 性能优化技巧
- ✅ 实际项目架构

---

## 🎯 学习路径（共5个阶段）

### 阶段1️⃣：Three.js 基础概念（建议2-3天）

#### 学习目标
理解Three.js的核心三要素和基础渲染流程

#### 必读文件
1. **src/components/3d/Scene.tsx** ⭐️ 入口文件
   - 打开方式：VSCode中已打开
   - 学习要点：
     ```typescript
     <Canvas>  // 这是什么？相当于Three.js的Renderer
       <Scene /> // 场景容器
     </Canvas>
     ```

2. **src/components/3d/Environment.tsx** 🌟 光照系统
   - 关键知识点：
     - `ambientLight`: 环境光（无方向，均匀照亮）
     - `directionalLight`: 平行光（模拟太阳光）
     - `hemisphereLight`: 半球光（天空+地面反射）

#### 实践任务
```bash
# 在浏览器打开项目
http://localhost:5173

# 实验1：修改光照
打开 src/components/3d/Environment.tsx
修改第12行的 intensity 值（从0.5到2试试）
观察场景亮度变化

# 实验2：修改相机位置
打开 src/components/3d/Scene.tsx
修改第28行的 initialPosition: [80, 60, 80]
改为 [120, 80, 120]，看视角变化
```

#### 学习资源
- 📖 [Three.js官方文档 - 创建场景](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene)
- 🎥 [B站教程：Three.js入门](https://www.bilibili.com/video/BV1Gg411X7FY)

---

### 阶段2️⃣：几何体与材质（建议3-4天）

#### 学习目标
掌握如何创建3D物体、材质属性和颜色系统

#### 必读文件

**📁 核心文件清单**
```
src/components/3d/
├── Factory.tsx       ⭐️⭐️⭐️ 建筑物几何体（盒子、平面）
├── Device.tsx        ⭐️⭐️⭐️ 设备模型（不同类型的几何体）
└── HeatMap.tsx       ⭐️⭐️   热力图（半透明材质）
```

#### 详细学习步骤

**Step 1: 理解基础几何体**
```typescript
// 打开 src/components/3d/Factory.tsx

// 1️⃣ 地面 - PlaneGeometry (平面几何体)
<mesh rotation={[-Math.PI / 2, 0, 0]}>
  <planeGeometry args={[200, 200]} />  // 宽200，高200
  <meshStandardMaterial color="#2d3436" />
</mesh>

// 问题：为什么rotation是 -Math.PI / 2 ？
// 答案：Three.js中平面默认朝向Z轴，旋转-90度让它平躺

// 2️⃣ 建筑物 - BoxGeometry (盒子几何体)
<boxGeometry args={[40, 10, 30]} />  // 长、高、宽
```

**Step 2: 理解材质系统**
```typescript
// 打开 src/components/3d/Device.tsx (第60行)

<meshStandardMaterial
  color={statusColor}              // 基础颜色
  emissive={hovered ? statusColor : '#000000'}  // 发光颜色
  emissiveIntensity={hovered ? 0.3 : 0}         // 发光强度
/>

// 🎨 颜色来自 src/utils/constants.ts (第17-22行)
export const DEVICE_STATUS_COLORS = {
  running: '#00FF00',   // 绿色
  warning: '#FFD700',   // 黄色
  error: '#FF0000',     // 红色
  idle: '#888888'       // 灰色
}
```

#### 实践任务

**任务1: 修改建筑物颜色和尺寸**
```typescript
// 文件: src/components/3d/Factory.tsx

// 找到第22-33行的建筑物代码
{buildings.map((building) => (
  <mesh ...>
    <boxGeometry args={building.size as [number, number, number]} />
    <meshStandardMaterial color={building.color} />  // ← 改这里
  </mesh>
))}

// 实验：
// 1. 修改 src/config/scene.json 第32行的颜色 "#34495e" → "#ff6b6b"
// 2. 保存后观察主厂房变成红色
```

**任务2: 创建你的第一个3D物体**
```typescript
// 文件: src/components/3d/Factory.tsx

// 在第66行（树木之后）添加：
<mesh position={[0, 5, 0]}>
  <sphereGeometry args={[3, 32, 32]} />  {/* 半径3，分段32 */}
  <meshStandardMaterial 
    color="#ffd700"     // 金色
    metalness={0.8}     // 金属感
    roughness={0.2}     // 光滑度
  />
</mesh>

// 保存后会在场景中心看到一个金色球体！
```

#### 学习资源
- 📖 [Three.js几何体文档](https://threejs.org/docs/#api/en/geometries/BoxGeometry)
- 📖 [Three.js材质文档](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)

---

### 阶段3️⃣：相机控制与交互（建议3-4天）

#### 学习目标
掌握相机控制、鼠标交互、点击事件

#### 必读文件

**📁 交互相关文件**
```
src/components/3d/
├── CameraController.tsx  ⭐️⭐️⭐️ 轨道控制器
├── Device.tsx            ⭐️⭐️⭐️ 点击、悬停交互
└── Scene.tsx             ⭐️⭐️   事件处理
```

#### 详细学习步骤

**Step 1: 理解相机控制**
```typescript
// 打开 src/components/3d/CameraController.tsx

import { OrbitControls } from '@react-three/drei'

<OrbitControls
  enableDamping          // 启用阻尼（鼠标松开后缓慢停止）
  dampingFactor={0.05}   // 阻尼系数
  minDistance={20}       // 最小缩放距离
  maxDistance={200}      // 最大缩放距离
  minPolarAngle={...}    // 最小垂直角度（防止穿地）
  maxPolarAngle={...}    // 最大垂直角度（防止倒置）
  target={[20, 0, 20]}   // 相机看向的点
/>

// 🎮 鼠标操作：
// - 左键拖动：旋转视角
// - 右键拖动：平移场景
// - 滚轮：缩放
```

**Step 2: 理解点击交互**
```typescript
// 打开 src/components/3d/Device.tsx (第47-57行)

<mesh
  onClick={(e) => {
    e.stopPropagation();  // 阻止事件冒泡
    onClick(data.id);     // 触发点击回调
  }}
  onPointerOver={(e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';  // 改变鼠标样式
  }}
  onPointerOut={() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }}
>
```

**Step 3: 理解HTML标签（3D中的2D UI）**
```typescript
// 打开 src/components/3d/Device.tsx (第68-77行)

import { Html } from '@react-three/drei'

{isSelected && (
  <Html 
    position={[0, 3, 0]}     // 在3D物体上方3个单位
    center                    // 居中对齐
    distanceFactor={10}       // 距离缩放因子
  >
    <DevicePanel data={data} />  // 普通React组件
  </Html>
)}

// 💡 关键：Html组件让你在3D场景中嵌入2D UI！
```

#### 实践任务

**任务1: 修改相机控制参数**
```typescript
// 文件: src/components/3d/CameraController.tsx

// 实验1：改变阻尼效果
dampingFactor={0.05}  // 改为 0.2（更快停止）

// 实验2：限制缩放范围
minDistance={20}   // 改为 50（不能靠太近）
maxDistance={200}  // 改为 100（不能拉太远）

// 保存后用鼠标测试效果
```

**任务2: 给球体添加点击事件**
```typescript
// 文件: src/components/3d/Factory.tsx

// 把之前添加的球体改成可交互的：
const [clicked, setClicked] = useState(false);

<mesh 
  position={[0, 5, 0]}
  onClick={() => {
    setClicked(!clicked);
    console.log('球体被点击了！');
  }}
  onPointerOver={(e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  }}
  onPointerOut={() => {
    document.body.style.cursor = 'auto';
  }}
>
  <sphereGeometry args={[3, 32, 32]} />
  <meshStandardMaterial 
    color={clicked ? '#ff0000' : '#ffd700'}  // 点击变红
  />
</mesh>

// 点击球体看颜色变化！
```

#### 学习资源
- 📖 [React Three Fiber交互文档](https://docs.pmnd.rs/react-three-fiber/api/events)
- 📖 [Drei组件库文档](https://github.com/pmndrs/drei)

---

### 阶段4️⃣：动画与状态（建议3-4天）

#### 学习目标
掌握Three.js动画循环、状态驱动动画

#### 必读文件

**📁 动画相关文件**
```
src/components/3d/
└── Device.tsx  ⭐️⭐️⭐️ 闪烁动画（useFrame）
```

#### 详细学习步骤

**Step 1: 理解动画循环**
```typescript
// 打开 src/components/3d/Device.tsx (第25-33行)

import { useFrame } from '@react-three/fiber'

const meshRef = useRef<Mesh>(null);

// useFrame 每帧都会执行（约60fps）
useFrame((state) => {
  if (meshRef.current && data.status === 'error') {
    // state.clock.elapsedTime: 从启动开始的总时间（秒）
    const opacity = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
    
    if (meshRef.current.material) {
      (meshRef.current.material as any).opacity = opacity;
      (meshRef.current.material as any).transparent = true;
    }
  }
});

// 🎬 动画原理：
// Math.sin(time * 2) → 产生-1到1的正弦波
// * 0.3 + 0.7 → 映射到0.4-1.0范围（透明度）
// 结果：每秒闪烁2次
```

**Step 2: 理解状态驱动**
```typescript
// 状态变化 → 触发动画
const statusColor = getDeviceStatusColor(data.status);

// 当 data.status 从 'running' 变为 'error' 时：
// 1. statusColor 从绿色变为红色
// 2. useFrame中的动画条件满足
// 3. 开始闪烁
```

#### 实践任务

**任务1: 让球体旋转**
```typescript
// 文件: src/components/3d/Factory.tsx

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const sphereRef = useRef<THREE.Mesh>(null);

// 添加旋转动画
useFrame((state, delta) => {
  if (sphereRef.current) {
    sphereRef.current.rotation.y += delta;  // 每帧旋转
    sphereRef.current.rotation.x += delta * 0.5;
  }
});

<mesh ref={sphereRef} position={[0, 5, 0]}>
  {/* ...球体代码 */}
</mesh>

// delta: 上一帧到当前帧的时间差
// 使用delta保证不同帧率下速度一致
```

**任务2: 上下浮动动画**
```typescript
useFrame((state) => {
  if (sphereRef.current) {
    // Math.sin产生-1到1的波动
    sphereRef.current.position.y = 5 + Math.sin(state.clock.elapsedTime) * 2;
    // 结果：在Y轴3-7之间上下浮动
  }
});
```

#### 学习资源
- 📖 [useFrame文档](https://docs.pmnd.rs/react-three-fiber/api/hooks#useframe)
- 🎥 [Three.js动画教程](https://www.bilibili.com/video/BV1kh411W7Li)

---

### 阶段5️⃣：项目架构与优化（建议5-7天）

#### 学习目标
理解项目整体架构、状态管理、性能优化

#### 项目架构图

```
my-react-app/
│
├── src/
│   ├── App.tsx                    ⭐️ 入口组件（状态管理、Effect）
│   │
│   ├── components/
│   │   ├── 3d/                    ⭐️ Three.js 3D组件
│   │   │   ├── Scene.tsx          → 场景容器
│   │   │   ├── CameraController   → 相机控制
│   │   │   ├── Environment        → 光照
│   │   │   ├── Factory            → 建筑物
│   │   │   ├── Device             → 设备模型
│   │   │   └── HeatMap            → 热力图
│   │   │
│   │   └── ui/                    ⭐️ 2D UI组件（Ant Design）
│   │       ├── Dashboard          → 数据看板
│   │       ├── DevicePanel        → 设备详情
│   │       ├── AlertPanel         → 告警面板
│   │       ├── TimeSlider         → 时间滑块
│   │       └── Toolbar            → 工具栏
│   │
│   ├── store/                     ⭐️ 状态管理（Zustand）
│   │   ├── deviceStore.ts         → 设备状态
│   │   ├── dashboardStore.ts      → 仪表盘状态
│   │   ├── alertStore.ts          → 告警状态
│   │   └── timeStore.ts           → 时间状态
│   │
│   ├── utils/                     ⭐️ 工具函数
│   │   ├── constants.ts           → 常量配置
│   │   └── dataProcessor.ts       → 数据处理
│   │
│   └── config/                    ⭐️ JSON配置
│       ├── devices.json           → 设备配置
│       ├── scene.json             → 场景配置
│       └── alertRules.json        → 告警规则
```

#### 核心概念理解

**1. 数据流向**
```
用户操作 → App.tsx → Zustand Store → 3D组件 → 视觉反馈
   ↑                                              ↓
   └──────────── useFrame 动画更新 ←──────────────┘
```

**2. 状态管理（Zustand）**
```typescript
// 打开 src/store/deviceStore.ts

// 为什么用Zustand？
// ✅ 轻量级（比Redux简单10倍）
// ✅ 无需Provider包裹
// ✅ TypeScript友好
// ✅ 可在组件外访问

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [...],  // 状态
  
  updateDevice: (id, updates) =>  // 更新方法
    set((state) => ({
      devices: state.devices.map(d => 
        d.id === id ? {...d, ...updates} : d
      )
    }))
}));

// 组件中使用：
const { devices, updateDevice } = useDeviceStore();
```

**3. 性能优化技巧**
```typescript
// 打开 src/App.tsx (第44-93行)

// ❌ 错误写法（会导致无限循环）
useEffect(() => {
  updateDevice(id, data);
}, [devices, updateDevice]);  // devices变化 → 触发effect → 更新devices → 循环

// ✅ 正确写法
useEffect(() => {
  const currentDevices = useDeviceStore.getState().devices;  // 直接获取
  updateDevice(id, data);
}, [updateDevice]);  // 只依赖稳定的函数
```

#### 实践任务

**任务1: 阅读数据流**
```bash
# 1. 打开 src/App.tsx
找到第44行的 useEffect（数据自动更新）
理解：如何每5秒更新一次设备温度

# 2. 打开 src/store/deviceStore.ts
找到第54行的 updateDevice 方法
理解：如何更新单个设备

# 3. 打开 src/components/3d/Device.tsx
找到第21行的 statusColor
理解：状态如何影响颜色

# 4. 用浏览器看实际效果
观察设备颜色变化（约30秒会看到状态变化）
```

**任务2: 修改更新频率**
```typescript
// 文件: src/utils/constants.ts (第41行)

/** 数据更新间隔 (毫秒) - 每5秒刷新一次设备数据 */
export const DATA_UPDATE_INTERVAL = 5000;

// 改为 2000（2秒更新一次）
// 观察设备状态变化更频繁
```

---

## 🎓 学习方法建议

### 📖 阅读代码的正确姿势

**方法1: 跟随数据流**
```bash
# 例子：理解"点击设备显示面板"的完整流程

1. 用户点击设备
   ↓
2. src/components/3d/Device.tsx (第47行)
   onClick={(e) => onClick(data.id)}
   ↓
3. src/components/3d/Scene.tsx (第24行)
   onClick={(id) => selectDevice(id)}
   ↓
4. src/store/deviceStore.ts (第60行)
   selectDevice: (id) => set({ selectedDeviceId: id })
   ↓
5. src/components/3d/Device.tsx (第68行)
   {isSelected && <Html><DevicePanel /></Html>}
   ↓
6. 面板显示！
```

**方法2: 修改-观察-理解**
```bash
# 不要只看代码，要动手改！

1. 找到一个你想理解的功能
2. 修改相关代码（改颜色、改数字）
3. 保存文件，观察浏览器变化
4. 理解代码的作用

# 示例：
修改 src/utils/constants.ts 第19行
running: '#00FF00' → running: '#ff00ff'
观察：正常设备变成紫色
理解：这个常量控制设备状态颜色
```

**方法3: 使用浏览器调试**
```bash
# 打开浏览器开发者工具

1. Console标签：
   - 输入 useDeviceStore.getState().devices
   - 查看当前所有设备数据

2. React DevTools（需安装扩展）：
   - 查看组件树
   - 查看props和state
   - 追踪re-render

3. Three.js Inspector（需安装扩展）：
   - 查看场景图
   - 查看物体位置、材质
```

### ✍️ 实践建议

**每日学习计划（建议）**
```
Day 1-3:   阅读 Environment.tsx、Scene.tsx
           实验：修改光照参数
           
Day 4-7:   阅读 Factory.tsx、Device.tsx
           实验：创建新几何体
           
Day 8-11:  阅读 CameraController.tsx、Device.tsx交互部分
           实验：添加点击事件
           
Day 12-15: 阅读 Device.tsx动画部分
           实验：创建旋转动画
           
Day 16-21: 阅读 App.tsx、所有Store文件
           实验：修改数据更新逻辑
```

**学习检查清单**
```
□ 能解释什么是场景、相机、渲染器
□ 能创建基础几何体（盒子、球体、平面）
□ 能修改材质属性（颜色、金属感、粗糙度）
□ 能使用OrbitControls控制相机
□ 能添加点击和悬停事件
□ 能使用useFrame创建动画
□ 能理解项目的状态管理
□ 能独立添加一个新的3D物体
```

---

## 🔗 推荐资源

### 📚 文档
- [Three.js官方文档](https://threejs.org/docs/)
- [React Three Fiber文档](https://docs.pmnd.rs/react-three-fiber)
- [Drei组件库](https://github.com/pmndrs/drei)
- [Zustand文档](https://github.com/pmndrs/zustand)

### 🎥 视频教程
- [Three.js Journey](https://threejs-journey.com/) - 最好的付费课程
- [B站Three.js教程合集](https://www.bilibili.com/video/BV1Gg411X7FY)
- [React Three Fiber教程](https://www.youtube.com/watch?v=DPl34H2ISsk)

### 🛠️ 工具
- [Three.js Editor](https://threejs.org/editor/) - 在线3D编辑器
- [Sketchfab](https://sketchfab.com/) - 3D模型库
- [glTF Viewer](https://gltf-viewer.donmccurdy.com/) - 模型查看器

---

## 💡 常见问题

**Q1: 为什么我的修改没生效？**
- A: Vite有热更新，但有时需要手动刷新浏览器（Ctrl+R）

**Q2: 为什么有些3D物体看不到？**
- A: 检查：1) 位置是否在相机视野内 2) 材质是否有颜色 3) 是否有光照

**Q3: 如何调试3D场景？**
- A: 安装 `@react-three/fiber` DevTools，或在控制台输入 `window.scene`

**Q4: 性能问题如何优化？**
- A: 1) 减少多边形数量 2) 使用Instances 3) 实现LOD 4) 控制更新频率

---

## 🎯 下一步建议

完成上述学习后，你可以尝试：

1. **独立添加新功能**
   - 添加一个新的设备类型
   - 实现设备轨迹动画
   - 添加粒子效果

2. **优化现有功能**
   - 替换简单几何体为真实GLB模型
   - 添加后处理效果（辉光、景深）
   - 优化性能（LOD、Instances）

3. **深入学习**
   - 学习Shader编程（GLSL）
   - 学习物理引擎（Rapier）
   - 学习WebXR（VR/AR）

---

**祝学习愉快！有问题随时问我 🚀**
