import * as Tone from 'tone';

/**
 * BackingTrack - Generates and plays musical backing tracks
 * Creates chord progressions that match the selected root note and scale
 */
class BackingTrack {
  constructor() {
    this.initialized = false;
    this.synth = null;
    this.basssynth = null;
    this.pattern = null;
    this.isPlaying = false;
    this.currentChords = [];
  }

  /**
   * Initialize the backing track synths
   */
  async initialize() {
    if (this.initialized) return;

    await Tone.start();

    // Pad synth for chords
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.5,
        decay: 0.3,
        sustain: 0.7,
        release: 1.5,
      },
      volume: -18,
    }).toDestination();

    // Bass synth for root notes
    this.bassSynth = new Tone.Synth({
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.05,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
      },
      volume: -15,
    }).toDestination();

    // Add reverb for atmosphere
    const reverb = new Tone.Reverb({
      decay: 3,
      wet: 0.3,
    }).toDestination();

    this.synth.connect(reverb);
    this.bassSynth.connect(reverb);

    this.initialized = true;
  }

  /**
   * Generate chord progression based on scale
   * Returns array of chord objects with notes and duration
   */
  generateChordProgression(rootNote, scaleName) {
    const scaleIntervals = this.getScaleIntervals(scaleName);
    const chords = this.buildChordsFromScale(rootNote, scaleIntervals, scaleName);
    
    // Common progressions based on scale type
    let progression;
    
    if (scaleName.includes('Minor') || scaleName.includes('Aeolian')) {
      // Minor progression: i - iv - i - v
      progression = [chords[0], chords[3], chords[0], chords[4]];
    } else if (scaleName.includes('Blues')) {
      // Blues progression: I - IV - I - V
      progression = [chords[0], chords[3], chords[0], chords[4]];
    } else if (scaleName.includes('Dorian')) {
      // Dorian: i - IV - i - IV
      progression = [chords[0], chords[3], chords[0], chords[3]];
    } else {
      // Major/default progression: I - IV - V - IV
      progression = [chords[0], chords[3], chords[4], chords[3]];
    }

    return progression.map(chord => ({
      notes: chord,
      duration: '2m', // 2 measures per chord
    }));
  }

  /**
   * Get scale intervals for a given scale name
   */
  getScaleIntervals(scaleName) {
    const SCALES = {
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

    return SCALES[scaleName] || [0, 2, 4, 5, 7, 9, 11]; // Default to major
  }

  /**
   * Build chords from scale degrees
   */
  buildChordsFromScale(rootNote, intervals, scaleName) {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = NOTES.indexOf(rootNote);
    
    // Get scale notes
    const scaleNotes = intervals.map(interval => 
      NOTES[(rootIndex + interval) % 12]
    );

    // Build triads on each scale degree
    const chords = [];
    
    for (let i = 0; i < Math.min(scaleNotes.length, 7); i++) {
      const root = scaleNotes[i];
      const third = scaleNotes[(i + 2) % scaleNotes.length];
      const fifth = scaleNotes[(i + 4) % scaleNotes.length];
      
      // Add octave numbers for Tone.js
      const rootMidi = NOTES.indexOf(root);
      const octave = rootMidi >= NOTES.indexOf(rootNote) ? 3 : 4;
      
      chords.push([
        `${root}${octave}`,
        `${third}${octave}`,
        `${fifth}${octave + 1}`,
      ]);
    }

    return chords;
  }

  /**
   * Start playing the backing track
   */
  async play(rootNote, scaleName) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Stop if already playing
    this.stop();

    // Generate chord progression
    const progression = this.generateChordProgression(rootNote, scaleName);
    this.currentChords = progression;

    // Set tempo (comfortable practice tempo)
    Tone.Transport.bpm.value = 80;

    let chordIndex = 0;

    // Create a repeating pattern
    this.pattern = new Tone.Pattern((time, chord) => {
      // Play chord
      this.synth.triggerAttackRelease(chord.notes, chord.duration, time);
      
      // Play bass note on beats 1 and 3
      const bassNote = chord.notes[0].replace(/\d/, '2'); // Drop to lower octave
      this.bassSynth.triggerAttackRelease(bassNote, '4n', time);
      this.bassSynth.triggerAttackRelease(bassNote, '4n', time + Tone.Time('4n').toSeconds() * 2);
      
    }, progression, 'up').start(0);

    // Start transport
    Tone.Transport.start();
    this.isPlaying = true;
  }

  /**
   * Stop the backing track
   */
  stop() {
    if (this.pattern) {
      this.pattern.stop();
      this.pattern.dispose();
      this.pattern = null;
    }
    
    Tone.Transport.stop();
    this.isPlaying = false;
  }

  /**
   * Check if backing track is playing
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Get current BPM for tempo-synced animations
   */
  getBPM() {
    return Tone.Transport.bpm.value;
  }

  /**
   * Update backing track when root/scale changes
   */
  async update(rootNote, scaleName) {
    if (this.isPlaying) {
      await this.play(rootNote, scaleName);
    }
  }
}

// Singleton instance
const backingTrack = new BackingTrack();
export default backingTrack;
