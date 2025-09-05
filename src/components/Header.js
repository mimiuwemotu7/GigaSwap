import React, { useState } from 'react';
import { ArrowRight, User, Bell, X, TrendingUp, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';
import ThemeSelector from './ThemeSelector';

const Header = () => {
  const { currentTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Mock notification data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: '35.99 Solana USDC Received!',
      message: 'You now have 35.99 USDC on Solana.',
      time: '6d ago',
      icon: CheckCircle,
      color: 'text-blue-400',
      action: 'Convert',
      actionColor: 'text-blue-400'
    },
    {
      id: 2,
      type: 'success',
      title: '68.65 Solana USDC Received!',
      message: 'You now have 68.65 USDC on Solana.',
      time: '6d ago',
      icon: CheckCircle,
      color: 'text-blue-400',
      action: 'Convert',
      actionColor: 'text-blue-400'
    },
    {
      id: 3,
      type: 'referral',
      title: '1x Referral Used!',
      message: 'j******* used your referral code',
      time: '1mo ago',
      icon: User,
      color: 'text-white',
      action: 'View',
      actionColor: 'text-blue-400'
    },
    {
      id: 4,
      type: 'points',
      title: '2000 Axiom Points Earned!',
      message: 'Keep trading to earn more!',
      time: '1mo ago',
      icon: TrendingUp,
      color: 'text-white',
      action: 'Claim',
      actionColor: 'text-blue-400'
    },
    {
      id: 5,
      type: 'points',
      title: '20000 Axiom Points Earned!',
      message: 'Keep trading to earn more!',
      time: '2mo ago',
      icon: TrendingUp,
      color: 'text-white',
      action: 'Claim',
      actionColor: 'text-blue-400'
    }
  ];

  return (
    <header className={`w-full py-4 px-6 ${getThemeClasses(currentTheme, 'headerContainer')}`}>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/icon2.png" alt="GigaSwap" className="w-8 h-8" />
          <h1 className={`text-2xl font-bold ${getThemeClasses(currentTheme, 'headerTitle')}`}>
            GigaSwap
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-200 text-sm font-medium">
            <ArrowRight className="w-3 h-3" />
            <span>Connect Wallet</span>
          </button>
          <div 
            className="relative"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
          >
            <button className={`p-2 rounded-full border ${getThemeClasses(currentTheme, 'border')} hover:${getThemeClasses(currentTheme, 'hover')} transition-all duration-200 relative`}>
              <Bell className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></div>
            </button>
            
            {/* Notification Card */}
            {showNotifications && (
              <div className={`absolute right-0 top-full mt-2 w-80 p-4 ${getThemeClasses(currentTheme, 'card')} rounded-lg ${getThemeClasses(currentTheme, 'border')} border shadow-lg z-50`}>
                {/* Header */}
                <div className={`pb-4 border-b ${getThemeClasses(currentTheme, 'border')}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-semibold ${getThemeClasses(currentTheme, 'textPrimary')}`} style={{ fontSize: '10px' }}>
                      Notifications
                    </h3>
                    <div className="flex items-center space-x-4">
                      <button className={`text-xs ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors duration-200`} style={{ fontSize: '8px' }}>
                        Clear All
                      </button>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className={`p-1 rounded hover:${getThemeClasses(currentTheme, 'hover')} transition-colors duration-200`}
                      >
                        <X className={`w-4 h-4 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        onClick={() => setSelectedNotification(selectedNotification === notification.id ? null : notification.id)}
                        className={`py-4 border-b ${getThemeClasses(currentTheme, 'border')} hover:${getThemeClasses(currentTheme, 'hover')} transition-colors duration-200 cursor-pointer ${selectedNotification === notification.id ? 'border-l-4 border-l-gray-800' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-blue-500' : 'bg-gray-600'}`}>
                            <IconComponent className={`w-3 h-3 ${notification.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-semibold ${getThemeClasses(currentTheme, 'textPrimary')}`} style={{ fontSize: '10px' }}>
                                  {notification.title}
                                </div>
                                <div className={`text-xs mt-1 ${getThemeClasses(currentTheme, 'textSecondary')}`} style={{ fontSize: '8px' }}>
                                  {notification.message}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1 ml-2">
                                <div className={`text-xs ${currentTheme === 'dark' ? 'text-[#a3a3a3]' : getThemeClasses(currentTheme, 'textTertiary')}`} style={{ fontSize: '7px' }}>
                                  {notification.time}
                                </div>
                                {notification.action && (
                                  <button className={`text-xs font-medium ${notification.actionColor} hover:underline transition-colors duration-200`} style={{ fontSize: '7px' }}>
                                    {notification.action}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button className="p-2 rounded-full border border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
