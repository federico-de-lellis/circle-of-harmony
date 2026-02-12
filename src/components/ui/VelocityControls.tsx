import React from 'react';
import { useSequencerStore } from '../../store';

export function VelocityControls() {
  const randomVelocity = useSequencerStore((s) => s.randomVelocity);
  const vMin = useSequencerStore((s) => s.vMin);
  const vMax = useSequencerStore((s) => s.vMax);
  const setRandomVelocity = useSequencerStore((s) => s.setRandomVelocity);
  const setVMin = useSequencerStore((s) => s.setVMin);
  const setVMax = useSequencerStore((s) => s.setVMax);

  return (
    <div className="control-section">
      <h3>Velocity</h3>

      {/* Random Velocity Toggle */}
      <div className="control-row">
        <span className="control-label">Random</span>
        <div
          className={`toggle ${randomVelocity ? 'active' : ''}`}
          onClick={() => setRandomVelocity(!randomVelocity)}
        />
      </div>

      {/* V.MIN */}
      <div className="control-row">
        <span className="control-label">V.MIN</span>
        <input
          type="range"
          min={0}
          max={127}
          value={vMin}
          onChange={(e) => setVMin(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{vMin}</span>
      </div>

      {/* V.MAX */}
      <div className="control-row">
        <span className="control-label">V.MAX</span>
        <input
          type="range"
          min={0}
          max={127}
          value={vMax}
          onChange={(e) => setVMax(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{vMax}</span>
      </div>
    </div>
  );
}
