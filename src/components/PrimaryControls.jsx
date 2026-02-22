import ScaleSelector from './ScaleSelector';
import ScaleInfo from './ScaleInfo';
import './PrimaryControls.css';

function PrimaryControls({ 
  rootNote, 
  scaleName, 
  onRootChange, 
  onScaleChange,
  displayMode,
  onDisplayModeChange
}) {
  return (
    <div className="primary-controls">
      <ScaleSelector
        rootNote={rootNote}
        scaleName={scaleName}
        onRootChange={onRootChange}
        onScaleChange={onScaleChange}
      />
      
      <ScaleInfo rootNote={rootNote} scaleName={scaleName} />

      <div className="display-mode-toggle">
        <button
          className={`mode-btn ${displayMode === 'note' ? 'active' : ''}`}
          onClick={() => onDisplayModeChange('note')}
          title="Show note names"
        >
          Notes
        </button>
        <button
          className={`mode-btn ${displayMode === 'degree' ? 'active' : ''}`}
          onClick={() => onDisplayModeChange('degree')}
          title="Show scale degrees"
        >
          Degrees
        </button>
        <button
          className={`mode-btn ${displayMode === 'both' ? 'active' : ''}`}
          onClick={() => onDisplayModeChange('both')}
          title="Show both"
        >
          Both
        </button>
      </div>
    </div>
  );
}

export default PrimaryControls;
