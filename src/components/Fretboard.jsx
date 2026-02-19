import { useState, useEffect } from 'react';
import { generateFretboard, STANDARD_TUNING, NUM_FRETS, FRET_MARKERS, detectCAGEDChordShapes, CAGED_COLORS, generateAShapeMajor } from '../data/musicTheory';
import audioEngine from '../audio/AudioEngine';
import scalePlayer from '../audio/ScalePlayer';
import './Fretboard.css';

function Fretboard({ rootNote, scaleName, showIntervals = false, selectedPosition = 'all', positions = [], chordNotes = [], chordRoot = '' }) {
  const fretboard = generateFretboard(rootNote, scaleName);
  const [highlightedNote, setHighlightedNote] = useState(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // TEMPORARY TEST: Generate A shape major positions for visual verification
  const testNotes = generateAShapeMajor("C");
  
  // Debug: log test notes
  console.log("A Shape Test Notes:", testNotes);

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

  // Detect CAGED chord shapes with multi-shape membership
  const { shapes: cagedShapes, noteToShapes, connections } = detectCAGEDChordShapes(chordRoot, chordNotes, fretboard);

  // Get the CAGED shapes for a specific note position
  const getCAGEDShapes = (stringIndex, fret) => {
    const key = `${stringIndex}-${fret}`;
    return noteToShapes.get(key) || [];
  };

  // TEMPORARY TEST: Check if a note is in the A shape test output
  const isAShapeTestNote = (stringIndex, fret) => {
    // Debug: log what we're comparing
    const found = testNotes.some(note => {
      const match = note.stringIndex === stringIndex && note.fret === fret;
      if (match) {
        console.log(`Match found: stringIndex ${stringIndex}, fret ${fret}`);
      }
      return match;
    });
    return found;
  };

  // Check if a note should be displayed
  const shouldDisplayNote = (fretData, stringIndex) => {
    // TEMPORARY TEST: Only show A shape major notes
    return isAShapeTestNote(stringIndex, fretData.fret);
    
    // ORIGINAL LOGIC (temporarily disabled):
    // In chord shape mode, show chord tones regardless of scale
    // if (isChordShapeMode) {
    //   return isChordTone(fretData.note) && fretData.fret > 0;
    // }
    // In scale mode, show scale notes in position
    // return fretData.inScale && isInPosition(fretData.fret);
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
    console.log('🎯 Fretboard note clicked:', { stringNote, fret, note, stringIndex });
    
    // Initialize audio on first interaction
    if (!isAudioInitialized) {
      console.log('🎵 First interaction - initializing audio engine...');
      try {
        const success = await audioEngine.initialize();
        if (success) {
          setIsAudioInitialized(true);
          console.log('✓✓✓ Audio engine initialized successfully in Fretboard');
        } else {
          throw new Error('Initialization returned false');
        }
      } catch (error) {
        console.error('❌ Failed to initialize audio engine:', error);
        alert(`Failed to initialize audio: ${error.message || 'Unknown error'}. Please refresh the page and try again.`);
        return;
      }
    }
    
    // Verify audio engine is ready before playing
    if (!audioEngine.isInitialized()) {
      console.error('❌ Audio engine not ready for playback');
      alert('Audio system not ready. Please try clicking again.');
      setIsAudioInitialized(false); // Reset state to trigger re-init on next click
      return;
    }

    try {
      console.log('🎸 Requesting note playback...');
      // Play the note with correct string index for accurate pitch
      audioEngine.playNote(stringNote, fret, 0.8, 'normal', stringIndex);

      // Visual feedback - use stringIndex for unique identification
      setHighlightedNote({ stringIndex, fret });
      setTimeout(() => {
        setHighlightedNote(null);
      }, 300);
    } catch (error) {
      console.error('❌ Error playing note:', error);
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

          {/* Strings - displayed from high E (index 5) to low E (index 0) */}
          {[...fretboard].reverse().map((stringData, displayIndex) => {
            const stringIndex = STANDARD_TUNING.length - 1 - displayIndex;
            return (
              <div key={stringIndex} className="guitar-string-row">
                {/* String label */}
                <div className="string-label">{stringLabels[displayIndex]}</div>

                {/* Open note spacer (before the nut) */}
                <div className="open-note-cell">
                  <div className={`string-line string-${displayIndex}`}></div>
                </div>

                {/* Fretted notes */}
                {stringData.frets.slice(1).map(fretData => {
                  const cagedShapes = getCAGEDShapes(stringData.stringIndex, fretData.fret);
                  const shouldDisplay = shouldDisplayNote(fretData, stringData.stringIndex);
                  
                  // TEMPORARY TEST: Use bright green for E shape test notes
                  let colorClasses = '';
                  let style = {};
                  let dataAttributes = {};
                  
                  if (shouldDisplay) {
                    // Bright green test color
                    style.backgroundColor = '#00ff00';
                    style.color = '#000000';
                  }
                  
                  // ORIGINAL CAGED COLOR LOGIC (temporarily disabled):
                  // if (cagedShapes.length > 0) {
                  //   if (cagedShapes.length === 1) {
                  //     // Single CAGED shape - use that shape's dedicated color
                  //     colorClasses = `caged-${cagedShapes[0]}`;
                  //   } else {
                  //     // Multiple CAGED shapes - blend shape colors using gradient fill
                  //     colorClasses = 'caged-multi';
                  //     dataAttributes['data-shape-count'] = cagedShapes.length;
                  //     // Map each CAGED shape to its color (NOT note color)
                  //     cagedShapes.forEach((shape, i) => {
                  //       style[`--shape-color-${i}`] = CAGED_COLORS[shape].primary;
                  //     });
                  //   }
                  // }
                  
                  return (
                    <div key={fretData.fret} className="fret-cell">
                      <div className={`string-line string-${displayIndex}`}></div>
                      <div className="fret-wire"></div>
                      {shouldDisplay && (
                        <button
                          className={`note-marker ${
                            isChordShapeMode && isChordTone(fretData.note) && fretData.note === chordRoot ? 'chord-root' : 
                            fretData.isRoot ? 'root' : ''
                          } ${
                            isNoteHighlighted(stringData.stringIndex, fretData.fret) ? 'highlighted' : ''
                          } ${showIntervals ? 'interval-mode' : 'note-mode'} ${
                            isChordTone(fretData.note) ? 'chord-tone' : ''
                          } ${
                            colorClasses
                          }`}
                          style={style}
                          {...dataAttributes}
                          title={getTooltipText(fretData)}
                          onClick={() => handleNoteClick(stringData.stringNote, fretData.fret, fretData.note, stringData.stringIndex)}
                        >
                          {getDisplayLabel(fretData)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="fretboard-legend">
        <div className="legend-item">
          <div className="legend-dot root"></div>
          <span>Root Note</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot scale"></div>
          <span>Scale Note</span>
        </div>
      </div>
    </div>
  );
}

export default Fretboard;
