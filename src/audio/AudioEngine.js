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

    try {
      await Tone.start();
      console.log('Audio context started');
      console.log('Audio context state:', Tone.getContext().state);

      // Create reverb first and wait for it to generate
      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.15,
      }).toDestination();
      
      // Wait for reverb to be ready
      await reverb.generate();
      console.log('Reverb generated');

      // Create a reliable polyphonic synth with pluck-like characteristics
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'triangle',
        },
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0.15,
          release: 1.5,
        },
        volume: -8,
      }).toDestination();

      console.log('Main synth created');

      // Layer with FMSynth for richness
      this.fmSynth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.001,
          decay: 0.3,
          sustain: 0.1,
          release: 1.2,
        },
        modulation: {
          type: 'square',
        },
        modulationEnvelope: {
          attack: 0.002,
          decay: 0.2,
          sustain: 0,
          release: 0.2,
        },
        volume: -20,
      }).toDestination();

      console.log('FM synth created');

      // Connect synths to reverb
      this.synth.connect(reverb);
      this.fmSynth.connect(reverb);

      // Add gentle compression for consistent volume
      const compressor = new Tone.Compressor({
        threshold: -20,
        ratio: 3,
        attack: 0.003,
        release: 0.1,
      }).toDestination();

      this.synth.connect(compressor);
      this.fmSynth.connect(compressor);

      this.initialized = true;
      console.log('Audio engine initialized successfully');
      console.log('Synth status:', { synth: !!this.synth, fmSynth: !!this.fmSynth });
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      this.initialized = false;
    }
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
   * Play a single note
   * @param {string} stringNote - Note name of the string (e.g., 'E', 'A', 'D')
   * @param {number} fret - Fret number (0-24)
   * @param {number} duration - Note duration in seconds
   * @param {string} articulation - Playing style ('normal', 'legato', 'staccato')
   * @param {number} stringIndex - Optional: string index (0-5) for precise pitch
   */
  playNote(stringNote, fret, duration = 0.5, articulation = 'normal', stringIndex = null) {
    console.log('playNote called:', { stringNote, fret, duration, articulation, stringIndex, initialized: this.initialized });
    
    if (!this.initialized) {
      console.warn('AudioEngine not initialized. Call initialize() first.');
      return;
    }

    if (!this.synth || !this.fmSynth) {
      console.error('Synths not available:', { synth: !!this.synth, fmSynth: !!this.fmSynth });
      return;
    }

    // Ensure audio context is running
    if (Tone.getContext().state !== 'running') {
      console.log('Resuming audio context...');
      Tone.getContext().resume();
    }

    try {
      // Calculate frequency using the existing getFrequency method
      const frequency = this.getFrequency(stringNote, fret, stringIndex);
      console.log('Calculated frequency:', frequency, 'Hz');
      
      if (!frequency || frequency <= 0) {
        console.error('Invalid frequency calculated:', frequency);
        return;
      }

      // Adjust duration based on articulation
      let adjustedDuration = duration;
      
      switch (articulation) {
        case 'legato':
          adjustedDuration = duration * 1.5;
          break;
        case 'staccato':
          adjustedDuration = Math.min(duration * 0.3, 0.15);
          break;
        default: // normal
          adjustedDuration = duration;
      }

      console.log('Triggering synths with frequency:', frequency, 'duration:', adjustedDuration);
      console.log('Audio context state:', Tone.getContext().state);
      
      // Play with both synths for rich, layered guitar tone
      this.synth.triggerAttackRelease(frequency, adjustedDuration);
      this.fmSynth.triggerAttackRelease(frequency, adjustedDuration);
      
      console.log('Note triggered successfully');
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  /**
   * Stop all currently playing notes
   */
  stopAll() {
    if (this.synth) {
      this.synth.releaseAll();
    }
    if (this.fmSynth) {
      this.fmSynth.releaseAll();
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.synth) {
      this.synth.dispose();
    }
    if (this.fmSynth) {
      this.fmSynth.dispose();
    }
    this.initialized = false;
  }
}

// Export singleton instance
const audioEngine = new AudioEngine();
export default audioEngine;
