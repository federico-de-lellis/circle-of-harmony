import React from 'react';
import { useSequencerStore } from '../../store';

const QUANTIZE_MODES = ['snap', 'spread', 'random'] as const;

export function OffsetControls() {
  const speedOffset = useSequencerStore((s) => s.speedOffset);
  const quantizedOffset = useSequencerStore((s) => s.quantizedOffset);
  const quantizeStrength = useSequencerStore((s) => s.quantizeStrength);
  const quantizeMode = useSequencerStore((s) => s.quantizeMode);
  const freeOffset = useSequencerStore((s) => s.freeOffset);
  const evenOffset = useSequencerStore((s) => s.evenOffset);
  const globalOffset = useSequencerStore((s) => s.globalOffset);
  const setSpeedOffset = useSequencerStore((s) => s.setSpeedOffset);
  const setQuantizedOffset = useSequencerStore((s) => s.setQuantizedOffset);
  const setQuantizeStrength = useSequencerStore((s) => s.setQuantizeStrength);
  const setQuantizeMode = useSequencerStore((s) => s.setQuantizeMode);
  const setFreeOffset = useSequencerStore((s) => s.setFreeOffset);
  const setEvenOffset = useSequencerStore((s) => s.setEvenOffset);
  const setGlobalOffset = useSequencerStore((s) => s.setGlobalOffset);
  const randomizeQuantizedOffset = useSequencerStore((s) => s.randomizeQuantizedOffset);
  const randomizeFreeOffset = useSequencerStore((s) => s.randomizeFreeOffset);

  return (
    <div className="control-section">
      <h3>Offsets</h3>

      {/* Speed Offset */}
      <div className="control-row">
        <span className="control-label">Speed</span>
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(speedOffset * 100)}
          onChange={(e) => setSpeedOffset(Number(e.target.value) / 100)}
          style={{ flex: 1 }}
        />
        <span className="control-value">{speedOffset.toFixed(3)}</span>
      </div>

      {/* Quantized Offset */}
      <div className="control-row">
        <span className="control-label">Quantized</span>
        <input
          type="range"
          min={0}
          max={32}
          step={1}
          value={quantizedOffset}
          onChange={(e) => setQuantizedOffset(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{quantizedOffset}</span>
        <button className="dice" onClick={randomizeQuantizedOffset}>
          🎲
        </button>
      </div>

      {/* Quantize Mode */}
      {quantizedOffset > 0 && (
        <>
          <div className="control-row">
            <span className="control-label">Q. Mode</span>
            <select
              value={quantizeMode}
              onChange={(e) => setQuantizeMode(e.target.value as typeof quantizeMode)}
              style={{ flex: 1 }}
            >
              {QUANTIZE_MODES.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Quantize Strength */}
          <div className="control-row">
            <span className="control-label">Q. Strength</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(quantizeStrength * 100)}
              onChange={(e) => setQuantizeStrength(Number(e.target.value) / 100)}
              style={{ flex: 1 }}
            />
            <span className="control-value">{(quantizeStrength * 100).toFixed(0)}%</span>
          </div>
        </>
      )}

      {/* Free Offset */}
      <div className="control-row">
        <span className="control-label">Free</span>
        <input
          type="range"
          min={-200}
          max={200}
          value={Math.round(freeOffset * 100)}
          onChange={(e) => setFreeOffset(Number(e.target.value) / 100)}
          style={{ flex: 1 }}
        />
        <span className="control-value">{freeOffset.toFixed(3)}</span>
        <button className="dice" onClick={randomizeFreeOffset}>
          🎲
        </button>
      </div>

      {/* Even Offset */}
      <div className="control-row">
        <span className="control-label">Even</span>
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(evenOffset * 100)}
          onChange={(e) => setEvenOffset(Number(e.target.value) / 100)}
          style={{ flex: 1 }}
        />
        <span className="control-value">{evenOffset.toFixed(3)}</span>
      </div>

      {/* Global Offset */}
      <div className="control-row">
        <span className="control-label">Global</span>
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(globalOffset * 100)}
          onChange={(e) => setGlobalOffset(Number(e.target.value) / 100)}
          style={{ flex: 1 }}
        />
        <span className="control-value">{globalOffset.toFixed(3)}</span>
      </div>
    </div>
  );
}
