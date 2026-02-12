import * as Tone from 'tone';
import { useSequencerStore } from '../store';
import { triggerNote, getTransportProgress } from './engine';
import { sendMidiNoteOn, sendMidiNoteOff } from './midi';
import { computeVelocity } from '../music/noteMapping';
import { midiToNoteName } from '../music/scales';

let schedulerLoop: Tone.Loop | null = null;
let lastTriggeredSet = new Set<number>();

/**
 * Start the scheduler loop.
 * This runs at a high rate and checks which notes should be triggered
 * based on the current playhead position crossing trigger bars.
 */
export function startScheduler(): void {
  if (schedulerLoop) {
    schedulerLoop.dispose();
  }

  // Track which notes were triggered on the previous tick to avoid re-triggers
  const prevTriggered = new Map<number, boolean>();

  schedulerLoop = new Tone.Loop((time) => {
    const state = useSequencerStore.getState();
    if (!state.isPlaying) return;

    const progress = getTransportProgress();
    const direction = state.direction;

    // Current playhead angle
    const playheadAngle =
      direction === 1
        ? progress * Math.PI * 2
        : (1 - progress) * Math.PI * 2;

    // Schedule visual update for playhead
    Tone.Draw.schedule(() => {
      useSequencerStore.getState().setPlayheadAngle(playheadAngle);
    }, time);

    // Check each note against each active trigger bar
    const triggered = new Set<number>();
    const tolerance = 0.08; // radians

    for (const note of state.notes) {
      for (const bar of state.triggerBars) {
        if (!bar.active) continue;

        // Compute the effective note angle based on progress + rotation
        // Notes rotate WITH the playhead
        const rotatedNoteAngle = (note.angle + playheadAngle) % (Math.PI * 2);

        // Check if the rotated note crosses the trigger bar
        let angleDiff = Math.abs(rotatedNoteAngle - bar.angle);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff < tolerance) {
          const noteKey = note.index * 100 + bar.index;
          const wasTriggered = prevTriggered.get(noteKey);

          if (!wasTriggered) {
            // Probability check
            if (Math.random() * 100 > state.probability) continue;

            // Compute velocity
            const velocity = computeVelocity(
              state.randomVelocity,
              state.vMin,
              state.vMax
            );

            // Compute duration
            let duration: number | string;
            if (state.quantNoteDuration) {
              // Use quantized duration relative to loop
              duration = state.quantNoteDurationValue.replace('/', 'n');
              // Convert to Tone.js notation: "1/4" -> "4n"
              const parts = state.quantNoteDurationValue.split('/');
              if (parts.length === 2) {
                duration = `${parts[1]}n`;
              }
            } else {
              duration = state.noteDuration;
            }

            const noteName = midiToNoteName(note.midi);

            // Trigger audio
            triggerNote(noteName, duration, time, velocity);

            // Trigger MIDI
            if (state.midiOutputId) {
              const durationSec =
                typeof duration === 'number'
                  ? duration
                  : Tone.Time(duration).toSeconds();
              sendMidiNoteOn(note.midi, velocity, state.midiChannel);
              setTimeout(() => {
                sendMidiNoteOff(note.midi, state.midiChannel);
              }, durationSec * 1000);
            }

            triggered.add(note.index);
            prevTriggered.set(noteKey, true);
          }
        } else {
          const noteKey = note.index * 100 + bar.index;
          prevTriggered.set(noteKey, false);
        }
      }
    }

    // Update visual triggered notes
    if (!setsEqual(triggered, lastTriggeredSet)) {
      lastTriggeredSet = triggered;
      Tone.Draw.schedule(() => {
        useSequencerStore.getState().setTriggeredNotes(new Set(triggered));
      }, time);
    }
  }, '32n'); // Run at 32nd note resolution

  schedulerLoop.start(0);
}

/**
 * Stop the scheduler loop.
 */
export function stopScheduler(): void {
  if (schedulerLoop) {
    schedulerLoop.dispose();
    schedulerLoop = null;
  }
  lastTriggeredSet = new Set();
}

/**
 * Compare two sets for equality.
 */
function setsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false;
  for (const val of a) {
    if (!b.has(val)) return false;
  }
  return true;
}
