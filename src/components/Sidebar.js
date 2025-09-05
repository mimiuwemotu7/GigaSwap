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
    // Keep the chat dropdown open
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
      hasDropdown: true
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: Coins,
      hasDropdown: true
    }
  ];

  return (
    <aside className={`${getThemeClasses(currentTheme, 'sidebarContainer')} ${getThemeClasses(currentTheme, 'sidebar')}`}>
      {/* Main Navigation */}
      <div className={getThemeClasses(currentTheme, 'sidebarContent')}>
        <nav className={getThemeClasses(currentTheme, 'sidebarNav')}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <div key={item.id}>
                <div
                  className={isActive ? getThemeClasses(currentTheme, 'sidebarItemActive') : `${getThemeClasses(currentTheme, 'sidebarItem').replace(getThemeClasses(currentTheme, 'hover'), '')} ${(item.id === 'tokens' || item.id === 'chats') ? getThemeClasses(currentTheme, 'tokensButtonHover') : getThemeClasses(currentTheme, 'hover')}`}
                  onClick={() => {
                    setActiveItem(item.id);
                    if (item.hasDropdown) {
                      if (item.id === 'chats') {
                        setShowChatHistory(!showChatHistory);
                      } else if (item.id === 'tokens') {
                        setShowTokensDropdown(!showTokensDropdown);
                      }
                    }
                  }}
                >
                  <Icon className={`${getThemeClasses(currentTheme, 'sidebarIconSize')} ${isActive ? getThemeClasses(currentTheme, 'sidebarIconActive') : getThemeClasses(currentTheme, 'sidebarIcon')}`} />
                  <span className={`${getThemeClasses(currentTheme, 'sidebarTextContainer')} ${isActive ? getThemeClasses(currentTheme, 'sidebarItemTextActive') : getThemeClasses(currentTheme, 'sidebarItemText')}`}>
                    {item.label}
                  </span>
                  {item.hasDropdown && (
                    <div className={getThemeClasses(currentTheme, 'sidebarChevronContainer')}>
                      <ChevronDown className={`${getThemeClasses(currentTheme, 'sidebarChevronSize')} ${isActive ? getThemeClasses(currentTheme, 'sidebarIconActive') : getThemeClasses(currentTheme, 'sidebarIcon')} ${
                        (item.id === 'chats' && showChatHistory) || (item.id === 'tokens' && showTokensDropdown) 
                          ? 'rotate-180' : ''
                      } ${getThemeClasses(currentTheme, 'sidebarChevronTransition')}`} />
                    </div>
                  )}
                </div>
                
                <>
                
                {/* Chat History - appears directly under the Chats button */}
                {item.id === 'chats' && (
                  <div className={`ml-4 mt-2 overflow-hidden transition-all duration-300 ease-in-out bg-transparent ${
                    showChatHistory ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  <div className={`${getThemeClasses(currentTheme, 'listContainer')} ${getThemeClasses(currentTheme, 'chatHistoryDropdown')}`}>
                      {/* New Chat Button */}
                      <button
                        onClick={handleNewChat}
                        className={`${getThemeClasses(currentTheme, 'newChatButton')} ${getThemeClasses(currentTheme, 'hover')} hover:${getThemeClasses(currentTheme, 'tertiary')} border border-dashed ${getThemeClasses(currentTheme, 'border')} hover:border-solid hover:shadow-sm`}
                      >
                        <Plus className={`${getThemeClasses(currentTheme, 'newChatIcon')} ${getThemeClasses(currentTheme, 'sidebarIcon')}`} />
                        <span className={`${getThemeClasses(currentTheme, 'newChatText')} ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                          New Chat
                        </span>
                      </button>
                      
                      {chatHistory.map((chat, index) => (
                        <div
                          key={chat.id}
                          className={`${getThemeClasses(currentTheme, 'chatItemContainer')} ${
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
                          <div className={getThemeClasses(currentTheme, 'chatItemLayout')}>
                            <div className={getThemeClasses(currentTheme, 'chatTextContainer')}>
                              <div className={`${getThemeClasses(currentTheme, 'chatItemText')} ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                {getChatPreview(chat.messages)}
                              </div>
                              <div className={`${getThemeClasses(currentTheme, 'chatItemTime')} ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                                <Clock className={getThemeClasses(currentTheme, 'chatItemClock')} />
                                <span>{formatDate(chat.lastUpdated)}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat.id);
                              }}
                              className={`${getThemeClasses(currentTheme, 'chatDeleteButton')} ${getThemeClasses(currentTheme, 'textPrimary')}`}
                            >
                              <Trash2 className={getThemeClasses(currentTheme, 'chatDeleteIcon')} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {chatHistory.length === 0 && (
                      <div className={`${getThemeClasses(currentTheme, 'chatEmptyContainer')} ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                        <MessageSquare className={getThemeClasses(currentTheme, 'chatEmptyIcon')} />
                        <div className={getThemeClasses(currentTheme, 'chatEmptyText')}>No chat history yet</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tokens List - appears directly under the Tokens button */}
                {item.id === 'tokens' && (
                  <div className={`ml-4 mt-2 overflow-hidden transition-all duration-300 ease-in-out bg-transparent ${
                    showTokensDropdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className={`${getThemeClasses(currentTheme, 'listContainer')} ${getThemeClasses(currentTheme, 'tokensDropdown')}`}>
                        {tokens.map((token, index) => (
                          <div
                            key={token.id}
                            className={`${getThemeClasses(currentTheme, 'tokenItemContainer')} ${getThemeClasses(currentTheme, 'hover')} hover:${getThemeClasses(currentTheme, 'tertiary')}`}
                            style={{
                              animationDelay: showTokensDropdown ? `${index * 50}ms` : '0ms',
                              animation: showTokensDropdown ? 'slideInFromTop 0.3s ease-out forwards' : 'none'
                            }}
                          >
                            <div className={getThemeClasses(currentTheme, 'tokenItemLayout')}>
                              <div className={getThemeClasses(currentTheme, 'tokenIconLayout')}>
                                <div className={`${getThemeClasses(currentTheme, 'tokenIconContainer')} ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                  {token.icon}
                                </div>
                                <div className={getThemeClasses(currentTheme, 'tokenTextContainer')}>
                                  <div className={`${getThemeClasses(currentTheme, 'tokenSymbol')} ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                    {token.symbol}
                                  </div>
                                  <div className={`${getThemeClasses(currentTheme, 'tokenName')} ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                                    {token.name}
                                  </div>
                                </div>
                              </div>
                              
                              <div className={getThemeClasses(currentTheme, 'tokenPriceContainer')}>
                                <div className={`${getThemeClasses(currentTheme, 'tokenPrice')} ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                                  {token.price}
                                </div>
                                <div className={`${getThemeClasses(currentTheme, 'tokenChange')} ${token.isPositive ? getThemeClasses(currentTheme, 'tokenChangePositive') : getThemeClasses(currentTheme, 'tokenChangeNegative')}`}>
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
      <div className={getThemeClasses(currentTheme, 'bottomSection')}>
        <div className={getThemeClasses(currentTheme, 'socialContainer')}>
          <button className={`${getThemeClasses(currentTheme, 'socialButton')} ${getThemeClasses(currentTheme, 'textSecondary')}`}>
            <Twitter className={getThemeClasses(currentTheme, 'socialIcon')} />
            <span className={getThemeClasses(currentTheme, 'socialText')}>Follow Twitter</span>
          </button>
          <button className={`${getThemeClasses(currentTheme, 'socialButton')} ${getThemeClasses(currentTheme, 'textSecondary')}`}>
            <MessageSquare className={getThemeClasses(currentTheme, 'socialIcon')} />
            <span className={getThemeClasses(currentTheme, 'socialText')}>Join Discord</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
