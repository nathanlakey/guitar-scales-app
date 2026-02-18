import { NOTES, SCALE_CATEGORIES } from '../data/musicTheory';
import './ScaleSelector.css';

function ScaleSelector({ rootNote, scaleName, onRootChange, onScaleChange }) {
  return (
    <div className="scale-selector">
      <div className="selector-section">
        <label className="selector-label">Root Note</label>
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

      <div className="selector-section">
        <label className="selector-label">Scale Type</label>
        <div className="scale-grid">
          {Object.entries(SCALE_CATEGORIES).map(([category, scales]) => (
            <div key={category} className="scale-group">
              <div className="group-label">{category}</div>
              <div className="scale-buttons">
                {scales.map(scale => (
                  <button
                    key={scale}
                    className={`scale-btn ${scale === scaleName ? 'active' : ''}`}
                    onClick={() => onScaleChange(scale)}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="current-selection">
        <span className="selection-badge">{rootNote} {scaleName}</span>
      </div>
    </div>
  );
}

export default ScaleSelector;
