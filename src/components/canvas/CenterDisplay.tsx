import React from 'react';
import { Text } from '@react-three/drei';
import { useSequencerStore } from '../../store';

export function CenterDisplay() {
  const bpm = useSequencerStore((s) => s.bpm);
  const rootNote = useSequencerStore((s) => s.rootNote);
  const scaleName = useSequencerStore((s) => s.scaleName);
  const isPlaying = useSequencerStore((s) => s.isPlaying);

  return (
    <group>
      {/* BPM display */}
      <Text
        position={[0, 0.04, 1]}
        fontSize={0.06}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
        /* @ts-expect-error toneMapped exists on material props at runtime */
        toneMapped={false}
      >
        {`${bpm} BPM`}
      </Text>

      {/* Scale info */}
      <Text
        position={[0, -0.02, 1]}
        fontSize={0.025}
        color="#8888a0"
        anchorX="center"
        anchorY="middle"
      >
        {`${rootNote} ${scaleName}`}
      </Text>

      {/* Play state indicator */}
      <Text
        position={[0, -0.06, 1]}
        fontSize={0.018}
        color={isPlaying ? '#00ff88' : '#ff6b35'}
        anchorX="center"
        anchorY="middle"
      >
        {isPlaying ? '▶ PLAYING' : '⏸ PAUSED'}
      </Text>
    </group>
  );
}
