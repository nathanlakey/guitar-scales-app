import { useState } from 'react'
import ScaleSelector from './components/ScaleSelector'
import ScaleInfo from './components/ScaleInfo'
import Fretboard from './components/Fretboard'
import './App.css'

function App() {
  const [rootNote, setRootNote] = useState('C')
  const [scaleName, setScaleName] = useState('Major (Ionian)')

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

        <Fretboard rootNote={rootNote} scaleName={scaleName} />
      </main>

      <footer className="app-footer">
        <p>Select a root note and scale to see it mapped across the fretboard</p>
      </footer>
    </div>
  )
}

export default App
