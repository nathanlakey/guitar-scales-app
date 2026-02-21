import { useState, useEffect, useMemo } from 'react';
import { generateFretboard, STANDARD_TUNING, NUM_FRETS, FRET_MARKERS, generateAllCAGEDShapes, generateCAGEDShape, getMajorScale, getMajorPentatonic, getMinorPentatonic, getRelativeMinorPentatonic, getNoteAt, NOTES, SCALES } from '../data/musicTheory';
import audioEngine from '../audio/AudioEngine';
import scalePlayer from '../audio/ScalePlayer';
import './Fretboard.css';

// Interval-based color mapping - colors assigned by interval from root
const INTERVAL_COLOR_MAP = {
  0:  "#FF3B30",  // Root
  1:  "#FF9500",  // ♭2
  2:  "#FFD60A",  // 2
  3:  "#00ACC1",  // ♭3
  4:  "#34C759",  // 3
  5:  "#FFD60A",  // 4
  6:  "#AF52DE",  // ♭5
  7:  "#2979FF",  // 5
  8:  "#FF2D55",  // ♭6
  9:  "#5856D6",  // 6
  10: "#FF9F0A",  // ♭7
  11: "#64D2FF"   // 7
};

// Semitone to harmonic degree display mapping with accidentals
const SEMITONE_TO_DISPLAY = {
  0: "1",   // Root
  1: "♭2",  // Minor 2nd
  2: "2",   // Major 2nd
  3: "♭3",  // Minor 3rd
  4: "3",   // Major 3rd
  5: "4",   // Perfect 4th
  6: "♭5",  // Tritone
  7: "5",   // Perfect 5th
  8: "♭6",  // Minor 6th
  9: "6",   // Major 6th
  10: "♭7", // Minor 7th
  11: "7"   // Major 7th
};

