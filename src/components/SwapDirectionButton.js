import React, { useState } from 'react';
import './SwapDirectionButton.css';

const SwapDirectionButton = ({ onClick }) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e) => {
    setAnimating(true);
    if (onClick) onClick(e);
    window.setTimeout(() => setAnimating(false), 380);
  };

  return (
    <button
      className={`swap-direction-button ${animating ? 'flip' : ''}`}
      onClick={handleClick}
      aria-label="Swap tokens"
      type="button"
    >
      <svg className="swap-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 9l5-5 5 5" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 15l-5 5-5-5" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

export default SwapDirectionButton;
