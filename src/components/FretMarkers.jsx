import { NUM_FRETS } from '../data/musicTheory';

// Layout constants - SINGLE SOURCE OF TRUTH
const STRING_HEIGHT = 42;
const LABEL_WIDTH = 40;
const OPEN_NOTE_WIDTH = 44;
const NUT_WIDTH = 6;
const FRET_WIDTH = 60;

// Fret marker positions (standard guitar inlays)
const FRET_MARKERS = [3, 5, 7, 9, 12, 15];

// String indices (0-based, high E at top)
const STRING_INDICES = {
  HIGH_E: 0,
  B: 1,
  G: 2,
  D: 3,
  A: 4,
  LOW_E: 5
};

/**
 * Calculate vertical position centered between two strings
 * @param {number} stringIndexA - First string index (0-based)
 * @param {number} stringIndexB - Second string index (0-based)
 * @returns {number} - Y position in pixels
 */
const calculateStringCenterY = (stringIndexA, stringIndexB) => {
  return ((stringIndexA + stringIndexB) / 2) * STRING_HEIGHT + STRING_HEIGHT / 2;
};

/**
 * Calculate horizontal position centered between fret wires
 * @param {number} fret - Fret number
 * @returns {string} - X position as percentage
 */
const calculateFretCenterX = (fret) => {
  const fretCellWidth = 100 / NUM_FRETS;
  return `${(fret - 0.5) * fretCellWidth}%`;
};

/**
 * FretMarkers Component
 * Renders standard guitar fret marker dots at positions 3, 5, 7, 9, 12, 15
 * Single markers centered between G and D strings
 * Double markers at fret 12 centered between B-G and D-A strings
 */
function FretMarkers() {
  // Single marker position: centered between G and D strings
  const singleMarkerY = calculateStringCenterY(STRING_INDICES.G, STRING_INDICES.D);

  // Double marker positions at fret 12: between B-G and D-A
  const doubleMarkerUpperY = calculateStringCenterY(STRING_INDICES.B, STRING_INDICES.G);
  const doubleMarkerLowerY = calculateStringCenterY(STRING_INDICES.D, STRING_INDICES.A);

  return (
    <div className="fret-markers-layer">
      {FRET_MARKERS.map(fret => {
        const markerX = calculateFretCenterX(fret);

        if (fret === 12) {
          // Double marker at 12th fret
          return (
            <div key={fret}>
              <div
                className="fret-marker-dot"
                style={{
                  left: markerX,
                  top: `${doubleMarkerUpperY}px`
                }}
              />
              <div
                className="fret-marker-dot"
                style={{
                  left: markerX,
                  top: `${doubleMarkerLowerY}px`
                }}
              />
            </div>
          );
        } else {
          // Single marker centered between G and D
          return (
            <div
              key={fret}
              className="fret-marker-dot"
              style={{
                left: markerX,
                top: `${singleMarkerY}px`
              }}
            />
          );
        }
      })}
    </div>
  );
}

export default FretMarkers;