function Fretboard({ rootNote, scaleName, showIntervals = false, selectedPosition = 'all', positions = [], chordNotes = [], chordRoot = '', cagedPosition = 'ALL', showScaleOverlay = false, displayMode = 'note', overlayScaleType = 'major' }) {
  const fretboard = generateFretboard(chordRoot || rootNote, scaleName);
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
    
    // Get scale definition for the active scale type
    let scaleDefinition;
    let activeRoot = cagedRoot;
    
    // Map overlayScaleType to SCALES keys, or use it directly if it matches
    switch (overlayScaleType) {
      case 'major':
        scaleDefinition = SCALES['Major (Ionian)'];
        break;
      case 'majorPentatonic':
        scaleDefinition = SCALES['Major Pentatonic'];
        break;
      case 'minorPentatonic':
        scaleDefinition = SCALES['Minor Pentatonic'];
        break;
      case 'relativeMinorPentatonic':
        // Relative minor is 3 semitones down, so adjust the root
        const rootIndex = NOTES.indexOf(cagedRoot);
        activeRoot = NOTES[(rootIndex - 3 + 12) % 12];
        scaleDefinition = SCALES['Minor Pentatonic'];
        break;
      default:
        // Try to use overlayScaleType directly as a SCALES key
        scaleDefinition = SCALES[overlayScaleType];
        if (!scaleDefinition) {
          // Fallback to Major if scale not found
          scaleDefinition = SCALES['Major (Ionian)'];
        }
    }
    
    // Safety check - ensure scaleDefinition has required properties
    if (!scaleDefinition || !scaleDefinition.intervals || !scaleDefinition.degrees) {
      console.error('Invalid scale definition for overlayScaleType:', overlayScaleType);
      return [];
    }
    
    console.log('Scale Overlay Debug:', {
      overlayScaleType,
      scaleIntervals: scaleDefinition.intervals,
      scaleDegrees: scaleDefinition.degrees,
      activeRoot
    });
    
    const notes = [];
    const rootIdx = NOTES.indexOf(activeRoot);
    
    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const note = getNoteAt(stringIndex, fret);
        const noteIdx = NOTES.indexOf(note);
        const semitoneDistance = (noteIdx - rootIdx + 12) % 12;
        
        // Find index in scale intervals using intervals.indexOf()
        const intervalIndex = scaleDefinition.intervals.indexOf(semitoneDistance);
        
        // Only include if semitone distance exists in scale
        if (intervalIndex !== -1) {
          const degree = scaleDefinition.degrees[intervalIndex];
          
          // Debug logging for every overlay note
          console.log({
            overlayScaleType,
            rootNote: activeRoot,
            note,
            fret,
            stringIndex,
            semitoneDistance,
            intervalIndex,
            scaleIntervals: scaleDefinition.intervals,
            scaleDegrees: scaleDefinition.degrees,
            degree
          });
          
          notes.push({
            stringIndex,
            fret,
            note,
            role: 'scale',
            isScaleTone: true,
            interval: semitoneDistance,
            degree
          });
        }
      }
    }
    
    return notes;
  }, [cagedRoot, showScaleOverlay, overlayScaleType]);

  // Filter scale notes by position (NEVER affects cagedNotes)
  const visibleScaleNotes = useMemo(() => {
    if (!showScaleOverlay || scaleNotes.length === 0) return [];
    
    let filtered;
    
    // Show all scale notes if "All Positions" selected
    if (cagedPosition === 'ALL') {
      filtered = scaleNotes;
    } else {
      // Filter scale notes to match CAGED position's fret range
      if (cagedNotes.length === 0) {
        // No chord notes to define range, don't show any scale notes
        filtered = [];
      } else {
        const frets = cagedNotes.map(n => n.fret);
        const minFret = Math.min(...frets);
        const maxFret = Math.max(...frets);
        
        filtered = scaleNotes.filter(note =>
          note.fret >= minFret &&
          note.fret <= maxFret
        );
      }
    }
    
    // FINAL adjacency filter: Prevent adjacent frets on same string from both rendering
    // Sort all notes by string, then by fret
    const sortedFiltered = filtered.sort((a, b) => {
      if (a.stringIndex !== b.stringIndex) {
        return a.stringIndex - b.stringIndex;
      }
      return a.fret - b.fret;
    });
    
    const filteredVisibleScaleNotes = [];
    const lastFretPerString = {};
    
    for (const note of sortedFiltered) {
      const string = note.stringIndex;
      const fret = note.fret;
      
      if (lastFretPerString[string] === undefined) {
        // First note on this string
        filteredVisibleScaleNotes.push(note);
        lastFretPerString[string] = fret;
      } else if (fret !== lastFretPerString[string] + 1) {
        // Not adjacent to previous, keep it
        filteredVisibleScaleNotes.push(note);
        lastFretPerString[string] = fret;
      }
      // If fret === lastFretPerString[string] + 1, skip it (adjacent to previous)
    }
    
    return filteredVisibleScaleNotes;
  }, [scaleNotes, cagedNotes, showScaleOverlay, cagedPosition]);

  // Get harmonic interval for any note relative to root
  // Returns semitone distance (0-11) for chromatic color mapping
  const getHarmonicInterval = (note, root) => {
    const noteIndex = NOTES.indexOf(note);
    const rootIndex = NOTES.indexOf(root);
    const semitones = (noteIndex - rootIndex + 12) % 12;
    return semitones;
  };

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
    // Check if current fret has a scale note
    const currentNote = visibleScaleNotes.find(note => 
      note.stringIndex === stringIndex && note.fret === fret
    );
    
    if (!currentNote) return null;
    
    // Check if previous fret on same string also has a scale note
    const previousNote = visibleScaleNotes.find(note =>
      note.stringIndex === stringIndex && note.fret === fret - 1
    );
    
    // If previous fret has a scale note, suppress current (lower fret wins)
    if (previousNote) return null;
    
    return currentNote;
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
  const getDisplayLabel = (fretData, scaleNoteData = null) => {
    // Backward compatibility: showIntervals takes precedence if displayMode not set
    if (showIntervals && displayMode === undefined) {
      // Use scale-specific degree if available, otherwise fall back to chromatic mapping
      if (scaleNoteData?.degree) {
        return scaleNoteData.degree;
      }
      if (!fretData.inScale) return '';
      const semitoneInterval = getHarmonicInterval(fretData.note, cagedRoot);
      return SEMITONE_TO_DISPLAY[semitoneInterval] || "1";
    }

    // New unified displayMode logic
    switch (displayMode) {
      case 'degree':
        // Use scale-specific degree if available
        if (scaleNoteData?.degree) {
          return scaleNoteData.degree;
        }
        // Fallback to chromatic mapping if in scale
        if (!fretData.inScale) return '';
        const semitoneInterval = getHarmonicInterval(fretData.note, cagedRoot);
        return SEMITONE_TO_DISPLAY[semitoneInterval] || "1";

      case 'both':
        // Use scale-specific degree if available, otherwise fall back to chromatic mapping
        let degreeLabel;
        if (scaleNoteData?.degree) {
          degreeLabel = scaleNoteData.degree;
        } else if (fretData.inScale) {
          const semitoneInt = getHarmonicInterval(fretData.note, cagedRoot);
          degreeLabel = SEMITONE_TO_DISPLAY[semitoneInt] || "1";
        } else {
          return fretData.note;
        }
        return `${fretData.note}\n${degreeLabel}`;

      case 'note':
      default:
        return fretData.note;
    }
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
                      {hasScaleNote && (() => {
                        const noteName = scaleNote.note;
                        const rootIndex = NOTES.indexOf(cagedRoot);
                        const noteIndex = NOTES.indexOf(noteName);
                        const interval = (noteIndex - rootIndex + 12) % 12;
                        const noteColor = INTERVAL_COLOR_MAP[interval];
                        console.log("🎨 FINAL NOTE COLOR (Scale):", noteName, "interval:", interval, "color:", noteColor);
                        return (
                          <button
                            className={`note-marker note-scale ${
                              isNoteHighlighted(stringData.stringIndex, fretData.fret) ? 'highlighted' : ''
                            } ${showIntervals ? 'interval-mode' : 'note-mode'}`}
                            style={{ backgroundColor: noteColor }}
                            title={getTooltipText(fretData)}
                            onClick={() => handleNoteClick(stringData.stringNote, fretData.fret, fretData.note, stringData.stringIndex)}
                          >
                            {getDisplayLabel(fretData, scaleNote)}
                          </button>
                        );
                      })()}
                      
                      {/* LAYER 2: Chord notes (foreground) */}
                      {hasChordNote && (() => {
                        const isRoot = chordNote.role === 'root';
                        const visualType = isRoot ? 'root' : 'chord';
                        const noteName = fretData.note;
                        const rootIndex = NOTES.indexOf(cagedRoot);
                        const noteIndex = NOTES.indexOf(noteName);
                        const interval = (noteIndex - rootIndex + 12) % 12;
                        const noteColor = INTERVAL_COLOR_MAP[interval];
                        console.log("🎨 FINAL NOTE COLOR (Chord):", noteName, "interval:", interval, "color:", noteColor);
                        // Get scale note for degree label if available
                        const correspondingScaleNote = getScaleNote(stringData.stringIndex, fretData.fret);
                        
                        return (
                          <button
                            className={`note-marker note-${visualType} ${
                              isNoteHighlighted(stringData.stringIndex, fretData.fret) ? 'highlighted' : ''
                            } ${showIntervals ? 'interval-mode' : 'note-mode'}`}
                            style={{ backgroundColor: noteColor }}
                            title={getTooltipText(fretData)}
                            onClick={() => handleNoteClick(stringData.stringNote, fretData.fret, fretData.note, stringData.stringIndex)}
                          >
                            {getDisplayLabel(fretData, correspondingScaleNote)}
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
