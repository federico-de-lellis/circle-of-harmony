import React from 'react';
import { useSequencerStore } from '../../store';
import { initMidi } from '../../audio/midi';

export function MidiSettings() {
  const midiAvailable = useSequencerStore((s) => s.midiAvailable);
  const midiOutputs = useSequencerStore((s) => s.midiOutputs);
  const midiOutputId = useSequencerStore((s) => s.midiOutputId);
  const midiChannel = useSequencerStore((s) => s.midiChannel);
  const midiError = useSequencerStore((s) => s.midiError);
  const setMidiOutputId = useSequencerStore((s) => s.setMidiOutputId);
  const setMidiChannel = useSequencerStore((s) => s.setMidiChannel);

  const handleRetryMidi = async () => {
    await initMidi();
  };

  if (!midiAvailable) {
    return (
      <div className="control-section">
        <h3>MIDI Output</h3>

        {midiError && (
          <div className="control-row">
            <span className="control-label" style={{ color: '#f66', fontSize: 10, whiteSpace: 'normal', lineHeight: 1.4 }}>
              {midiError}
            </span>
          </div>
        )}

        <div className="control-row">
          <button onClick={handleRetryMidi} style={{ flex: 1 }}>
            Enable MIDI
          </button>
        </div>

        <div className="control-row">
          <span className="control-label" style={{ color: '#888', fontSize: 9, whiteSpace: 'normal', lineHeight: 1.4 }}>
            <strong>macOS:</strong> Open Audio MIDI Setup → Window → Show MIDI Studio → enable IAC Driver.{' '}
            <strong>Windows:</strong> Install loopMIDI or connect a MIDI device.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="control-section">
      <h3>MIDI Output</h3>

      {midiError && (
        <div className="control-row">
          <span className="control-label" style={{ color: '#f66', fontSize: 10, whiteSpace: 'normal', lineHeight: 1.4 }}>
            {midiError}
          </span>
        </div>
      )}

      {/* Output Device */}
      <div className="control-row">
        <span className="control-label">Device</span>
        <select
          value={midiOutputId ?? ''}
          onChange={(e) => setMidiOutputId(e.target.value || null)}
          style={{ flex: 1 }}
        >
          <option value="">None</option>
          {midiOutputs.map((output) => (
            <option key={output.id} value={output.id}>
              {output.name}
            </option>
          ))}
        </select>
      </div>

      {midiOutputs.length === 0 && (
        <div className="control-row">
          <span className="control-label" style={{ color: '#aa8', fontSize: 9, whiteSpace: 'normal', lineHeight: 1.4 }}>
            No MIDI outputs found. Connect a device or enable a virtual MIDI port, then click Refresh.
          </span>
        </div>
      )}

      {/* Channel */}
      <div className="control-row">
        <span className="control-label">Channel</span>
        <input
          type="range"
          min={1}
          max={16}
          value={midiChannel}
          onChange={(e) => setMidiChannel(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="control-value">{midiChannel}</span>
      </div>

      <div className="control-row">
        <button onClick={handleRetryMidi} style={{ flex: 1 }}>
          Refresh MIDI
        </button>
      </div>
    </div>
  );
}
