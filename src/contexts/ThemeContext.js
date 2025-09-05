import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('swap-theme');
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('swap-theme', currentTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [currentTheme]);

  // Apply theme class to body element
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (theme) => {
    if (theme === 'dark' || theme === 'light') {
      setCurrentTheme(theme);
    }
  };

  const value = {
    currentTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
