// All 12 chromatic notes
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic display names for flats
export const ENHARMONIC = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

// Standard guitar tuning (stringIndex 0 = high E, stringIndex 5 = low E)
export const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];

// Number of frets to display
export const NUM_FRETS = 15;

// Fret markers (dots on the fretboard)
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15];
export const DOUBLE_MARKERS = [12];

// Scale definitions using semitone intervals from root
export const SCALES = {
  'Major (Ionian)': [0, 2, 4, 5, 7, 9, 11],
  'Natural Minor (Aeolian)': [0, 2, 3, 5, 7, 8, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Phrygian': [0, 1, 3, 5, 7, 8, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Locrian': [0, 1, 3, 5, 6, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
  'Major Pentatonic': [0, 2, 4, 7, 9],
  'Minor Pentatonic': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
  'Major Blues': [0, 2, 3, 4, 7, 9],
  'Whole Tone': [0, 2, 4, 6, 8, 10],
  'Diminished (HW)': [0, 1, 3, 4, 6, 7, 9, 10],
  'Diminished (WH)': [0, 2, 3, 5, 6, 8, 9, 11],
  'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'Hungarian Minor': [0, 2, 3, 6, 7, 8, 11],
  'Phrygian Dominant': [0, 1, 4, 5, 7, 8, 10],
  'Double Harmonic': [0, 1, 4, 5, 7, 8, 11],
};

// Chord definitions using semitone intervals from root
export const CHORDS = {
  'Major': [0, 4, 7],
  'Minor': [0, 3, 7],
  'Dominant 7': [0, 4, 7, 10],
  'Minor 7': [0, 3, 7, 10],
  'Major 7': [0, 4, 7, 11],
};

// Scale categories for organized display
export const SCALE_CATEGORIES = {
  'Common': ['Major (Ionian)', 'Natural Minor (Aeolian)', 'Major Pentatonic', 'Minor Pentatonic', 'Blues'],
  'Modes': ['Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'],
  'Harmonic & Melodic': ['Harmonic Minor', 'Melodic Minor'],
  'Exotic': ['Whole Tone', 'Diminished (HW)', 'Diminished (WH)', 'Hungarian Minor', 'Phrygian Dominant', 'Double Harmonic'],
  'Other': ['Major Blues', 'Chromatic'],
};

/**
 * Get the note at a specific fret on a specific string
 */
export function getNoteAtFret(stringNote, fret) {
  const startIndex = NOTES.indexOf(stringNote);
  return NOTES[(startIndex + fret) % 12];
}

/**
 * Get all notes in a given scale
 */
export function getScaleNotes(rootNote, scaleName) {
  const intervals = SCALES[scaleName];
  if (!intervals) return [];
  const rootIndex = NOTES.indexOf(rootNote);
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Get all notes in a given chord
 */
export function getChordNotes(rootNote, chordType) {
  const intervals = CHORDS[chordType];
  if (!intervals) return [];
  const rootIndex = NOTES.indexOf(rootNote);
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Check if a note is the root of the scale
 */
export function isRoot(note, rootNote) {
  return note === rootNote;
}

/**
 * Get the interval number of a note in the scale (1-indexed)
 */
export function getIntervalNumber(note, rootNote, scaleName) {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const index = scaleNotes.indexOf(note);
  return index >= 0 ? index + 1 : null;
}

/**
 * Calculate CAGED system positions
 * Returns 5 positions based on traditional CAGED chord shapes
 */
function getCAGEDPositions(rootNote, scaleName) {
  const positions = [];
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  
  // Find first root note on low E string
  const lowEString = STANDARD_TUNING[0]; // 'E'
  let firstRootFret = 0;
  
  for (let fret = 0; fret <= NUM_FRETS; fret++) {
    const note = getNoteAtFret(lowEString, fret);
    if (note === rootNote) {
      firstRootFret = fret;
      break;
    }
  }
  
  // CAGED shapes with very generous overlapping spans
  // Generated dynamically from full fretboard scale data
  // Wide boundaries ensure ALL scale notes within each shape region are included
  // All 5 shapes MUST be included for complete CAGED system
  const cagedShapes = [
    { name: 'C Shape', offset: -4, span: 10 },  // Wide span ensures complete pattern coverage
    { name: 'A Shape', offset: -1, span: 10 },  // Overlaps with C shape for smooth transitions
    { name: 'G Shape', offset: 2, span: 10 },   // Wide span captures all notes in G shape region
    { name: 'E Shape', offset: 6, span: 10 },   // Generous span for complete E shape pattern
    { name: 'D Shape', offset: 9, span: 7 },    // Reduced span to ensure it fits on fretboard
  ];
  
  cagedShapes.forEach((shape, index) => {
    let startFret = Math.max(0, firstRootFret + shape.offset);
    let endFret = Math.min(NUM_FRETS, startFret + shape.span);
    
    // If shape would start beyond fretboard, wrap it to lower octave
    if (startFret >= NUM_FRETS) {
      startFret = Math.max(0, startFret - 12);
      endFret = Math.min(NUM_FRETS, startFret + shape.span);
    }
    
    // Always include all 5 shapes - only exclude if range is invalid
    if (endFret > startFret && endFret > 0) {
      positions.push({
        number: index + 1,
        name: shape.name,
        startFret,
        endFret,
        system: 'CAGED',
      });
    }
  });
  
  return positions;
}

/**
 * Calculate 3-Notes-Per-String (3NPS) positions
 * Returns positions optimized for 3 notes on each string
 */
function get3NPSPositions(rootNote, scaleName) {
  const positions = [];
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const intervals = SCALES[scaleName];
  
  // 3NPS works best with 7-note scales
  if (!intervals || intervals.length < 7) {
    // For pentatonic/other scales, fall back to simpler positioning
    return getCAGEDPositions(rootNote, scaleName);
  }
  
  // Find first root on low E string
  const lowEString = STANDARD_TUNING[0];
  let firstRootFret = 0;
  
  for (let fret = 0; fret <= NUM_FRETS; fret++) {
    const note = getNoteAtFret(lowEString, fret);
    if (note === rootNote) {
      firstRootFret = fret;
      break;
    }
  }
  
  // 3NPS positions: typically 3-4 positions covering the neck
  // Each position spans 5-7 frets to accommodate 3 notes per string
  const npsPositions = [
    { name: 'Position 1', offset: 0, span: 6 },
    { name: 'Position 2', offset: 5, span: 6 },
    { name: 'Position 3', offset: 9, span: 6 },
  ];
  
  npsPositions.forEach((pos, index) => {
    const startFret = Math.max(0, firstRootFret + pos.offset);
    const endFret = Math.min(NUM_FRETS, startFret + pos.span);
    
    if (startFret <= NUM_FRETS) {
      positions.push({
        number: index + 1,
        name: pos.name,
        startFret,
        endFret,
        system: '3NPS',
      });
    }
  });
  
  return positions;
}

/**
 * Calculate scale positions based on selected system
 * @param {string} rootNote - The root note of the scale
 * @param {string} scaleName - The name of the scale
 * @param {string} system - Position system: 'CAGED' or '3NPS'
 * Returns array of position objects with starting fret and range
 */
export function getScalePositions(rootNote, scaleName, system = 'CAGED') {
  if (system === '3NPS') {
    return get3NPSPositions(rootNote, scaleName);
  }
  return getCAGEDPositions(rootNote, scaleName);
}

/**
 * Generate the full fretboard data
 */
export function generateFretboard(rootNote, scaleName) {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const fretboard = [];

  // Iterate strings from low (6th) to high (1st)
  for (let s = 0; s < STANDARD_TUNING.length; s++) {
    const stringData = [];
    const openNote = STANDARD_TUNING[s];

    for (let f = 0; f <= NUM_FRETS; f++) {
      const note = getNoteAtFret(openNote, f);
      const inScale = scaleNotes.includes(note);
      const root = isRoot(note, rootNote);
      const interval = getIntervalNumber(note, rootNote, scaleName);

      stringData.push({
        note,
        fret: f,
        fretNumber: f,
        string: s,
        stringIndex: s,
        stringNote: openNote,
        inScale,
        isRoot: root,
        interval,
      });
    }
    fretboard.push({
      stringNote: openNote,
      stringIndex: s,
      frets: stringData
    });
  }

  return fretboard;
}

/**
 * Detect and cluster chord shapes on the fretboard
 * Groups chord tones into distinct playable shape regions
 * @param {Array} fretboard - Full fretboard data
 * @param {Array} chordNotes - Array of notes in the chord
 * @returns {Array} Array of chord shape clusters
 */
export function detectChordShapes(fretboard, chordNotes) {
  if (!chordNotes || chordNotes.length === 0) return [];

  // Collect all chord tone positions
  const chordTonePositions = [];
  
  fretboard.forEach((stringData, stringIndex) => {
    stringData.frets.forEach(fretData => {
      if (chordNotes.includes(fretData.note) && fretData.fret > 0) {
        chordTonePositions.push({
          stringIndex,
          fret: fretData.fret,
          note: fretData.note,
        });
      }
    });
  });

  if (chordTonePositions.length === 0) return [];

  // Cluster chord tones into distinct shapes
  const shapes = [];
  const used = new Set();

  // Sort by fret position to process shapes from low to high
  const sortedPositions = [...chordTonePositions].sort((a, b) => a.fret - b.fret);

  sortedPositions.forEach(position => {
    const posKey = `${position.stringIndex}-${position.fret}`;
    if (used.has(posKey)) return;

    // Find all nearby chord tones that form a playable shape
    const shapeNotes = [];
    let minFret = position.fret;
    let maxFret = position.fret;
    let minString = position.stringIndex;
    let maxString = position.stringIndex;

    // Collect notes within a 4-fret span (typical hand position)
    chordTonePositions.forEach(tone => {
      const toneKey = `${tone.stringIndex}-${tone.fret}`;
      if (used.has(toneKey)) return;

      // Check if this tone is within playable range of current cluster
      const fretDistance = Math.abs(tone.fret - position.fret);
      
      if (fretDistance <= 4) {
        // Check if adding this note keeps the shape compact
        const wouldMinFret = Math.min(minFret, tone.fret);
        const wouldMaxFret = Math.max(maxFret, tone.fret);
        const wouldMinString = Math.min(minString, tone.stringIndex);
        const wouldMaxString = Math.max(maxString, tone.stringIndex);
        const wouldSpan = wouldMaxFret - wouldMinFret;
        const wouldStringSpan = wouldMaxString - wouldMinString;

        // Keep shapes within 5-fret span and covering at least 2 strings
        if (wouldSpan <= 5 && wouldStringSpan <= 5) {
          shapeNotes.push(tone);
          used.add(toneKey);
          minFret = wouldMinFret;
          maxFret = wouldMaxFret;
          minString = wouldMinString;
          maxString = wouldMaxString;
        }
      }
    });

    // Only create a shape if we have at least 2 notes
    if (shapeNotes.length >= 2) {
      shapes.push({
        notes: shapeNotes,
        minFret,
        maxFret,
        minString,
        maxString,
        fretSpan: maxFret - minFret + 1,
        stringSpan: maxString - minString + 1,
      });
    }
  });

  return shapes;
}

// CAGED shape colors - fixed and consistent
export const CAGED_COLORS = {
  'C': { 
    name: 'C Shape',
    primary: 'rgba(239, 68, 68, 1)', // Red
    glow: 'rgba(239, 68, 68, 0.6)',
    light: 'rgba(248, 113, 113, 0.8)',
    shadow: 'rgba(239, 68, 68, 0.3)'
  },
  'A': { 
    name: 'A Shape',
    primary: 'rgba(168, 85, 247, 1)', // Purple
    glow: 'rgba(168, 85, 247, 0.6)',
    light: 'rgba(192, 132, 252, 0.8)',
    shadow: 'rgba(168, 85, 247, 0.3)'
  },
  'G': { 
    name: 'G Shape',
    primary: 'rgba(34, 197, 94, 1)', // Green
    glow: 'rgba(34, 197, 94, 0.6)',
    light: 'rgba(74, 222, 128, 0.8)',
    shadow: 'rgba(34, 197, 94, 0.3)'
  },
  'E': { 
    name: 'E Shape',
    primary: 'rgba(234, 179, 8, 1)', // Yellow
    glow: 'rgba(234, 179, 8, 0.6)',
    light: 'rgba(250, 204, 21, 0.8)',
    shadow: 'rgba(234, 179, 8, 0.3)'
  },
  'D': { 
    name: 'D Shape',
    primary: 'rgba(6, 182, 212, 1)', // Cyan
    glow: 'rgba(6, 182, 212, 0.6)',
    light: 'rgba(34, 211, 238, 0.8)',
    shadow: 'rgba(6, 182, 212, 0.3)'
  }
};

/**
 * Detect CAGED chord shapes on the fretboard
 * Returns shapes with CAGED shape assignment and multi-shape membership
 * @param {string} chordRoot - Root note of the chord
 * @param {Array} chordNotes - Array of notes in the chord  
 * @param {Array} fretboard - Full fretboard data
 * @returns {Object} Object containing shapes array and note-to-shapes mapping
 */
// True CAGED major chord shape templates
// Each template defines note positions relative to the root note
// Format: { stringOffset: number, fretOffset: number, interval: 'R' | '3' | '5' }
const CAGED_TEMPLATES = {
  // C shape - root on A string, C-form barre chord
  'C': {
    rootString: 1, // A string
    notes: [
      { stringOffset: 0, fretOffset: 0, interval: 'R' },  // Root on A string
      { stringOffset: 1, fretOffset: 2, interval: '5' },  // 5th on D string
      { stringOffset: 2, fretOffset: 0, interval: '3' },  // 3rd on G string
      { stringOffset: 3, fretOffset: 1, interval: 'R' },  // Root on B string
      { stringOffset: 4, fretOffset: 0, interval: '5' }   // 5th on high E string
    ]
  },
  // A shape - root on A string, open A-form
  'A': {
    rootString: 1, // A string
    notes: [
      { stringOffset: 0, fretOffset: 0, interval: 'R' },  // Root on A string
      { stringOffset: 1, fretOffset: 2, interval: '5' },  // 5th on D string
      { stringOffset: 2, fretOffset: 1, interval: '3' },  // 3rd on G string
      { stringOffset: 3, fretOffset: 2, interval: 'R' },  // Root on B string
      { stringOffset: 4, fretOffset: 0, interval: '5' }   // 5th on high E string
    ]
  },
  // G shape - root on low E string, G-form barre
  'G': {
    rootString: 0, // Low E string
    notes: [
      { stringOffset: 0, fretOffset: 0, interval: 'R' },  // Root on low E
      { stringOffset: 1, fretOffset: 2, interval: '5' },  // 5th on A string
      { stringOffset: 2, fretOffset: 0, interval: '3' },  // 3rd on D string
      { stringOffset: 3, fretOffset: 0, interval: 'R' },  // Root on G string
      { stringOffset: 4, fretOffset: 0, interval: '5' },  // 5th on B string
      { stringOffset: 5, fretOffset: 0, interval: 'R' }   // Root on high E
    ]
  },
  // E shape - root on low E string, E-form barre
  'E': {
    rootString: 0, // Low E string
    notes: [
      { stringOffset: 0, fretOffset: 0, interval: 'R' },  // Root on low E
      { stringOffset: 1, fretOffset: 2, interval: '5' },  // 5th on A string
      { stringOffset: 2, fretOffset: 2, interval: 'R' },  // Root on D string
      { stringOffset: 3, fretOffset: 1, interval: '3' },  // 3rd on G string
      { stringOffset: 4, fretOffset: 0, interval: '5' },  // 5th on B string
      { stringOffset: 5, fretOffset: 0, interval: 'R' }   // Root on high E
    ]
  },
  // D shape - root on D string, triangle shape
  'D': {
    rootString: 2, // D string
    notes: [
      { stringOffset: 0, fretOffset: 0, interval: 'R' },  // Root on D string
      { stringOffset: 1, fretOffset: 2, interval: '3' },  // 3rd on G string
      { stringOffset: 2, fretOffset: 3, interval: 'R' },  // Root on B string
      { stringOffset: 3, fretOffset: 2, interval: '5' }   // 5th on high E string
    ]
  }
};

// Helper to calculate note at a given interval from root
function getNoteAtInterval(root, interval, chordNotes) {
  // For major chords: R = 0, 3 = 4 semitones, 5 = 7 semitones
  const intervalMap = {
    'R': 0,
    '3': 4,
    '5': 7
  };
  
  const rootIndex = NOTES.indexOf(root);
  const targetIndex = (rootIndex + intervalMap[interval]) % 12;
  return NOTES[targetIndex];
}

export function detectCAGEDChordShapes(chordRoot, chordNotes, fretboard) {
  if (!chordNotes || chordNotes.length === 0 || !chordRoot) {
    return { shapes: [], noteToShapes: new Map(), connections: [] };
  }

  const shapes = [];
  const noteToShapes = new Map();
  const connections = [];

  // For each CAGED shape template
  Object.entries(CAGED_TEMPLATES).forEach(([shapeName, template]) => {
    // Find all valid root positions for this shape type
    const validRootPositions = [];
    
    fretboard.forEach((stringData, stringIndex) => {
      // Only look for roots on the correct string for this shape
      if (stringIndex === template.rootString) {
        stringData.frets.forEach(fretData => {
          if (fretData.note === chordRoot && fretData.fret > 0 && fretData.fret <= NUM_FRETS) {
            validRootPositions.push({
              stringIndex,
              fret: fretData.fret,
              note: fretData.note
            });
          }
        });
      }
    });

    // For each valid root position, generate a shape instance
    validRootPositions.forEach(rootPos => {
      const shapeNotes = [];
      let isValidShape = true;

      // Apply template to generate shape notes
      template.notes.forEach(templateNote => {
        const targetString = rootPos.stringIndex + templateNote.stringOffset;
        const targetFret = rootPos.fret + templateNote.fretOffset;
        
        // Check if position is valid on fretboard
        if (targetString < 0 || targetString >= STANDARD_TUNING.length ||
            targetFret < 1 || targetFret > NUM_FRETS) {
          isValidShape = false;
          return;
        }

        // Get expected note at this interval
        const expectedNote = getNoteAtInterval(chordRoot, templateNote.interval, chordNotes);
        
        // Get actual note at this position on fretboard
        const stringData = fretboard[targetString];
        const fretData = stringData.frets[targetFret];
        
        // Verify the note matches the template
        if (fretData && fretData.note === expectedNote && chordNotes.includes(fretData.note)) {
          const noteKey = `${targetString}-${targetFret}`;
          
          shapeNotes.push({
            stringIndex: targetString,
            fret: targetFret,
            note: fretData.note,
            isRoot: fretData.note === chordRoot,
            interval: templateNote.interval
          });

          // Track which shapes this note belongs to
          if (!noteToShapes.has(noteKey)) {
            noteToShapes.set(noteKey, []);
          }
          noteToShapes.get(noteKey).push(shapeName);
        } else {
          isValidShape = false;
        }
      });

      // Only add complete, valid shapes
      if (isValidShape && shapeNotes.length === template.notes.length) {
        shapes.push({
          cagedShape: shapeName,
          notes: shapeNotes,
          rootPosition: rootPos
        });
      }
    });
  });

  return { shapes, noteToShapes, connections };
}

// ============================================================================
// CAGED SHAPE TEMPLATE DEFINITIONS
// ============================================================================

/**
 * Template definitions for CAGED major chord shapes
 * Each template contains rootStringIndex and offset patterns relative to the root note position
 */
const CAGED_MAJOR_TEMPLATES = {
  C: {
    rootStringIndex: 4,
    offsets: [
      { stringOffset: 0, fretOffset: 0, role: "root" },
      { stringOffset: -1, fretOffset: -1, role: "fifth" },
      { stringOffset: -2, fretOffset: -3, role: "root" },
      { stringOffset: -3, fretOffset: -2, role: "third" },
      { stringOffset: -4, fretOffset: -3, role: "fifth" }
    ]
  },

  A: {
    rootStringIndex: 4,
    offsets: [
      { stringOffset: 0, fretOffset: 0, role: "root" },
      { stringOffset: -1, fretOffset: 2, role: "fifth" },
      { stringOffset: -2, fretOffset: 2, role: "root" },
      { stringOffset: -3, fretOffset: 2, role: "third" },
      { stringOffset: -4, fretOffset: 0, role: "fifth" }
    ]
  },

  G: {
    rootStringIndex: 5,
    offsets: [
      { stringOffset: 0, fretOffset: 0, role: "root" },
      { stringOffset: -1, fretOffset: -1, role: "third" },
      { stringOffset: -2, fretOffset: -3, role: "fifth" },
      { stringOffset: -3, fretOffset: -3, role: "root" },
      { stringOffset: -4, fretOffset: 0, role: "third" },
      { stringOffset: -5, fretOffset: 0, role: "fifth" }
    ]
  },

  E: {
    rootStringIndex: 5,
    offsets: [
      { stringOffset: 0, fretOffset: 0, role: "root" },
      { stringOffset: -1, fretOffset: 2, role: "fifth" },
      { stringOffset: -2, fretOffset: 2, role: "root" },
      { stringOffset: -3, fretOffset: 1, role: "third" },
      { stringOffset: -4, fretOffset: 0, role: "fifth" },
      { stringOffset: -5, fretOffset: 0, role: "root" }
    ]
  },

  D: {
    rootStringIndex: 1,
    offsets: [
      { stringOffset: 0, fretOffset: 0, role: "root" },
      { stringOffset: 1, fretOffset: -1, role: "third" },
      { stringOffset: 2, fretOffset: -3, role: "fifth" },
      { stringOffset: 3, fretOffset: -3, role: "root" },
      { stringOffset: -1, fretOffset: -1, role: "fifth" }
    ]
  }
};

// ============================================================================
// UNIFIED SHAPE GENERATOR
// ============================================================================

/**
 * Generate chord shape notes from a template definition
 * This is the core engine for all CAGED shape generation
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @param {number} rootStringIndex - The string index where the root note is located (0-5)
 * @param {Array} template - Array of {stringOffset, fretOffset, role} objects
 * @param {string} shapeName - The name of the shape ('E', 'A', 'C', 'G', 'D')
 * @returns {Array} Array of note objects with stringIndex, fret, note, role, shape, rootFret
 */
function generateShapeFromTemplate(rootNote, rootStringIndex, template, shapeName) {
  const shapeNotes = [];

  // Get major chord notes (root, third, fifth)
  const chordNotes = getChordNotes(rootNote, 'Major');
  const thirdNote = chordNotes[1];  // Major third
  const fifthNote = chordNotes[2];  // Perfect fifth

  // Find all positions of root note on the specified root string
  const rootString = STANDARD_TUNING[rootStringIndex];
  
  for (let fret = 0; fret <= NUM_FRETS; fret++) {
    const noteAtFret = getNoteAtFret(rootString, fret);
    
    // If this fret has the root note, generate the shape from this position
    if (noteAtFret === rootNote) {
      const rootFret = fret;
      
      // Log the start of a new shape instance
      console.log(`\n${shapeName} shape instance:`);
      console.log(`root: ${rootNote}`);
      console.log(`stringIndex: ${rootStringIndex}`);
      console.log(`fret: ${rootFret}`);
      console.log('\nnotes:');
      
      // Apply template offsets to generate all notes in the shape
      for (const templateNote of template) {
        const stringIndex = rootStringIndex + templateNote.stringOffset;
        const shapeFret = rootFret + templateNote.fretOffset;
        
        // Only include notes within fretboard bounds
        if (stringIndex >= 0 && stringIndex <= 5 && shapeFret >= 0 && shapeFret <= NUM_FRETS) {
          const stringNote = STANDARD_TUNING[stringIndex];
          const note = getNoteAtFret(stringNote, shapeFret);
          
          // Determine role based on actual note value, not template position
          const role = note === rootNote ? "root" 
                     : note === thirdNote ? "third"
                     : note === fifthNote ? "fifth"
                     : "other";
          
          shapeNotes.push({
            stringIndex: stringIndex,
            fret: shapeFret,
            note: note,
            role: role,
            shape: shapeName,
            rootFret: rootFret
          });
          
          // Log each generated note
          console.log(`stringIndex ${stringIndex} fret ${shapeFret} note ${note} role ${role}`);
        }
      }
    }
  }

  return shapeNotes;
}

// ============================================================================
// CAGED SHAPE GENERATORS (refactored to use templates)
// ============================================================================

/**
 * Generate E shape major chord positions using explicit template offsets
 * This is an isolated function for testing template-based chord generation
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @returns {Array} Array of shape note positions with stringIndex and fret
 */
export function generateEShapeMajor(rootNote) {
  // E shape root is on the low E string (stringIndex 5)
  const notes = generateShapeFromTemplate(rootNote, 5, CAGED_MAJOR_TEMPLATES.E.offsets, 'E');

  console.log("Debug E Shape:", notes.map(n =>
    `stringIndex ${n.stringIndex} fret ${n.fret} note ${n.note} role ${n.role}`
  ));

  return notes;
}

/**
 * Generate A shape major chord positions using explicit template offsets
 * This is an isolated function for testing template-based chord generation
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @returns {Array} Array of shape note positions with stringIndex and fret
 */
export function generateAShapeMajor(rootNote) {
  // A shape root is on the A string (stringIndex 4)
  const notes = generateShapeFromTemplate(rootNote, 4, CAGED_MAJOR_TEMPLATES.A.offsets, 'A');

  console.log("Debug A Shape:", notes.map(n =>
    `stringIndex ${n.stringIndex} fret ${n.fret} note ${n.note} role ${n.role}`
  ));

  return notes;
}

/**
 * Generate C shape major chord positions using explicit template offsets
 * This is an isolated function for testing template-based chord generation
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @returns {Array} Array of shape note positions with stringIndex and fret
 */
export function generateCShapeMajor(rootNote) {
  // C shape root is ALWAYS on the A string (stringIndex 4)
  const rootStringIndex = 4;
  const shapeNotes = [];
  const template = CAGED_MAJOR_TEMPLATES.C.offsets;

  // Get major chord notes (root, third, fifth)
  const chordNotes = getChordNotes(rootNote, 'Major');
  const thirdNote = chordNotes[1];  // Major third
  const fifthNote = chordNotes[2];  // Perfect fifth

  // Find all positions of root note on A string (stringIndex 4)
  const aString = STANDARD_TUNING[rootStringIndex];
  
  for (let fret = 0; fret <= NUM_FRETS; fret++) {
    const noteAtFret = getNoteAtFret(aString, fret);
    
    // If this fret has the root note, generate the C shape from this position
    if (noteAtFret === rootNote) {
      const rootFret = fret;
      
      // Log the start of a new shape instance
      console.log(`\nC shape instance:`);
      console.log(`root: ${rootNote}`);
      console.log(`stringIndex: ${rootStringIndex}`);
      console.log(`fret: ${rootFret}`);
      console.log('\nnotes:');
      
      // Apply template offsets to generate all notes in the shape
      for (const templateNote of template) {
        const stringIndex = rootStringIndex + templateNote.stringOffset;
        const shapeFret = rootFret + templateNote.fretOffset;
        
        // Only include notes within fretboard bounds (exclude negative frets)
        if (stringIndex >= 0 && stringIndex <= 5 && shapeFret >= 0 && shapeFret <= NUM_FRETS) {
          const stringNote = STANDARD_TUNING[stringIndex];
          const note = getNoteAtFret(stringNote, shapeFret);
          
          // Determine role based on actual note value, not template position
          const role = note === rootNote ? "root" 
                     : note === thirdNote ? "third"
                     : note === fifthNote ? "fifth"
                     : "other";
          
          shapeNotes.push({
            stringIndex: stringIndex,
            fret: shapeFret,
            note: note,
            role: role,
            shape: 'C',
            rootFret: rootFret
          });
          
          // Log each generated note
          console.log(`stringIndex ${stringIndex} fret ${shapeFret} note ${note} role ${role}`);
        }
      }
    }
  }

  console.log("Debug C Shape:", shapeNotes.map(n =>
    `stringIndex ${n.stringIndex} fret ${n.fret} note ${n.note} role ${n.role}`
  ));

  return shapeNotes;
}

/**
 * Generate G shape major chord positions using explicit template offsets
 * This is an isolated function for testing template-based chord generation
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @returns {Array} Array of shape note positions with stringIndex and fret
 */
export function generateGShapeMajor(rootNote) {
  // G shape root is on the high E string (stringIndex 5)
  const notes = generateShapeFromTemplate(rootNote, 5, CAGED_MAJOR_TEMPLATES.G.offsets, 'G');

  console.log("Debug G Shape:", notes.map(n =>
    `stringIndex ${n.stringIndex} fret ${n.fret} note ${n.note} role ${n.role}`
  ));

  return notes;
}

/**
 * Generate D shape major chord positions using explicit template offsets
 * This is an isolated function for testing template-based chord generation
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @returns {Array} Array of shape note positions with stringIndex and fret
 */
export function generateDShapeMajor(rootNote) {
  // D shape root is ALWAYS on the B string (stringIndex 1)
  const rootStringIndex = 1;
  const shapeNotes = [];
  const template = CAGED_MAJOR_TEMPLATES.D.offsets;

  // Get major chord notes (root, third, fifth)
  const chordNotes = getChordNotes(rootNote, 'Major');
  const thirdNote = chordNotes[1];  // Major third
  const fifthNote = chordNotes[2];  // Perfect fifth

  // Find all positions of root note on B string (stringIndex 1)
  const bString = STANDARD_TUNING[rootStringIndex];
  
  for (let fret = 0; fret <= NUM_FRETS; fret++) {
    const noteAtFret = getNoteAtFret(bString, fret);
    
    // If this fret has the root note AND fret >= 5, generate the D shape from this position
    if (noteAtFret === rootNote && fret >= 5) {
      const rootFret = fret;
      
      // Log the start of a new shape instance
      console.log(`\nD shape instance:`);
      console.log(`root: ${rootNote}`);
      console.log(`stringIndex: ${rootStringIndex}`);
      console.log(`fret: ${rootFret}`);
      console.log('\nnotes:');
      
      // Apply template offsets to generate all notes in the shape
      for (const templateNote of template) {
        const stringIndex = rootStringIndex + templateNote.stringOffset;
        const shapeFret = rootFret + templateNote.fretOffset;
        
        // Only include notes within fretboard bounds
        if (stringIndex >= 0 && stringIndex <= 5 && shapeFret >= 0 && shapeFret <= NUM_FRETS) {
          const stringNote = STANDARD_TUNING[stringIndex];
          const note = getNoteAtFret(stringNote, shapeFret);
          
          // Determine role based on actual note value, not template position
          const role = note === rootNote ? "root" 
                     : note === thirdNote ? "third"
                     : note === fifthNote ? "fifth"
                     : "other";
          
          shapeNotes.push({
            stringIndex: stringIndex,
            fret: shapeFret,
            note: note,
            role: role,
            shape: 'D',
            rootFret: rootFret
          });
          
          // Log each generated note
          console.log(`stringIndex ${stringIndex} fret ${shapeFret} note ${note} role ${role}`);
        }
      }
    }
  }

  console.log("Debug D Shape:", shapeNotes.map(n =>
    `stringIndex ${n.stringIndex} fret ${n.fret} note ${n.note} role ${n.role}`
  ));

  return shapeNotes;
}

/**
 * Generate all CAGED major chord shapes for a given root note
 * Combines E, A, C, G, and D shapes into a single array
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @returns {Array} Combined array of all CAGED shape notes
 */
export function generateAllCAGEDMajorShapes(rootNote) {
  const eShape = generateEShapeMajor(rootNote);
  const aShape = generateAShapeMajor(rootNote);
  const cShape = generateCShapeMajor(rootNote);
  const gShape = generateGShapeMajor(rootNote);
  const dShape = generateDShapeMajor(rootNote);

  // Combine all shapes into one array
  const allShapes = [
    ...eShape,
    ...aShape,
    ...cShape,
    ...gShape,
    ...dShape
  ];

  return allShapes;
}

/**
 * Generate all CAGED major chord shapes for a given root note
 * Uses the template-based generator and removes duplicate notes
 * 
 * @param {string} rootNote - The root note (e.g., 'A', 'C', 'E')
 * @returns {Array} Combined array of all CAGED shape notes without duplicates
 */
export function generateAllCAGEDShapes(rootNote) {
  console.log("generateAllCAGEDShapes root:", rootNote);
  
  let allNotes = [];

  // Generate notes for each CAGED shape
  for (const shapeName in CAGED_MAJOR_TEMPLATES) {
    let shapeNotes = [];
    
    // Call the appropriate generator for each shape
    if (shapeName === 'C') shapeNotes = generateCShapeMajor(rootNote);
    else if (shapeName === 'A') shapeNotes = generateAShapeMajor(rootNote);
    else if (shapeName === 'G') shapeNotes = generateGShapeMajor(rootNote);
    else if (shapeName === 'E') shapeNotes = generateEShapeMajor(rootNote);
    else if (shapeName === 'D') shapeNotes = generateDShapeMajor(rootNote);
    
    allNotes.push(...shapeNotes);
  }

  // Remove duplicates based on stringIndex and fret
  const unique = new Map();

  allNotes.forEach(note => {
    const key = `${note.stringIndex}-${note.fret}`;
    unique.set(key, note);
  });

  return Array.from(unique.values());
}
