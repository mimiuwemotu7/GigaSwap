import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';

const ThemeSelector = () => {
  const { currentTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 ${getThemeClasses(currentTheme, 'themeSelectorButton')} min-w-[40px] flex items-center justify-center`}
      title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {currentTheme === 'dark' ? (
        <Sun className={`w-5 h-5 ${getThemeClasses(currentTheme, 'themeSelectorIcon')}`} />
      ) : (
        <Moon className={`w-5 h-5 ${getThemeClasses(currentTheme, 'themeSelectorIcon')}`} />
      )}
    </button>
  );
};

export default ThemeSelector;
