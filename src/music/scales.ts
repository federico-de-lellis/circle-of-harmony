import { Scale, ScaleType, Note } from 'tonal';

/**
 * Get all available scale names (57+).
 */
export function getAvailableScales(): string[] {
  return ScaleType.names();
}

/**
 * Get all notes in a given scale within a MIDI range.
 * Returns sorted array of MIDI note numbers.
 */
export function getScaleNotes(
  root: string,
  scaleName: string,
  minMidi: number,
  maxMidi: number
): number[] {
  const scale = Scale.get(`${root} ${scaleName}`);
  if (!scale.notes.length) {
    // Fallback: return chromatic
    return Array.from(
      { length: maxMidi - minMidi + 1 },
      (_, i) => minMidi + i
    );
  }

  const pitchClasses = new Set(
    scale.notes.map((n) => Note.chroma(n)).filter((c): c is number => c !== undefined)
  );

  const result: number[] = [];
  for (let midi = minMidi; midi <= maxMidi; midi++) {
    const chroma = midi % 12;
    if (pitchClasses.has(chroma)) {
      result.push(midi);
    }
  }
  return result;
}

/**
 * Get note name from MIDI number.
 */
export function midiToNoteName(midi: number): string {
  return Note.fromMidi(midi) ?? `${midi}`;
}

/**
 * Get MIDI number from note name.
 */
export function noteNameToMidi(name: string): number | null {
  const m = Note.midi(name);
  return m ?? null;
}

/**
 * Get the pitch class (0-11) from a note name or MIDI number.
 */
export function getPitchClass(noteOrMidi: string | number): number {
  if (typeof noteOrMidi === 'number') return noteOrMidi % 12;
  return Note.chroma(noteOrMidi) ?? 0;
}

/**
 * Transpose a MIDI note by octaves.
 */
export function transposeOctave(midi: number, octaves: number): number {
  return Math.max(0, Math.min(127, midi + octaves * 12));
}

/**
 * Filter an array of MIDI notes to only those in the given scale.
 */
export function filterToScale(
  midiNotes: number[],
  root: string,
  scaleName: string
): number[] {
  const scale = Scale.get(`${root} ${scaleName}`);
  if (!scale.notes.length) return midiNotes;

  const pitchClasses = new Set(
    scale.notes.map((n) => Note.chroma(n)).filter((c): c is number => c !== undefined)
  );

  return midiNotes.filter((m) => pitchClasses.has(m % 12));
}

/**
 * Get a subset of commonly used scales for display purposes.
 */
export function getCommonScales(): string[] {
  return [
    'major',
    'minor',
    'dorian',
    'phrygian',
    'lydian',
    'mixolydian',
    'aeolian',
    'locrian',
    'harmonic minor',
    'harmonic major',
    'melodic minor',
    'major pentatonic',
    'minor pentatonic',
    'blues',
    'whole tone',
    'diminished',
    'augmented',
    'chromatic',
    'bebop',
    'bebop minor',
    'bebop major',
    'bebop locrian',
    'lydian dominant',
    'lydian augmented',
    'altered',
    'hungarian minor',
    'hungarian major',
    'persian',
    'arabic',
    'flamenco',
    'phrygian dominant',
    'double harmonic major',
    'enigmatic',
    'neapolitan major',
    'neapolitan minor',
    'hirajoshi',
    'iwato',
    'in-sen',
    'kumoi',
    'pelog',
    'prometheus',
    'scriabin',
    'whole half diminished',
    'half whole diminished',
    'locrian major',
    'super locrian',
    'leading whole tone',
    'lydian minor',
    'ionian pentatonic',
    'mixolydian pentatonic',
    'ritusen',
    'egyptian',
    'balinese',
    'vietnamese 1',
    'malkos raga',
    'todi raga',
    'purvi raga',
    'kafi raga',
  ];
}
