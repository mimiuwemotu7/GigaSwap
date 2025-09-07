import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabase } from '../contexts/SupabaseContext';
import { getThemeClasses } from '../themes/themeConfig';
import AuthModalUI from './AuthModalUI';

const LoginPage = () => {
  const { currentTheme } = useTheme();
  const { user } = useSupabase();

  // Redirect to app if user is already authenticated
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${getThemeClasses(currentTheme, 'headerContainer')} border-b ${getThemeClasses(currentTheme, 'border')}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/icon2.png" alt="GigaSwap" className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className={`text-lg sm:text-xl font-bold ${getThemeClasses(currentTheme, 'headerTitle')}`}>
                GigaSwap
              </h1>
            </div>
             <a
               href="https://x.com/gigaswap"
               target="_blank"
               rel="noopener noreferrer"
               className={`p-2 rounded-lg transition-all duration-200 ${getThemeClasses(currentTheme, 'buttonSecondary')} ${getThemeClasses(currentTheme, 'textPrimary')} hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 active:bg-gray-200 dark:active:bg-gray-600`}
               aria-label="Follow us on X (Twitter)"
             >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          {/* Left Side - Hero Section */}
          <div className="flex flex-col items-center lg:items-start justify-center text-center lg:text-left mb-8 lg:mb-0">
            <div className="w-48 h-48 sm:w-56 sm:h-56 mb-4 sm:mb-6 flex items-center justify-center">
              <img src="/icon1.png" alt="GigaSwap" className="w-48 h-48 sm:w-56 sm:h-56" />
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${getThemeClasses(currentTheme, 'textPrimary')} mb-3 sm:mb-4`}>
              The Gateway to DeFi
            </h1>
            <p className={`text-lg sm:text-xl ${getThemeClasses(currentTheme, 'textSecondary')}`}>
              GigaSwap is the only trading platform you'll ever need.
            </p>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex items-center justify-center lg:justify-end w-full">
            <div className="w-full max-w-sm">
              <div className={`${getThemeClasses(currentTheme, 'container')} border ${getThemeClasses(currentTheme, 'border')} rounded-2xl shadow-xl p-6`}>
                <AuthModalUI />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`${getThemeClasses(currentTheme, 'headerContainer')} border-t ${getThemeClasses(currentTheme, 'border')}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/icon2.png" alt="GigaSwap" className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className={`text-sm sm:text-base font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>GigaSwap</span>
            </div>
            <button className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Docs</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
