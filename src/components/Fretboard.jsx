import { useState, useEffect } from 'react';
import { generateFretboard, STANDARD_TUNING, NUM_FRETS, FRET_MARKERS } from '../data/musicTheory';
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

  // Calculate chord shape boundaries for visual outline
  const getChordShapeBounds = () => {
    if (chordNotes.length === 0) return null;

    let minFret = NUM_FRETS + 1;
    let maxFret = -1;
    let minString = STANDARD_TUNING.length;
    let maxString = -1;
    let foundChordTones = false;

    fretboard.forEach((stringData, stringIndex) => {
      stringData.frets.forEach(fretData => {
        if (fretData.inScale && isInPosition(fretData.fret) && isChordTone(fretData.note) && fretData.fret > 0) {
          foundChordTones = true;
          minFret = Math.min(minFret, fretData.fret);
          maxFret = Math.max(maxFret, fretData.fret);
          minString = Math.min(minString, stringIndex);
          maxString = Math.max(maxString, stringIndex);
        }
      });
    });

    if (!foundChordTones) return null;

    return {
      minFret,
      maxFret,
      minString,
      maxString,
      // Calculate display positions (reversed for visual layout)
      displayMinString: STANDARD_TUNING.length - 1 - maxString,
      displayMaxString: STANDARD_TUNING.length - 1 - minString,
    };
  };

  const chordShapeBounds = getChordShapeBounds();

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

          {/* Chord shape outline overlay */}
          {chordShapeBounds && (
            <div
              className="chord-shape-outline"
              style={{
                '--chord-min-fret': chordShapeBounds.minFret,
                '--chord-max-fret': chordShapeBounds.maxFret,
                '--chord-min-string': chordShapeBounds.displayMinString,
                '--chord-max-string': chordShapeBounds.displayMaxString,
                '--fret-span': chordShapeBounds.maxFret - chordShapeBounds.minFret + 1,
                '--string-span': chordShapeBounds.displayMaxString - chordShapeBounds.displayMinString + 1,
              }}
            />
          )}

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
                {stringData.frets.slice(1).map(fretData => (
                  <div key={fretData.fret} className="fret-cell">
                    <div className={`string-line string-${displayIndex}`}></div>
                    <div className="fret-wire"></div>
                    {fretData.inScale && isInPosition(fretData.fret) && (
                      <button
                        className={`note-marker ${fretData.isRoot ? 'root' : ''} ${
                          isNoteHighlighted(stringData.stringIndex, fretData.fret) ? 'highlighted' : ''
                        } ${showIntervals ? 'interval-mode' : 'note-mode'} ${
                          isChordTone(fretData.note) ? 'chord-tone' : ''
                        }`}
                        title={getTooltipText(fretData)}
                        onClick={() => handleNoteClick(stringData.stringNote, fretData.fret, fretData.note, stringData.stringIndex)}
                      >
                        {getDisplayLabel(fretData)}
                      </button>
                    )}
                  </div>
                ))}
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
