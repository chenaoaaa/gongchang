import { useState } from 'react';
import sceneConfig from '../../config/scene.json';
import { getHeatmapColor } from '../../utils/constants';

interface HeatMapProps {
  visible: boolean;
  temperatureData?: Record<string, number>; // zoneId -> temperature
}

const HeatMap = ({ visible, temperatureData = {} }: HeatMapProps) => {
  const { heatMap } = sceneConfig;

  if (!visible) return null;

  return (
    <group>
      {heatMap.zones.map((zone) => {
        const temperature = temperatureData[zone.id] || zone.defaultTemp;
        const color = getHeatmapColor(temperature);

        return (
          <mesh
            key={zone.id}
            position={zone.position as [number, number, number]}
          >
            <boxGeometry args={zone.size as [number, number, number]} />
            <meshBasicMaterial
              color={color}
              opacity={0.3}
              transparent
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default HeatMap;
