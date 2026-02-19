import { useState, useMemo } from 'react'
import { generateFretboard, getScalePositions, getChordNotes, CHORDS, NOTES } from './data/musicTheory'
import ScaleSelector from './components/ScaleSelector'
import ScaleInfo from './components/ScaleInfo'
import AudioControls from './components/AudioControls'
import ChordSelector from './components/ChordSelector'
import Fretboard from './components/Fretboard'
import './App.css'

function App() {
  const [rootNote, setRootNote] = useState('C')
  const [scaleName, setScaleName] = useState('Major (Ionian)')
  const [showIntervals, setShowIntervals] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [positionSystem, setPositionSystem] = useState('CAGED')
  const [chordRoot, setChordRoot] = useState('')
  const [chordType, setChordType] = useState('Major')
  const [cagedPosition, setCagedPosition] = useState('ALL')
  const [showScaleOverlay, setShowScaleOverlay] = useState(false)

  // Generate fretboard data for AudioControls
  const fretboardData = generateFretboard(rootNote, scaleName)

  // Calculate available positions for current root/scale/system
  const positions = useMemo(() => 
    getScalePositions(rootNote, scaleName, positionSystem),
    [rootNote, scaleName, positionSystem]
  )

  // Calculate chord notes if chord is selected
  const chordNotes = useMemo(() => {
    if (!chordRoot) return [];
    return getChordNotes(chordRoot, chordType);
  }, [chordRoot, chordType])

  // Reset position selection when system changes
  const handleSystemChange = (newSystem) => {
    setPositionSystem(newSystem)
    setSelectedPosition('all')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Fretboard Scholar</h1>
      </header>

      <main className="app-main">
        {/* Minimal horizontal control bar */}
        <div className="control-bar">
          <ScaleSelector
            rootNote={rootNote}
            scaleName={scaleName}
            onRootChange={setRootNote}
            onScaleChange={setScaleName}
          />
          
          <ScaleInfo rootNote={rootNote} scaleName={scaleName} />

          {/* Position system selector */}
          <select
            className="system-select"
            value={positionSystem}
            onChange={(e) => handleSystemChange(e.target.value)}
            title="Position System"
          >
            <option value="CAGED">CAGED</option>
            <option value="3NPS">3NPS</option>
          </select>

          {/* Position selector */}
          <select
            className="position-select"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            title="Select Position"
          >
            <option value="all">All Positions</option>
            {positions.map(pos => (
              <option key={pos.number} value={pos.number}>
                {pos.name}
              </option>
            ))}
          </select>

          {/* Interval display toggle */}
          <button
            className={`interval-toggle ${showIntervals ? 'active' : ''}`}
            onClick={() => setShowIntervals(!showIntervals)}
            title={showIntervals ? 'Show Note Names' : 'Show Intervals'}
          >
            {showIntervals ? 'Notes' : 'Intervals'}
          </button>
        </div>

        {/* Chord Shape Selector */}
        <ChordSelector
          selectedRoot={chordRoot}
          selectedType={chordType}
          onRootChange={setChordRoot}
          onTypeChange={setChordType}
          onClear={() => setChordRoot('')}
          selectedPosition={cagedPosition}
          onPositionChange={setCagedPosition}
          showScaleOverlay={showScaleOverlay}
          onScaleOverlayChange={setShowScaleOverlay}
        />

        {/* The instrument - primary focus */}
        <Fretboard 
          rootNote={rootNote} 
          scaleName={scaleName}
          showIntervals={showIntervals}
          selectedPosition={selectedPosition}
          positions={positions}
          chordNotes={chordNotes}
          chordRoot={chordRoot}
          cagedPosition={cagedPosition}
          showScaleOverlay={showScaleOverlay}
        />

        {/* Audio controls - minimal and secondary */}
        <AudioControls 
          fretboardData={fretboardData}
          rootNote={rootNote}
          scaleName={scaleName}
        />
      </main>
    </div>
  )
}

export default App
