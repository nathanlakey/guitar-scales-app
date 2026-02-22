import { useState } from 'react'
import Home from './pages/Home'
import FretboardPage from './pages/FretboardPage'
import Header from './components/Header'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  if (currentPage === 'home') {
    return <Home onEnter={() => setCurrentPage('fretboard')} />;
  }

  if (currentPage === 'fretboard') {
    return (
      <>
        <Header onHome={() => setCurrentPage('home')} />
        <FretboardPage />
      </>
    );
  }

  return null;
}

export default App
