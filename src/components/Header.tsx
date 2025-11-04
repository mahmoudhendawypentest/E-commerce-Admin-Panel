'use client';

import { Bell, Search, User, X, Sun, Moon, CheckCircle, AlertTriangle, Info, AlertCircle, Settings, LogOut, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { getNotifications, getUnreadCount, markAsRead, subscribeToNotifications, Notification } from '@/services/notificationService';
import { mockProducts } from '@/services/mockData';
import { Product } from '@/interfaces';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userEmail, setUserEmail] = useState('admin@example.com');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { profilePicture, setProfilePicture } = useProfile();
    const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Load notifications and user data
  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'admin@example.com';
    setUserEmail(email);

    // Load initial notifications
    setNotifications(getNotifications());

    // Subscribe to notification updates
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  // Generate intelligent search suggestions
  const generateSuggestions = (query: string): Product[] => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const results: { product: Product; score: number }[] = [];

    mockProducts.forEach(product => {
      let score = 0;
      const name = product.name.toLowerCase();
      const description = product.description.toLowerCase();
      const category = product.category.toLowerCase();

      // Exact match gets highest score
      if (name === searchTerm) score += 100;
      if (category === searchTerm) score += 90;

      // Starts with search term
      if (name.startsWith(searchTerm)) score += 80;
      if (category.startsWith(searchTerm)) score += 70;

      // Contains search term
      if (name.includes(searchTerm)) score += 50;
      if (description.includes(searchTerm)) score += 30;
      if (category.includes(searchTerm)) score += 40;

      // Word boundary matches (more realistic)
      const words = searchTerm.split(' ');
      words.forEach(word => {
        if (name.includes(word)) score += 20;
        if (description.includes(word)) score += 10;
        if (category.includes(word)) score += 15;
      });

      // Boost active products
      if (product.status === 'active') score += 5;

      // Boost products with higher stock (more available)
      if (product.stock > 10) score += 3;

      if (score > 0) {
        results.push({ product, score });
      }
    });

    // Sort by score (highest first) and return top 5
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(result => result.product);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    // Navigate to products page with the selected product highlighted
    router.push(`/products?search=${encodeURIComponent(product.name)}&highlight=${product.id}`);
  };

  // Handle global search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to products page with search query if not already there
    if (pathname !== '/products' && query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
     setSearchQuery('');
     setShowSuggestions(false);
   };

  // Notification helpers
  const unreadCount = getUnreadCount();
  const recentNotifications = notifications.slice(0, 5); // Show only 5 most recent

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'order': return <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🛒</div>;
      case 'payment': return <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">💳</div>;
      case 'security': return <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🔐</div>;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setShowNotifications(false);
    }
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
    });
  };

  // Profile picture upload handler
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        localStorage.setItem('adminProfilePicture', imageData);
        setProfilePicture(imageData);

        // Dispatch custom event to update other components
        window.dispatchEvent(
          new CustomEvent('profileUpdated', {
            detail: { imageData },
          })
        );

        setShowProfileMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    localStorage.removeItem('adminProfilePicture');
    setProfilePicture(null);

    // Dispatch custom event to update other components
    window.dispatchEvent(
      new CustomEvent('profileUpdated', {
        detail: { imageData: null },
      })
    );

    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('currentSession');
      router.push('/login');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (showProfileMenu && !target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile: Only Hamburger Icon and Profile */}
          <div className="sm:hidden">
            {/* Hamburger Icon is in Sidebar component */}
          </div>

          {/* Desktop: Back button and title */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              title="Go back"
            >
              ←
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
           {/* Enhanced Search Bar - Only visible on larger screens */}
           <div className="hidden sm:block relative flex-1 max-w-xs sm:max-w-sm md:max-w-md">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className={`h-5 w-5 ${isSearchFocused ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
             </div>
             <input
                type="text"
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchQuery.trim() && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow click on them
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                className={`pl-10 pr-10 py-2.5 border rounded-lg bg-gray-50 focus:bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all duration-200 w-full ${
                  isSearchFocused
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400'
                }`}
              />
             {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/32x32?text=No+Image';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          {/* Theme Toggle Button - Hidden on mobile */}
          <button
            onClick={toggleTheme}
            className="hidden sm:block relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <div className="relative w-5 h-5">
              <Sun className={`absolute inset-0 h-5 w-5 text-yellow-500 transition-all duration-300 ${
                theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'
              }`} />
              <Moon className={`absolute inset-0 h-5 w-5 text-blue-400 transition-all duration-300 ${
                theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
              }`} />
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>

          {/* Notifications Dropdown - Hidden on mobile */}
          <div className="hidden sm:block relative notification-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} group-hover:text-gray-800 dark:group-hover:text-white`} />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'}
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${getPriorityColor(notification.priority)} border-l-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${notification.read ? 'text-gray-900 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.message}
                            </p>
                            {notification.priority === 'urgent' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 mt-2">
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">We'll notify you when something important happens</p>
                    </div>
                  )}
                </div>

                {notifications.length > 5 && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button
                      onClick={() => {
                        router.push('/notifications');
                        setShowNotifications(false);
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      View all notifications ({notifications.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-24">{userEmail}</p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => profileFileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Change Profile Picture
                  </button>

                  {profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Remove Profile Picture
                    </button>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>

                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}