import React, { useState } from 'react';
import { MessageCircle, Coins, ChevronDown, Plus, Twitter, MessageSquare, Trash2, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { getThemeClasses } from '../themes/themeConfig';

const Sidebar = () => {
  const { currentTheme } = useTheme();
  const { currentChatId, setCurrentChatId, createNewChat, deleteChat, chatHistory } = useChat();
  const [activeItem, setActiveItem] = useState('chats');
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showTokensDropdown, setShowTokensDropdown] = useState(false);

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
    setShowChatHistory(false);
  };

  const handleToggleHistory = (e) => {
    e.stopPropagation();
    setShowChatHistory(!showChatHistory);
  };

  const handleToggleTokens = (e) => {
    e.stopPropagation();
    setShowTokensDropdown(!showTokensDropdown);
  };

  // Mock tokens data - same as HoldingsViewer
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

  const sidebarItems = [
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageCircle,
      hasDropdown: true,
      hasAddButton: true
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: Coins,
      hasDropdown: true
    }
  ];

  return (
    <aside className={`w-64 h-full flex flex-col ${getThemeClasses(currentTheme, 'sidebar')}`}>
      {/* Main Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <div key={item.id}>
                <div
                  className={isActive ? getThemeClasses(currentTheme, 'sidebarItemActive') : getThemeClasses(currentTheme, 'sidebarItem')}
                  onClick={() => setActiveItem(item.id)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? getThemeClasses(currentTheme, 'sidebarIconActive') : getThemeClasses(currentTheme, 'sidebarIcon')}`} />
                  <span className={`flex-1 ${isActive ? getThemeClasses(currentTheme, 'sidebarItemTextActive') : getThemeClasses(currentTheme, 'sidebarItemText')}`}>
                    {item.label}
                  </span>
                  {item.hasAddButton && (
                    <button
                      onClick={handleNewChat}
                      className="p-1 hover:bg-gray-600 rounded transition-colors duration-200"
                    >
                      <Plus className={`w-4 h-4 ${getThemeClasses(currentTheme, 'sidebarIconActive')}`} />
                    </button>
                  )}
                  {item.hasDropdown && (
                    <button
                      onClick={item.id === 'chats' ? handleToggleHistory : handleToggleTokens}
                      className="p-1 hover:bg-gray-600 rounded transition-colors duration-200"
                    >
                      <ChevronDown className={`w-4 h-4 ${getThemeClasses(currentTheme, 'sidebarIcon')} ${
                        (item.id === 'chats' && showChatHistory) || (item.id === 'tokens' && showTokensDropdown) 
                          ? 'rotate-180' : ''
                      } transition-transform duration-200`} />
                    </button>
                  )}
                </div>
                
                <>
                
                {/* Chat History - appears directly under the Chats button */}
                {item.id === 'chats' && (
                  <div className={`ml-4 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                    showChatHistory ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  <div className="space-y-1">
                      {chatHistory.map((chat, index) => (
                        <div
                          key={chat.id}
                          className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 focus:outline-none ${
                            currentChatId === chat.id 
                              ? `${getThemeClasses(currentTheme, 'tertiary')} border-gray-800 border shadow-lg` 
                              : `${getThemeClasses(currentTheme, 'hover')} hover:${getThemeClasses(currentTheme, 'tertiary')}`
                          }`}
                          style={{
                            animationDelay: showChatHistory ? `${index * 50}ms` : '0ms',
                            animation: showChatHistory ? 'slideInFromTop 0.3s ease-out forwards' : 'none'
                          }}
                          onClick={() => setCurrentChatId(chat.id)}
                          tabIndex={-1}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 text-left">
                              <div className={`text-xs font-medium text-left truncate ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                {getChatPreview(chat.messages)}
                              </div>
                              <div className={`text-xs mt-1 flex items-center space-x-1 text-left ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(chat.lastUpdated)}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat.id);
                              }}
                              className={`p-1 rounded hover:bg-red-500 hover:text-white transition-all duration-200 ml-2`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {chatHistory.length === 0 && (
                      <div className={`text-center py-4 ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                        <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <div className="text-xs">No chat history yet</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tokens List - appears directly under the Tokens button */}
                {item.id === 'tokens' && (
                  <div className={`ml-4 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                    showTokensDropdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="space-y-1">
                        {tokens.map((token, index) => (
                          <div
                            key={token.id}
                            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${getThemeClasses(currentTheme, 'hover')} hover:${getThemeClasses(currentTheme, 'tertiary')}`}
                            style={{
                              animationDelay: showTokensDropdown ? `${index * 50}ms` : '0ms',
                              animation: showTokensDropdown ? 'slideInFromTop 0.3s ease-out forwards' : 'none'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                  {token.icon}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className={`text-xs font-medium text-left truncate ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                    {token.symbol}
                                  </div>
                                  <div className={`text-xs text-left truncate ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                                    {token.name}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className={`text-xs font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                  {token.price}
                                </div>
                                <div className={`text-xs ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                  {token.change24h}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              </div>
            );
          })}
        </nav>
        
      </div>

      {/* Bottom Section - Social Links */}
      <div className={`p-3 border-t border-gray-800`}>
        <div className="space-y-1">
          <button className={`flex items-center space-x-2 px-2 py-1 ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors duration-200`}>
            <Twitter className={`w-3 h-3 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
            <span className="text-xs">Follow Twitter</span>
          </button>
          <button className={`flex items-center space-x-2 px-2 py-1 ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors duration-200`}>
            <MessageSquare className={`w-3 h-3 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
            <span className="text-xs">Join Discord</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
