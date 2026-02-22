import { useState, useEffect, useMemo } from 'react';
import { generateFretboard, STANDARD_TUNING, NUM_FRETS, generateAllCAGEDShapes, generateCAGEDShape, getMajorScale, getMajorPentatonic, getMinorPentatonic, getRelativeMinorPentatonic, getNoteAt, NOTES, SCALES } from '../data/musicTheory';
import audioEngine from '../audio/AudioEngine';
import scalePlayer from '../audio/ScalePlayer';
import FretMarkers from './FretMarkers';
import './Fretboard.css';

// Fret marker positions (for fret number display)
const FRET_MARKERS = [3, 5, 7, 9, 12, 15];

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

function Fretboard({ rootNote, scaleName, showIntervals = false, chordNotes = [], chordRoot = '', cagedPosition = 'ALL', showScaleOverlay = false, displayMode = 'note', overlayScaleType = 'major' }) {
  // Only generate fretboard if we have valid root and scale
  // This is the PRIMARY DATA SOURCE - contains the selected scale notes
  const fretboard = useMemo(() => {
    const activeRoot = chordRoot || rootNote;
    if (!activeRoot || !scaleName) return null;
    return generateFretboard(activeRoot, scaleName);
  }, [rootNote, scaleName, chordRoot]);

  const [highlightedNote, setHighlightedNote] = useState(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Generate display notes from fretboard data
  // This converts the fretboard structure into a flat array for rendering
  const scaleDisplayNotes = useMemo(() => {
    if (!fretboard) return [];
    
    const notes = [];
    const activeRoot = chordRoot || rootNote;
    const rootIdx = NOTES.indexOf(activeRoot);
    
    fretboard.forEach((stringData, stringIndex) => {
      stringData.frets.forEach(fretData => {
        if (fretData.inScale) {
          const noteIdx = NOTES.indexOf(fretData.note);
          const interval = (noteIdx - rootIdx + 12) % 12;
          
          notes.push({
            stringIndex,
            fret: fretData.fret,
            note: fretData.note,
            role: fretData.isRoot ? 'root' : 'scale',
            isScaleTone: true,
            interval,
            degree: fretData.degree || null
          });
        }
      });
    });
    
    return notes;
  }, [fretboard, chordRoot, rootNote]);

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
    
    return filtered;
  }, [scaleNotes, cagedNotes, showScaleOverlay, cagedPosition]);

  // Get harmonic interval for any note relative to root
  // Returns semitone distance (0-11) for chromatic color mapping
  const getHarmonicInterval = (note, root) => {
    const noteIndex = NOTES.indexOf(note);
    const rootIndex = NOTES.indexOf(root);
    const semitones = (noteIndex - rootIndex + 12) % 12;
    return semitones;
  };

  // Check if a note is a chord tone
  const isChordTone = (note) => {
    return chordNotes.length > 0 && chordNotes.includes(note);
  };

  // Detect if we're in chord shape mode
  const isChordShapeMode = chordNotes.length > 0 && chordRoot;

  // Check if a chord note exists at position
  const getChordNote = (stringIndex, fret) => {
    // Only show CAGED notes if explicitly in chord shape mode (chordRoot is set)
    if (!chordRoot) return null;
    return cagedNotes.find(note => 
      note.stringIndex === stringIndex && note.fret === fret
    );
  };

  // Check if a scale note exists at position
  // PRIMARY RENDERING LOGIC: Use the selected scale unless CAGED mode overrides
  const getScaleNote = (stringIndex, fret) => {
    // If we're in chord shape mode, only show the chord notes (CAGED shapes)
    // Scale notes are hidden unless overlay is enabled
    if (chordRoot && !overlayActive) {
      return null;
    }
    
    // Otherwise, show the primary scale selection
    // Use overlay notes only if overlay is actually active (requires chordRoot)
    const currentNote = overlayActive
      ? visibleScaleNotes.find(note => note.stringIndex === stringIndex && note.fret === fret)
      : scaleDisplayNotes.find(note => note.stringIndex === stringIndex && note.fret === fret);
    
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

  // Determine if scale notes are the primary dataset (should render fully opaque)
  // Primary = user selected a scale and it's the main focus (not an overlay)
  const isPrimaryDataset = !chordRoot && !showScaleOverlay;

  // Overlay is only active when BOTH conditions are met:
  // 1. showScaleOverlay is enabled
  // 2. chordRoot is actively selected (not null, empty, or "None")
  const overlayActive = showScaleOverlay && !!chordRoot;

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

  // Render empty fretboard if no scale selected
  if (!fretboard) {
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

          {/* Empty fretboard */}
          <div className="fretboard">
            <div className="nut"></div>
            {stringLabels.map((label, stringIndex) => (
              <div key={stringIndex} className="guitar-string-row">
                <div className="string-label">{label}</div>
                <div className="open-note-cell">
                  <div className={`string-line string-${stringIndex}`}></div>
                </div>
                {Array.from({ length: NUM_FRETS }, (_, fret) => (
                  <div key={fret + 1} className="fret-cell">
                    <div className={`string-line string-${stringIndex}`}></div>
                    <div className="fret-wire"></div>
                  </div>
                ))}
              </div>
            ))}

          {/* Fret marker dots - always visible */}
          <FretMarkers />
        </div>
      </div>
      <div className="empty-state-message">
        <p>Select a root note and scale to get started</p>
      </div>
      </div>
    );
  }

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
                        const isRoot = scaleNote.role === 'root';
                        const isPrimary = isPrimaryDataset && !isRoot;
                        const visualType = isRoot ? 'root' : (isPrimary ? 'scale-primary' : 'scale');
                        console.log("🎨 FINAL NOTE COLOR (Scale):", noteName, "interval:", interval, "color:", noteColor, "isPrimary:", isPrimary);
                        return (
                          <button
                            className={`note-marker note-${visualType} ${
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

          {/* Fret marker dots - always visible */}
          <FretMarkers />
        </div>
      </div>
    </div>
  );
}

export default Fretboard;
