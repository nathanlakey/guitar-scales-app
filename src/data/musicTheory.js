// All 12 chromatic notes
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Note-based color mapping - SINGLE SOURCE OF TRUTH for all note colors
// DO NOT add color logic anywhere else in the application
export const NOTE_COLOR_MAP = {
  "C":  "#00C853",  // Flat 3 in A minor — GREEN
  "C#": "#00ACC1",  // Major 3 in A major — TEAL
  "D":  "#FFD600",  // golden yellow
  "D#": "#FF8F00",  // orange
  "E":  "#2979FF",  // blue
  "F":  "#AA00FF",  // purple
  "F#": "#FF6F61",  // coral
  "G":  "#FF9F1C",  // orange-amber
  "G#": "#8E24AA",  // violet
  "A":  "#FF3B30",  // red
  "A#": "#6A4C93",  // indigo
  "B":  "#A3E635"   // lime
};

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

// Scale definitions using semitone intervals from root with degree labels
export const SCALES = {
  'Major (Ionian)': {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7']
  },
  'Natural Minor (Aeolian)': {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '♭7']
  },
  'Dorian': {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', '♭3', '4', '5', '6', '♭7']
  },
  'Phrygian': {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degrees: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7']
  },
  'Lydian': {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ['1', '2', '3', '♯4', '5', '6', '7']
  },
  'Mixolydian': {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', '♭7']
  },
  'Locrian': {
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7']
  },
  'Harmonic Minor': {
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '7']
  },
  'Melodic Minor': {
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: ['1', '2', '♭3', '4', '5', '6', '7']
  },
  'Major Pentatonic': {
    intervals: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6']
  },
  'Minor Pentatonic': {
    intervals: [0, 3, 5, 7, 10],
    degrees: ['1', '♭3', '4', '5', '♭7']
  },
  'Blues': {
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['1', '♭3', '4', '♭5', '5', '♭7']
  },
  'Major Blues': {
    intervals: [0, 2, 3, 4, 7, 9],
    degrees: ['1', '2', '♭3', '3', '5', '6']
  },
  'Whole Tone': {
    intervals: [0, 2, 4, 6, 8, 10],
    degrees: ['1', '2', '3', '♯4', '♯5', '♯6']
  },
  'Diminished (HW)': {
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    degrees: ['1', '♭2', '♭3', '3', '♯4', '5', '6', '♭7']
  },
  'Diminished (WH)': {
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    degrees: ['1', '2', '♭3', '4', '♭5', '♯5', '6', '7']
  },
  'Chromatic': {
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    degrees: ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7']
  },
  'Hungarian Minor': {
    intervals: [0, 2, 3, 6, 7, 8, 11],
    degrees: ['1', '2', '♭3', '♯4', '5', '♭6', '7']
  },
  'Phrygian Dominant': {
    intervals: [0, 1, 4, 5, 7, 8, 10],
    degrees: ['1', '♭2', '3', '4', '5', '♭6', '♭7']
  },
  'Double Harmonic': {
    intervals: [0, 1, 4, 5, 7, 8, 11],
    degrees: ['1', '♭2', '3', '4', '5', '♭6', '7']
  },
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * @typedef {Object} FretboardNote
 * @property {number} stringIndex - String index (0 = high E, 5 = low E)
 * @property {number} fret - Fret number
 * @property {string} note - Note name (e.g., 'C', 'D#', 'F')
 * @property {'root'|'third'|'fifth'|'scale'|'other'} role - Harmonic role
 * @property {string} [shape] - CAGED shape name (C, A, G, E, D)
 */

/**
 * @typedef {Object} CAGEDTemplate
 * @property {number} rootStringIndex - String where root note is located
 * @property {Array<{stringOffset: number, fretOffset: number}>} positions - Shape positions
 */

// ============================================================================
// CORE NOTE MATH FUNCTIONS (Single Source of Truth)
// ============================================================================

/**
 * Transpose a note by a number of semitones
 * @param {string} note - Starting note
 * @param {number} semitones - Number of semitones to transpose
 * @returns {string} Transposed note
 */
function transposeNote(note, semitones) {
  const startIndex = NOTES.indexOf(note);
  if (startIndex === -1) return note;
  return NOTES[(startIndex + semitones) % 12];
}

/**
 * Get the note at a specific string and fret position
 * @param {number} stringIndex - String index (0 = high E, 5 = low E)
 * @param {number} fret - Fret number
 * @returns {string} Note at that position
 */
export function getNoteAt(stringIndex, fret) {
  const openNote = STANDARD_TUNING[stringIndex];
  return transposeNote(openNote, fret);
}

