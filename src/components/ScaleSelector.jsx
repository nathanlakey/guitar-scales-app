import { useState } from 'react';
import { NOTES, SCALES, SCALE_CATEGORIES } from '../data/musicTheory';
import './ScaleSelector.css';

function ScaleSelector({ rootNote, scaleName, onRootChange, onScaleChange }) {
  const [expandedCategory, setExpandedCategory] = useState('Common');

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
        <div className="scale-categories">
          {Object.entries(SCALE_CATEGORIES).map(([category, scales]) => (
            <div key={category} className="scale-category">
              <button
                className={`category-header ${expandedCategory === category ? 'expanded' : ''}`}
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              >
                <span>{category}</span>
                <span className="chevron">{expandedCategory === category ? '▾' : '▸'}</span>
              </button>
              {expandedCategory === category && (
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
              )}
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
