import React, { useMemo, useState } from 'react';
import { useSequencerStore } from '../../store';
import { getAvailableScales, getCommonScales } from '../../music/scales';
import { getCollectionNames, getRandomCollection } from '../../music/collections';
import { ROOT_NOTES } from '../../types';
import { PianoRoll } from './PianoRoll';

export function ScaleControls() {
  const rootNote = useSequencerStore((s) => s.rootNote);
  const scaleName = useSequencerStore((s) => s.scaleName);
  const noteCollectionName = useSequencerStore((s) => s.noteCollectionName);
  const octaveTranspose = useSequencerStore((s) => s.octaveTranspose);
  const setRootNote = useSequencerStore((s) => s.setRootNote);
  const setScaleName = useSequencerStore((s) => s.setScaleName);
  const setNoteCollectionName = useSequencerStore((s) => s.setNoteCollectionName);
  const setOctaveTranspose = useSequencerStore((s) => s.setOctaveTranspose);
  const [pianoRollEnabled, setPianoRollEnabled] = useState(false);

  const scales = useMemo(() => {
    const common = getCommonScales();
    const all = getAvailableScales();
    // Show common first, then any remaining
    const remaining = all.filter((s) => !common.includes(s));
    return [...common, ...remaining];
  }, []);

  const collections = useMemo(() => getCollectionNames(), []);

  const handleRandomCollection = () => {
    const col = getRandomCollection();
    setNoteCollectionName(col.name);
  };

  return (
    <div className="control-section">
      <h3>Scale & Harmony</h3>

      {/* Root Note */}
      <div className="control-row">
        <span className="control-label">Root</span>
        <select
          value={rootNote}
          onChange={(e) => setRootNote(e.target.value)}
          style={{ flex: 1 }}
        >
          {ROOT_NOTES.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>

      {/* Piano Roll Toggle */}
      <div className="control-row">
        <span className="control-label">Piano Roll</span>
        <div
          className={`toggle ${pianoRollEnabled ? 'active' : ''}`}
          onClick={() => setPianoRollEnabled(!pianoRollEnabled)}
        />
      </div>

      {/* Piano Roll */}
      <PianoRoll enabled={pianoRollEnabled} />

      {/* Scale */}
      <div className="control-row">
        <span className="control-label">Scale</span>
        <select
          value={scaleName}
          onChange={(e) => setScaleName(e.target.value)}
          style={{ flex: 1 }}
        >
          {scales.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Note Collection */}
      <div className="control-row">
        <span className="control-label">Collection</span>
        <select
          value={noteCollectionName}
          onChange={(e) => setNoteCollectionName(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="Default">Default</option>
          {collections.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="dice" onClick={handleRandomCollection}>
          🎲
        </button>
      </div>

      {/* Octave Transpose */}
      <div className="control-row">
        <span className="control-label">Octave</span>
        <input
          type="range"
          min={-3}
          max={3}
          step={1}
          value={octaveTranspose}
          onChange={(e) => setOctaveTranspose(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{octaveTranspose > 0 ? `+${octaveTranspose}` : octaveTranspose}</span>
      </div>
    </div>
  );
}
