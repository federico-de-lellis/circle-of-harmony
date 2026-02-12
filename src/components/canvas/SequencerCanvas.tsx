import React, { useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Ring } from './Ring';
import { NoteSpiral } from './NoteSpiral';
import { NoteConnections } from './NoteConnections';
import { TriggerBars } from './TriggerBars';
import { Playhead } from './Playhead';
import { CenterDisplay } from './CenterDisplay';
import { useSequencerStore } from '../../store';

interface SequencerCanvasProps {
  width?: number;
  height?: number;
}

export function SequencerCanvas({ width, height }: SequencerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const showConnections = useSequencerStore((s) => s.showConnections);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#0a0a0f' }}
    >
      <Canvas
        orthographic
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#0a0a0f' }}
      >
        <OrthographicCamera
          makeDefault
          zoom={280}
          position={[0, 0, 100]}
          near={0.1}
          far={1000}
        />

        <color attach="background" args={['#0a0a0f']} />

        {/* Main sequencer ring — visible outline */}
        <Ring innerRadius={0.92} outerRadius={0.93} color="#334" />
        {/* Outer glow ring */}
        <Ring innerRadius={0.90} outerRadius={0.95} color="#1a1a2e" opacity={0.4} />

        {/* Inner subtle ring */}
        <Ring innerRadius={0.13} outerRadius={0.135} color="#334" />

        {/* Note connection lines */}
        {showConnections && <NoteConnections />}

        {/* Note dots on spiral */}
        <NoteSpiral />

        {/* 8 Trigger bars around the perimeter */}
        <TriggerBars />

        {/* Rotating playhead */}
        <Playhead />

        {/* Center BPM / Info display */}
        <CenterDisplay />

        {/* Post-processing: Bloom glow */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={1.2}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
