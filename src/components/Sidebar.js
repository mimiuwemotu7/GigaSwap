import React, { useState } from 'react';
import { MessageCircle, Coins, ChevronDown, Plus, Twitter, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';

const Sidebar = () => {
  const { currentTheme } = useTheme();
  const [activeItem, setActiveItem] = useState('chats');

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
                    <Plus className={`w-4 h-4 ${getThemeClasses(currentTheme, 'sidebarIconActive')}`} />
                  )}
                  {item.hasDropdown && (
                    <ChevronDown className={`w-4 h-4 ${getThemeClasses(currentTheme, 'sidebarIcon')}`} />
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - Social Links */}
      <div className={`p-3 border-t ${currentTheme === 'dark' ? 'border-gray-400' : 'border-gray-300'}`}>
        <div className="space-y-1">
          <a href="#" className={`flex items-center space-x-2 px-2 py-1 ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors duration-200`}>
            <Twitter className={`w-3 h-3 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
            <span className="text-xs">Follow Twitter</span>
          </a>
          <a href="#" className={`flex items-center space-x-2 px-2 py-1 ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors duration-200`}>
            <MessageSquare className={`w-3 h-3 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
            <span className="text-xs">Join Discord</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
