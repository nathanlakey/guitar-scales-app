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

// Standard guitar tuning (low to high): E A D G B E
export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

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
