import { NOTES, SCALE_CATEGORIES } from '../data/musicTheory';
import './ScaleSelector.css';

function ScaleSelector({ rootNote, scaleName, onRootChange, onScaleChange }) {
  return (
    <div className="scale-selector">
      {/* Compact inline root note selector */}
      <div className="root-note-row">
        <span className="inline-label">Root:</span>
        <div className="note-buttons">
          {[...NOTES].sort().map(note => (
            <button
              key={note}
              className={`note-btn ${note === rootNote ? 'active' : ''}`}
              onClick={() => onRootChange(note)}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      {/* Clean scale dropdown */}
      <div className="scale-select-row">
        <span className="inline-label">Scale:</span>
        <select 
          className="scale-dropdown"
          value={scaleName}
          onChange={(e) => onScaleChange(e.target.value)}
        >
          {Object.entries(SCALE_CATEGORIES).map(([category, scales]) => (
            <optgroup key={category} label={category}>
              {scales.map(scale => (
                <option key={scale} value={scale}>
                  {scale}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ScaleSelector;
