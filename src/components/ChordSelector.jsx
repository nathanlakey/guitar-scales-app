import { useState } from 'react';
import { NOTES, CHORDS } from '../data/musicTheory';
import './ChordSelector.css';

function ChordSelector({ selectedRoot, selectedType, onRootChange, onTypeChange, onClear, selectedPosition, onPositionChange, showScaleOverlay, onScaleOverlayChange }) {
  return (
    <div className="chord-selector">
      <div className="chord-selector-header">
        <label className="chord-selector-label">Chord Shapes</label>
        {selectedRoot && (
          <button 
            className="chord-clear-btn"
            onClick={onClear}
            title="Clear chord selection"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="chord-selector-controls">
        <div className="chord-control-group">
          <label className="chord-control-label">Root</label>
          <select
            value={selectedRoot}
            onChange={(e) => onRootChange(e.target.value)}
            className="chord-select"
          >
            <option value="">None</option>
            {NOTES.map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
        </div>

        <div className="chord-control-group">
          <label className="chord-control-label">Type</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="chord-select"
            disabled={!selectedRoot}
          >
            {Object.keys(CHORDS).map(chordType => (
              <option key={chordType} value={chordType}>{chordType}</option>
            ))}
          </select>
        </div>

        <div className="chord-control-group">
          <label className="chord-control-label">Position</label>
          <select
            value={selectedPosition}
            onChange={(e) => onPositionChange(e.target.value)}
            className="chord-select"
            disabled={!selectedRoot}
          >
            <option value="ALL">All Positions</option>
            <option value="C">C Shape</option>
            <option value="A">A Shape</option>
            <option value="G">G Shape</option>
            <option value="E">E Shape</option>
            <option value="D">D Shape</option>
          </select>
        </div>

        <div className="chord-control-group">
          <label className="chord-control-label">
            <input
              type="checkbox"
              checked={showScaleOverlay}
              onChange={(e) => onScaleOverlayChange(e.target.checked)}
              disabled={!selectedRoot}
            />
            Show Scale Overlay
          </label>
        </div>
      </div>

      {selectedRoot && (
        <div className="chord-display-label">
          {selectedRoot} {selectedType}
        </div>
      )}
    </div>
  );
}

export default ChordSelector;
