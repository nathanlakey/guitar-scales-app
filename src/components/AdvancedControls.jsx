import CollapsibleSection from './CollapsibleSection';
import ChordSelector from './ChordSelector';

function AdvancedControls({
  chordRoot,
  chordType,
  onChordRootChange,
  onChordTypeChange,
  onChordClear,
  cagedPosition,
  onCagedPositionChange,
  showScaleOverlay,
  onScaleOverlayChange,
  overlayScaleType,
  onOverlayScaleTypeChange
}) {
  return (
    <CollapsibleSection title="Advanced: Chord Shapes" defaultOpen={false}>
      <div className="card-content">
        <ChordSelector
          selectedRoot={chordRoot}
          selectedType={chordType}
          onRootChange={onChordRootChange}
          onTypeChange={onChordTypeChange}
          onClear={onChordClear}
          selectedPosition={cagedPosition}
          onPositionChange={onCagedPositionChange}
          showScaleOverlay={showScaleOverlay}
          onScaleOverlayChange={onScaleOverlayChange}
          overlayScaleType={overlayScaleType}
          onOverlayScaleTypeChange={onOverlayScaleTypeChange}
        />
      </div>
    </CollapsibleSection>
  );
}

export default AdvancedControls;
