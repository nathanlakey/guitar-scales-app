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
        </div>

        {/* The instrument - primary focus */}
        <Fretboard rootNote={rootNote} scaleName={scaleName} />

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