/**
 * Get the note at a specific fret on a specific string (legacy compatibility)
 * @param {string} stringNote - The open string note
 * @param {number} fret - Fret number
 * @returns {string} Note at that fret
 */
export function getNoteAtFret(stringNote, fret) {
  return transposeNote(stringNote, fret);
}

/**
 * Get major scale notes for a given root
 * @param {string} root - Root note
 * @returns {Array<string>} Array of 7 notes in major scale
 */
export function getMajorScale(root) {
  const intervals = [0, 2, 4, 5, 7, 9, 11];
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

// ADD THIS - Pentatonic scale generators
export function getMajorPentatonic(root) {
  const intervals = [0, 2, 4, 7, 9];
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

export function getMinorPentatonic(root) {
  const intervals = [0, 3, 5, 7, 10];
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

export function getRelativeMinorPentatonic(root) {
  // Relative minor is 3 semitones down from major root
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];
  const relativeMinorRoot = NOTES[(rootIndex - 3 + 12) % 12];
  return getMinorPentatonic(relativeMinorRoot);
}

/**
 * Get all notes in a given scale
 * @param {string} rootNote - Root note
 * @param {string} scaleName - Name of the scale
 * @returns {Array<string>} Array of notes in the scale
 */
export function getScaleNotes(rootNote, scaleName) {
  const scaleDefinition = SCALES[scaleName];
  if (!scaleDefinition) return [];
  const intervals = scaleDefinition.intervals;
  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) return [];
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Get chord tones for a given root and chord type
 * @param {string} root - Root note
 * @param {string} type - Chord type ('Major', 'Minor', etc.)
 * @returns {Array<string>} Array of chord tones
 */
export function getChordTones(root, type) {
  const intervals = CHORDS[type];
  if (!intervals) return [];
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Get all notes in a given chord (legacy compatibility)
 * @param {string} rootNote - Root note
 * @param {string} chordType - Chord type
 * @returns {Array<string>} Array of chord notes
 */
export function getChordNotes(rootNote, chordType) {
  return getChordTones(rootNote, chordType);
}

/**
 * Get the interval (in semitones) between root and target note
 * @param {string} root - Root note
 * @param {string} targetNote - Target note
 * @returns {number} Interval in semitones (0-11)
 */
export function getInterval(root, targetNote) {
  const rootIndex = NOTES.indexOf(root);
  const targetIndex = NOTES.indexOf(targetNote);
  if (rootIndex === -1 || targetIndex === -1) return -1;
  return (targetIndex - rootIndex + 12) % 12;
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
  const lowEString = STANDARD_TUNING[5]; // index 5 = low E
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
  const scaleDefinition = SCALES[scaleName];
  const intervals = scaleDefinition?.intervals;
  
  // 3NPS works best with 7-note scales
  if (!intervals || intervals.length < 7) {
    // For pentatonic/other scales, fall back to simpler positioning
    return getCAGEDPositions(rootNote, scaleName);
  }
  
  // Find first root on low E string
  const lowEString = STANDARD_TUNING[5]; // index 5 = low E
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
  const scaleDefinition = SCALES[scaleName];
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
      
      // Calculate degree from scale definition
      let degree = null;
      if (inScale && scaleDefinition && scaleDefinition.intervals && scaleDefinition.degrees) {
        const rootIdx = NOTES.indexOf(rootNote);
        const noteIdx = NOTES.indexOf(note);
        const semitoneDistance = (noteIdx - rootIdx + 12) % 12;
        const intervalIndex = scaleDefinition.intervals.indexOf(semitoneDistance);
        if (intervalIndex !== -1) {
          degree = scaleDefinition.degrees[intervalIndex];
        }
      }

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
        degree,
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

// ============================================================================
// CAGED CHORD SYSTEM (Production-Ready)
// ============================================================================
//
// This CAGED implementation is:
// • Root-independent: Works for all 12 keys
// • Pure functions: No side effects, deterministic output
// • Scalable: Ready for scales, modes, arpeggios
// • Position-based templates: Roles computed dynamically
// • Zero debug code: Production-ready
//
// Usage:
//   const notes = generateAllCAGEDShapes('D')
//   // Returns all 5 CAGED shapes for D major with computed roles
//
// Note structure:
//   { stringIndex, fret, note, role, shape }
//   role is ALWAYS computed from actual note values
//
// ============================================================================

// ============================================================================
// CAGED SHAPE TEMPLATES (Position-Only, No Roles)
// ============================================================================

/**
 * CAGED chord shape templates
 * Templates define SHAPE ONLY - positions relative to root note
 * Roles are ALWAYS computed dynamically based on actual note values
 */
const CAGED_TEMPLATES = {
  C: {
    rootStringIndex: 4,
    positions: [
      { stringOffset: 0, fretOffset: 0 },
      { stringOffset: -1, fretOffset: -1 },
      { stringOffset: -2, fretOffset: -3 },
      { stringOffset: -3, fretOffset: -2 },
      { stringOffset: -4, fretOffset: -3 }
    ]
  },
  A: {
    rootStringIndex: 4,
    positions: [
      { stringOffset: 0, fretOffset: 0 },
      { stringOffset: -1, fretOffset: 2 },
      { stringOffset: -2, fretOffset: 2 },
      { stringOffset: -3, fretOffset: 2 },
      { stringOffset: -4, fretOffset: 0 }
    ]
  },
  G: {
    rootStringIndex: 5,
    positions: [
      { stringOffset: 0, fretOffset: 0 },
      { stringOffset: -1, fretOffset: -1 },
      { stringOffset: -2, fretOffset: -3 },
      { stringOffset: -3, fretOffset: -3 },
      { stringOffset: -4, fretOffset: 0 },
      { stringOffset: -5, fretOffset: 0 }
    ]
  },
  E: {
    rootStringIndex: 5,
    positions: [
      { stringOffset: 0, fretOffset: 0 },
      { stringOffset: -1, fretOffset: 2 },
      { stringOffset: -2, fretOffset: 2 },
      { stringOffset: -3, fretOffset: 1 },
      { stringOffset: -4, fretOffset: 0 },
      { stringOffset: -5, fretOffset: 0 }
    ]
  },
  D: {
    rootStringIndex: 3,
    positions: [
      { stringOffset: 0, fretOffset: 0 },
      { stringOffset: -1, fretOffset: 2 },
      { stringOffset: -2, fretOffset: 3 },
      { stringOffset: -3, fretOffset: 2 }
    ]
  }
};

// ============================================================================
// CAGED SHAPE GENERATOR (Pure Function)
// ============================================================================

/**
 * Generate CAGED chord shape for a specific shape type and root
 * @param {string} shapeType - Shape type ('C', 'A', 'G', 'E', 'D')
 * @param {string} root - Root note
 * @returns {FretboardNote[]} Array of note objects with stringIndex, fret, note, role
 */
export function generateCAGEDShape(shapeType, root) {
  const template = CAGED_TEMPLATES[shapeType];
  if (!template) return [];

  const notes = [];
  const chordTones = getChordTones(root, 'Major');
  const rootNote = chordTones[0];
  const thirdNote = chordTones[1];
  const fifthNote = chordTones[2];

  const { rootStringIndex, positions } = template;
  const rootString = STANDARD_TUNING[rootStringIndex];

  // Find all occurrences of root note on the root string
  for (let fret = 0; fret <= NUM_FRETS; fret++) {
    const noteAtFret = getNoteAtFret(rootString, fret);
    
    if (noteAtFret === root) {
      // Generate shape from this root position
      for (const pos of positions) {
        const stringIndex = rootStringIndex + pos.stringOffset;
        const noteFret = fret + pos.fretOffset;

        // Only include notes within fretboard bounds
        if (stringIndex >= 0 && stringIndex <= 5 && noteFret >= 0 && noteFret <= NUM_FRETS) {
          const note = getNoteAt(stringIndex, noteFret);
          
          // Compute role dynamically based on actual note value
          const role = note === rootNote ? 'root'
                     : note === thirdNote ? 'third'
                     : note === fifthNote ? 'fifth'
                     : 'other';

          // ONLY include chord tones (root, third, fifth) - NEVER 'other'
          if (role !== 'other') {
            notes.push({
              stringIndex,
              fret: noteFret,
              note,
              role,
              shape: shapeType
            });
          }
        }
      }
    }
  }

  return notes;
}

/**
 * Generate all CAGED shapes for a given root
 * @param {string} root - Root note
 * @returns {FretboardNote[]} Combined array of all CAGED shape notes without duplicates
 */
export function generateAllCAGEDShapes(root) {
  const allNotes = [];

  // Generate all 5 CAGED shapes
  for (const shapeType of ['C', 'A', 'G', 'E', 'D']) {
    const shapeNotes = generateCAGEDShape(shapeType, root);
    allNotes.push(...shapeNotes);
  }

  // Remove duplicates (same position can be in multiple shapes)
  const uniqueNotes = new Map();
  allNotes.forEach(note => {
    const key = `${note.stringIndex}-${note.fret}`;
    if (!uniqueNotes.has(key)) {
      uniqueNotes.set(key, note);
    }
  });

  return Array.from(uniqueNotes.values());
}
