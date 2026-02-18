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

    // Create a Sampler with realistic guitar samples
    // Using a multi-sampled approach covering the guitar's range
    this.synth = new Tone.Sampler({
      urls: {
        // Sample map covering guitar range from low E (E2) to high notes
        // Using subset of notes and Tone.js will interpolate between them
        "E2": "https://tonejs.github.io/audio/salamander/E2.mp3",
        "A2": "https://tonejs.github.io/audio/salamander/A2.mp3",
        "D3": "https://tonejs.github.io/audio/salamander/D3.mp3",
        "G3": "https://tonejs.github.io/audio/salamander/G3.mp3",
        "B3": "https://tonejs.github.io/audio/salamander/B3.mp3",
        "E4": "https://tonejs.github.io/audio/salamander/E4.mp3",
        "A4": "https://tonejs.github.io/audio/salamander/A4.mp3",
        "D5": "https://tonejs.github.io/audio/salamander/D5.mp3",
      },
      release: 1,
      baseUrl: "",
      onload: () => {
        console.log('Guitar samples loaded');
      },
    }).toDestination();

    // Add subtle reverb for natural acoustic space
    const reverb = new Tone.Reverb({
      decay: 1.8,
      wet: 0.12,
    }).toDestination();

    this.synth.connect(reverb);

    // Add gentle compression for consistent volume
    const compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.1,
    }).toDestination();

    this.synth.connect(compressor);

    this.initialized = true;
  }

  /**
   * Convert string and fret to frequency
   * Uses scientific pitch notation and equal temperament tuning
   * Standard tuning (low to high): E2, A2, D3, G3, B3, E4
   * @param {string} stringNote - The open note of the string ('E', 'A', 'D', 'G', 'B')
   * @param {number} fret - Fret number (0-24)
   * @param {number} stringIndex - Optional: string index (0-5) for disambiguation
   */
  getFrequency(stringNote, fret, stringIndex = null) {
    // Standard tuning MIDI note numbers for open strings (low to high)
    // Matches STANDARD_TUNING array: ['E', 'A', 'D', 'G', 'B', 'E']
    const openStringMidiByIndex = [40, 45, 50, 55, 59, 64];
    
    let baseMidi;
    
    if (stringIndex !== null && stringIndex >= 0 && stringIndex < 6) {
      // Use the string index for precise MIDI note (preferred method)
      baseMidi = openStringMidiByIndex[stringIndex];
    } else {
      // Fallback: determine by note name
      const openStringMidi = {
        'A': 45,  // A2
        'D': 50,  // D3
        'G': 55,  // G3
        'B': 59,  // B3
      };
      
      if (stringNote === 'E') {
        // Default to low E if no index provided
        baseMidi = 40; // E2
      } else {
        baseMidi = openStringMidi[stringNote] || 40;
      }
    }

    // Calculate the MIDI note number for this fret
    const midiNote = baseMidi + fret;
    
    // Convert MIDI note to frequency using A440 tuning
    // Formula: f = 440 * 2^((n - 69) / 12) where 69 is A4 (MIDI note 69)
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    return frequency;
  }

  /**
   * Convert MIDI note number to note name with octave
   * @param {number} midiNote - MIDI note number (e.g., 60 = C4)
   * @returns {string} Note name with octave (e.g., 'C4')
   */
  midiToNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return noteName + octave;
  }

  /**
   * Play a single note
   * @param {string} stringNote - Note name of the string (e.g., 'E', 'A', 'D')
   * @param {number} fret - Fret number (0-24)
   * @param {number} duration - Note duration in seconds
   * @param {string} articulation - Playing style ('normal', 'legato', 'staccato')
   * @param {number} stringIndex - Optional: string index (0-5) for precise pitch
   */
  playNote(stringNote, fret, duration = 0.5, articulation = 'normal', stringIndex = null) {
    if (!this.initialized) {
      console.warn('AudioEngine not initialized. Call initialize() first.');
      return;
    }

    // Standard tuning MIDI note numbers for open strings (low to high)
    const openStringMidiByIndex = [40, 45, 50, 55, 59, 64];
    
    let baseMidi;
    
    if (stringIndex !== null && stringIndex >= 0 && stringIndex < 6) {
      baseMidi = openStringMidiByIndex[stringIndex];
    } else {
      const openStringMidi = {
        'A': 45,  // A2
        'D': 50,  // D3
        'G': 55,  // G3
        'B': 59,  // B3
      };
      
      if (stringNote === 'E') {
        baseMidi = 40; // E2
      } else {
        baseMidi = openStringMidi[stringNote] || 40;
      }
    }

    const midiNote = baseMidi + fret;
    const noteName = this.midiToNoteName(midiNote);

    // Adjust duration based on articulation
    let adjustedDuration = duration;
    
    switch (articulation) {
      case 'legato':
        adjustedDuration = duration * 1.5;
        break;
      case 'staccato':
        adjustedDuration = Math.min(duration * 0.4, 0.2);
        break;
      default: // normal
        adjustedDuration = duration;
    }

    // Trigger the sampler with the note name
    this.synth.triggerAttackRelease(noteName, adjustedDuration);
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
