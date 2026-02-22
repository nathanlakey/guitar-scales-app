import { useState } from 'react';
import './CollapsibleSection.css';

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible-section ${isOpen ? 'open' : 'closed'}`}>
      <button 
        className="collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h2 className="collapsible-title">{title}</h2>
        <svg 
          className="collapsible-icon"
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M4 6L8 10L12 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="collapsible-content">
        <div className="collapsible-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

export default CollapsibleSection;
