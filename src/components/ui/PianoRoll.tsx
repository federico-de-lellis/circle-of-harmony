import React, { useCallback, useRef, useEffect } from 'react';
import { useSequencerStore } from '../../store';
import { ROOT_NOTES } from '../../types';

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: Record<string, string> = {
  'C': 'C#',
  'D': 'D#',
  'F': 'F#',
  'G': 'G#',
  'A': 'A#',
};

// Black key horizontal offsets (fraction of white key width)
const BLACK_KEY_OFFSETS: Record<string, number> = {
  'C': 0.65,
  'D': 0.65,
  'F': 0.65,
  'G': 0.65,
  'A': 0.65,
};

interface PianoRollProps {
  enabled: boolean;
}

export function PianoRoll({ enabled }: PianoRollProps) {
  const rootNote = useSequencerStore((s) => s.rootNote);
  const setRootNote = useSequencerStore((s) => s.setRootNote);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Clean up audio context when disabled
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Play a short preview tone when a key is pressed
  const playPreview = useCallback((noteName: string) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const freq = noteToFreq(noteName + '4'); // octave 4
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Ignore audio errors gracefully
    }
  }, []);

  const handleKeyClick = useCallback((note: string) => {
    setRootNote(note);
    if (enabled) {
      playPreview(note);
    }
  }, [enabled, setRootNote, playPreview]);

  if (!enabled) return null;

  const whiteKeyWidth = 28;
  const whiteKeyHeight = 64;
  const blackKeyWidth = 18;
  const blackKeyHeight = 38;
  const totalWidth = WHITE_KEYS.length * whiteKeyWidth;

  return (
    <div style={{ marginTop: 4 }}>
      <svg
        width={totalWidth}
        height={whiteKeyHeight + 2}
        viewBox={`0 0 ${totalWidth} ${whiteKeyHeight + 2}`}
        style={{ display: 'block', margin: '0 auto', cursor: 'pointer' }}
      >
        {/* White keys */}
        {WHITE_KEYS.map((note, i) => {
          const isRoot = rootNote === note;
          return (
            <rect
              key={note}
              x={i * whiteKeyWidth + 1}
              y={1}
              width={whiteKeyWidth - 2}
              height={whiteKeyHeight}
              rx={2}
              fill={isRoot ? '#00aacc' : '#ddd'}
              stroke={isRoot ? '#00d4ff' : '#888'}
              strokeWidth={isRoot ? 1.5 : 0.5}
              onClick={() => handleKeyClick(note)}
              style={{ transition: 'fill 0.1s' }}
            />
          );
        })}
        {/* White key labels */}
        {WHITE_KEYS.map((note, i) => {
          const isRoot = rootNote === note;
          return (
            <text
              key={`label-${note}`}
              x={i * whiteKeyWidth + whiteKeyWidth / 2}
              y={whiteKeyHeight - 5}
              textAnchor="middle"
              fontSize={9}
              fontFamily="var(--font-mono)"
              fill={isRoot ? '#fff' : '#666'}
              pointerEvents="none"
            >
              {note}
            </text>
          );
        })}
        {/* Black keys */}
        {WHITE_KEYS.map((note, i) => {
          const blackNote = BLACK_KEYS[note];
          if (!blackNote) return null;
          const offset = BLACK_KEY_OFFSETS[note] ?? 0.65;
          const isRoot = rootNote === blackNote;
          return (
            <rect
              key={blackNote}
              x={i * whiteKeyWidth + whiteKeyWidth * offset - blackKeyWidth / 2 + 1}
              y={1}
              width={blackKeyWidth}
              height={blackKeyHeight}
              rx={2}
              fill={isRoot ? '#0088aa' : '#222'}
              stroke={isRoot ? '#00d4ff' : '#444'}
              strokeWidth={isRoot ? 1.5 : 0.5}
              onClick={() => handleKeyClick(blackNote)}
              style={{ transition: 'fill 0.1s' }}
            />
          );
        })}
        {/* Black key labels */}
        {WHITE_KEYS.map((note, i) => {
          const blackNote = BLACK_KEYS[note];
          if (!blackNote) return null;
          const offset = BLACK_KEY_OFFSETS[note] ?? 0.65;
          const isRoot = rootNote === blackNote;
          return (
            <text
              key={`label-${blackNote}`}
              x={i * whiteKeyWidth + whiteKeyWidth * offset + 1}
              y={blackKeyHeight - 5}
              textAnchor="middle"
              fontSize={7}
              fontFamily="var(--font-mono)"
              fill={isRoot ? '#fff' : '#999'}
              pointerEvents="none"
            >
              {blackNote}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/** Convert note name like "C4" to frequency */
function noteToFreq(noteName: string): number {
  const NOTE_MAP: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
  };
  const match = noteName.match(/^([A-G]#?)(\d)$/);
  if (!match) return 440;
  const semitone = NOTE_MAP[match[1]] ?? 0;
  const octave = parseInt(match[2]);
  const midi = semitone + (octave + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
