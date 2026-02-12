import React from 'react';
import { useSequencerStore } from '../../store';
import { togglePlayback, stopTransport } from '../../audio/engine';

export function TransportControls() {
  const isPlaying = useSequencerStore((s) => s.isPlaying);
  const bpm = useSequencerStore((s) => s.bpm);
  const loopLength = useSequencerStore((s) => s.loopLength);
  const direction = useSequencerStore((s) => s.direction);
  const setBpm = useSequencerStore((s) => s.setBpm);
  const setLoopLength = useSequencerStore((s) => s.setLoopLength);
  const toggleDirection = useSequencerStore((s) => s.toggleDirection);
  const randomizeLoopLength = useSequencerStore((s) => s.randomizeLoopLength);

  return (
    <div className="control-section">
      <h3>Transport</h3>

      {/* Play / Stop / Direction */}
      <div className="control-row">
        <button
          className={isPlaying ? 'active' : 'primary'}
          onClick={togglePlayback}
          style={{ flex: 1 }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={stopTransport} style={{ flex: 1 }}>
          ⏹ Stop
        </button>
        <button
          className={direction === -1 ? 'active' : ''}
          onClick={toggleDirection}
          title="Invert Direction"
          style={{ minWidth: 36 }}
        >
          {direction === 1 ? '↻' : '↺'}
        </button>
      </div>

      {/* BPM */}
      <div className="control-row">
        <span className="control-label">BPM</span>
        <input
          type="range"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{
            width: 52,
            background: '#0a0a0f',
            color: '#e0e0e8',
            border: '1px solid #2a2a3a',
            borderRadius: 4,
            padding: '2px 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            textAlign: 'center',
          }}
        />
      </div>

      {/* Loop Length */}
      <div className="control-row">
        <span className="control-label">Loop Length</span>
        <input
          type="range"
          min={1}
          max={64}
          value={loopLength}
          onChange={(e) => setLoopLength(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{loopLength}</span>
        <button className="dice" onClick={randomizeLoopLength}>
          🎲
        </button>
      </div>
    </div>
  );
}
