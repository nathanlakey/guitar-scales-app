import { generateFretboard, STANDARD_TUNING, NUM_FRETS, FRET_MARKERS, DOUBLE_MARKERS } from '../data/musicTheory';
import './Fretboard.css';

function Fretboard({ rootNote, scaleName }) {
  const fretboard = generateFretboard(rootNote, scaleName);

  // String labels (high to low for display: 1st string at top)
  const stringLabels = ['e', 'B', 'G', 'D', 'A', 'E'];

  return (
    <div className="fretboard-container">
      <div className="fretboard-wrapper">
        {/* Fret numbers */}
        <div className="fret-numbers">
          <div className="fret-number nut-label"></div>
          {Array.from({ length: NUM_FRETS }, (_, i) => (
            <div key={i + 1} className="fret-number">
              {FRET_MARKERS.includes(i + 1) ? (i + 1) : ''}
            </div>
          ))}
        </div>

        {/* The actual fretboard */}
        <div className="fretboard">
          {/* Nut */}
          <div className="nut"></div>

          {/* Fret markers (dots) */}
          <div className="fret-markers-row">
            {Array.from({ length: NUM_FRETS }, (_, i) => (
              <div key={i + 1} className="marker-cell">
                {FRET_MARKERS.includes(i + 1) && (
                  DOUBLE_MARKERS.includes(i + 1) ? (
                    <div className="double-dot">
                      <div className="fret-dot"></div>
                      <div className="fret-dot"></div>
                    </div>
                  ) : (
                    <div className="fret-dot"></div>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Strings - displayed from high E (index 5) to low E (index 0) */}
          {[...fretboard].reverse().map((stringData, displayIndex) => {
            const stringIndex = STANDARD_TUNING.length - 1 - displayIndex;
            return (
              <div key={stringIndex} className="guitar-string-row">
                {/* String label */}
                <div className="string-label">{stringLabels[displayIndex]}</div>

                {/* Open note (fret 0) */}
                <div className="open-note-cell">
                  <div className={`string-line string-${displayIndex}`}></div>
                  {stringData[0].inScale && (
                    <button
                      className={`note-marker ${stringData[0].isRoot ? 'root' : ''}`}
                      title={`${stringData[0].note} (${stringData[0].interval})`}
                    >
                      {stringData[0].note}
                    </button>
                  )}
                </div>

                {/* Fretted notes */}
                {stringData.slice(1).map(fretData => (
                  <div key={fretData.fret} className="fret-cell">
                    <div className={`string-line string-${displayIndex}`}></div>
                    <div className="fret-wire"></div>
                    {fretData.inScale && (
                      <button
                        className={`note-marker ${fretData.isRoot ? 'root' : ''}`}
                        title={`${fretData.note} (Interval: ${fretData.interval})`}
                      >
                        {fretData.note}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="fretboard-legend">
        <div className="legend-item">
          <div className="legend-dot root"></div>
          <span>Root Note</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot scale"></div>
          <span>Scale Note</span>
        </div>
      </div>
    </div>
  );
}

export default Fretboard;
