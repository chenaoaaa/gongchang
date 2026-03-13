/**
 * BuildingFacade.tsx — 单面建筑立面（高性能版）
 *
 * 性能优化:
 *  - 面板分缝线 + 窗框全部烘焙进 CanvasTexture（1个 draw call）
 *  - 每面立面只有 2 个 mesh：墙体 + 玻璃窗平面
 *  - 彻底消除 z-fighting（无共面几何体）
 *
 * 视觉还原:
 *  1. 橙红色墙面底色
 *  2. 对角线面板分缝线（菱形纹理）
 *  3. 窗户网格（深色窗框 + 内凹阴影）
 *  4. 半透明玻璃（独立 mesh）
 */

import { useMemo } from 'react';
import * as THREE from 'three';

// ─── 类型定义 ──────────────────────────────────
interface FacadeProps {
  /** 立面宽度（米） */
  width: number;
  /** 立面高度（米） */
  height: number;
  /** 墙体厚度（米），默认 0.3 */
  thickness?: number;
  /** 墙面底色 */
  wallColor?: string;
  /** 窗户行数，默认 2 */
  windowRows?: number;
  /** 窗户列数，默认自适应 */
  windowCols?: number;
}

// ─── 常量 ────────────────────────────────────────
const TEXTURE_SCALE = 64; // 每米对应的像素数
const PANEL_SIZE = 2.8;   // 每块面板尺寸（米）

// ─── Canvas 纹理生成 ────────────────────────────

/** 在 Canvas 上绘制完整的立面纹理（墙色 + 分缝线 + 窗框） */
function createFacadeTexture(
  facadeW: number,
  facadeH: number,
  wallColor: string,
  windowRows: number,
  windowCols: number
): { wallTexture: THREE.CanvasTexture; windowRects: Array<{ x: number; y: number; w: number; h: number }> } {
  const pixelW = Math.round(facadeW * TEXTURE_SCALE);
  const pixelH = Math.round(facadeH * TEXTURE_SCALE);

  const canvas = document.createElement('canvas');
  canvas.width = pixelW;
  canvas.height = pixelH;
  const ctx = canvas.getContext('2d')!;

  // 1. 填充墙面底色
  ctx.fillStyle = wallColor;
  ctx.fillRect(0, 0, pixelW, pixelH);

  // 2. 绘制面板分缝线
  const panelCols = Math.max(1, Math.ceil(facadeW / PANEL_SIZE));
  const panelRows = Math.max(1, Math.ceil(facadeH / PANEL_SIZE));
  const panelPxW = pixelW / panelCols;
  const panelPxH = pixelH / panelRows;

  // 分缝线颜色（比底色暗一些）
  const c = new THREE.Color(wallColor);
  c.multiplyScalar(0.65);
  const seamColor = '#' + c.getHexString();

  ctx.strokeStyle = seamColor;
  ctx.lineWidth = 2;

  // 水平网格线
  for (let r = 0; r <= panelRows; r++) {
    const py = r * panelPxH;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(pixelW, py);
    ctx.stroke();
  }
  // 垂直网格线
  for (let cc = 0; cc <= panelCols; cc++) {
    const px = cc * panelPxW;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, pixelH);
    ctx.stroke();
  }
  // 对角线
  ctx.lineWidth = 1.5;
  for (let r = 0; r < panelRows; r++) {
    for (let cc = 0; cc < panelCols; cc++) {
      const x0 = cc * panelPxW;
      const y0 = r * panelPxH;
      const x1 = x0 + panelPxW;
      const y1 = y0 + panelPxH;
      // /
      ctx.beginPath();
      ctx.moveTo(x0, y1);
      ctx.lineTo(x1, y0);
      ctx.stroke();
      // \
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }

  // 3. 计算窗户位置并绘制窗框
  const marginX = facadeW * 0.08;
  const marginTop = facadeH * 0.08;
  const marginBottom = facadeH * 0.12;
  const availW = facadeW - marginX * 2;
  const availH = facadeH - marginTop - marginBottom;
  const spacingX = availW / windowCols;
  const spacingY = availH / windowRows;
  const winW = spacingX * 0.55;
  const winH = spacingY * 0.55;

  const windowRects: Array<{ x: number; y: number; w: number; h: number }> = [];

  for (let r = 0; r < windowRows; r++) {
    for (let cc = 0; cc < windowCols; cc++) {
      // 世界坐标（原点左下角）
      const wx = -facadeW / 2 + marginX + spacingX * (cc + 0.5);
      const wy = facadeH - marginTop - spacingY * (r + 0.5);
      windowRects.push({ x: wx, y: wy, w: winW, h: winH });

      // 像素坐标（Canvas 原点左上角）
      const pxX = (marginX + spacingX * (cc + 0.5) - winW / 2) * TEXTURE_SCALE;
      const pxY = (marginTop + spacingY * (r + 0.5) - winH / 2) * TEXTURE_SCALE;
      const pxW = winW * TEXTURE_SCALE;
      const pxH = winH * TEXTURE_SCALE;

      // 窗洞深色背景
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(pxX - 4, pxY - 4, pxW + 8, pxH + 8);

      // 窗户内部（暗灰色模拟内凹）
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(pxX, pxY, pxW, pxH);

      // 窗框（黑色粗边）
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 5;
      ctx.strokeRect(pxX - 2, pxY - 2, pxW + 4, pxH + 4);

      // 窗户十字分隔线
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pxX + pxW / 2, pxY);
      ctx.lineTo(pxX + pxW / 2, pxY + pxH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pxX, pxY + pxH / 2);
      ctx.lineTo(pxX + pxW, pxY + pxH / 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  return { wallTexture: texture, windowRects };
}

// ─── 主组件 ──────────────────────────────────────

const BuildingFacade = ({
  width,
  height,
  thickness = 0.3,
  wallColor = '#C94B1F',
  windowRows = 2,
  windowCols,
}: FacadeProps) => {
  const cols = windowCols ?? Math.max(2, Math.round(width / 5));

  // 生成纹理 + 窗口位置（仅在参数变化时重新计算）
  const { wallTexture, windowRects } = useMemo(
    () => createFacadeTexture(width, height, wallColor, windowRows, cols),
    [width, height, wallColor, windowRows, cols]
  );

  return (
    <group>
      {/* ═══ 墙体（1个 mesh，含烘焙纹理） ═══ */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial
          map={wallTexture}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* ═══ 窗户玻璃（独立 mesh，半透明） ═══ */}
      {windowRects.map((win, i) => (
        <mesh
          key={`glass-${i}`}
          position={[win.x, win.y, thickness / 2 + 0.02]}
        >
          <planeGeometry args={[win.w * 0.92, win.h * 0.92]} />
          <meshStandardMaterial
            color="#6090a8"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default BuildingFacade;
