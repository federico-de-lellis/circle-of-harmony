import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSequencerStore } from '../../store';

// Match the pitch-class colors from NoteSpiral
const PITCH_CLASS_COLORS = [
  '#ff3366', '#ff6633', '#ffaa00', '#ffdd00',
  '#88ff00', '#00dd66', '#00ddaa', '#00aaff',
  '#0066ff', '#6633ff', '#aa33ff', '#ff33aa',
];

/**
 * Draws lines connecting each note to the next note in index order,
 * forming intricate geometric patterns across the spiral.
 */
export function NoteConnections() {
  const notes = useSequencerStore((s) => s.notes);
  const triggeredIndices = useSequencerStore((s) => s.triggeredNoteIndices);
  const lineRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  // Build the geometry from note positions
  const { positions, colors } = useMemo(() => {
    if (notes.length < 2) return { positions: new Float32Array(0), colors: new Float32Array(0) };

    // Each connection = 2 vertices = 6 floats for position, 6 for color
    const segmentCount = notes.length - 1;
    const pos = new Float32Array(segmentCount * 6);
    const col = new Float32Array(segmentCount * 6);

    for (let i = 0; i < segmentCount; i++) {
      const a = notes[i];
      const b = notes[i + 1];

      const ax = Math.cos(a.angle) * a.radius;
      const ay = Math.sin(a.angle) * a.radius;
      const bx = Math.cos(b.angle) * b.radius;
      const by = Math.sin(b.angle) * b.radius;

      const offset = i * 6;
      pos[offset] = ax;
      pos[offset + 1] = ay;
      pos[offset + 2] = -0.01; // slightly behind notes
      pos[offset + 3] = bx;
      pos[offset + 4] = by;
      pos[offset + 5] = -0.01;

      // Color: blend between the two notes' pitch class colors
      const colorA = new THREE.Color(PITCH_CLASS_COLORS[a.midi % 12]);
      const colorB = new THREE.Color(PITCH_CLASS_COLORS[b.midi % 12]);

      col[offset] = colorA.r;
      col[offset + 1] = colorA.g;
      col[offset + 2] = colorA.b;
      col[offset + 3] = colorB.r;
      col[offset + 4] = colorB.g;
      col[offset + 5] = colorB.b;
    }

    return { positions: pos, colors: col };
  }, [notes]);

  // Animate opacity: brighten lines connected to triggered notes
  useFrame((_, delta) => {
    if (!materialRef.current) return;
    // Subtle pulse based on whether anything is triggered
    const hasTriggered = triggeredIndices.size > 0;
    const targetOpacity = hasTriggered ? 0.5 : 0.25;
    materialRef.current.opacity +=
      (targetOpacity - materialRef.current.opacity) * Math.min(1, delta * 8);
  });

  if (positions.length === 0) return null;

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={materialRef}
        vertexColors
        transparent
        opacity={0.25}
        toneMapped={false}
        depthWrite={false}
      />
    </lineSegments>
  );
}
