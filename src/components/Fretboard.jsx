import { useState, useEffect } from 'react';
import { generateFretboard, STANDARD_TUNING, NUM_FRETS, FRET_MARKERS, detectChordShapes } from '../data/musicTheory';
import audioEngine from '../audio/AudioEngine';
import scalePlayer from '../audio/ScalePlayer';
import './Fretboard.css';

function Fretboard({ rootNote, scaleName, showIntervals = false, selectedPosition = 'all', positions = [], chordNotes = [] }) {
  const fretboard = generateFretboard(rootNote, scaleName);
  const [highlightedNote, setHighlightedNote] = useState(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

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
  const isChordShapeMode = chordNotes.length > 0;

  // Detect chord shapes using clustering algorithm
  const chordShapes = detectChordShapes(fretboard, chordNotes);

  // Create a map of note positions to their shape index for coloring
  const noteToShapeMap = new Map();
  chordShapes.forEach((shape, shapeIndex) => {
    shape.notes.forEach(note => {
      const key = `${note.stringIndex}-${note.fret}`;
      noteToShapeMap.set(key, shapeIndex);
    });
  });

  // Get the shape index for a specific note position
  const getShapeIndex = (stringIndex, fret) => {
    const key = `${stringIndex}-${fret}`;
    return noteToShapeMap.get(key);
  };

  // Check if a note should be displayed
  const shouldDisplayNote = (fretData, stringIndex) => {
    // In chord shape mode, show chord tones regardless of scale
    if (isChordShapeMode) {
      return isChordTone(fretData.note) && fretData.fret > 0;
    }
    // In scale mode, show scale notes in position
    return fretData.inScale && isInPosition(fretData.fret);
  };

  // Calculate shape region positioning for display
  const calculateShapeRegion = (shape, shapeIndex) => {
    // Convert string indices to display positions (reversed)
    const displayMinString = STANDARD_TUNING.length - 1 - shape.maxString;
    const displayMaxString = STANDARD_TUNING.length - 1 - shape.minString;

    // Calculate pixel positions
    // String label (40px) + open cell (44px) + nut (6px) = 90px base offset
    // Each fret is 60px wide, each string row is 42px tall
    const left = 90 + (shape.minFret - 1) * 60;
    const width = shape.fretSpan * 60;
    const top = displayMinString * 42;
    const height = (displayMaxString - displayMinString + 1) * 42;

    // Generate distinct colors for each shape
    const colors = [
      { bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.3)', shadow: 'rgba(96, 165, 250, 0.2)' }, // Blue
      { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', shadow: 'rgba(168, 85, 247, 0.2)' }, // Purple
      { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)', shadow: 'rgba(236, 72, 153, 0.2)' }, // Pink
      { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', shadow: 'rgba(34, 197, 94, 0.2)' }, // Green
      { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.3)', shadow: 'rgba(251, 146, 60, 0.2)' }, // Orange
    ];
    const colorSet = colors[shapeIndex % colors.length];

    return {
      left: `${left}px`,
      width: `${width}px`,
      top: `${top}px`,
      height: `${height}px`,
      '--shape-bg': colorSet.bg,
      '--shape-border': colorSet.border,
      '--shape-shadow': colorSet.shadow,
    };
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

          {/* Chord shape regions overlay */}
          {chordShapes.map((shape, index) => (
            <div
              key={`chord-shape-${index}`}
              className="chord-shape-region"
              style={calculateShapeRegion(shape, index)}
            >
              <div className="chord-shape-glow"></div>
            </div>
          ))}

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
                  const shapeIndex = getShapeIndex(stringData.stringIndex, fretData.fret);
                  const shouldDisplay = shouldDisplayNote(fretData, stringData.stringIndex);
                  
                  return (
                    <div key={fretData.fret} className="fret-cell">
                      <div className={`string-line string-${displayIndex}`}></div>
                      <div className="fret-wire"></div>
                      {shouldDisplay && (
                        <button
                          className={`note-marker ${
                            isChordShapeMode && isChordTone(fretData.note) && fretData.note === chordNotes[0] ? 'chord-root' : 
                            fretData.isRoot ? 'root' : ''
                          } ${
                            isNoteHighlighted(stringData.stringIndex, fretData.fret) ? 'highlighted' : ''
                          } ${showIntervals ? 'interval-mode' : 'note-mode'} ${
                            isChordTone(fretData.note) ? 'chord-tone' : ''
                          } ${
                            shapeIndex !== undefined ? `chord-shape-${shapeIndex % 5}` : ''
                          }`}
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
