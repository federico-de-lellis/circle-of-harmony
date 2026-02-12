import React, { useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useSequencerStore } from '../../store';
import { NUM_TRIGGER_BARS } from '../../types';

const TRIGGER_RADIUS_INNER = 0.1;
const TRIGGER_RADIUS_OUTER = 0.93;
const TRIGGER_DOT_RADIUS = 0.03;
const TRIGGER_DOT_POSITION = 0.97; // Just outside the ring

export function TriggerBars() {
  const triggerBars = useSequencerStore((s) => s.triggerBars);

  return (
    <group>
      {triggerBars.map((bar) => (
        <TriggerBar key={bar.index} bar={bar} />
      ))}
    </group>
  );
}

interface TriggerBarProps {
  bar: { index: number; angle: number; active: boolean };
}

function TriggerBar({ bar }: TriggerBarProps) {
  const lineRef = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const dotMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const currentIntensity = useRef(bar.active ? 2 : 0.3);

  const toggle = useCallback(() => {
    useSequencerStore.getState().toggleTriggerBar(bar.index);
  }, [bar.index]);

  // Dot position (on the ring perimeter)
  const dotX = Math.cos(bar.angle) * TRIGGER_DOT_POSITION;
  const dotY = Math.sin(bar.angle) * TRIGGER_DOT_POSITION;

  // Line points (radial from center outward)
  const linePoints = useMemo(() => {
    const innerX = Math.cos(bar.angle) * TRIGGER_RADIUS_INNER;
    const innerY = Math.sin(bar.angle) * TRIGGER_RADIUS_INNER;
    const outerX = Math.cos(bar.angle) * TRIGGER_RADIUS_OUTER;
    const outerY = Math.sin(bar.angle) * TRIGGER_RADIUS_OUTER;
    return [
      new THREE.Vector3(innerX, innerY, 0),
      new THREE.Vector3(outerX, outerY, 0),
    ];
  }, [bar.angle]);

  // Animate glow
  useFrame((_, delta) => {
    if (!dotMaterialRef.current) return;

    const targetIntensity = bar.active ? 2.5 : 0.4;
    currentIntensity.current +=
      (targetIntensity - currentIntensity.current) * Math.min(1, delta * 8);

    const color = new THREE.Color(bar.active ? '#ffaa00' : '#444466');
    color.multiplyScalar(currentIntensity.current);
    dotMaterialRef.current.color.copy(color);
  });

  return (
    <group>
      {/* Trigger bar line (only visible when active) */}
      {bar.active && (
        <Line
          points={linePoints}
          color="#ffaa00"
          lineWidth={1.5}
          transparent
          opacity={0.4}
        />
      )}

      {/* Clickable dot on the perimeter */}
      <mesh
        ref={dotRef}
        position={[dotX, dotY, 0]}
        onClick={toggle}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <circleGeometry args={[TRIGGER_DOT_RADIUS, 24]} />
        <meshBasicMaterial
          ref={dotMaterialRef}
          color={bar.active ? '#ffaa00' : '#444466'}
          toneMapped={false}
        />
      </mesh>

      {/* Ring outline for the dot */}
      <mesh position={[dotX, dotY, -0.01]}>
        <ringGeometry args={[TRIGGER_DOT_RADIUS - 0.003, TRIGGER_DOT_RADIUS + 0.003, 24]} />
        <meshBasicMaterial
          color={bar.active ? '#ffaa00' : '#333344'}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
