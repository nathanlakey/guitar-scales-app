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
        <h1 className="app-title">
          <span className="title-icon">🎸</span>
          Fretboard Scholar
        </h1>
        <p className="app-subtitle">Master every scale on the guitar</p>
      </header>

      <main className="app-main">
        <ScaleSelector
          rootNote={rootNote}
          scaleName={scaleName}
          onRootChange={setRootNote}
          onScaleChange={setScaleName}
        />

        <ScaleInfo rootNote={rootNote} scaleName={scaleName} />

        <AudioControls fretboardData={fretboardData} />

        <Fretboard rootNote={rootNote} scaleName={scaleName} />
      </main>

      <footer className="app-footer">
        <p>Click any note on the fretboard to hear it • Use playback controls to practice scales</p>
      </footer>
    </div>
  )
}

export default App
