import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Menu, Wallet, MessageCircle, Coins, ChevronDown, Plus, Trash2, Clock, X, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
// Auth removed: no useSupabase
import { useSupabase } from '../contexts/SupabaseContext';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import { getThemeClasses } from '../themes/themeConfig';
import ThemeSelector from './ThemeSelector';
import NotificationCard from './NotificationCard';
import { useToast } from './ToastContext';

const Header = () => {
  const { currentTheme } = useTheme();
  const { currentChatId, setCurrentChatId, createNewChat, deleteChat, chatHistory } = useChat();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showTokensDropdown, setShowTokensDropdown] = useState(false);

  // Swipe detection constants
  const minSwipeDistance = 50;
  const edgeDetectionWidth = 30;
  const menuWidth = 320; // Width of the mobile menu

  // Global touch events for swipe functionality
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.targetTouches && e.targetTouches[0]) {
        const startX = e.targetTouches[0].clientX;
        const startY = e.targetTouches[0].clientY;
        
        // Only start swipe detection from left edge or if menu is open
        if (startX <= edgeDetectionWidth || showMobileMenu) {
          setTouchStart({ x: startX, y: startY });
          setTouchEnd(null);
          setIsSwipeActive(true);
          setSwipeProgress(0);
        }
      }
    };

    const handleTouchMove = (e) => {
      if (e.targetTouches && e.targetTouches[0] && isSwipeActive && touchStart) {
        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        
        // Check if it's a horizontal swipe (not vertical scroll)
        const deltaX = currentX - touchStart.x;
        const deltaY = Math.abs(currentY - touchStart.y);
        
        if (deltaY < 100) { // Only if it's more horizontal than vertical
          setTouchEnd({ x: currentX, y: currentY });
          
          // Calculate swipe progress for visual feedback
          if (showMobileMenu) {
            // Closing menu - swipe left
            const progress = Math.max(0, Math.min(1, -deltaX / menuWidth));
            setSwipeProgress(progress);
          } else {
            // Opening menu - swipe right
            const progress = Math.max(0, Math.min(1, deltaX / menuWidth));
            setSwipeProgress(progress);
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd || !isSwipeActive) {
        setIsSwipeActive(false);
        setSwipeProgress(0);
        return;
      }
      
      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = Math.abs(touchEnd.y - touchStart.y);
      
      // Only process horizontal swipes
      if (deltaY < 100) {
        const isLeftSwipe = deltaX < -minSwipeDistance;
        const isRightSwipe = deltaX > minSwipeDistance;
        
        // Open menu with right swipe from left edge
        if (isRightSwipe && !showMobileMenu && touchStart.x <= edgeDetectionWidth) {
          setShowMobileMenu(true);
        }
        
        // Close menu with left swipe
        if (isLeftSwipe && showMobileMenu) {
          setShowMobileMenu(false);
        }
      }
      
      // Reset touch values
      setTouchStart(null);
      setTouchEnd(null);
      setIsSwipeActive(false);
      setSwipeProgress(0);
    };

    // Add touch events to document
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, showMobileMenu, isSwipeActive, minSwipeDistance, edgeDetectionWidth, menuWidth]);

  // Helper functions from Sidebar
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatPreview = (messages) => {
    if (messages.length === 0) return 'New chat';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.text;
  };

  const handleNewChat = (e) => {
    e.stopPropagation();
    createNewChat();
  };

  // Mock tokens data
  const tokens = [
    {
      id: 1,
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '⟠',
      price: '$1,728.45',
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
      price: '$85.92',
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
      price: '$1.00',
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
      price: '$65,872.96',
      change24h: '-1.45%',
      isPositive: false,
      color: 'text-orange-400',
      contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    }
  ];

  return (
    <>
      {/* Left Edge Swipe Indicator (only visible during swipe) */}
      {isSwipeActive && !showMobileMenu && (
        <div 
          className="fixed top-0 left-0 h-full w-1 bg-red-500 z-50 transition-opacity duration-200"
          style={{ opacity: swipeProgress * 0.5 }}
        />
      )}
      
      <header 
        className={`w-full py-4 px-6 ${getThemeClasses(currentTheme, 'headerContainer')}`}
      >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/icon2.png" alt="GigaSwap" className="w-8 h-8" />
          <h1 className={`hidden md:block text-lg md:text-xl font-bold ${getThemeClasses(currentTheme, 'headerTitle')}`}>
            GigaSwap
          </h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Compact Connect Wallet Button */}
          <button className={`p-2 rounded-full border transition-all duration-200 bg-transparent flex items-center justify-center ${getThemeClasses(currentTheme, 'connectWalletButton')}`}>
            <Wallet className={`w-4 h-4`} />
          </button>
          
          {/* Notifications Bell */}
            <button 
              data-notification-bell
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
            className={getThemeClasses(currentTheme, 'notificationBellButton')}
            >
            <Bell className={getThemeClasses(currentTheme, 'notificationBellIcon')} />
              {/* Notification dot */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${getThemeClasses(currentTheme, 'notificationDot')}`}></div>
            </button>
            
            {/* Notification Card */}
            <NotificationCard 
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              selectedNotification={selectedNotification}
              setSelectedNotification={setSelectedNotification}
            />
            
          <AuthControls currentTheme={currentTheme} />
          <ThemeSelector />
          {/* Mobile hamburger menu button - moved to right side */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`md:hidden p-2 rounded-lg touch-feedback bg-transparent flex items-center justify-center ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
          >
            <Menu className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textPrimary')}`} />
          </button>
        </div>
      </div>
      
      {/* Mobile Side Drawer */}
      <div className={`md:hidden fixed inset-0 z-40 ${
        showMobileMenu ? 'pointer-events-auto' : 'pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
            showMobileMenu ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setShowMobileMenu(false)}
        />
        
        {/* Side Drawer */}
        <div 
          className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transition-transform duration-300 ease-out ${
            showMobileMenu ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            transform: isSwipeActive && !showMobileMenu 
              ? `translateX(${swipeProgress * 100 - 100}%)` 
              : isSwipeActive && showMobileMenu 
                ? `translateX(${-swipeProgress * 100}%)` 
                : showMobileMenu 
                  ? 'translateX(0)' 
                  : 'translateX(-100%)'
          }}
        >
            <div className={`h-full ${getThemeClasses(currentTheme, 'headerContainer')} border-r ${getThemeClasses(currentTheme, 'border')} shadow-xl`}>
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className={`p-2 rounded-lg touch-feedback ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
                >
                  <X className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textPrimary')}`} />
                </button>
                <h2 className={`text-base md:text-lg font-bold ${getThemeClasses(currentTheme, 'headerTitle')}`}>
                  Menu
                </h2>
              </div>
              
              {/* Drawer Content */}
              <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
                {/* Profile / Auth */}
                <div className="space-y-2">
                  <MobileAuthControls currentTheme={currentTheme} setShowMobileMenu={setShowMobileMenu} />
                </div>

                {/* Chats Section */}
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setShowChatHistory(!showChatHistory);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <MessageCircle className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                      <span className={`${getThemeClasses(currentTheme, 'textPrimary')} font-medium text-sm md:text-base`}>Chats</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')} transition-transform duration-200 ${showChatHistory ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Chat History */}
                  {showChatHistory && (
                    <div className="ml-4 space-y-1">
                      <button
                        onClick={handleNewChat}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg border border-dashed ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
                      >
                        <Plus className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                        <span className={`${getThemeClasses(currentTheme, 'textPrimary')} text-xs md:text-sm`}>New Chat</span>
                      </button>
                      
                      {chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                            currentChatId === chat.id 
                              ? `${getThemeClasses(currentTheme, 'tertiary')} border border-gray-800` 
                              : `${getThemeClasses(currentTheme, 'hover')}`
                          }`}
                          onClick={() => setCurrentChatId(chat.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs md:text-sm ${getThemeClasses(currentTheme, 'textPrimary')} truncate text-left`}>
                              {getChatPreview(chat.messages)}
                            </div>
                            <div className={`text-[10px] md:text-xs ${getThemeClasses(currentTheme, 'textSecondary')} flex items-center space-x-1 text-left`}>
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(chat.lastUpdated)}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className={`p-1 rounded transition-colors duration-200 hover:bg-red-500 hover:text-white`}
                          >
                            <Trash2 className={`w-3 h-3 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tokens Section */}
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setShowTokensDropdown(!showTokensDropdown);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <Coins className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                      <span className={`${getThemeClasses(currentTheme, 'textPrimary')} font-medium`}>Tokens</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')} transition-transform duration-200 ${showTokensDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Tokens List */}
                  {showTokensDropdown && (
                    <div className="ml-4 space-y-1">
                      {tokens.map((token) => (
                        <div
                          key={token.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                              {token.icon}
                            </div>
                            <div className="text-left">
                              <div className={`text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                {token.symbol}
                              </div>
                              <div className={`text-xs ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                                {token.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                              {token.price}
                            </div>
                            <div className={`text-xs ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {token.change24h}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </header>

  {/* Auth/UI removed */}
    </>
  );
};

// Small auth controls component (desktop)
function AuthControls({ currentTheme }) {
  const { user, signOut } = useSupabase();
  const { addToast } = useToast();
  const [showModal, setShowModal] = React.useState(false);
  const modalRef = React.useRef(null);
  const [signingOut, setSigningOut] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => {
      const el = modalRef.current?.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      if (el && typeof el.focus === 'function') el.focus();
    }, 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  return (
    <>
      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`hidden md:flex items-center space-x-2 p-1.5 rounded-full cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${getThemeClasses(currentTheme, 'userButton')}`}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-200 dark:border-gray-600">
                {(user.email || '').slice(0,2).toUpperCase()}
              </div>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''} ${getThemeClasses(currentTheme, 'textSecondary')}`} />
          </button>

          {showDropdown && (
            <div 
              role="menu" 
              aria-label="User menu" 
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'container')} py-1 z-50`} 
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className={`text-xs font-medium ${getThemeClasses(currentTheme, 'textSecondary')} uppercase tracking-wide`}>
                  {user?.email}
                </div>
              </div>
              <button 
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${getThemeClasses(currentTheme, 'textPrimary')} flex items-center space-x-2`} 
                onClick={() => { setShowProfile(true); setShowDropdown(false); }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>
              <button 
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 ${getThemeClasses(currentTheme, 'textPrimary')} flex items-center space-x-2`} 
                onClick={() => { setSigningOut(true); signOut(); addToast('Signed out — see you next time!', 'info'); setShowDropdown(false); setTimeout(() => setSigningOut(false), 700); }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          )}

          {showProfile && createPortal(
            <div 
              role="presentation" 
              aria-hidden={!showProfile} 
              className="fixed bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowProfile(false)}
              style={{ 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                width: '100vw', 
                height: '100vh',
                margin: 0,
                padding: 0,
                position: 'fixed',
                zIndex: 9999
              }}
            >
              <div 
                role="dialog" 
                aria-modal="true" 
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-lg mx-4"
              >
                <UserProfile onClose={() => setShowProfile(false)} />
              </div>
            </div>,
            document.body
          )}
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowModal(true)}
            aria-haspopup="dialog"
            aria-expanded={showModal}
            className={`hidden md:block p-2 rounded-full border transition-all duration-200 bg-transparent flex items-center justify-center ${getThemeClasses(currentTheme, 'userButton')}`}
          >
            <LogIn className={`w-4 h-4 ${getThemeClasses(currentTheme, 'userButtonIcon')}`} />
          </button>
          {showModal && createPortal(
            <div
              role="presentation"
              aria-hidden={!showModal}
              className="fixed bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowModal(false)}
              style={{ 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                width: '100vw', 
                height: '100vh',
                margin: 0,
                padding: 0,
                position: 'fixed',
                zIndex: 9999
              }}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className={`${getThemeClasses(currentTheme, 'container')} w-full max-w-md mx-4 shadow-2xl border ${getThemeClasses(currentTheme, 'border')} rounded-2xl`}
                style={{ maxWidth: 'min(400px, calc(100vw - 2rem))' }}
              >
                <AuthModal />
                <div className="mt-2 text-right">
                  <button 
                    onClick={() => setShowModal(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${getThemeClasses(currentTheme, 'buttonSecondary')} ${getThemeClasses(currentTheme, 'buttonSecondaryHover')} ${getThemeClasses(currentTheme, 'textPrimary')}`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
}

// Mobile auth controls used in the side drawer
function MobileAuthControls({ currentTheme, setShowMobileMenu }) {
  const { user, signOut } = useSupabase();
  const { addToast } = useToast();
  const [showModal, setShowModal] = React.useState(false);
  const modalRef = React.useRef(null);
  const [signingOutMobile, setSigningOutMobile] = React.useState(false);
  const [showProfileMobile, setShowProfileMobile] = React.useState(false);

  React.useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => {
      const el = modalRef.current?.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      if (el && typeof el.focus === 'function') el.focus();
    }, 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  return (
    <>
      {user ? (
        <>
          <button
            onClick={() => setShowProfileMobile(true)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">{(user.email || '').slice(0,2).toUpperCase()}</div>
            )}
            <div className={`${getThemeClasses(currentTheme, 'textPrimary')} font-medium`}>{user.email}</div>
            <div className="ml-auto">
              <ChevronDown className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
            </div>
          </button>
          {showProfileMobile && createPortal(
            <div 
              role="presentation" 
              aria-hidden={!showProfileMobile} 
              className="fixed bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowProfileMobile(false)}
              style={{ 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                width: '100vw', 
                height: '100vh',
                margin: 0,
                padding: 0,
                position: 'fixed',
                zIndex: 9999
              }}
            >
              <div 
                role="dialog" 
                aria-modal="true" 
                onClick={(e) => e.stopPropagation()} 
                className={`w-full max-w-sm mx-4 rounded-xl shadow-2xl border ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'container')} p-4`}
              >
                <div className="space-y-3">
                  <button 
                    onClick={() => { setShowProfileMobile(false); setShowMobileMenu(false); }} 
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${getThemeClasses(currentTheme, 'textPrimary')} flex items-center space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => { setSigningOutMobile(true); signOut(); addToast('Signed out — see you next time!', 'info'); setTimeout(() => { setSigningOutMobile(false); setShowMobileMenu(false); }, 700); }} 
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 ${getThemeClasses(currentTheme, 'textPrimary')} flex items-center space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      ) : (
        <>
          <button
            onClick={() => { setShowModal(true); setShowMobileMenu(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
          >
            <LogIn className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
            <span className={`${getThemeClasses(currentTheme, 'textPrimary')} font-medium text-sm md:text-base`}>Sign In</span>
          </button>
          {showModal && createPortal(
            <div 
              role="presentation" 
              aria-hidden={!showModal} 
              className="fixed bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowModal(false)}
              style={{ 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                width: '100vw', 
                height: '100vh',
                margin: 0,
                padding: 0,
                position: 'fixed',
                zIndex: 9999
              }}
            >
              <div 
                ref={modalRef} 
                role="dialog" 
                aria-modal="true" 
                onClick={(e) => e.stopPropagation()} 
                className={`${getThemeClasses(currentTheme, 'container')} w-full max-w-sm mx-4 shadow-2xl border ${getThemeClasses(currentTheme, 'border')} rounded-2xl`}
              >
                <AuthModal />
                <div className="mt-2 text-right">
                  <button 
                    onClick={() => setShowModal(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${getThemeClasses(currentTheme, 'buttonSecondary')} ${getThemeClasses(currentTheme, 'buttonSecondaryHover')} ${getThemeClasses(currentTheme, 'textPrimary')}`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
}
export default Header;
