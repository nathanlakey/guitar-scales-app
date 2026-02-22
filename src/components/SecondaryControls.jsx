import './SecondaryControls.css';

function SecondaryControls({
  positionSystem,
  onPositionSystemChange,
  selectedPosition,
  onPositionChange,
  positions,
  showScaleOverlay,
  onScaleOverlayChange
}) {
  return (
    <div className="secondary-controls">
      <div className="secondary-label">Layout Options</div>
      
      <select
        className="system-select"
        value={positionSystem || ''}
        onChange={(e) => onPositionSystemChange(e.target.value)}
        title="Position System"
      >
        <option value="">None</option>
        <option value="CAGED">CAGED</option>
        <option value="3NPS">3NPS</option>
      </select>

      <select
        className="position-select"
        value={selectedPosition}
        onChange={(e) => onPositionChange(e.target.value)}
        title="Select Position"
      >
        <option value="all">All Positions</option>
        {positions.map(pos => (
          <option key={pos.number} value={pos.number}>
            {pos.name}
          </option>
        ))}
      </select>

      <label className="overlay-toggle">
        <input
          type="checkbox"
          checked={showScaleOverlay}
          onChange={(e) => onScaleOverlayChange(e.target.checked)}
        />
        <span>Scale Overlay</span>
      </label>
    </div>
  );
}

export default SecondaryControls;
