import * as Tone from 'tone';
import audioEngine from './AudioEngine';

/**
 * ScalePlayer - Handles automated scale playback with timing and visual sync
 */
class ScalePlayer {
  constructor() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSequence = null;
    this.speed = 1.0; // 1.0 = normal speed
    this.direction = 'ascending'; // 'ascending', 'descending', 'both'
    this.looping = false;
    this.articulation = 'normal';
    this.highlightCallback = null;
    this.sequence = null;
  }

  /**
   * Set the callback function for visual highlighting
   * @param {Function} callback - Called with (stringNote, fret, isActive)
   */
  setHighlightCallback(callback) {
    this.highlightCallback = callback;
  }

  /**
   * Calculate note duration based on speed
   */
  getNoteDuration() {
    return (0.5 / this.speed); // Base duration 0.5s, adjusted by speed
  }

  /**
   * Play a scale automatically
   * @param {Array} scaleNotes - Array of {stringNote, fret, note, interval} objects
   * @param {Object} options - {speed, direction, looping, articulation}
   */
  playScale(scaleNotes, options = {}) {
    if (this.isPlaying) {
      this.stop();
    }

    // Update settings
    this.speed = options.speed || this.speed;
    this.direction = options.direction || this.direction;
    this.looping = options.looping !== undefined ? options.looping : this.looping;
    this.articulation = options.articulation || this.articulation;

    // Ensure audio is initialized
    if (!audioEngine.initialized) {
      console.warn('Audio not initialized. Cannot play scale.');
      return;
    }

    // Prepare sequence based on direction
    let sequence = this.prepareSequence(scaleNotes);
    if (sequence.length === 0) {
      console.warn('No notes to play in scale');
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.currentSequence = sequence;

    const noteDuration = this.getNoteDuration();
    const noteInterval = noteDuration * 1.1; // Slight gap between notes

    // Create Tone.js sequence
    let noteIndex = 0;
    this.sequence = new Tone.Sequence(
      (time, note) => {
        // Schedule the audio
        Tone.Draw.schedule(() => {
          if (!this.isPaused) {
            // Highlight current note
            if (this.highlightCallback) {
              this.highlightCallback(note.stringNote, note.fret, true);
            }

            // Play the note with string index for accurate pitch
            audioEngine.playNote(
              note.stringNote,
              note.fret,
              noteDuration,
              this.articulation,
              note.stringIndex
            );

            // Clear highlight after note duration
            setTimeout(() => {
              if (this.highlightCallback) {
                this.highlightCallback(note.stringNote, note.fret, false);
              }
            }, noteDuration * 1000);
          }
        }, time);

        noteIndex++;
      },
      sequence,
      noteInterval
    );

    // Configure looping
    this.sequence.loop = this.looping;
    if (this.looping) {
      this.sequence.loopEnd = sequence.length * noteInterval;
    }

    // Start the sequence
    Tone.Transport.start();
    this.sequence.start(0);
  }

  /**
   * Prepare note sequence based on direction
   */
  prepareSequence(scaleNotes) {
    if (!scaleNotes || scaleNotes.length === 0) return [];

    // Filter to only notes in scale and sort by string/fret
    const inScaleNotes = scaleNotes.filter((n) => n.inScale);

    // Sort ascending (low to high pitch)
    // Lower stringIndex = lower pitch (0 = low E, 5 = high E)
    const sortedNotes = [...inScaleNotes].sort((a, b) => {
      // Use stringIndex for accurate sorting (0=low E, 5=high E)
      const stringA = a.stringIndex !== undefined ? a.stringIndex : 0;
      const stringB = b.stringIndex !== undefined ? b.stringIndex : 0;

      if (stringA !== stringB) return stringA - stringB; // Lower strings (lower pitch) first
      return a.fret - b.fret; // Lower frets first
    });

    let sequence = [];
    switch (this.direction) {
      case 'ascending':
        sequence = sortedNotes;
        break;
      case 'descending':
        sequence = [...sortedNotes].reverse();
        break;
      case 'both':
        sequence = [...sortedNotes, ...[...sortedNotes].reverse()];
        break;
      default:
        sequence = sortedNotes;
    }

    return sequence;
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.isPlaying && !this.isPaused) {
      this.isPaused = true;
      Tone.Transport.pause();
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (this.isPlaying && this.isPaused) {
      this.isPaused = false;
      Tone.Transport.start();
    }
  }

  /**
   * Stop playback
   */
  stop() {
    if (this.sequence) {
      this.sequence.stop();
      this.sequence.dispose();
      this.sequence = null;
    }

    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear all scheduled events

    this.isPlaying = false;
    this.isPaused = false;
    this.currentSequence = null;

    // Clear any active highlights
    if (this.highlightCallback) {
      // Signal to clear all highlights
      this.highlightCallback(null, null, false);
    }
  }

  /**
   * Update playback speed (0.5x to 2x)
   */
  setSpeed(newSpeed) {
    const wasPlaying = this.isPlaying;
    const currentSequence = this.currentSequence;

    if (wasPlaying) {
      this.stop();
    }

    this.speed = Math.max(0.5, Math.min(2.0, newSpeed));

    // Restart if was playing
    if (wasPlaying && currentSequence) {
      this.playScale(currentSequence, {
        speed: this.speed,
        direction: this.direction,
        looping: this.looping,
        articulation: this.articulation,
      });
    }
  }

  /**
   * Set playback direction
   */
  setDirection(newDirection) {
    this.direction = newDirection;
    if (this.isPlaying) {
      // Restart with new direction
      const currentSequence = this.currentSequence;
      this.stop();
      this.playScale(currentSequence, {
        speed: this.speed,
        direction: this.direction,
        looping: this.looping,
        articulation: this.articulation,
      });
    }
  }

  /**
   * Toggle looping
   */
  setLooping(shouldLoop) {
    this.looping = shouldLoop;
    if (this.sequence) {
      this.sequence.loop = shouldLoop;
    }
  }

  /**
   * Set articulation style
   */
  setArticulation(style) {
    this.articulation = style;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stop();
  }
}

// Export singleton instance
const scalePlayer = new ScalePlayer();
export default scalePlayer;
