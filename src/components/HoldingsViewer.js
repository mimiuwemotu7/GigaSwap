import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { getThemeClasses } from '../themes/themeConfig';

const HoldingsViewer = () => {
  const { currentTheme } = useTheme();
  const { sendMessage } = useChat();
  const [showBalances, setShowBalances] = useState(true);

  // Mock data - in a real app, this would come from an API
  const holdings = [
    {
      id: 1,
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '⟠',
      balance: '2.4521',
      value: '$4,234.56',
      change24h: '+5.23%',
      isPositive: true,
      color: 'text-blue-400',
      contractAddress: '0xA0b86a33E6441c8C06DDD4C4c4c4c4c4c4c4c4c4c'
    },
    {
      id: 2,
      symbol: 'SOL',
      name: 'Solana',
      icon: '◎',
      balance: '45.32',
      value: '$3,891.24',
      change24h: '+2.15%',
      isPositive: true,
      color: 'text-purple-400',
      contractAddress: 'So11111111111111111111111111111111111111112'
    },
    {
      id: 3,
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '$',
      balance: '1,234.56',
      value: '$1,234.56',
      change24h: '+0.01%',
      isPositive: true,
      color: 'text-green-400',
      contractAddress: '0xA0b86a33E6441c8C06DDD4C4c4c4c4c4c4c4c4c4c'
    },
    {
      id: 4,
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      balance: '0.125',
      value: '$8,234.12',
      change24h: '-1.45%',
      isPositive: false,
      color: 'text-orange-400',
      contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    }
  ];

  const handleSwap = (holding) => {
    sendMessage(`swap ${holding.contractAddress}`);
  };

  const totalValue = holdings.reduce((sum, holding) => {
    const value = parseFloat(holding.value.replace('$', '').replace(',', ''));
    return sum + value;
  }, 0);

  const formatValue = (value) => {
    if (showBalances) {
      return value;
    }
    return '••••••';
  };

  const formatBalance = (balance) => {
    if (showBalances) {
      return balance;
    }
    return '••••';
  };

  return (
    <div className={`w-full max-w-sm md:max-w-sm mx-auto rounded-xl p-3 md:p-3 shadow-lg ${getThemeClasses(currentTheme, 'container')} border border-gray-800`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-4">
        <h2 className={`text-base md:text-lg font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
          Portfolio Holdings
        </h2>
        <button
          onClick={() => setShowBalances(!showBalances)}
          className={`p-2 md:p-2 rounded-lg min-h-touch min-w-touch ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
        >
          {showBalances ? (
            <Eye className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
          ) : (
            <EyeOff className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
          )}
        </button>
      </div>

      {/* Total Value */}
      <div className={`mb-4 md:mb-4 p-3 md:p-3 rounded-lg ${getThemeClasses(currentTheme, 'section')}`}>
        <div className={`text-sm ${getThemeClasses(currentTheme, 'textSecondary')}`}>Total Portfolio Value</div>
        <div className={`text-xl md:text-2xl font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
          {formatValue(`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-3 md:space-y-2">
        {holdings.map((holding) => (
          <div
            key={holding.id}
            className={`p-3 md:p-3 rounded-lg ${getThemeClasses(currentTheme, 'section')} hover:${getThemeClasses(currentTheme, 'hover')} transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-sm font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                  {holding.icon}
                </div>
                <div>
                  <div className={`font-semibold text-left text-sm md:text-base ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                    {holding.symbol}
                  </div>
                  <div className={`text-xs text-left ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                    {holding.name}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="text-right">
                  <div className={`font-semibold text-sm md:text-base ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                    {formatValue(holding.value)}
                  </div>
                  <div className={`text-xs ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                    {formatBalance(holding.balance)} {holding.symbol}
                  </div>
                  <div className={`text-xs flex items-center justify-end ${holding.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {holding.change24h}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSwap(holding)}
                  className={`px-3 py-2 md:px-3 md:py-1 rounded-lg border min-h-touch ${getThemeClasses(currentTheme, 'border')} text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')} hover:bg-red-500 hover:text-white hover:border-gray-800 transition-all duration-200`}
                >
                  Swap
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`mt-4 md:mt-3 text-center text-xs ${getThemeClasses(currentTheme, 'footer')}`}>
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default HoldingsViewer;
