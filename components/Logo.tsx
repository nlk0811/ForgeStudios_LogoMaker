
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background container for the logo to give it depth in the UI */}
      <rect width="100" height="100" rx="20" fill="#121212" />
      
      {/* Letter F Base Structure */}
      <path 
        d="M30 25V75" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinecap="round" 
        opacity="0.1"
      />
      
      {/* The F formed by connections */}
      {/* Vertical Stem */}
      <path d="M30 25V75" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" />
      {/* Top Bar */}
      <path d="M30 25H70" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" />
      {/* Middle Bar */}
      <path d="M30 50H60" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" />
      
      {/* Three Connected Network Nodes */}
      <circle cx="70" cy="25" r="5" fill="#00E5FF" className="shadow-glow" /> {/* Top Right Node */}
      <circle cx="60" cy="50" r="5" fill="#00E5FF" className="shadow-glow" /> {/* Mid Right Node */}
      <circle cx="30" cy="75" r="5" fill="#00E5FF" className="shadow-glow" /> {/* Bottom Stem Node */}
      
      {/* Digital Spark Element at top right */}
      <g>
        <path d="M80 12L88 12M84 8L84 16" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
        </path>
        <path d="M81 9L87 15M87 9L81 15" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
        </path>
      </g>
      
      <style>{`
        .shadow-glow { filter: drop-shadow(0 0 4px #00E5FF); }
      `}</style>
    </svg>
  );
};
