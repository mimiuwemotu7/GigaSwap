import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';

const CryptoSwapComponent = () => {
  const { currentTheme } = useTheme();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState({ symbol: 'ETH', name: 'Ethereum', icon: '⟠' });
  const [toToken, setToToken] = useState({ symbol: 'USDC', name: 'USD Coin', icon: '$' });

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠', balance: '2.4521' },
    { symbol: 'USDC', name: 'USD Coin', icon: '$', balance: '1,234.56' },
    { symbol: 'SOL', name: 'Solana', icon: '◎', balance: '45.32' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', balance: '0.125' },
  ];

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers, decimal points, and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      // Simulate conversion rate (in real app, this would be fetched from API)
      if (value && !isNaN(value) && value !== '') {
        setToAmount((parseFloat(value) * 1850.42).toFixed(2));
      } else {
        setToAmount('');
      }
    }
  };

  const handleToAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers, decimal points, and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value);
      // Simulate reverse conversion rate
      if (value && !isNaN(value) && value !== '') {
        setFromAmount((parseFloat(value) / 1850.42).toFixed(6));
      } else {
        setFromAmount('');
      }
    }
  };

  const TokenSelector = ({ token, onSelect, type }) => (
    <div className={`${getThemeClasses(currentTheme, 'tokenSelector')} px-3 py-3 md:py-2 min-w-[120px] min-h-touch`}>
      <div className={`${getThemeClasses(currentTheme, 'tokenIcon')}`}>
        {token.icon}
      </div>
      <div className="flex-1">
        <div className={`${getThemeClasses(currentTheme, 'tokenSymbol')}`}>{token.symbol}</div>
      </div>
      <ChevronDown className={`w-4 h-4 ${getThemeClasses(currentTheme, 'chevron')}`} />
    </div>
  );

  const InputField = ({ amount, onChange, token, type, placeholder }) => {
    const handleInputChange = (e) => {
      e.persist(); // Prevent React from recycling the event
      onChange(e);
    };

    return (
      <div className="flex-1">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          value={amount}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full text-lg md:text-xl font-bold outline-none focus:outline-none py-2 md:py-0 ${getThemeClasses(currentTheme, 'input')}`}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          enterKeyHint="done"
          maxLength={20}
        />
        <div className={`text-sm mt-1 text-left ${getThemeClasses(currentTheme, 'inputValue')}`}>
          ${type === 'from' ? (amount && parseFloat(amount) > 0 ? (parseFloat(amount) * 2847.32).toFixed(2) : '0.00') : (amount && parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : '0.00')}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-sm md:max-w-sm mx-auto rounded-xl p-3 md:p-3 shadow-lg ${getThemeClasses(currentTheme, 'container')} border border-gray-800`}>


      {/* From Section */}
      <div className="mb-2 md:mb-1">
        <div className={`rounded-xl p-3 md:p-3 ${getThemeClasses(currentTheme, 'section')}`}>
          <div className="flex justify-between items-center mb-3 md:mb-2">
            <span className={`font-medium text-sm ${getThemeClasses(currentTheme, 'label')}`}>From</span>
            <span className={`text-xs ${getThemeClasses(currentTheme, 'balance')}`}>Balance: {tokens.find(t => t.symbol === fromToken.symbol)?.balance}</span>
          </div>
          
          <div className="flex items-start gap-3">
            <InputField 
              amount={fromAmount}
              onChange={handleFromAmountChange}
              token={fromToken}
              type="from"
              placeholder="0.00"
            />
            <TokenSelector token={fromToken} type="from" />
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-2 md:mb-1 relative z-10">
        <button
          onClick={handleSwapTokens}
          className={`w-14 h-14 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${getThemeClasses(currentTheme, 'swapButton')}`}
        >
          <ArrowUpDown className={`w-6 h-6 ${getThemeClasses(currentTheme, 'swapIcon')}`} />
        </button>
      </div>

      {/* To Section */}
      <div className="mb-3 md:mb-2">
        <div className={`rounded-xl p-3 md:p-3 ${getThemeClasses(currentTheme, 'section')}`}>
          <div className="flex justify-between items-center mb-3 md:mb-2">
            <span className={`font-medium text-sm ${getThemeClasses(currentTheme, 'label')}`}>To</span>
            <span className={`text-xs ${getThemeClasses(currentTheme, 'balance')}`}>Balance: {tokens.find(t => t.symbol === toToken.symbol)?.balance}</span>
          </div>
          
          <div className="flex items-start gap-3">
            <InputField 
              amount={toAmount}
              onChange={handleToAmountChange}
              token={toToken}
              type="to"
              placeholder="0.00"
            />
            <TokenSelector token={toToken} type="to" />
          </div>
        </div>
      </div>

      {/* Swap Info */}
      {fromAmount && (
        <div className={`mb-3 md:mb-2 rounded-lg p-3 md:p-2 ${getThemeClasses(currentTheme, 'infoSection')}`}>
          <div className="flex justify-between text-xs mb-2 md:mb-1">
            <span className={getThemeClasses(currentTheme, 'infoText')}>Rate</span>
            <span className={getThemeClasses(currentTheme, 'infoValue')}>1 {fromToken.symbol} = 1,850.42 {toToken.symbol}</span>
          </div>
          <div className="flex justify-between text-xs mb-2 md:mb-1">
            <span className={getThemeClasses(currentTheme, 'infoText')}>Network fee</span>
            <span className={getThemeClasses(currentTheme, 'infoValue')}>~$12.45</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className={getThemeClasses(currentTheme, 'infoText')}>Price impact</span>
            <span className={getThemeClasses(currentTheme, 'infoAccent')}>0.01%</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button 
        disabled={!fromAmount || parseFloat(fromAmount) === 0}
        className={`${getThemeClasses(currentTheme, 'actionButton')} min-h-touch ${
          fromAmount && parseFloat(fromAmount) > 0
            ? getThemeClasses(currentTheme, 'actionButtonEnabled')
            : getThemeClasses(currentTheme, 'actionButtonDisabled')
        }`}
      >
        {fromAmount && parseFloat(fromAmount) > 0 ? 'Swap Tokens' : 'Enter Amount'}
      </button>

      {/* Footer */}
      <div className={`mt-2 text-center text-xs ${getThemeClasses(currentTheme, 'footer')}`}>
        Powered by decentralized exchanges
      </div>
    </div>
  );
};

export default CryptoSwapComponent;