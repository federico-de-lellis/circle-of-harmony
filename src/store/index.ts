import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { TriggerBar, NoteOnSpiral, MidiOutputDevice } from '../types';
import { NUM_TRIGGER_BARS } from '../types';

// ─── Helper: random in range ──────────────────────────────────

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// ─── Initial trigger bars (8 evenly spaced) ───────────────────

function createInitialTriggerBars(): TriggerBar[] {
  return Array.from({ length: NUM_TRIGGER_BARS }, (_, i) => ({
    index: i,
    angle: (i / NUM_TRIGGER_BARS) * Math.PI * 2,
    active: i === 0, // only first trigger bar active at start
  }));
}

// ─── Store Interface ───────────────────────────────────────────

export interface SequencerStore {
  // Transport
  isPlaying: boolean;
  bpm: number;
  loopLength: number;
  direction: 1 | -1;

  // Notes
  noteCount: number;
  noteDuration: number;
  quantNoteDuration: boolean;
  quantNoteDurationValue: string;

  // Scale / Theory
  rootNote: string;
  scaleName: string;
  noteCollectionName: string;
  octaveTranspose: number;
  minNote: number;
  maxNote: number;
  linkRangeNotes: boolean;

  // Offsets
  speedOffset: number;
  quantizedOffset: number;
  quantizeStrength: number; // 0-1: blend between free and quantized angle
  quantizeMode: 'snap' | 'spread' | 'random'; // how quantize distributes notes
  freeOffset: number;
  evenOffset: number;
  globalOffset: number;

  // Grid
  gridActive: boolean;
  gridDivision: string;

  // Probability
  probability: number;

  // Velocity
  randomVelocity: boolean;
  vMin: number;
  vMax: number;

  // Trigger Bars
  triggerBars: TriggerBar[];

  // Notes on spiral (computed from params)
  notes: NoteOnSpiral[];

  // Visual feedback - which notes are currently triggered
  triggeredNoteIndices: Set<number>;

  // Current playhead angle (radians)
  playheadAngle: number;

  // Audio started (user gesture received)
  audioStarted: boolean;

  // Visual options
  showConnections: boolean;

  // MIDI
  midiOutputId: string | null;
  midiChannel: number;
  midiAvailable: boolean;
  midiOutputs: MidiOutputDevice[];
  midiError: string | null;

  // ─── Actions ──────────────────────────────────────────────

  // Transport
  setPlaying: (playing: boolean) => void;
  setBpm: (bpm: number) => void;
  setLoopLength: (length: number) => void;
  toggleDirection: () => void;
  setAudioStarted: (started: boolean) => void;
  setShowConnections: (show: boolean) => void;

  // Notes
  setNoteCount: (count: number) => void;
  setNoteDuration: (duration: number) => void;
  setQuantNoteDuration: (enabled: boolean) => void;
  setQuantNoteDurationValue: (value: string) => void;

  // Scale
  setRootNote: (root: string) => void;
  setScaleName: (scale: string) => void;
  setNoteCollectionName: (name: string) => void;
  setOctaveTranspose: (octave: number) => void;
  setMinNote: (midi: number) => void;
  setMaxNote: (midi: number) => void;
  setLinkRangeNotes: (linked: boolean) => void;

  // Offsets
  setSpeedOffset: (offset: number) => void;
  setQuantizedOffset: (offset: number) => void;
  setQuantizeStrength: (strength: number) => void;
  setQuantizeMode: (mode: 'snap' | 'spread' | 'random') => void;
  setFreeOffset: (offset: number) => void;
  setEvenOffset: (offset: number) => void;
  setGlobalOffset: (offset: number) => void;

  // Grid
  setGridActive: (active: boolean) => void;
  setGridDivision: (division: string) => void;

  // Probability & Velocity
  setProbability: (prob: number) => void;
  setRandomVelocity: (random: boolean) => void;
  setVMin: (v: number) => void;
  setVMax: (v: number) => void;

  // Trigger bars
  toggleTriggerBar: (index: number) => void;

  // Notes
  setNotes: (notes: NoteOnSpiral[]) => void;
  toggleNoteSelection: (index: number) => void;
  selectNotesInRange: (indices: number[]) => void;
  clearSelection: () => void;

  // Visual feedback
  setTriggeredNotes: (indices: Set<number>) => void;
  setPlayheadAngle: (angle: number) => void;

