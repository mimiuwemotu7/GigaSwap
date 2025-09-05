export const themes = {
  dark: {
    name: 'Dark',
    colors: {
      // Background colors
      primary: 'bg-[#171717]',
      secondary: 'bg-[#1f1f1f]',
      tertiary: 'bg-[#262626]',
      card: 'bg-[#1f1f1f]',
      
      // Text colors
      textPrimary: 'text-white',
      textSecondary: 'text-[#a3a3a3]',
      textTertiary: 'text-[#737373]',
      textAccent: 'text-red-400',
      
      // Border colors
      border: 'border-gray-800',
      borderSecondary: 'border-gray-800',
      borderTertiary: 'border-gray-800',
      
      // Interactive colors
      hover: 'hover:bg-[#262626]',
      buttonPrimary: 'bg-gradient-to-r from-red-500 to-red-600',
      buttonPrimaryHover: 'hover:from-red-400 hover:to-red-500',
      buttonSecondary: 'bg-gradient-to-br from-[#262626] to-[#1f1f1f]',
      buttonSecondaryHover: 'hover:from-[#404040] hover:to-[#262626]',
      buttonDisabled: 'bg-[#1f1f1f]',
      
      // Token selector colors
      tokenIcon: 'bg-gradient-to-br from-[#404040] to-[#262626]',
      
      // Input colors
      inputBg: 'bg-[#1f1f1f]',
      inputPlaceholder: 'placeholder-[#737373]',
    }
  },
  
  light: {
    name: 'Light',
    colors: {
      // Background colors
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      tertiary: 'bg-gray-100',
      card: 'bg-gray-200',
      
      // Text colors
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textTertiary: 'text-gray-500',
      textAccent: 'text-red-500',
      
      // Border colors
      border: 'border-gray-800',
      borderSecondary: 'border-gray-800',
      borderTertiary: 'border-gray-800',
      
      // Interactive colors
      hover: 'hover:bg-gray-100',
      buttonPrimary: 'bg-gradient-to-r from-red-500 to-red-600',
      buttonPrimaryHover: 'hover:from-red-400 hover:to-red-500',
      buttonSecondary: 'bg-gradient-to-br from-gray-200 to-gray-300',
      buttonSecondaryHover: 'hover:from-gray-100 hover:to-gray-200',
      buttonDisabled: 'bg-gray-200',
      
      // Token selector colors
      tokenIcon: 'bg-gradient-to-br from-red-100 to-red-200',
      
      // Input colors
      inputBg: 'bg-transparent',
      inputPlaceholder: 'placeholder-gray-400',
    }
  }
};

export const getThemeClasses = (theme, component, variant = 'default') => {
  const themeColors = themes[theme].colors;
  
  const componentStyles = {
    container: `${themeColors.primary} rounded-2xl shadow-2xl ${themeColors.border}`,
    header: `${themeColors.textPrimary} font-bold`,
    headerContainer: `${themeColors.primary} ${themeColors.border} border-b`,
    headerTitle: `${themeColors.textPrimary} font-bold`,
    textPrimary: `${themeColors.textPrimary}`,
    textSecondary: `${themeColors.textSecondary}`,
    sidebar: `${themeColors.secondary} ${themeColors.border} border-r shadow-lg`,
    sidebarItem: `flex items-center space-x-3 px-4 py-3 cursor-pointer ${themeColors.hover} transition-all duration-200 rounded-lg mx-2 my-1`,
    sidebarItemActive: `flex items-center space-x-3 px-4 py-3 cursor-pointer ${themeColors.tertiary} ${themeColors.borderSecondary} border-r-4 border-gray-800 rounded-lg mx-2 my-1 shadow-md`,
    sidebarItemText: `${themeColors.textPrimary} font-medium`,
    sidebarItemTextActive: `${themeColors.textAccent} font-semibold`,
    sidebarIcon: `${themeColors.textSecondary}`,
    sidebarIconActive: `${themeColors.textAccent}`,
    section: `${themeColors.secondary} rounded-xl ${themeColors.borderSecondary}`,
    label: `${themeColors.textSecondary} font-medium`,
    balance: `${themeColors.textSecondary}`,
    input: `${themeColors.inputBg} ${themeColors.textPrimary} font-bold ${themeColors.inputPlaceholder}`,
    inputValue: `${themeColors.textSecondary}`,
    tokenSelector: `flex items-center space-x-2 ${themeColors.card} rounded-lg cursor-pointer ${themeColors.hover} transition-all duration-200`,
    tokenIcon: `w-6 h-6 rounded-full ${themeColors.tokenIcon} flex items-center justify-center text-sm font-bold ${themeColors.textPrimary}`,
    tokenSymbol: `${themeColors.textPrimary} font-semibold text-sm`,
    chevron: `${themeColors.textSecondary}`,
    swapButton: `w-12 h-12 ${themeColors.buttonSecondary} ${themeColors.buttonSecondaryHover} rounded-xl flex items-center justify-center transition-all duration-200 ${themeColors.border} shadow-lg hover:shadow-xl transform hover:scale-105`,
    swapIcon: `${themeColors.textPrimary}`,
    infoSection: `${themeColors.tertiary} rounded-lg ${themeColors.borderTertiary}`,
    infoText: `${themeColors.textSecondary}`,
    infoValue: `${themeColors.textPrimary}`,
    infoAccent: `${themeColors.textAccent}`,
    actionButton: `w-full py-3 rounded-lg font-bold text-base transition-all duration-200`,
    actionButtonEnabled: `${themeColors.buttonPrimary} ${themeColors.buttonPrimaryHover} ${themeColors.textPrimary} shadow-lg hover:shadow-xl transform hover:scale-[1.02]`,
    actionButtonDisabled: `${themeColors.buttonDisabled} ${themeColors.textSecondary} cursor-not-allowed`,
    footer: `${themeColors.textTertiary}`,
    chatInput: `${themeColors.secondary} rounded-lg ${themeColors.borderSecondary} border shadow-lg`,
    chatInputField: `${themeColors.inputBg} ${themeColors.textPrimary} ${themeColors.inputPlaceholder} border ${themeColors.borderSecondary} rounded-lg`,
    chatSelector: `flex items-center justify-center px-3 py-2 rounded-md cursor-pointer ${themeColors.hover} transition-all duration-200 border ${themeColors.borderTertiary}`,
    chatSelectorText: `${themeColors.textPrimary} font-medium text-sm`,
    chatSelectorIcon: `${themeColors.textSecondary}`,
    chatSendButton: `p-2 rounded-md ${themeColors.hover} transition-all duration-200 ${themeColors.borderSecondary} border`,
    chatSendIcon: `${themeColors.textSecondary}`,
    chatArea: `${themeColors.primary} h-full overflow-y-auto`,
    chatMessage: `mb-8`,
    chatMessageUser: `flex flex-col items-end`,
    chatMessageBot: `flex flex-col items-start`,
    chatMessageText: `${themeColors.textPrimary} leading-relaxed text-sm`,
    chatMessageTime: `${themeColors.textTertiary} text-xs mt-1 opacity-60`,
    chatTyping: `${themeColors.textSecondary} italic`,
  };
  
  return componentStyles[component] || '';
};
