import React from 'react';
import { useSequencerStore } from '../../store';
import { QUANT_DURATION_OPTIONS } from '../../types';

export function NoteControls() {
  const noteCount = useSequencerStore((s) => s.noteCount);
  const noteDuration = useSequencerStore((s) => s.noteDuration);
  const quantNoteDuration = useSequencerStore((s) => s.quantNoteDuration);
  const quantNoteDurationValue = useSequencerStore((s) => s.quantNoteDurationValue);
  const probability = useSequencerStore((s) => s.probability);
  const setNoteCount = useSequencerStore((s) => s.setNoteCount);
  const setNoteDuration = useSequencerStore((s) => s.setNoteDuration);
  const setQuantNoteDuration = useSequencerStore((s) => s.setQuantNoteDuration);
  const setQuantNoteDurationValue = useSequencerStore((s) => s.setQuantNoteDurationValue);
  const setProbability = useSequencerStore((s) => s.setProbability);
  const randomizeNoteCount = useSequencerStore((s) => s.randomizeNoteCount);
  const randomizeNoteDuration = useSequencerStore((s) => s.randomizeNoteDuration);

  return (
    <div className="control-section">
      <h3>Notes</h3>

      {/* Number of Notes */}
      <div className="control-row">
        <span className="control-label"># Notes</span>
        <input
          type="range"
          min={1}
          max={82}
          value={noteCount}
          onChange={(e) => setNoteCount(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{noteCount}</span>
        <button className="dice" onClick={randomizeNoteCount}>
          🎲
        </button>
      </div>

      {/* Note Duration */}
      <div className="control-row">
        <span className="control-label">Duration</span>
        {quantNoteDuration ? (
          <select
            value={quantNoteDurationValue}
            onChange={(e) => setQuantNoteDurationValue(e.target.value)}
            style={{ flex: 1 }}
          >
            {QUANT_DURATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              type="range"
              min={1}
              max={500}
              value={Math.round(noteDuration * 100)}
              onChange={(e) => setNoteDuration(Number(e.target.value) / 100)}
              style={{ flex: 1 }}
            />
            <span className="control-value">{noteDuration.toFixed(3)}s</span>
          </>
        )}
        <button className="dice" onClick={randomizeNoteDuration}>
          🎲
        </button>
      </div>

      {/* Quantize Duration Toggle */}
      <div className="control-row">
        <span className="control-label">Quant. Duration</span>
        <div
          className={`toggle ${quantNoteDuration ? 'active' : ''}`}
          onClick={() => setQuantNoteDuration(!quantNoteDuration)}
        />
      </div>

      {/* Probability */}
      <div className="control-row">
        <span className="control-label">Probability</span>
        <input
          type="range"
          min={0}
          max={100}
          value={probability}
          onChange={(e) => setProbability(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{probability}%</span>
      </div>
    </div>
  );
}
