import React, { useMemo } from 'react';
import * as THREE from 'three';

interface RingProps {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity?: number;
  segments?: number;
}

export function Ring({
  innerRadius,
  outerRadius,
  color,
  opacity = 1,
  segments = 128,
}: RingProps) {
  return (
    <mesh>
      <ringGeometry args={[innerRadius, outerRadius, segments]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
