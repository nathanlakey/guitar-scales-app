import { NOTES, CHORDS } from '../data/musicTheory';
import './ChordSelector.css';

function ChordSelector({ selectedRoot, selectedType, onRootChange, onTypeChange, onClear }) {
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
