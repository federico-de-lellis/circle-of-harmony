// ─── Core Musical Types ────────────────────────────────────────

export interface NoteEvent {
  /** MIDI note number (0-127) */
  midi: number;
  /** Note name e.g. "C4" */
  name: string;
  /** Velocity (0-127) */
  velocity: number;
  /** Duration in seconds (or loop-relative if quantized) */
  duration: number;
  /** Probability of triggering (0-1) */
  probability: number;
}

export interface NoteOnSpiral {
  /** Unique index in the spiral */
  index: number;
  /** MIDI note number */
  midi: number;
  /** Note name */
  name: string;
  /** Angle in radians on the spiral */
  angle: number;
  /** Radius (distance from center, 0-1 normalized) */
  radius: number;
  /** Whether this note is currently selected */
  selected: boolean;
  /** Whether this note is currently being triggered (for visual flash) */
  triggered: boolean;
}

export interface TriggerBar {
  /** Index 0-7 */
  index: number;
  /** Angle in radians where this bar sits */
  angle: number;
  /** Whether this trigger bar is active */
  active: boolean;
}

export interface NoteCollection {
  /** Display name */
  name: string;
  /** Intervals from root, e.g. ["1P", "3M", "5P"] */
  intervals: string[];
}

// ─── Sequencer Parameters ──────────────────────────────────────

export interface SequencerParams {
  // Transport
  isPlaying: boolean;
  bpm: number;
  loopLength: number; // in beats
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise

  // Notes
  noteCount: number; // 1-82
  noteDuration: number; // in seconds
  quantNoteDuration: boolean; // if true, duration is loop-relative
  quantNoteDurationValue: string; // e.g. "1/1", "1/2", "1/4"

  // Scale / Theory
  rootNote: string; // "C", "C#", "D", etc.
  scaleName: string;
  noteCollectionName: string;
  octaveTranspose: number; // -2 to +2
  minNote: number; // MIDI number
  maxNote: number; // MIDI number
  linkRangeNotes: boolean;

  // Offsets
  speedOffset: number; // -1.0 to 1.0
  quantizedOffset: number; // integer
  freeOffset: number; // float
  evenOffset: number; // float
  globalOffset: number; // float

  // Grid
  gridActive: boolean;
  gridDivision: string; // "1/4", "1/8", "1/16" etc.

  // Probability
  probability: number; // 0-100

  // Velocity
  randomVelocity: boolean;
  vMin: number; // 0-127
  vMax: number; // 0-127
}

// ─── Trigger Bars ──────────────────────────────────────────────

export const NUM_TRIGGER_BARS = 8;

// ─── Scale & Root Constants ────────────────────────────────────

export const ROOT_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type RootNote = (typeof ROOT_NOTES)[number];

export const QUANT_DURATION_OPTIONS = [
  '1/1', '1/2', '1/4', '1/8', '1/16', '1/32',
] as const;

export const GRID_DIVISION_OPTIONS = [
  '1/1', '1/2', '1/4', '1/8', '1/16', '1/32',
] as const;

// ─── MIDI Output ───────────────────────────────────────────────

export interface MidiOutputDevice {
  id: string;
  name: string;
}
