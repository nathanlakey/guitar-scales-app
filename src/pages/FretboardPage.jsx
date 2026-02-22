import { useState, useMemo } from 'react'
import { generateFretboard, getScalePositions, getChordNotes } from '../data/musicTheory'
import AudioControls from '../components/AudioControls'
import Fretboard from '../components/Fretboard'
import PrimaryControls from '../components/PrimaryControls'
import SecondaryControls from '../components/SecondaryControls'
import AdvancedControls from '../components/AdvancedControls'
import '../App.css'

function FretboardPage() {
  const [rootNote, setRootNote] = useState(null)
  const [scaleName, setScaleName] = useState(null)
  const [showIntervals, setShowIntervals] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [positionSystem, setPositionSystem] = useState(null)
  const [chordRoot, setChordRoot] = useState('')
  const [chordType, setChordType] = useState('Major')
  const [cagedPosition, setCagedPosition] = useState('ALL')
  const [showScaleOverlay, setShowScaleOverlay] = useState(false)
  const [displayMode, setDisplayMode] = useState('note')
  const [overlayScaleType, setOverlayScaleType] = useState(null)

  // Handler to update overlayScaleType when scaleName changes
  const handleScaleNameChange = (newScaleName) => {
    setScaleName(newScaleName);
    setOverlayScaleType(newScaleName);
  };

  // Generate fretboard data for AudioControls - only if scale selected
  const fretboardData = useMemo(() => {
    if (!rootNote || !scaleName) return [];
    return generateFretboard(rootNote, scaleName);
  }, [rootNote, scaleName])

  // Calculate available positions for current root/scale/system
  const positions = useMemo(() => {
    if (!rootNote || !scaleName || !positionSystem) return [];
    return getScalePositions(rootNote, scaleName, positionSystem);
  }, [rootNote, scaleName, positionSystem])

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
      <main className="app-main">
        {/* PRIMARY BAR - Most prominent controls */}
        <PrimaryControls
          rootNote={rootNote}
          scaleName={scaleName}
          onRootChange={setRootNote}
          onScaleChange={handleScaleNameChange}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
        />

        {/* SECONDARY BAR - Layout options */}
        <SecondaryControls
          positionSystem={positionSystem}
          onPositionSystemChange={handleSystemChange}
          selectedPosition={selectedPosition}
          onPositionChange={setSelectedPosition}
          positions={positions}
          showScaleOverlay={showScaleOverlay}
          onScaleOverlayChange={setShowScaleOverlay}
        />

        {/* ADVANCED SECTION - Chord shapes and advanced controls */}
        <AdvancedControls
          chordRoot={chordRoot}
          chordType={chordType}
          onChordRootChange={setChordRoot}
          onChordTypeChange={setChordType}
          onChordClear={() => {
            setChordRoot('');
            setShowScaleOverlay(false);
          }}
          cagedPosition={cagedPosition}
          onCagedPositionChange={setCagedPosition}
          showScaleOverlay={showScaleOverlay}
          onScaleOverlayChange={setShowScaleOverlay}
          overlayScaleType={overlayScaleType}
          onOverlayScaleTypeChange={setOverlayScaleType}
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
          displayMode={displayMode}
          overlayScaleType={overlayScaleType}
        />

        {/* Audio controls - minimal and secondary */}
        {rootNote && scaleName && (
          <AudioControls 
            fretboardData={fretboardData}
            rootNote={rootNote}
            scaleName={scaleName}
          />
        )}
      </main>
    </div>
  )
}

export default FretboardPage
