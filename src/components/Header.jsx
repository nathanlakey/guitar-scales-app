import './Header.css';

function Header({ onHome }) {
  return (
    <header className="app-nav-header">
      <button className="home-btn" onClick={onHome} title="Return to Home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Home</span>
      </button>
      
      <h1 className="header-title">Fretboard Scholar</h1>
      
      <div className="header-spacer"></div>
    </header>
  );
}

export default Header;
