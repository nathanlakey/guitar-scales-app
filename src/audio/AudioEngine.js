import * as Tone from 'tone';

/**
 * AudioEngine - Core audio system manager for the guitar fretboard
 * Handles Tone.js initialization, guitar synthesis, and note playback
 */
class AudioEngine {
  constructor() {
    this.initialized = false;
    this.synth = null;
    this.isPlaying = false;
  }

  /**
   * Initialize Tone.js audio context
   * Must be called after user interaction (browser autoplay policy)
   */
  async initialize() {
    if (this.initialized) return;

    await Tone.start();
    console.log('Audio context started');

    // Create a polyphonic synthesizer with guitar-like timbre
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle',
        partials: [1, 0.5, 0.3, 0.2, 0.1], // Harmonic content for warmth
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1.2,
      },
      volume: -8,
    }).toDestination();

    // Add reverb for natural space
    const reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.15,
    }).toDestination();

    this.synth.connect(reverb);

    this.initialized = true;
  }

  /**
   * Convert string and fret to frequency
   * Uses scientific pitch notation and equal temperament tuning
   */
  getFrequency(stringNote, fret) {
    const noteToMidi = {
      C: 0,
      'C#': 1,
      Db: 1,
      D: 2,
      'D#': 3,
      Eb: 3,
      E: 4,
      F: 5,
      'F#': 6,
      Gb: 6,
      G: 7,
      'G#': 8,
      Ab: 8,
      A: 9,
      'A#': 10,
      Bb: 10,
      B: 11,
    };

    // Standard tuning MIDI note numbers (string 1 = high E)
    const stringMidi = {
      E: 64, // High E (E4)
      B: 59, // B3
      G: 55, // G3
      D: 50, // D3
      A: 45, // A2
      E2: 40, // Low E (E2)
    };

    let baseMidi;
    if (stringNote === 'E' && fret === 0) {
      // Determine which E string (check context or default to high E)
      baseMidi = stringMidi.E;
    } else {
      baseMidi = stringMidi[stringNote] || stringMidi.E2;
    }

    const midiNote = baseMidi + fret;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    return frequency;
  }

  /**
   * Play a single note
   * @param {string} stringNote - Note name of the string (e.g., 'E', 'A', 'D')
   * @param {number} fret - Fret number (0-24)
   * @param {number} duration - Note duration in seconds
   * @param {string} articulation - Playing style ('normal', 'legato', 'staccato')
   */
  playNote(stringNote, fret, duration = 0.5, articulation = 'normal') {
    if (!this.initialized) {
      console.warn('AudioEngine not initialized. Call initialize() first.');
      return;
    }

    const frequency = this.getFrequency(stringNote, fret);

    // Adjust envelope based on articulation
    const originalEnvelope = { ...this.synth.get().envelope };

    switch (articulation) {
      case 'legato':
        this.synth.set({
          envelope: {
            attack: 0.001,
            decay: 0.05,
            sustain: 0.9,
            release: 0.3,
          },
        });
        break;
      case 'staccato':
        this.synth.set({
          envelope: {
            attack: 0.001,
            decay: 0.05,
            sustain: 0.1,
            release: 0.1,
          },
        });
        duration = Math.min(duration, 0.2);
        break;
      default: // normal
        this.synth.set({ envelope: originalEnvelope });
    }

    this.synth.triggerAttackRelease(frequency, duration);

    // Reset envelope after note
    setTimeout(() => {
      this.synth.set({ envelope: originalEnvelope });
    }, (duration + 0.1) * 1000);
  }

  /**
   * Stop all currently playing notes
   */
  stopAll() {
    if (this.synth) {
      this.synth.releaseAll();
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.synth) {
      this.synth.dispose();
    }
    this.initialized = false;
  }
}

// Export singleton instance
const audioEngine = new AudioEngine();
export default audioEngine;