  // MIDI
  setMidiOutputId: (id: string | null) => void;
  setMidiChannel: (channel: number) => void;
  setMidiAvailable: (available: boolean) => void;
  setMidiOutputs: (outputs: MidiOutputDevice[]) => void;
  setMidiError: (error: string | null) => void;

  // Randomizers
  randomizeNoteCount: () => void;
  randomizeLoopLength: () => void;
  randomizeQuantizedOffset: () => void;
  randomizeFreeOffset: () => void;
  randomizeNoteDuration: () => void;
  randomizeNoteCollection: () => void;
  randomizeAll: () => void;
}

// ─── Available scales list (for randomizer) ────────────────────

const COMMON_SCALES = [
  'major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian',
  'aeolian', 'locrian', 'harmonic minor', 'melodic minor',
  'major pentatonic', 'minor pentatonic', 'blues',
  'whole tone', 'diminished', 'chromatic',
];

const ROOT_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const LOOP_LENGTH_OPTIONS = [2, 4, 8, 16, 32];

// ─── Create Store ──────────────────────────────────────────────

export const useSequencerStore = create<SequencerStore>()(
  subscribeWithSelector((set, get) => ({
    // Transport defaults
    isPlaying: false,
    bpm: 120,
    loopLength: 8,
    direction: 1,

    // Note defaults
    noteCount: 16,
    noteDuration: 0.3,
    quantNoteDuration: false,
    quantNoteDurationValue: '1/4',

    // Scale defaults
    rootNote: 'C',
    scaleName: 'minor pentatonic',
    noteCollectionName: 'Default',
    octaveTranspose: 0,
    minNote: 48, // C3
    maxNote: 84, // C6
    linkRangeNotes: false,

    // Offset defaults
    speedOffset: 0,
    quantizedOffset: 0,
    quantizeStrength: 1,
    quantizeMode: 'snap' as const,
    freeOffset: 0,
    evenOffset: 0,
    globalOffset: 0,

    // Grid defaults
    gridActive: false,
    gridDivision: '1/8',

    // Probability
    probability: 100,

    // Velocity
    randomVelocity: false,
    vMin: 60,
    vMax: 127,

    // Trigger bars
    triggerBars: createInitialTriggerBars(),

    // Notes
    notes: [],
    triggeredNoteIndices: new Set<number>(),
    playheadAngle: 0,

    // Audio
    audioStarted: false,

    // Visual options
    showConnections: true,

    // MIDI
    midiOutputId: null,
    midiChannel: 1,
    midiAvailable: false,
    midiOutputs: [],
    midiError: null,

    // ─── Action Implementations ──────────────────────────────

    setPlaying: (playing) => set({ isPlaying: playing }),
    setBpm: (bpm) => set({ bpm: Math.max(20, Math.min(300, bpm)) }),
    setLoopLength: (length) => set({ loopLength: Math.max(1, Math.min(64, length)) }),
    toggleDirection: () => set((s) => ({ direction: s.direction === 1 ? -1 : 1 })),
    setAudioStarted: (started) => set({ audioStarted: started }),
    setShowConnections: (show) => set({ showConnections: show }),

    setNoteCount: (count) => set({ noteCount: Math.max(1, Math.min(82, count)) }),
    setNoteDuration: (duration) => set({ noteDuration: Math.max(0.01, Math.min(10, duration)) }),
    setQuantNoteDuration: (enabled) => set({ quantNoteDuration: enabled }),
    setQuantNoteDurationValue: (value) => set({ quantNoteDurationValue: value }),

    setRootNote: (root) => set({ rootNote: root }),
    setScaleName: (scale) => set({ scaleName: scale }),
    setNoteCollectionName: (name) => set({ noteCollectionName: name }),
    setOctaveTranspose: (octave) => set({ octaveTranspose: Math.max(-3, Math.min(3, octave)) }),
    setMinNote: (midi) => {
      const state = get();
      const newMin = Math.max(0, Math.min(127, midi));
      if (state.linkRangeNotes) {
        const range = state.maxNote - state.minNote;
        set({ minNote: newMin, maxNote: Math.min(127, newMin + range) });
      } else {
        set({ minNote: newMin });
      }
    },
    setMaxNote: (midi) => {
      const state = get();
      const newMax = Math.max(0, Math.min(127, midi));
      if (state.linkRangeNotes) {
        const range = state.maxNote - state.minNote;
        set({ maxNote: newMax, minNote: Math.max(0, newMax - range) });
      } else {
        set({ maxNote: newMax });
      }
    },
    setLinkRangeNotes: (linked) => set({ linkRangeNotes: linked }),

    setSpeedOffset: (offset) => set({ speedOffset: Math.max(-1, Math.min(1, offset)) }),
    setQuantizedOffset: (offset) => set({ quantizedOffset: Math.max(0, Math.min(32, Math.round(offset))) }),
    setQuantizeStrength: (strength) => set({ quantizeStrength: Math.max(0, Math.min(1, strength)) }),
    setQuantizeMode: (mode) => set({ quantizeMode: mode }),
    setFreeOffset: (offset) => set({ freeOffset: offset }),
    setEvenOffset: (offset) => set({ evenOffset: offset }),
    setGlobalOffset: (offset) => set({ globalOffset: offset }),

    setGridActive: (active) => set({ gridActive: active }),
    setGridDivision: (division) => set({ gridDivision: division }),

    setProbability: (prob) => set({ probability: Math.max(0, Math.min(100, prob)) }),
    setRandomVelocity: (random) => set({ randomVelocity: random }),
    setVMin: (v) => set({ vMin: Math.max(0, Math.min(127, v)) }),
    setVMax: (v) => set({ vMax: Math.max(0, Math.min(127, v)) }),

    toggleTriggerBar: (index) =>
      set((s) => ({
        triggerBars: s.triggerBars.map((tb) =>
          tb.index === index ? { ...tb, active: !tb.active } : tb
        ),
      })),

    setNotes: (notes) => set({ notes }),
    toggleNoteSelection: (index) =>
      set((s) => ({
        notes: s.notes.map((n) =>
          n.index === index ? { ...n, selected: !n.selected } : n
        ),
      })),
    selectNotesInRange: (indices) =>
      set((s) => ({
        notes: s.notes.map((n) => ({
          ...n,
          selected: indices.includes(n.index) ? true : n.selected,
        })),
      })),
    clearSelection: () =>
      set((s) => ({
        notes: s.notes.map((n) => ({ ...n, selected: false })),
      })),

    setTriggeredNotes: (indices) => set({ triggeredNoteIndices: indices }),
    setPlayheadAngle: (angle) => set({ playheadAngle: angle }),

    setMidiOutputId: (id) => set({ midiOutputId: id }),
    setMidiChannel: (channel) => set({ midiChannel: Math.max(1, Math.min(16, channel)) }),
    setMidiAvailable: (available) => set({ midiAvailable: available }),
    setMidiOutputs: (outputs) => set({ midiOutputs: outputs }),
    setMidiError: (error) => set({ midiError: error }),

    // ─── Randomizers ─────────────────────────────────────────

    randomizeNoteCount: () => set({ noteCount: randInt(4, 82) }),
    randomizeLoopLength: () => set({ loopLength: pick(LOOP_LENGTH_OPTIONS) }),
    randomizeQuantizedOffset: () => set({ quantizedOffset: randInt(0, 16) }),
    randomizeFreeOffset: () => set({ freeOffset: randFloat(-2, 2) }),
    randomizeNoteDuration: () => set({ noteDuration: parseFloat(randFloat(0.05, 2).toFixed(3)) }),
    randomizeNoteCollection: () => {
      // Will be overridden by actual collection data
      set({ noteCollectionName: 'Random' });
    },

    randomizeAll: () => {
      set({
        bpm: randInt(60, 200),
        loopLength: pick(LOOP_LENGTH_OPTIONS),
        noteCount: randInt(4, 48),
        noteDuration: parseFloat(randFloat(0.05, 1.5).toFixed(3)),
        rootNote: pick(ROOT_OPTIONS),
        scaleName: pick(COMMON_SCALES),
        octaveTranspose: randInt(-2, 2),
        speedOffset: parseFloat(randFloat(-1, 1).toFixed(3)),
        quantizedOffset: randInt(0, 12),
        freeOffset: parseFloat(randFloat(-2, 2).toFixed(3)),
        evenOffset: parseFloat(randFloat(-1, 1).toFixed(3)),
        globalOffset: parseFloat(randFloat(-1, 1).toFixed(3)),
        probability: randInt(30, 100),
        randomVelocity: Math.random() > 0.5,
        vMin: randInt(30, 80),
        vMax: randInt(90, 127),
      });
    },
  }))
);
