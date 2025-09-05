import React from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider, useChat } from './contexts/ChatContext';

const AppContent = () => {
  const { messages, isTyping } = useChat();

  return (
    <div className="App h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        {/* Sidebar - Hidden on mobile, visible on md and up */}
        <div className="hidden md:block fixed left-0 top-16 bottom-0 z-40">
          <Sidebar />
        </div>
        {/* Main content area - Full width on mobile, with margin on desktop */}
        <main className="flex-1 md:ml-64 relative h-[calc(100vh-4rem)] w-full">
          <ChatArea messages={messages} isTyping={isTyping} />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
