import { WebMidi } from 'webmidi';
import { useSequencerStore } from '../store';

let midiEnabled = false;

/**
 * Initialize Web MIDI via the webmidi library.
 * Chrome, Edge, Firefox 108+ support this. Safari does NOT.
 * Must be called after a user gesture (click).
 */
export async function initMidi(): Promise<boolean> {
  try {
    await WebMidi.enable();
    midiEnabled = true;
    useSequencerStore.getState().setMidiAvailable(true);
    updateMidiOutputs();

    // Listen for device connection/disconnection
    WebMidi.addListener('connected', updateMidiOutputs);
    WebMidi.addListener('disconnected', updateMidiOutputs);

    console.log('Web MIDI enabled. Outputs:', WebMidi.outputs.map((o) => o.name));
    return true;
  } catch (err) {
    console.warn('Web MIDI could not be enabled:', err);
    useSequencerStore.getState().setMidiAvailable(false);
    useSequencerStore.getState().setMidiError(
      getMidiErrorMessage(err)
    );
    return false;
  }
}

function getMidiErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('SecurityError') || msg.includes('permission')) {
    return 'MIDI permission denied. Allow MIDI access in browser settings.';
  }
  if (msg.includes('not a function') || msg.includes('not supported')) {
    return 'Web MIDI not supported in this browser. Use Chrome, Edge, or Firefox 108+.';
  }
  return `MIDI error: ${msg}`;
}

/**
 * Update the list of available MIDI outputs in the store.
 */
function updateMidiOutputs(): void {
  if (!midiEnabled) return;

  const outputs = WebMidi.outputs.map((output) => ({
    id: output.id,
    name: output.name,
  }));

  useSequencerStore.getState().setMidiOutputs(outputs);

  // Auto-select first output if none selected and outputs available
  const state = useSequencerStore.getState();
  if (!state.midiOutputId && outputs.length > 0) {
    useSequencerStore.getState().setMidiOutputId(outputs[0].id);
  }
}

/**
 * Send MIDI Note On message.
 */
export function sendMidiNoteOn(
  note: number,
  velocity: number,
  channel: number = 1
): void {
  const outputId = useSequencerStore.getState().midiOutputId;
  if (!outputId || !midiEnabled) return;

  const output = WebMidi.getOutputById(outputId);
  if (!output) return;

  output.channels[channel].playNote(note, {
    attack: velocity / 127,
    rawAttack: velocity,
  });
}

/**
 * Send MIDI Note Off message.
 */
export function sendMidiNoteOff(
  note: number,
  channel: number = 1
): void {
  const outputId = useSequencerStore.getState().midiOutputId;
  if (!outputId || !midiEnabled) return;

  const output = WebMidi.getOutputById(outputId);
  if (!output) return;

  output.channels[channel].stopNote(note);
}

/**
 * Send all notes off on a channel (panic).
 */
export function sendAllNotesOff(channel: number = 1): void {
  const outputId = useSequencerStore.getState().midiOutputId;
  if (!outputId || !midiEnabled) return;

  const output = WebMidi.getOutputById(outputId);
  if (!output) return;

  output.channels[channel].sendAllNotesOff();
}

/**
 * Check if Web MIDI is likely supported (without requesting access).
 */
export function isMidiSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess;
}
