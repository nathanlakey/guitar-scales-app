import * as Tone from 'tone';

/**
 * AudioEngine - Core audio system manager for the guitar fretboard
 * Handles Tone.js initialization and realistic guitar synthesis
 */
class AudioEngine {
  constructor() {
    this.initialized = false;
    this.synth = null;
    this.isPlaying = false;
  }

  /**
   * Initialize Tone.js audio context with realistic guitar synthesis
   * Must be called after user interaction (browser autoplay policy)
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await Tone.start();
      console.log('Audio context started');
      console.log('Audio context state:', Tone.getContext().state);

      // Create reverb for natural guitar ambience
      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.2,
      }).toDestination();
      
      await reverb.generate();
      console.log('Reverb generated');

      // Create realistic guitar synth using PluckSynth (Karplus-Strong algorithm)
      // This produces a natural, guitar-like plucked string sound
      this.synth = new Tone.PolySynth(Tone.PluckSynth, {
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.92,
      }).connect(reverb);

      console.log('Guitar synth created');

      // Add compression for consistent dynamics
      const compressor = new Tone.Compressor({
        threshold: -20,
        ratio: 3,
        attack: 0.003,
        release: 0.25,
      }).toDestination();

      this.synth.connect(compressor);

      // Add subtle EQ to enhance guitar frequencies
      const eq = new Tone.EQ3({
        low: 2,
        mid: 1.5,
        high: 0,
        lowFrequency: 200,
        highFrequency: 4000,
      }).toDestination();

      this.synth.connect(eq);

      this.initialized = true;
      console.log('Audio engine initialized successfully');
      console.log('Synth status:', { synth: !!this.synth });
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
   * Play a single note with realistic guitar synthesis
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

    if (!this.synth) {
      console.error('Synth not available');
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
      let velocity = 0.85;
      
      switch (articulation) {
        case 'legato':
          adjustedDuration = duration * 1.5;
          velocity = 0.75;
          break;
        case 'staccato':
          adjustedDuration = Math.min(duration * 0.3, 0.15);
          velocity = 0.95;
          break;
        default: // normal
          adjustedDuration = duration;
          velocity = 0.85;
      }

      // Add slight random variation for natural feel
      velocity = velocity + (Math.random() - 0.5) * 0.1;
      velocity = Math.max(0.4, Math.min(1, velocity));

      console.log('Triggering synth - frequency:', frequency, 'duration:', adjustedDuration, 'velocity:', velocity);
      console.log('Audio context state:', Tone.getContext().state);
      
      // Trigger the synth with the calculated frequency
      this.synth.triggerAttackRelease(frequency, adjustedDuration, undefined, velocity);
      
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
