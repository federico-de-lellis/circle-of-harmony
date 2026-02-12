import React from 'react';
import { useSequencerStore } from '../../store';
import { GRID_DIVISION_OPTIONS } from '../../types';

export function GridControls() {
  const gridActive = useSequencerStore((s) => s.gridActive);
  const gridDivision = useSequencerStore((s) => s.gridDivision);
  const setGridActive = useSequencerStore((s) => s.setGridActive);
  const setGridDivision = useSequencerStore((s) => s.setGridDivision);

  return (
    <div className="control-section">
      <h3>Grid</h3>

      {/* Grid Active */}
      <div className="control-row">
        <span className="control-label">Grid Active</span>
        <div
          className={`toggle ${gridActive ? 'active' : ''}`}
          onClick={() => setGridActive(!gridActive)}
        />
      </div>

      {/* Grid Division */}
      <div className="control-row">
        <span className="control-label">Division</span>
        <select
          value={gridDivision}
          onChange={(e) => setGridDivision(e.target.value)}
          style={{ flex: 1 }}
          disabled={!gridActive}
        >
          {GRID_DIVISION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
