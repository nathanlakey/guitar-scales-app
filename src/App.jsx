import { useState } from 'react'
import { generateFretboard } from './data/musicTheory'
import ScaleSelector from './components/ScaleSelector'
import ScaleInfo from './components/ScaleInfo'
import AudioControls from './components/AudioControls'
import Fretboard from './components/Fretboard'
import './App.css'

function App() {
  const [rootNote, setRootNote] = useState('C')
  const [scaleName, setScaleName] = useState('Major (Ionian)')

  // Generate fretboard data for AudioControls
  const fretboardData = generateFretboard(rootNote, scaleName)

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Fretboard Scholar</h1>
        <p className="app-subtitle">Interactive guitar scale visualizer</p>
      </header>

      <main className="app-main">
        {/* Control Panel - all controls grouped together */}
        <div className="control-panel">
          <ScaleSelector
            rootNote={rootNote}
            scaleName={scaleName}
            onRootChange={setRootNote}
            onScaleChange={setScaleName}
          />
          
          <ScaleInfo rootNote={rootNote} scaleName={scaleName} />
          
          <AudioControls fretboardData={fretboardData} />
        </div>

        {/* Fretboard - the main focus */}
        <Fretboard rootNote={rootNote} scaleName={scaleName} />
      </main>
    </div>
  )
}

export default App
