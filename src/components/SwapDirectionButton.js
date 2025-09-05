import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';
import './SwapDirectionButton.css';

const SwapDirectionButton = ({ onClick }) => {
  const { currentTheme } = useTheme();
  const [animating, setAnimating] = useState(false);

  const handleClick = (e) => {
    setAnimating(true);
    if (onClick) onClick(e);
    window.setTimeout(() => setAnimating(false), 380);
  };

  return (
    <button
      className={`swap-direction-button ${animating ? 'flip' : ''} ${getThemeClasses(currentTheme, 'swapDirectionButton')}`}
      onClick={handleClick}
      aria-label="Swap tokens"
      type="button"
    >
      <svg className="swap-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 9l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={getThemeClasses(currentTheme, 'swapDirectionIcon')} />
        <path d="M17 15l-5 5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={getThemeClasses(currentTheme, 'swapDirectionIcon')} />
      </svg>
    </button>
  );
};

export default SwapDirectionButton;
