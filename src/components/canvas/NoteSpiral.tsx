import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSequencerStore } from '../../store';

// Colors for pitch classes (chromatic: C=0 through B=11)
const PITCH_CLASS_COLORS = [
  '#ff3366', // C - pink/red
  '#ff6633', // C# - orange
  '#ffaa00', // D - amber
  '#ffdd00', // D# - yellow
  '#88ff00', // E - lime
  '#00dd66', // F - green
  '#00ddaa', // F# - teal
  '#00aaff', // G - blue
  '#0066ff', // G# - deep blue
  '#6633ff', // A - purple
  '#aa33ff', // A# - violet
  '#ff33aa', // B - magenta
];

const TRIGGERED_SCALE = 1.8;
const NORMAL_SCALE = 1;
const SELECTED_SCALE = 1.3;

export function NoteSpiral() {
  const notes = useSequencerStore((s) => s.notes);
  const triggeredIndices = useSequencerStore((s) => s.triggeredNoteIndices);

  return (
    <group>
      {notes.map((note) => (
        <NoteDot
          key={note.index}
          index={note.index}
          midi={note.midi}
          angle={note.angle}
          radius={note.radius}
          selected={note.selected}
          triggered={triggeredIndices.has(note.index)}
        />
      ))}
    </group>
  );
}

interface NoteDotProps {
  index: number;
  midi: number;
  angle: number;
  radius: number;
  selected: boolean;
  triggered: boolean;
}

function NoteDot({ index, midi, angle, radius, selected, triggered }: NoteDotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const currentScale = useRef(NORMAL_SCALE);
  const currentEmissiveIntensity = useRef(0);

  const pitchClass = midi % 12;
  const baseColor = PITCH_CLASS_COLORS[pitchClass];

  // Position on the circle
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const toggleSelection = useCallback(() => {
    useSequencerStore.getState().toggleNoteSelection(index);
  }, [index]);

  // Animate scale and glow on trigger
  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const targetScale = triggered
      ? TRIGGERED_SCALE
      : selected
        ? SELECTED_SCALE
        : NORMAL_SCALE;

    // Spring-like interpolation
    currentScale.current += (targetScale - currentScale.current) * Math.min(1, delta * 12);
    meshRef.current.scale.setScalar(currentScale.current);

    // For bloom: use color intensity > 1 for triggered notes
    const targetIntensity = triggered ? 3 : selected ? 1.5 : 0.8;
    currentEmissiveIntensity.current +=
      (targetIntensity - currentEmissiveIntensity.current) * Math.min(1, delta * 10);

    const color = new THREE.Color(baseColor);
    color.multiplyScalar(currentEmissiveIntensity.current);
    materialRef.current.color.copy(color);
  });

  return (
    <mesh
      ref={meshRef}
      position={[x, y, 0]}
      onClick={toggleSelection}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <circleGeometry args={[0.018, 16]} />
      <meshBasicMaterial
        ref={materialRef}
        color={baseColor}
        toneMapped={false}
      />
    </mesh>
  );
}
