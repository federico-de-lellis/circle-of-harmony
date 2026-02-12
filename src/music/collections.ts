import type { NoteCollection } from '../types';

/**
 * Predefined note collections: chords, scales, curated interval sets.
 * Each collection has a name and an array of intervals from the root.
 */
export const NOTE_COLLECTIONS: NoteCollection[] = [
  // Triads
  { name: 'Major Triad', intervals: ['1P', '3M', '5P'] },
  { name: 'Minor Triad', intervals: ['1P', '3m', '5P'] },
  { name: 'Diminished Triad', intervals: ['1P', '3m', '5d'] },
  { name: 'Augmented Triad', intervals: ['1P', '3M', '5A'] },
  { name: 'Sus2', intervals: ['1P', '2M', '5P'] },
  { name: 'Sus4', intervals: ['1P', '4P', '5P'] },

  // Seventh Chords
  { name: 'Major 7th', intervals: ['1P', '3M', '5P', '7M'] },
  { name: 'Minor 7th', intervals: ['1P', '3m', '5P', '7m'] },
  { name: 'Dominant 7th', intervals: ['1P', '3M', '5P', '7m'] },
  { name: 'Diminished 7th', intervals: ['1P', '3m', '5d', '7d'] },
  { name: 'Half-Dim 7th', intervals: ['1P', '3m', '5d', '7m'] },
  { name: 'Minor-Major 7th', intervals: ['1P', '3m', '5P', '7M'] },

  // Extended Chords
  { name: 'Major 9th', intervals: ['1P', '3M', '5P', '7M', '9M'] },
  { name: 'Minor 9th', intervals: ['1P', '3m', '5P', '7m', '9M'] },
  { name: 'Dominant 9th', intervals: ['1P', '3M', '5P', '7m', '9M'] },
  { name: 'Add9', intervals: ['1P', '3M', '5P', '9M'] },
  { name: '6/9', intervals: ['1P', '3M', '5P', '6M', '9M'] },
  { name: 'Major 11th', intervals: ['1P', '3M', '5P', '7M', '9M', '11P'] },
  { name: 'Major 13th', intervals: ['1P', '3M', '5P', '7M', '9M', '11P', '13M'] },

  // Scales as collections
  { name: 'Pentatonic Major', intervals: ['1P', '2M', '3M', '5P', '6M'] },
  { name: 'Pentatonic Minor', intervals: ['1P', '3m', '4P', '5P', '7m'] },
  { name: 'Blues', intervals: ['1P', '3m', '4P', '4A', '5P', '7m'] },
  { name: 'Whole Tone', intervals: ['1P', '2M', '3M', '4A', '5A', '7m'] },

  // Curated Interval Sets
  { name: 'Quartal', intervals: ['1P', '4P', '7m', '3m'] },
  { name: 'Quintal', intervals: ['1P', '5P', '9M', '6M'] },
  { name: 'Stacked 4ths', intervals: ['1P', '4P', '7m', '3m', '6m'] },
  { name: 'Open Fifth', intervals: ['1P', '5P'] },
  { name: 'Octave + Fifth', intervals: ['1P', '5P', '8P'] },
  { name: 'Tritone Pair', intervals: ['1P', '4A'] },
  { name: 'Cluster Tight', intervals: ['1P', '2m', '2M'] },
  { name: 'Cluster Wide', intervals: ['1P', '2M', '3M', '4P'] },
  { name: 'All Perfect', intervals: ['1P', '4P', '5P', '8P'] },
];

/**
 * Get a random note collection.
 */
export function getRandomCollection(): NoteCollection {
  return NOTE_COLLECTIONS[Math.floor(Math.random() * NOTE_COLLECTIONS.length)];
}

/**
 * Get a collection by name.
 */
export function getCollectionByName(name: string): NoteCollection | undefined {
  return NOTE_COLLECTIONS.find((c) => c.name === name);
}

/**
 * Get all collection names.
 */
export function getCollectionNames(): string[] {
  return NOTE_COLLECTIONS.map((c) => c.name);
}
