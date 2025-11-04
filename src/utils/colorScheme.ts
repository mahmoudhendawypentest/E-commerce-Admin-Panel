// Color scheme utilities for consistent theming across the application

export const colorScheme = {
  // Background colors
  backgrounds: {
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-gray-50 dark:bg-gray-900',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
    active: 'bg-blue-50 dark:bg-blue-900/20',
  },

  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    light: 'text-gray-700 dark:text-gray-200',
  },

  // Border colors
  borders: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    light: 'border-gray-100 dark:border-gray-800',
  },

  // Cards and containers
  card: {
    base: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    hover: 'hover:shadow-lg dark:hover:shadow-gray-950/50',
    transition: 'transition-all duration-300',
  },

  // Input fields
  input: {
    base: 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600',
    focus: 'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400',
    text: 'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
  },

  // Buttons
  buttons: {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white',
  },

  // Status badges
  status: {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  },

  // Modals and overlays
  modal: {
    overlay: 'bg-black/50 dark:bg-black/70',
    content: 'bg-white dark:bg-gray-800',
    border: 'border border-gray-200 dark:border-gray-700',
  },

  // Icons
  icons: {
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
    light: 'text-gray-700 dark:text-gray-300',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm dark:shadow-lg',
    base: 'shadow dark:shadow-xl',
    lg: 'shadow-lg dark:shadow-2xl',
  },
};

// Commonly used combinations
export const combinedClasses = {
  cardBase: `${colorScheme.card.base} rounded-lg ${colorScheme.shadows.sm} ${colorScheme.card.transition}`,
  inputBase: `${colorScheme.input.base} ${colorScheme.input.text} ${colorScheme.input.focus} px-4 py-2 rounded-lg transition-colors duration-200`,
  buttonBase: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105',
};