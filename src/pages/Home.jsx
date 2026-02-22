import './Home.css';

function Home({ onEnter }) {
  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header">
          <h1 className="home-title">Fretboard Scholar</h1>
          <p className="home-subtitle">Interactive guitar learning tools</p>
        </header>

        <button 
          className="open-fretboard-btn"
          onClick={onEnter}
        >
          <span className="btn-icon">🎸</span>
          <span className="btn-text">Open Fretboard</span>
        </button>
      </div>
    </div>
  );
}

export default Home;
