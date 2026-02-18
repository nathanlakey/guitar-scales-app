import { getScaleNotes } from '../data/musicTheory';
import './ScaleInfo.css';

function ScaleInfo({ rootNote, scaleName }) {
  const scaleNotes = getScaleNotes(rootNote, scaleName);

  const intervalNames = {
    1: 'R',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
  };

  return (
    <div className="scale-info">
      <h3 className="scale-info-title">Notes in {rootNote} {scaleName}</h3>
      <div className="scale-notes-display">
        {scaleNotes.map((note, index) => (
          <div key={index} className={`scale-note-chip ${index === 0 ? 'root' : ''}`}>
            <span className="chip-interval">{intervalNames[index + 1] || (index + 1)}</span>
            <span className="chip-note">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScaleInfo;
