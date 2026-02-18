import * as Tone from 'tone';

/**
 * AudioEngine - Core audio system manager for the guitar fretboard
 * Handles Tone.js initialization, realistic guitar sample playback, and effects processing
 */
class AudioEngine {
  constructor() {
    this.initialized = false;
    this.sampler = null;
    this.isPlaying = false;
  }

  /**
   * Initialize Tone.js audio context with realistic guitar samples
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
        decay: 2.0,
        wet: 0.25,
      }).toDestination();
      
      await reverb.generate();
      console.log('Reverb generated');

      // Create guitar sampler with strategically mapped samples
      // Using multiple sample points across the range for natural pitch shifting
      this.sampler = new Tone.Sampler({
        urls: {
          'E2': 'E2.mp3',
          'A2': 'A2.mp3',
          'D3': 'D3.mp3',
          'G3': 'G3.mp3',
          'B3': 'B3.mp3',
          'E4': 'E4.mp3',
          'A4': 'A4.mp3',
        },
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        onload: () => {
          console.log('Guitar samples loaded successfully');
        },
        onerror: (error) => {
          console.error('Error loading samples:', error);
          // Fallback to synthesis if samples fail to load
          this.initializeFallbackSynth();
        },
        attack: 0,
        release: 1.5,
        curve: 'exponential',
      }).connect(reverb);

      console.log('Sampler created');

      // Add compression for consistent dynamics
      const compressor = new Tone.Compressor({
        threshold: -24,
        ratio: 4,
        attack: 0.003,
        release: 0.25,
      }).toDestination();

      this.sampler.connect(compressor);

      // Add subtle EQ to enhance guitar frequencies
      const eq = new Tone.EQ3({
        low: 1,
        mid: 2,
        high: -1,
        lowFrequency: 250,
        highFrequency: 4000,
      }).toDestination();

      this.sampler.connect(eq);

      this.initialized = true;
      console.log('Audio engine initialized successfully');
      console.log('Sampler status:', { sampler: !!this.sampler });
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      this.initialized = false;
    }
  }

  /**
   * Fallback synthesis if samples fail to load
   * Uses advanced synthesis to approximate guitar sound
   */
  initializeFallbackSynth() {
    console.log('Initializing fallback synthesis...');
    
    // Create a more guitar-like synth using Karplus-Strong algorithm approximation
    this.sampler = new Tone.PolySynth(Tone.PluckSynth, {
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.9,
    }).toDestination();
    
    console.log('Fallback synth created');
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
   * Play a single note with realistic guitar sample
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

    if (!this.sampler) {
      console.error('Sampler not available');
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

      // Convert frequency to note name for Tone.js
      const noteName = Tone.Frequency(frequency).toNote();
      console.log('Note name:', noteName);

      // Adjust duration based on articulation
      let adjustedDuration = duration;
      let velocity = 0.8;
      
      switch (articulation) {
        case 'legato':
          adjustedDuration = duration * 1.5;
          velocity = 0.7;
          break;
        case 'staccato':
          adjustedDuration = Math.min(duration * 0.3, 0.15);
          velocity = 0.9;
          break;
        default: // normal
          adjustedDuration = duration;
          velocity = 0.8;
      }

      // Add slight random variation for natural feel
      velocity = velocity + (Math.random() - 0.5) * 0.1;
      velocity = Math.max(0.3, Math.min(1, velocity));

      console.log('Triggering sampler with note:', noteName, 'duration:', adjustedDuration, 'velocity:', velocity);
      console.log('Audio context state:', Tone.getContext().state);
      
      // Trigger the sampler with the calculated note
      this.sampler.triggerAttackRelease(noteName, adjustedDuration, undefined, velocity);
      
      console.log('Note triggered successfully');
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  /**
   * Stop all currently playing notes
   */
  stopAll() {
    if (this.sampler) {
      this.sampler.releaseAll();
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.sampler) {
      this.sampler.dispose();
    }
    this.initialized = false;
  }
}

// Export singleton instance
const audioEngine = new AudioEngine();
export default audioEngine;
