import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';

const NotificationCard = ({ 
  showNotifications, 
  setShowNotifications, 
  selectedNotification, 
  setSelectedNotification 
}) => {
  const { currentTheme } = useTheme();
  const notificationRef = useRef(null);

  // Handle click outside to close notification card
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside notification card AND not on the bell button
      if (notificationRef.current && 
          !notificationRef.current.contains(event.target) &&
          !event.target.closest('button[data-notification-bell]')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showNotifications, setShowNotifications]);

  // Mock notification data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: '35.99 Solana USDC Received!',
      message: 'You now have 35.99 USDC on Solana.',
      time: '6d ago',
      icon: CheckCircle,
      action: 'Convert'
    },
    {
      id: 2,
      type: 'info',
      title: 'New Token Available',
      message: 'BTC is now available for trading on GigaSwap.',
      time: '1w ago',
      icon: TrendingUp,
      action: 'Trade'
    },
    {
      id: 3,
      type: 'success',
      title: 'Swap Completed',
      message: 'Successfully swapped 0.5 ETH for 1,234.56 USDC.',
      time: '2w ago',
      icon: CheckCircle,
      action: 'View'
    },
    {
      id: 4,
      type: 'info',
      title: 'Price Alert',
      message: 'ETH has reached your target price of $2,000.',
      time: '3w ago',
      icon: TrendingUp,
      action: 'Claim'
    }
  ];

  if (!showNotifications) return null;

  return (
    <div className="absolute top-full right-8 mt-2 w-80 max-w-[90vw] z-50" ref={notificationRef}>
      <div className={`${getThemeClasses(currentTheme, 'notificationCard')} rounded-lg`}>
        {/* Notification Header */}
        <div className={`flex items-center justify-between p-3 border-b ${getThemeClasses(currentTheme, 'notificationHeaderBorder')}`}>
          <h3 className={`text-sm font-semibold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
            Notifications
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowNotifications(false)}
              className={`p-1 rounded transition-colors duration-200`}
            >
              <X className={`w-3 h-3 ${getThemeClasses(currentTheme, 'textPrimary')}`} />
            </button>
          </div>
        </div>
        
        {/* Notification List */}
        <div className="max-h-64 overflow-y-auto hide-scrollbar">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-3 border-b ${getThemeClasses(currentTheme, 'notificationHeaderBorder')} last:border-b-0 cursor-pointer transition-colors duration-200`}
                onClick={() => setSelectedNotification(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`w-4 h-4 mt-0.5 ${notification.type === 'success' ? 'text-green-400' : 'text-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                      {notification.title}
                    </div>
                    <div className={`text-[10px] mt-1 ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                      {notification.message}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                        {notification.time}
                      </span>
                      <button className={`text-[10px] px-2 py-1 rounded transition-colors duration-200 ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                        {notification.action}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Notification Footer */}
        <div className={`p-3 border-t ${getThemeClasses(currentTheme, 'notificationHeaderBorder')}`}>
          <button className={`w-full text-xs transition-colors duration-200 px-2 py-1 rounded ${getThemeClasses(currentTheme, 'textPrimary')}`}>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
