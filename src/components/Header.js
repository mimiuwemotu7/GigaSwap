import React, { useState } from 'react';
import { User, Bell, Menu, Wallet, MessageCircle, Coins, ChevronDown, Plus, Trash2, Clock, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { getThemeClasses } from '../themes/themeConfig';
import ThemeSelector from './ThemeSelector';
import NotificationCard from './NotificationCard';

const Header = () => {
  const { currentTheme } = useTheme();
  const { currentChatId, setCurrentChatId, createNewChat, deleteChat, chatHistory } = useChat();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showTokensDropdown, setShowTokensDropdown] = useState(false);

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

  // Swipe detection functions
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    if (e.targetTouches && e.targetTouches[0]) {
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e) => {
    if (e.targetTouches && e.targetTouches[0]) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && showMobileMenu) {
      setShowMobileMenu(false);
    }
  };


  return (
    <header className={`w-full py-4 px-6 ${getThemeClasses(currentTheme, 'headerContainer')}`}>
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
            className={`relative p-2 rounded-full border transition-all duration-200 flex items-center justify-center ${showNotifications ? 'bg-red-500 border-red-500' : 'bg-transparent border-gray-700 hover:bg-gray-700'}`}
            >
            <Bell className={`w-4 h-4 ${showNotifications ? 'text-white' : getThemeClasses(currentTheme, 'textSecondary')}`} />
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
            
          <button className={`hidden md:block p-2 rounded-full border transition-all duration-200 bg-transparent flex items-center justify-center ${getThemeClasses(currentTheme, 'userButton')}`}>
            <User className={`w-4 h-4 ${getThemeClasses(currentTheme, 'userButtonIcon')}`} />
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
          className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 slide-drawer-right ${
            showMobileMenu ? 'open' : ''
          }`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
            <div className={`h-full ${getThemeClasses(currentTheme, 'headerContainer')} border-l ${getThemeClasses(currentTheme, 'border')} shadow-xl`}>
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
                  <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}>
                    <User className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                    <span className={`${getThemeClasses(currentTheme, 'textPrimary')} font-medium text-sm md:text-base`}>Profile</span>
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
                            <div>
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
  );
};

export default Header;
