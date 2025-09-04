import React, { useState } from 'react';
import { ChevronDown, Send } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { getThemeClasses } from '../themes/themeConfig';

const ChatInput = () => {
  const { currentTheme } = useTheme();
  const { 
    selectedModel, 
    selectedNetwork, 
    setSelectedModel, 
    setSelectedNetwork, 
    sendMessage 
  } = useChat();
  const [message, setMessage] = useState('');

  const models = [
    { id: 'openai', name: 'Swap', color: 'text-teal-500' },
    { id: 'claude', name: 'Claude', color: 'text-orange-500' }
  ];

  const networks = [
    { id: 'solana', name: 'Holdings', color: 'text-gray-500' },
    { id: 'ethereum', name: 'Ethereum', color: 'text-blue-500' }
  ];

  const handleSend = async () => {
    if (message.trim()) {
      await sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-inherit">
      <div className={`p-4 ${getThemeClasses(currentTheme, 'chatInput')}`}>
        <div className="flex items-center space-x-3 mb-3">
          {/* Model Selector */}
          <button 
            onClick={() => sendMessage('swap')}
            className={`${getThemeClasses(currentTheme, 'chatSelector')} cursor-pointer`}
          >
            <span className={`${getThemeClasses(currentTheme, 'chatSelectorText')}`}>
              {models.find(m => m.id === selectedModel)?.name || 'Swap'}
            </span>
          </button>

          {/* Network Selector */}
          <button 
            onClick={() => sendMessage('holdings')}
            className={`${getThemeClasses(currentTheme, 'chatSelector')} cursor-pointer`}
          >
            <span className={`${getThemeClasses(currentTheme, 'chatSelectorText')}`}>
              {networks.find(n => n.id === selectedNetwork)?.name || 'Holdings'}
            </span>
          </button>
        </div>

        {/* Input Field */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the hive anything..."
            className={`flex-1 py-3 px-4 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-red-400/50 ${getThemeClasses(currentTheme, 'chatInputField')}`}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`${getThemeClasses(currentTheme, 'chatSendButton')} ${!message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            <Send className={`w-5 h-5 ${getThemeClasses(currentTheme, 'chatSendIcon')}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
