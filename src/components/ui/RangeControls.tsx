import React from 'react';
import { useSequencerStore } from '../../store';
import { midiToNoteName } from '../../music/scales';

export function RangeControls() {
  const minNote = useSequencerStore((s) => s.minNote);
  const maxNote = useSequencerStore((s) => s.maxNote);
  const linkRangeNotes = useSequencerStore((s) => s.linkRangeNotes);
  const setMinNote = useSequencerStore((s) => s.setMinNote);
  const setMaxNote = useSequencerStore((s) => s.setMaxNote);
  const setLinkRangeNotes = useSequencerStore((s) => s.setLinkRangeNotes);

  return (
    <div className="control-section">
      <h3>Note Range</h3>

      {/* Minimum Note */}
      <div className="control-row">
        <span className="control-label">Min Note</span>
        <input
          type="range"
          min={0}
          max={126}
          value={minNote}
          onChange={(e) => setMinNote(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value" style={{ minWidth: 48 }}>
          {midiToNoteName(minNote)}
        </span>
      </div>

      {/* Maximum Note */}
      <div className="control-row">
        <span className="control-label">Max Note</span>
        <input
          type="range"
          min={1}
          max={127}
          value={maxNote}
          onChange={(e) => setMaxNote(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value" style={{ minWidth: 48 }}>
          {midiToNoteName(maxNote)}
        </span>
      </div>

      {/* Link Range */}
      <div className="control-row">
        <span className="control-label">Link Range</span>
        <div
          className={`toggle ${linkRangeNotes ? 'active' : ''}`}
          onClick={() => setLinkRangeNotes(!linkRangeNotes)}
        />
      </div>
    </div>
  );
}
