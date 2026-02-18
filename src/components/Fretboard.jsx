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

  // Get all chord tone positions for shape visualization
  const getChordTonePositions = () => {
    if (chordNotes.length === 0) return [];

    const chordTonePositions = [];

    fretboard.forEach((stringData, stringIndex) => {
      stringData.frets.forEach(fretData => {
        if (fretData.inScale && isInPosition(fretData.fret) && isChordTone(fretData.note) && fretData.fret > 0) {
          // Calculate display position (strings are reversed in display)
          const displayStringIndex = STANDARD_TUNING.length - 1 - stringIndex;
          chordTonePositions.push({
            stringIndex,
            displayStringIndex,
            fret: fretData.fret,
            note: fretData.note,
            interval: fretData.interval,
          });
        }
      });
    });

    return chordTonePositions;
  };

  // Generate chord shape connections based on real guitar fingering patterns
  const generateChordShapeConnections = (chordTones) => {
    if (chordTones.length < 2) return [];

    const connections = [];
    
    // Group chord tones by fret to find shapes
    const fretGroups = {};
    chordTones.forEach(tone => {
      if (!fretGroups[tone.fret]) {
        fretGroups[tone.fret] = [];
      }
      fretGroups[tone.fret].push(tone);
    });

    // Sort chord tones by fret position
    const sortedByFret = [...chordTones].sort((a, b) => a.fret - b.fret);
    const minFret = sortedByFret[0].fret;
    const maxFret = sortedByFret[sortedByFret.length - 1].fret;
    const fretSpan = maxFret - minFret;

    // Connect notes that form playable chord shapes
    // Strategy: Connect notes on adjacent strings if they're within 4-fret span (playable hand position)
    chordTones.forEach(tone1 => {
      chordTones.forEach(tone2 => {
        // Check if notes are on adjacent or nearby strings
        const stringDistance = Math.abs(tone1.stringIndex - tone2.stringIndex);
        const fretDistance = Math.abs(tone1.fret - tone2.fret);
        
        // Connect if:
        // 1. On adjacent strings (stringDistance = 1) and within 4 frets (typical hand span)
        // 2. On same fret across multiple strings (barre chord shape)
        // 3. Within small area that forms a recognizable shape
        if (
          (stringDistance === 1 && fretDistance <= 4) || // Adjacent strings, playable span
          (tone1.fret === tone2.fret && stringDistance <= 2) || // Barre or partial barre
          (stringDistance <= 2 && fretDistance <= 3 && fretSpan <= 4) // Compact chord shape
        ) {
          // Avoid duplicate connections
          const connectionKey = `${Math.min(tone1.stringIndex, tone2.stringIndex)}-${Math.max(tone1.stringIndex, tone2.stringIndex)}-${tone1.fret}-${tone2.fret}`;
          
          if (!connections.find(c => c.key === connectionKey)) {
            connections.push({
              key: connectionKey,
              from: tone1,
              to: tone2,
              type: tone1.fret === tone2.fret ? 'horizontal' : 'diagonal'
            });
          }
        }
      });
    });

    return connections;
  };

  const chordTonePositions = getChordTonePositions();
  const chordShapeConnections = generateChordShapeConnections(chordTonePositions);

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

          {/* Chord shape connections overlay */}
          {chordShapeConnections.length > 0 && (
            <svg
              className="chord-shape-connections"
              viewBox="0 0 1100 260"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Gradient for connection lines */}
                <linearGradient id="chord-connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(232, 140, 125, 0.3)" />
                  <stop offset="50%" stopColor="rgba(232, 140, 125, 0.5)" />
                  <stop offset="100%" stopColor="rgba(232, 140, 125, 0.3)" />
                </linearGradient>
                {/* Glow filter for connections */}
                <filter id="chord-glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Draw connections between chord tones */}
              {chordShapeConnections.map((connection, index) => {
                const fromPos = calculateNotePosition(connection.from.displayStringIndex, connection.from.fret);
                const toPos = calculateNotePosition(connection.to.displayStringIndex, connection.to.fret);
                
                // Create smooth curved path for diagonal connections
                const isHorizontal = connection.type === 'horizontal';
                const path = isHorizontal
                  ? `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}` // Straight line for barre chords
                  : `M ${fromPos.x} ${fromPos.y} Q ${(fromPos.x + toPos.x) / 2} ${(fromPos.y + toPos.y) / 2 - 10} ${toPos.x} ${toPos.y}`; // Curved for diagonal
                
                return (
                  <path
                    key={`connection-${index}`}
                    d={path}
                    stroke="url(#chord-connection-gradient)"
                    strokeWidth={isHorizontal ? "3" : "2.5"}
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#chord-glow)"
                    className="chord-connection-path"
                  />
                );
              })}
              
              {/* Draw subtle glow circles at each chord tone */}
              {chordTonePositions.map((tone, index) => {
                const pos = calculateNotePosition(tone.displayStringIndex, tone.fret);
                return (
                  <circle
                    key={`chord-glow-${index}`}
                    cx={pos.x}
                    cy={pos.y}
                    r="18"
                    fill="rgba(232, 140, 125, 0.08)"
                    stroke="rgba(232, 140, 125, 0.2)"
                    strokeWidth="1"
                    filter="url(#chord-glow)"
                    className="chord-tone-glow"
                  />
                );
              })}
            </svg>
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
