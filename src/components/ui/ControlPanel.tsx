import React from 'react';
import { useSequencerStore } from '../../store';
import { TransportControls } from './TransportControls';
import { ScaleControls } from './ScaleControls';
import { OffsetControls } from './OffsetControls';
import { NoteControls } from './NoteControls';
import { RangeControls } from './RangeControls';
import { VelocityControls } from './VelocityControls';
import { GridControls } from './GridControls';
import { MidiSettings } from './MidiSettings';

function VisualControls() {
  const showConnections = useSequencerStore((s) => s.showConnections);
  const setShowConnections = useSequencerStore((s) => s.setShowConnections);
  return (
    <div className="control-section">
      <h3>Visual</h3>
      <div className="control-row">
        <span className="control-label">Note Lines</span>
        <div
          className={`toggle ${showConnections ? 'active' : ''}`}
          onClick={() => setShowConnections(!showConnections)}
        />
      </div>
    </div>
  );
}

export function ControlPanel() {
  const randomizeAll = useSequencerStore((s) => s.randomizeAll);

  return (
    <div className="control-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e8', margin: 0 }}>
          Circle of Harmony
        </h2>
        <button
          className="primary"
          onClick={randomizeAll}
          title="Randomize all parameters"
          style={{ fontSize: 11, padding: '4px 10px' }}
        >
          🎲 Global Random
        </button>
      </div>

      <TransportControls />
      <ScaleControls />
      <NoteControls />
      <OffsetControls />
      <RangeControls />
      <VelocityControls />
      <GridControls />
      <VisualControls />
      <MidiSettings />
    </div>
  );
}
