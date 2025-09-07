import React, { useState, useEffect } from 'react';
import { User, Bell, Menu, Wallet, MessageCircle, Coins, ChevronDown, Plus, Trash2, Clock, X, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { useSupabase } from '../contexts/SupabaseContext';
import { getThemeClasses } from '../themes/themeConfig';
import ThemeSelector from './ThemeSelector';
import NotificationCard from './NotificationCard';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';

const Header = () => {
  const { currentTheme } = useTheme();
  const { currentChatId, setCurrentChatId, createNewChat, deleteChat, chatHistory } = useChat();
  const { user, profile, loading } = useSupabase();
  
  // Debug logging
  console.log('Header: user state:', user);
  console.log('Header: profile state:', profile);
  console.log('Header: loading state:', loading);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
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
            
          <button 
            onClick={() => user ? setShowUserProfile(true) : setShowAuthModal(true)}
            className={`hidden md:block p-2 rounded-full border transition-all duration-200 bg-transparent flex items-center justify-center ${getThemeClasses(currentTheme, 'userButton')}`}
          >
            {user ? (
              <User className={`w-4 h-4 ${getThemeClasses(currentTheme, 'userButtonIcon')}`} />
            ) : (
              <LogIn className={`w-4 h-4 ${getThemeClasses(currentTheme, 'userButtonIcon')}`} />
            )}
          </button>
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
                {/* Profile */}
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      user ? setShowUserProfile(true) : setShowAuthModal(true);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
                  >
                    {user ? (
                      <User className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                    ) : (
                      <LogIn className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                    )}
                    <span className={`${getThemeClasses(currentTheme, 'textPrimary')} font-medium text-sm md:text-base`}>
                      {user ? 'Profile' : 'Sign In'}
                    </span>
                  </button>
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

    {/* Auth Modal */}
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={() => setShowAuthModal(false)} 
    />

    {/* User Profile Modal */}
    <UserProfile 
      isOpen={showUserProfile} 
      onClose={() => setShowUserProfile(false)} 
    />
    </>
  );
};

export default Header;
