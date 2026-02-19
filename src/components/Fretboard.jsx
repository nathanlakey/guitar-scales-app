import { useState, useEffect, useMemo } from 'react';
import { generateFretboard, STANDARD_TUNING, NUM_FRETS, FRET_MARKERS, generateAllCAGEDShapes, generateCAGEDShape, getMajorScale, getNoteAt } from '../data/musicTheory';
import audioEngine from '../audio/AudioEngine';
import scalePlayer from '../audio/ScalePlayer';
import './Fretboard.css';

function Fretboard({ rootNote, scaleName, showIntervals = false, selectedPosition = 'all', positions = [], chordNotes = [], chordRoot = '', cagedPosition = 'ALL', showScaleOverlay = false }) {
  const fretboard = generateFretboard(rootNote, scaleName);
  const [highlightedNote, setHighlightedNote] = useState(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Generate all CAGED major shapes for the selected chord root (memoized for performance)
  // PURE - NEVER modified after generation
  const cagedRoot = chordRoot || rootNote;
  const cagedNotes = useMemo(() => {
    if (!cagedRoot) return [];
    if (cagedPosition === 'ALL') {
      return generateAllCAGEDShapes(cagedRoot);
    }
    return generateCAGEDShape(cagedPosition, cagedRoot);
  }, [cagedRoot, cagedPosition]);

  // Generate scale notes across fretboard (memoized for performance)
  // PURE - NEVER modified after generation
  const scaleNotes = useMemo(() => {
    if (!showScaleOverlay || !cagedRoot) return [];
    
    const scale = getMajorScale(cagedRoot);
    const notes = [];
    
    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const note = getNoteAt(stringIndex, fret);
        if (scale.includes(note)) {
          notes.push({
            stringIndex,
            fret,
            note,
            role: 'scale',
            isScaleTone: true
          });
        }
      }
    }
    
    return notes;
  }, [cagedRoot, showScaleOverlay]);

  // Filter scale notes by position (NEVER affects cagedNotes)
  const visibleScaleNotes = useMemo(() => {
    if (!showScaleOverlay || scaleNotes.length === 0) return [];
    
    // Show all scale notes if "All Positions" selected
    if (cagedPosition === 'ALL') {
      return scaleNotes;
    }
    
    // Filter scale notes to match CAGED position's fret range
    if (cagedNotes.length === 0) return scaleNotes;
    
    const frets = cagedNotes.map(n => n.fret);
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);
    
    return scaleNotes.filter(note =>
      note.fret >= minFret - 1 &&
      note.fret <= maxFret + 1
    );
  }, [scaleNotes, cagedNotes, showScaleOverlay, cagedPosition]);

  // Get the selected position data
  const currentPosition = selectedPosition === 'all' 
    ? null 
    : positions.find(p => p.number === parseInt(selectedPosition));

  // Check if a note is in the current position
  const isInPosition = (fret) => {
    if (!currentPosition) return true; // Show all if no position selected
    return fret >= currentPosition.startFret && fret <= currentPosition.endFret;
  };

  // Check if a note is a chord tone
  const isChordTone = (note) => {
    return chordNotes.length > 0 && chordNotes.includes(note);
  };

  // Detect if we're in chord shape mode
  const isChordShapeMode = chordNotes.length > 0 && chordRoot;

  // Check if a chord note exists at position
  const getChordNote = (stringIndex, fret) => {
    return cagedNotes.find(note => 
      note.stringIndex === stringIndex && note.fret === fret
    );
  };

  // Check if a scale note exists at position
  const getScaleNote = (stringIndex, fret) => {
    return visibleScaleNotes.find(note => 
      note.stringIndex === stringIndex && note.fret === fret
    );
  };

  // Calculate position for SVG coordinate system
  const calculateNotePosition = (displayStringIndex, fret) => {
    // String label (40px) + open cell (44px) + nut (6px) = 90px base offset
    // Each fret is 60px wide
    const x = 90 + (fret - 1) * 60 + 30; // Center of the fret cell
    const y = displayStringIndex * 42 + 21; // Center of the string row
    return { x, y };
  };

  // Set up visual highlighting callback for scale playback
  useEffect(() => {
    scalePlayer.setHighlightCallback((stringNote, fret, isActive, stringIndex) => {
      if (!isActive) {
        setHighlightedNote(null);
      } else {
        setHighlightedNote({ stringIndex, fret });
      }
    });

    return () => {
      scalePlayer.setHighlightCallback(null);
    };
  }, []);

  // Handle note click - play individual note
  const handleNoteClick = async (stringNote, fret, note, stringIndex) => {
    // Initialize audio on first interaction
    if (!isAudioInitialized) {
      try {
        const success = await audioEngine.initialize();
        if (success) {
          setIsAudioInitialized(true);
        } else {
          throw new Error('Initialization returned false');
        }
      } catch (error) {
        alert(`Failed to initialize audio: ${error.message || 'Unknown error'}. Please refresh the page and try again.`);
        return;
      }
    }
    
    // Verify audio engine is ready before playing
    if (!audioEngine.isInitialized()) {
      alert('Audio system not ready. Please try clicking again.');
      setIsAudioInitialized(false);
      return;
    }

    try {
      // Play the note with correct string index for accurate pitch
      audioEngine.playNote(stringNote, fret, 0.8, 'normal', stringIndex);

      // Visual feedback - use stringIndex for unique identification
      setHighlightedNote({ stringIndex, fret });
      setTimeout(() => {
        setHighlightedNote(null);
      }, 300);
    } catch (error) {
      // Silent fail - audio errors are non-critical
    }
  };

  // Check if a note should be highlighted
  const isNoteHighlighted = (stringIndex, fret) => {
    if (!highlightedNote) return false;
    return highlightedNote.stringIndex === stringIndex && highlightedNote.fret === fret;
  };

  // Get display label for a fret (note name or interval)
  const getDisplayLabel = (fretData) => {
    if (showIntervals) {
      if (fretData.isRoot) return 'R';
      return fretData.interval || '';
    }
    return fretData.note;
  };

  // Get tooltip text based on display mode
  const getTooltipText = (fretData) => {
    if (showIntervals) {
      const intervalLabel = fretData.isRoot ? 'Root' : `Interval: ${fretData.interval}`;
      return `${intervalLabel} (${fretData.note}) - Click to play`;
    }
    return `${fretData.note} - Click to play`;
  };

  // String labels (high to low for display: 1st string at top)
  const stringLabels = ['e', 'B', 'G', 'D', 'A', 'E'];

  return (
    <div className="fretboard-container">
      <div className="fretboard-wrapper">
        {/* Fret numbers */}
        <div className="fret-numbers">
          <div className="fret-number nut-label"></div>
          {Array.from({ length: NUM_FRETS }, (_, i) => (
            <div key={i + 1} className="fret-number">
              {FRET_MARKERS.includes(i + 1) ? (i + 1) : ''}
            </div>
          ))}
        </div>

        {/* The actual fretboard */}
        <div className="fretboard">
          {/* Nut */}
          <div className="nut"></div>

          {/* CAGED chord shape coloring - no connections, color-only visualization */}

          {/* Strings - displayed from stringIndex 0 (high E) to stringIndex 5 (low E) */}
          {fretboard.map((stringData, stringIndex) => {
            return (
              <div key={stringIndex} className="guitar-string-row">
                {/* String label */}
                <div className="string-label">{stringLabels[stringIndex]}</div>

                {/* Open note spacer (before the nut) */}
                <div className="open-note-cell">
                  <div className={`string-line string-${stringIndex}`}></div>
                </div>

                {/* Fretted notes */}
                {stringData.frets.slice(1).map(fretData => {
                  const chordNote = getChordNote(stringData.stringIndex, fretData.fret);
                  const scaleNote = getScaleNote(stringData.stringIndex, fretData.fret);
                  
                  // Determine if this position should display a note
                  const hasChordNote = !!chordNote;
                  const hasScaleNote = !!scaleNote && !hasChordNote; // Don't show scale if chord exists at same position
                  
                  return (
                    <div key={fretData.fret} className="fret-cell">
                      <div className={`string-line string-${stringIndex}`}></div>
                      <div className="fret-wire"></div>
                      
                      {/* LAYER 1: Scale notes (background) */}
                      {hasScaleNote && (
                        <button
                          className={`note-marker note-scale ${
                            isNoteHighlighted(stringData.stringIndex, fretData.fret) ? 'highlighted' : ''
                          } ${showIntervals ? 'interval-mode' : 'note-mode'}`}
                          title={getTooltipText(fretData)}
                          onClick={() => handleNoteClick(stringData.stringNote, fretData.fret, fretData.note, stringData.stringIndex)}
                        >
                          {getDisplayLabel(fretData)}
                        </button>
                      )}
                      
                      {/* LAYER 2: Chord notes (foreground) */}
                      {hasChordNote && (() => {
                        const isRoot = chordNote.role === 'root';
                        const visualType = isRoot ? 'root' : 'chord';
                        
                        return (
                          <button
                            className={`note-marker note-${visualType} ${
                              isNoteHighlighted(stringData.stringIndex, fretData.fret) ? 'highlighted' : ''
                            } ${showIntervals ? 'interval-mode' : 'note-mode'}`}
                            title={getTooltipText(fretData)}
                            onClick={() => handleNoteClick(stringData.stringNote, fretData.fret, fretData.note, stringData.stringIndex)}
                          >
                            {getDisplayLabel(fretData)}
                          </button>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Fretboard;
