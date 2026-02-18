import { useState, useEffect, useRef } from 'react';
import audioEngine from '../audio/AudioEngine';
import scalePlayer from '../audio/ScalePlayer';
import backingTrack from '../audio/BackingTrack';
import './AudioControls.css';

function AudioControls({ fretboardData, rootNote, scaleName }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [direction, setDirection] = useState('ascending');
  const [looping, setLooping] = useState(false);
  const [articulation, setArticulation] = useState('normal');
  const [backingTrackPlaying, setBackingTrackPlaying] = useState(false);
  const [initError, setInitError] = useState(null);
  const backingTrackBtnRef = useRef(null);

  // Initialize audio on first user interaction
  const handleInitialize = async () => {
    if (isInitialized) return true;
    
    try {
      console.log('🎵 Initializing audio system...');
      await audioEngine.initialize();
      setIsInitialized(true);
      setInitError(null);
      console.log('✓ Audio system ready');
      return true;
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
      setInitError(error.message || 'Failed to initialize audio');
      setIsInitialized(false);
      return false;
    }
  };

  // Play/Pause toggle
  const handlePlayPause = async () => {
    const initialized = await handleInitialize();
    if (!initialized) {
      alert('Failed to initialize audio. Please refresh the page and try again.');
      return;
    }

    if (!isPlaying) {
      // Start playing
      const scaleNotes = getScaleNotes();
      scalePlayer.playScale(scaleNotes, {
        speed,
        direction,
        looping,
        articulation,
      });
      setIsPlaying(true);
      setIsPaused(false);
    } else if (isPaused) {
      // Resume
      scalePlayer.resume();
      setIsPaused(false);
    } else {
      // Pause
      scalePlayer.pause();
      setIsPaused(true);
    }
  };

  // Stop playback
  const handleStop = () => {
    scalePlayer.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Get all scale notes from fretboard data
  const getScaleNotes = () => {
    const notes = [];
    fretboardData.forEach((string) => {
      string.frets.forEach((fret) => {
        if (fret.inScale) {
          notes.push({
            stringNote: string.stringNote,
            fret: fret.fretNumber,
            note: fret.note,
            interval: fret.interval,
            inScale: fret.inScale,
          });
        }
      });
    });
    return notes;
  };

  // Update speed
  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    scalePlayer.setSpeed(newSpeed);
  };

  // Update direction
  const handleDirectionChange = (e) => {
    const newDirection = e.target.value;
    setDirection(newDirection);
    scalePlayer.setDirection(newDirection);
  };

  // Toggle looping
  const handleLoopToggle = () => {
    const newLooping = !looping;
    setLooping(newLooping);
    scalePlayer.setLooping(newLooping);
  };

  // Update articulation
  const handleArticulationChange = (e) => {
    const newArticulation = e.target.value;
    setArticulation(newArticulation);
    scalePlayer.setArticulation(newArticulation);
  };

  // Toggle backing track
  const handleBackingTrackToggle = async () => {
    const initialized = await handleInitialize();
    if (!initialized) {
      alert('Failed to initialize audio. Please refresh the page and try again.');
      return;
    }
    
    if (!backingTrackPlaying) {
      try {
        await backingTrack.play(rootNote, scaleName);
        setBackingTrackPlaying(true);
        
        // Sync animation duration with BPM
        if (backingTrackBtnRef.current) {
          const bpm = backingTrack.getBPM();
          // Pulse every 2 beats for a relaxed rhythm
          const pulseDuration = (60 / bpm) * 2;
          backingTrackBtnRef.current.style.setProperty('--pulse-duration', `${pulseDuration}s`);
        }
      } catch (error) {
        console.error('❌ Failed to start backing track:', error);
        alert('Failed to start backing track. Please try again.');
      }
    } else {
      backingTrack.stop();
      setBackingTrackPlaying(false);
    }
  };

  // Update backing track when root/scale changes
  useEffect(() => {
    if (backingTrackPlaying) {
      backingTrack.update(rootNote, scaleName);
      
      // Re-sync animation timing after update
      if (backingTrackBtnRef.current) {
        const bpm = backingTrack.getBPM();
        const pulseDuration = (60 / bpm) * 2;
        backingTrackBtnRef.current.style.setProperty('--pulse-duration', `${pulseDuration}s`);
      }
    }
  }, [rootNote, scaleName, backingTrackPlaying]);

  return (
    <div className="audio-controls">
      {/* Single compact row of controls */}
      <div className="audio-controls-row">
        {/* Playback buttons */}
        <div className="button-group">
          <button
            className={`control-button ${isPlaying && !isPaused ? 'active' : ''}`}
            onClick={handlePlayPause}
            title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
          >
            {isPlaying && !isPaused ? '⏸' : '▶'}
          </button>
          <button
            className="control-button"
            onClick={handleStop}
            disabled={!isPlaying}
            title="Stop"
          >
            ⏹
          </button>
          <button
            className={`control-button ${looping ? 'active' : ''}`}
            onClick={handleLoopToggle}
            title="Loop"
          >
            🔁
          </button>
        </div>

        <div className="control-divider"></div>

        {/* Speed control */}
        <div className="control-group">
          <label>{speed.toFixed(1)}x</label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={handleSpeedChange}
            className="speed-slider"
            title="Speed"
          />
        </div>

        <div className="control-divider"></div>

        {/* Backing track toggle */}
        <button
          ref={backingTrackBtnRef}
          className={`control-button backing-track-btn ${backingTrackPlaying ? 'active' : ''}`}
          onClick={handleBackingTrackToggle}
          title={backingTrackPlaying ? 'Stop Backing Track' : 'Play Backing Track'}
        >
          ♫
        </button>

        <div className="control-divider"></div>

        {/* Direction select */}
        <select
          value={direction}
          onChange={handleDirectionChange}
          className="control-select"
          title="Direction"
        >
          <option value="ascending">↑ Up</option>
          <option value="descending">↓ Down</option>
          <option value="both">↕ Both</option>
        </select>

        {/* Articulation select */}
        <select
          value={articulation}
          onChange={handleArticulationChange}
          className="control-select"
          title="Articulation"
        >
          <option value="normal">Normal</option>
          <option value="legato">Legato</option>
          <option value="staccato">Staccato</option>
        </select>
      </div>
    </div>
  );
}

export default AudioControls;
