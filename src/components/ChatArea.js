import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';
import ChatInput from './ChatInput';
import SwapComponent from './SwapComponent';
import HoldingsViewer from './HoldingsViewer';

const ChatArea = ({ messages = [], isTyping = false }) => {
  const { currentTheme } = useTheme();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderComponent = (componentType) => {
    switch (componentType) {
      case 'SwapComponent':
        return <SwapComponent />;
      case 'HoldingsViewer':
        return <HoldingsViewer />;
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col ${getThemeClasses(currentTheme, 'chatArea')}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center w-full max-w-sm">
              <div className="mb-4">
                <img src="/icon1.png" alt="AI Assistant" className="w-40 md:w-24 h-auto mx-auto" />
              </div>
              
              {/* Comic Speech Bubble */}
              <div className="relative inline-block w-full max-w-64 md:max-w-sm">
                <div className={`relative border-2 ${getThemeClasses(currentTheme, 'border')} rounded-2xl px-3 md:px-6 py-2 md:py-4 shadow-lg w-full`}>
                  <div className={`text-sm md:text-lg font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                    What's good chad,
                  </div>
                  <div className={`text-xs md:text-sm mt-1 ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                    ready to make some money?
                  </div>
                  
                  {/* Speech bubble tail pointing up to character */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className={`w-4 h-4 border-l-2 border-t-2 ${getThemeClasses(currentTheme, 'border')} rotate-45`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6 px-2 md:px-6 py-2 md:py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${getThemeClasses(currentTheme, 'chatMessage')} ${
                  message.type === 'user' 
                    ? getThemeClasses(currentTheme, 'chatMessageUser')
                    : getThemeClasses(currentTheme, 'chatMessageBot')
                }`}
              >
                {message.type === 'user' ? (
                  <div className="w-full flex justify-end">
                    <div className="flex flex-col items-end max-w-[85%] md:max-w-lg">
                      {/* User Message */}
                      <div className="px-3 py-2 rounded-lg bg-gray-600 text-white text-xs md:text-sm font-medium mb-1 md:mb-2 break-words">
                        {message.text}
                      </div>
                      {/* User Message Time */}
                      <div className="flex flex-col items-end">
                        <div className={`${getThemeClasses(currentTheme, 'chatMessageTime')} text-right text-[10px] md:text-xs`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2 md:space-x-3">
                    {/* Bot Avatar */}
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src="/icon1.png" alt="AI Assistant" className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    {/* Bot Message */}
                    <div className="flex flex-col items-start max-w-[85%] md:max-w-lg">
                      <div className={`px-3 py-2 rounded-lg bg-red-500 ${getThemeClasses(currentTheme, 'chatMessageText')} text-left text-white text-xs md:text-sm break-words`}>
                        {message.text}
                      </div>
                      {message.component && (
                        <div className="mt-2 md:mt-3 w-full">
                          {renderComponent(message.component)}
                        </div>
                      )}
                      <div className={`${getThemeClasses(currentTheme, 'chatMessageTime')} mt-1 text-[10px] md:text-xs`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className={`${getThemeClasses(currentTheme, 'chatMessage')} ${getThemeClasses(currentTheme, 'chatMessageBot')}`}>
                <div className={`${getThemeClasses(currentTheme, 'chatTyping')}`}>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="ml-2">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input Area */}
      <div className="flex-shrink-0">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatArea;
