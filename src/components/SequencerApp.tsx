import React, { useEffect, useCallback, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { SequencerCanvas } from './canvas/SequencerCanvas';
import { ControlPanel } from './ui/ControlPanel';
import { useSequencerStore } from '../store';
import { initAudio, syncTransportWithStore, disposeAudio, togglePlayback } from '../audio/engine';
import { startScheduler, stopScheduler } from '../audio/scheduler';
import { initMidi } from '../audio/midi';
import { generateNoteSpiral } from '../music/noteMapping';

function selectNoteParams(s: ReturnType<typeof useSequencerStore.getState>) {
  return {
    noteCount: s.noteCount,
    rootNote: s.rootNote,
    scaleName: s.scaleName,
    minNote: s.minNote,
    maxNote: s.maxNote,
    octaveTranspose: s.octaveTranspose,
    speedOffset: s.speedOffset,
    quantizedOffset: s.quantizedOffset,
    quantizeStrength: s.quantizeStrength,
    quantizeMode: s.quantizeMode,
    freeOffset: s.freeOffset,
    evenOffset: s.evenOffset,
    globalOffset: s.globalOffset,
  };
}

export function SequencerApp() {
  const audioStarted = useSequencerStore((s) => s.audioStarted);
  const [showOverlay, setShowOverlay] = useState(true);

  // Initialize note spiral when relevant params change
  useEffect(() => {
    // Generate initial notes immediately
    const initialParams = selectNoteParams(useSequencerStore.getState());
    const initialNotes = generateNoteSpiral(initialParams);
    useSequencerStore.getState().setNotes(initialNotes);

    // Subscribe to param changes with shallow equality to prevent infinite loop.
    // Without shallow, the selector returns a new object every time → infinite setNotes cycle.
    const unsub = useSequencerStore.subscribe(
      selectNoteParams,
      (params) => {
        const notes = generateNoteSpiral(params);
        useSequencerStore.getState().setNotes(notes);
      },
      { equalityFn: shallow }
    );
    return unsub;
  }, []);

  // Start audio on first user interaction
  const handleStart = useCallback(async () => {
    await initAudio();
    const unsync = syncTransportWithStore();
    startScheduler();
    initMidi(); // Non-blocking, graceful failure
    setShowOverlay(false);

    // Cleanup on unmount
    return () => {
      unsync();
      stopScheduler();
      disposeAudio();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && audioStarted) {
        e.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [audioStarted]);

  return (
    <div id="app">
      {/* Start overlay - required for AudioContext user gesture */}
      {showOverlay && (
        <div className="start-overlay" onClick={handleStart}>
          <h1>Circle of Harmony</h1>
          <p>Click anywhere to start</p>
        </div>
      )}

      {/* Main content */}
      <div className="canvas-container">
        <SequencerCanvas />
      </div>
      <ControlPanel />
    </div>
  );
}
