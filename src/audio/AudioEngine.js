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
    if (this.initialized) {
      console.log('Audio engine already initialized');
      return true;
    }

    try {
      // Start Tone.js audio context
      await Tone.start();
      console.log('✓ Audio context started');
      console.log('✓ Audio context state:', Tone.getContext().state);

      // Verify audio context is running
      if (Tone.getContext().state !== 'running') {
        console.warn('⚠️ Audio context not running, attempting resume...');
        await Tone.getContext().resume();
      }

      // Create reverb for natural guitar ambience
      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.2,
      }).toDestination();
      
      await reverb.generate();
      console.log('✓ Reverb generated');

      // Create realistic guitar synth using PluckSynth (Karplus-Strong algorithm)
      // This produces a natural, guitar-like plucked string sound
      this.synth = new Tone.PolySynth(Tone.PluckSynth, {
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.92,
      }).toDestination();

      console.log('✓ Guitar synth created and connected to destination');

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
      console.log('✓✓✓ AUDIO ENGINE FULLY INITIALIZED ✓✓✓');
      console.log('Synth ready:', !!this.synth);
      console.log('Context state:', Tone.getContext().state);
      
      // Test the synth to confirm it works
      this.testSound();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio engine:', error);
      console.error('Error details:', error.message, error.stack);
      this.initialized = false;
      this.synth = null;
      throw new Error(`Audio initialization failed: ${error.message}`);
    }
  }

  /**
   * Test sound to verify audio system is working
   */
  testSound() {
    try {
      console.log('🔊 Testing audio system...');
      // Play a quick test tone
      this.synth.triggerAttackRelease('C4', 0.1);
      console.log('✓ Test sound triggered successfully');
    } catch (error) {
      console.error('❌ Test sound failed:', error);
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
    console.log('🎸 playNote called:', { stringNote, fret, duration, articulation, stringIndex, initialized: this.initialized });
    
    if (!this.initialized) {
      console.error('❌ AudioEngine not initialized. Call initialize() first.');
      return;
    }

    if (!this.synth) {
      console.error('❌ Synth not available');
      return;
    }

    // Ensure audio context is running
    const contextState = Tone.getContext().state;
    if (contextState !== 'running') {
      console.log('⚠️ Resuming audio context... Current state:', contextState);
      Tone.getContext().resume();
    }

    try {
      // Calculate frequency using the existing getFrequency method
      const frequency = this.getFrequency(stringNote, fret, stringIndex);
      console.log('✓ Calculated frequency:', frequency, 'Hz');
      
      if (!frequency || frequency <= 0) {
        console.error('❌ Invalid frequency calculated:', frequency);
        return;
      }

      // Convert frequency to note name for Tone.js
      const noteName = Tone.Frequency(frequency, 'hz').toNote();
      console.log('✓ Converted to note name:', noteName);

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

      console.log('🔊 Triggering synth:', { 
        noteName, 
        frequency: frequency.toFixed(2) + ' Hz',
        duration: adjustedDuration, 
        velocity: velocity.toFixed(2),
        contextState: Tone.getContext().state 
      });
      
      // Trigger the synth with the note name
      this.synth.triggerAttackRelease(noteName, adjustedDuration, undefined, velocity);
      
      console.log('✓✓✓ Note triggered successfully!');
    } catch (error) {
      console.error('❌ Error playing note:', error);
      console.error('Error stack:', error.stack);
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
   * Check if audio engine is initialized
   */
  isInitialized() {
    return this.initialized && this.synth !== null;
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.synth) {
      this.synth.dispose();
    }
    this.initialized = false;
    this.synth = null;
  }
}

// Export singleton instance
const audioEngine = new AudioEngine();
export default audioEngine;
