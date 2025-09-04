import React from 'react';
import './TokenSelector.css';

const TokenSelector = ({ token, onTokenSelect, className, isSelectToken = false }) => {
  const renderTokenLogo = () => {
    if (token.symbol === 'ETH') {
      return (
        <div className="eth-logo">
          <div className="eth-diamond"></div>
        </div>
      );
    }
    return token.logo && <span className="token-logo">{token.logo}</span>;
  };

  const handleClick = () => {
    if (isSelectToken) {
      // Placeholder for token selection modal
      console.log('Open token selector');
    }
  };

  return (
    <button 
      className={`token-selector ${className} ${isSelectToken ? 'select-token' : ''}`}
      onClick={handleClick}
    >
      {renderTokenLogo()}
      <span className="token-symbol">{token.symbol}</span>
      <span className="chevron">▼</span>
    </button>
  );
};

export default TokenSelector;
