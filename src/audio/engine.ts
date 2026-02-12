import * as Tone from 'tone';
import { useSequencerStore } from '../store';

// ─── Synth Setup ───────────────────────────────────────────────

let synth: Tone.PolySynth | null = null;
let isInitialized = false;

/**
 * Initialize the audio engine. Must be called after a user gesture.
 */
export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  await Tone.start();
  console.log('AudioContext started');

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.4,
      release: 0.3,
    },
  }).toDestination();

  synth.maxPolyphony = 16;

  // Slight volume reduction to avoid clipping
  synth.volume.value = -6;

  isInitialized = true;
  useSequencerStore.getState().setAudioStarted(true);
}

/**
 * Get the synth instance.
 */
export function getSynth(): Tone.PolySynth | null {
  return synth;
}

/**
 * Start the transport.
 */
export function startTransport(): void {
  if (!isInitialized) return;
  Tone.getTransport().start('+0.05');
  useSequencerStore.getState().setPlaying(true);
}

/**
 * Stop the transport.
 */
export function stopTransport(): void {
  Tone.getTransport().stop();
  Tone.getTransport().position = 0;
  useSequencerStore.getState().setPlaying(false);
  useSequencerStore.getState().setPlayheadAngle(0);
  useSequencerStore.getState().setTriggeredNotes(new Set());
}

/**
 * Pause the transport
 */
export function pauseTransport(): void {
  Tone.getTransport().pause();
  useSequencerStore.getState().setPlaying(false);
}

/**
 * Toggle play/pause.
 */
export function togglePlayback(): void {
  const state = useSequencerStore.getState();
  if (!state.audioStarted) return;

  if (state.isPlaying) {
    pauseTransport();
  } else {
    startTransport();
  }
}

/**
 * Set BPM.
 */
export function setBpm(bpm: number): void {
  Tone.getTransport().bpm.value = bpm;
}

/**
 * Set the loop length in beats.
 */
export function setLoopLength(beats: number): void {
  Tone.getTransport().loop = true;
  Tone.getTransport().loopStart = 0;
  Tone.getTransport().loopEnd = `${beats}:0:0`;
}

/**
 * Get the current transport progress (0 to 1) within the loop.
 */
export function getTransportProgress(): number {
  const transport = Tone.getTransport();
  if (!transport.loop) return 0;

  const position = transport.seconds;
  const loopEnd = Tone.Time(transport.loopEnd).toSeconds();

  if (loopEnd === 0) return 0;
  return (position % loopEnd) / loopEnd;
}

/**
 * Trigger a note on the synth.
 */
export function triggerNote(
  noteName: string,
  duration: number | string,
  time: number,
  velocity: number = 0.8
): void {
  if (!synth) return;
  try {
    synth.triggerAttackRelease(
      noteName,
      duration,
      time,
      Math.max(0, Math.min(1, velocity / 127))
    );
  } catch (e) {
    // Ignore note scheduling errors (e.g., disposed synth)
  }
}

/**
 * Dispose and clean up audio.
 */
export function disposeAudio(): void {
  if (synth) {
    synth.dispose();
    synth = null;
  }
  isInitialized = false;
}

/**
 * Subscribe to store changes and sync transport params.
 */
export function syncTransportWithStore(): () => void {
  const unsubBpm = useSequencerStore.subscribe(
    (s) => s.bpm,
    (bpm) => setBpm(bpm)
  );

  const unsubLoop = useSequencerStore.subscribe(
    (s) => s.loopLength,
    (length) => setLoopLength(length)
  );

  // Set initial values
  const state = useSequencerStore.getState();
  setBpm(state.bpm);
  setLoopLength(state.loopLength);

  return () => {
    unsubBpm();
    unsubLoop();
  };
}
