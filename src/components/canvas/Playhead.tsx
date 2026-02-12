import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useSequencerStore } from '../../store';

const PLAYHEAD_INNER = 0.05;
const PLAYHEAD_OUTER = 0.93;

export function Playhead() {
  const groupRef = useRef<THREE.Group>(null);
  const isPlaying = useSequencerStore((s) => s.isPlaying);

  useFrame(() => {
    if (!groupRef.current) return;
    const angle = useSequencerStore.getState().playheadAngle;
    groupRef.current.rotation.z = angle;
  });

  const linePoints = useMemo(
    () => [
      new THREE.Vector3(0, PLAYHEAD_INNER, 0),
      new THREE.Vector3(0, PLAYHEAD_OUTER, 0),
    ],
    []
  );

  if (!isPlaying) return null;

  return (
    <group ref={groupRef}>
      {/* Main playhead line */}
      <Line
        points={linePoints}
        color="#00e8ff"
        lineWidth={2}
        toneMapped={false}
      />
      {/* Glow line (wider, more transparent) */}
      <Line
        points={linePoints}
        color="#00e8ff"
        lineWidth={6}
        transparent
        opacity={0.15}
      />
    </group>
  );
}
