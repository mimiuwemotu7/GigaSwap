import React from 'react';
import { ArrowRight, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';
import ThemeSelector from './ThemeSelector';

const Header = () => {
  const { currentTheme } = useTheme();

  return (
    <header className={`w-full py-4 px-6 ${getThemeClasses(currentTheme, 'headerContainer')}`}>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/icon2.png" alt="GigaSwap" className="w-8 h-8" />
          <h1 className={`text-2xl font-bold ${getThemeClasses(currentTheme, 'headerTitle')}`}>
            GigaSwap
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-200 text-sm font-medium">
            <ArrowRight className="w-3 h-3" />
            <span>Connect Wallet</span>
          </button>
          <button className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
