import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [selectedNetwork, setSelectedNetwork] = useState('solana');

  const createNewChat = useCallback(() => {
    const newChat = {
      id: Date.now(),
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat;
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('gigaswap-chat-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
        if (parsed.length > 0 && !currentChatId) {
          setCurrentChatId(parsed[0].id);
        }
      } else {
        // Create initial chat
        const newChat = {
          id: Date.now(),
          messages: [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        setChatHistory([newChat]);
        setCurrentChatId(newChat.id);
      }
    } catch (error) {
      console.warn('Failed to load chat history from localStorage:', error);
      // Create initial chat as fallback
      const newChat = {
        id: Date.now(),
        messages: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      setChatHistory([newChat]);
      setCurrentChatId(newChat.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to prevent circular dependency

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    try {
      if (chatHistory.length > 0) {
        localStorage.setItem('gigaswap-chat-history', JSON.stringify(chatHistory));
      }
    } catch (error) {
      console.warn('Failed to save chat history to localStorage:', error);
    }
  }, [chatHistory]);

  const deleteChat = useCallback((chatId) => {
    setChatHistory(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      if (currentChatId === chatId && filtered.length > 0) {
        setCurrentChatId(filtered[0].id);
      } else if (filtered.length === 0) {
        // Create a new chat directly instead of calling createNewChat
        const newChat = {
          id: Date.now(),
          messages: [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        setCurrentChatId(newChat.id);
        return [newChat];
      }
      return filtered;
    });
  }, [currentChatId]);

  const getCurrentMessages = useCallback(() => {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    return currentChat ? currentChat.messages : [];
  }, [chatHistory, currentChatId]);

  const addMessage = useCallback((text, type = 'user', component = null) => {
    if (!currentChatId) return;
    
    const newMessage = {
      id: Date.now(),
      text,
      type,
      component,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, newMessage],
            lastUpdated: new Date().toISOString()
          }
        : chat
    ));
    
    return newMessage;
  }, [currentChatId]);

  const simulateBotResponse = useCallback(async (userMessage) => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate a simple response based on the message
    let botResponse = '';
    
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      botResponse = `Hey chad, what're we doing today?`;
    } else if (userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
      botResponse = `I can help you check current crypto prices and market data. For real-time prices, I'd recommend checking our price feeds or connecting to a price API. What specific token are you interested in?`;
    } else if (userMessage.toLowerCase().includes('swap') || userMessage.toLowerCase().includes('trade')) {
      botResponse = `Here you go chad`;
      addMessage(botResponse, 'bot', 'SwapComponent');
      setIsTyping(false);
      return;
    } else if (userMessage.toLowerCase().includes('holdings') || userMessage.toLowerCase().includes('portfolio')) {
      botResponse = `Here's your portfolio overview`;
      addMessage(botResponse, 'bot', 'HoldingsViewer');
      setIsTyping(false);
      return;
    } else if (userMessage.toLowerCase().includes('defi') || userMessage.toLowerCase().includes('yield')) {
      botResponse = `DeFi is exciting! I can help you understand yield farming, liquidity pools, and various DeFi protocols. What specific DeFi strategy are you interested in?`;
    } else if (userMessage.toLowerCase().includes('solana') || userMessage.toLowerCase().includes('ethereum')) {
      botResponse = `I can help you with ${userMessage.toLowerCase().includes('solana') ? 'Solana' : 'Ethereum'} blockchain questions. Both networks have their strengths - Solana for speed and low fees, Ethereum for security and ecosystem. What would you like to know?`;
    } else {
      const responses = [
        `That's an interesting question! I'm here to help with crypto and blockchain topics. Could you provide more details?`,
        `I understand you're asking about "${userMessage}". Let me help you with that. What specific aspect would you like to explore?`,
        `Great question! As your AI assistant, I can help you navigate the crypto space. What would you like to dive deeper into?`,
        `I'm here to assist with all things crypto and DeFi. Could you rephrase your question or provide more context?`
      ];
      botResponse = responses[Math.floor(Math.random() * responses.length)];
    }
    
    addMessage(botResponse, 'bot');
    setIsTyping(false);
  }, [addMessage]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    addMessage(text, 'user');
    
    // Simulate bot response
    await simulateBotResponse(text);
  }, [addMessage, simulateBotResponse]);

  const value = {
    currentChatId,
    setCurrentChatId,
    chatHistory,
    messages: getCurrentMessages(),
    isTyping,
    selectedModel,
    selectedNetwork,
    setSelectedModel,
    setSelectedNetwork,
    sendMessage,
    clearChat: () => {
      if (currentChatId) {
        setChatHistory(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [], lastUpdated: new Date().toISOString() }
            : chat
        ));
      }
    },
    addMessage,
    createNewChat,
    deleteChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
