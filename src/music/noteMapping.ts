import type { NoteOnSpiral } from '../types';
import { getScaleNotes, midiToNoteName, transposeOctave } from './scales';

/**
 * Generate the spiral note mapping: computes positions and MIDI assignments
 * for all notes on the circular sequencer.
 *
 * Notes are arranged in a spiral from the center outward.
 * Inner notes = lower pitch, outer notes = higher pitch.
 * Angle spacing is distributed evenly, with optional offsets.
 */
export function generateNoteSpiral(params: {
  noteCount: number;
  rootNote: string;
  scaleName: string;
  minNote: number;
  maxNote: number;
  octaveTranspose: number;
  speedOffset: number;
  quantizedOffset: number;
  quantizeStrength: number;
  quantizeMode: 'snap' | 'spread' | 'random';
  freeOffset: number;
  evenOffset: number;
  globalOffset: number;
}): NoteOnSpiral[] {
  const {
    noteCount,
    rootNote,
    scaleName,
    minNote,
    maxNote,
    octaveTranspose,
    speedOffset,
    quantizedOffset,
    quantizeStrength,
    quantizeMode,
    freeOffset,
    evenOffset,
    globalOffset,
  } = params;

  // Get available scale notes in range
  const transposedMin = transposeOctave(minNote, octaveTranspose);
  const transposedMax = transposeOctave(maxNote, octaveTranspose);
  const scaleNotes = getScaleNotes(
    rootNote,
    scaleName,
    Math.min(transposedMin, transposedMax),
    Math.max(transposedMin, transposedMax)
  );

  if (scaleNotes.length === 0) return [];

  const notes: NoteOnSpiral[] = [];
  const totalNotes = Math.min(noteCount, 82);

  for (let i = 0; i < totalNotes; i++) {
    // Map note index to a scale note (wrap around if more notes than scale notes)
    const scaleIndex = i % scaleNotes.length;
    const octaveOffset = Math.floor(i / scaleNotes.length);
    let midi = scaleNotes[scaleIndex] + octaveOffset * 12;

    // Clamp to valid MIDI range
    midi = Math.max(0, Math.min(127, midi));

    // Compute radius: inner (0.15) to outer (0.9)
    // Lower-indexed notes are closer to center
    const normalizedIndex = totalNotes > 1 ? i / (totalNotes - 1) : 0.5;
    const radius = 0.15 + normalizedIndex * 0.75;

    // Compute base angle: distribute notes around the circle
    const freeAngle = (i / totalNotes) * Math.PI * 2;
    let baseAngle = freeAngle;

    // Apply quantized offset: evenly spaces by quantizedOffset divisions
    // (Must come BEFORE speedOffset so speed can spread quantized positions)
    if (quantizedOffset > 0) {
      let quantAngle: number;
      if (quantizeMode === 'snap') {
        const quantStep = (Math.PI * 2) / quantizedOffset;
        const quantIndex = i % quantizedOffset;
        quantAngle = quantIndex * quantStep;
      } else if (quantizeMode === 'spread') {
        // Spread: quantize but keep relative spacing within each slot
        const quantStep = (Math.PI * 2) / quantizedOffset;
        const quantIndex = i % quantizedOffset;
        const slotSize = quantStep * 0.8; // 80% of slot
        const notesInSlot = Math.ceil(totalNotes / quantizedOffset);
        const posInSlot = Math.floor(i / quantizedOffset);
        const slotFraction = notesInSlot > 1 ? posInSlot / (notesInSlot - 1) : 0.5;
        quantAngle = quantIndex * quantStep + (slotFraction - 0.5) * slotSize;
      } else {
        // Random: quantize with random jitter inside slot
        const quantStep = (Math.PI * 2) / quantizedOffset;
        const quantIndex = i % quantizedOffset;
        // Use deterministic pseudo-random based on index (stable across renders)
        const jitter = (Math.sin(i * 127.1 + quantizedOffset * 311.7) * 0.5 + 0.5) * quantStep * 0.6;
        quantAngle = quantIndex * quantStep + jitter - quantStep * 0.3;
      }
      // Blend between free angle and quantized angle by quantizeStrength
      baseAngle = freeAngle + (quantAngle - freeAngle) * quantizeStrength;
    }

    // Apply speed offset: shifts angle based on distance from center
    // Positive: outer notes advance further; Negative: inner notes advance further
    const speedOffsetAmount = speedOffset * normalizedIndex * Math.PI * 0.5;
    baseAngle += speedOffsetAmount;

    // Apply free offset
    baseAngle += freeOffset * (Math.PI / 4);

    // Apply even offset (delays even-indexed notes)
    if (i % 2 === 0) {
      baseAngle += evenOffset * (Math.PI / 8);
    }

    // Apply global offset
    baseAngle += globalOffset * (Math.PI / 4);

    // Normalize angle
    baseAngle = ((baseAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    notes.push({
      index: i,
      midi,
      name: midiToNoteName(midi),
      angle: baseAngle,
      radius,
      selected: false,
      triggered: false,
    });
  }

  return notes;
}

/**
 * Determine which notes should be triggered based on current playhead
 * angle and active trigger bars.
 *
 * Returns indices of notes that are within the trigger threshold.
 */
export function getTriggeredNotes(
  notes: NoteOnSpiral[],
  triggerBars: { angle: number; active: boolean }[],
  tolerance: number = 0.06 // radians (~3.4 degrees)
): number[] {
  const triggered: number[] = [];

  for (const note of notes) {
    for (const bar of triggerBars) {
      if (!bar.active) continue;

      // Calculate angular distance (handle wrapping)
      let angleDiff = Math.abs(note.angle - bar.angle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      if (angleDiff < tolerance) {
        triggered.push(note.index);
        break; // Don't trigger same note from multiple bars
      }
    }
  }

  return triggered;
}

/**
 * Compute velocity for a note based on velocity settings.
 */
export function computeVelocity(
  randomVelocity: boolean,
  vMin: number,
  vMax: number
): number {
  if (randomVelocity) {
    return Math.floor(Math.random() * (vMax - vMin + 1)) + vMin;
  }
  return vMax;
}
