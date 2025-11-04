'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { StoreSettings } from '@/interfaces';
import { Save, RotateCcw, Bell, Shield, Palette, CheckCircle, AlertCircle, Upload, User as UserIcon, X } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const DEFAULT_SETTINGS: StoreSettings = {
  name: 'My E-commerce Store',
  currency: 'USD',
  language: 'en',
  timezone: 'UTC',
  email: 'admin@example.com',
  phone: '+1-555-0123',
};

export default function Settings() {
  const router = useRouter();
  const { profilePicture, setProfilePicture } = useProfile();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [tempProfilePicture, setTempProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Actions State
  const [showExport, setShowExport] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    productAlerts: true,
    customerEmails: true,
  });
  const [appearance, setAppearance] = useState({
    compactMode: false,
    showAnimations: true,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('storeSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      }
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      const savedAppearance = localStorage.getItem('appearance');
      if (savedAppearance) {
        setAppearance(JSON.parse(savedAppearance));
      }
      // Initialize temp profile picture with current value
      setTempProfilePicture(profilePicture);
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
  }, [profilePicture]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Simple phone validation - allows various formats
    const re = /^[\d\s\-\+\(\)]{7,}$/;
    return re.test(phone);
  };

  const validateSettings = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!settings.name.trim()) {
      errors.name = 'Store name is required';
    }
    if (!validateEmail(settings.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!validatePhone(settings.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      setSaveMessage({ type: 'error', text: '❌ Please fix the validation errors below' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Save to localStorage
      localStorage.setItem('storeSettings', JSON.stringify(settings));
      localStorage.setItem('notifications', JSON.stringify(notifications));
      localStorage.setItem('appearance', JSON.stringify(appearance));

      // Save profile picture if it was updated
      if (tempProfilePicture !== profilePicture) {
        if (tempProfilePicture) {
          localStorage.setItem('adminProfilePicture', tempProfilePicture);
          setProfilePicture(tempProfilePicture);
          // Dispatch custom event to update other components
          window.dispatchEvent(
            new CustomEvent('profileUpdated', {
              detail: { imageData: tempProfilePicture },
            })
          );
        } else {
          localStorage.removeItem('adminProfilePicture');
          setProfilePicture(null);
          window.dispatchEvent(
            new CustomEvent('profileUpdated', {
              detail: { imageData: null },
            })
          );
        }
      }

      setIsSaving(false);
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: '✅ Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setIsSaving(false);
      setSaveMessage({ type: 'error', text: '❌ Failed to save settings. Please try again.' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      setNotifications({ orderNotifications: true, productAlerts: true, customerEmails: true });
      setAppearance({ compactMode: false, showAnimations: true });
      setValidationErrors({});
      setHasChanges(false);
      setTempProfilePicture(profilePicture);
      // Reset temp to current
      setSaveMessage({ type: 'success', text: '✅ Settings reset to defaults' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleInputChange = (field: keyof StoreSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleAppearanceChange = (key: keyof typeof appearance) => {
    setAppearance(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleProfilePictureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setSaveMessage({ type: 'error', text: '❌ Please select an image file' });
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage({ type: 'error', text: '❌ Image size must be less than 5MB' });
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Check if we're on mobile and handle potential issues
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imageData = event.target?.result as string;
          if (imageData && imageData.length > 0) {
            setTempProfilePicture(imageData);
            setHasChanges(true);
            setSaveMessage({ type: 'success', text: '✅ Profile picture selected! Click "Save Changes" to confirm.' });
            setTimeout(() => setSaveMessage(null), 3000);
          } else {
            throw new Error('Empty image data');
          }
        } catch (error) {
          console.error('Error processing image:', error);
          setSaveMessage({ type: 'error', text: '❌ Failed to process the image. Please try again.' });
          setTimeout(() => setSaveMessage(null), 3000);
        }
      };
      reader.onerror = () => {
        console.error('FileReader error');
        setSaveMessage({ type: 'error', text: '❌ Failed to read the image file. Please try again.' });
        setTimeout(() => setSaveMessage(null), 3000);
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error reading file:', error);
        setSaveMessage({ type: 'error', text: '❌ Failed to read the file. Please try a different image.' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    }
  };

  const handleRemoveProfilePicture = () => {
    setTempProfilePicture(null);
    setHasChanges(true);
    setSaveMessage({ type: 'success', text: '✅ Profile picture will be removed! Click "Save Changes" to confirm.' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Quick Actions Handlers
  const handleDeleteStore = () => {
    if (deleteConfirmText === 'DELETE MY STORE') {
      setSaveMessage({ type: 'success', text: '✅ Store deleted successfully! Redirecting...' });
      setTimeout(() => {
        router.push('/');
      }, 2000);
      setShowDeleteConfirm(false);
    } else {
      setSaveMessage({ type: 'error', text: '❌ Confirmation text does not match' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <Layout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">Configure your store and preferences</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <RotateCcw size={20} />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Save size={20} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            saveMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle size={20} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{saveMessage.text}</p>
          </div>
        )}

        {hasChanges && !saveMessage && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg font-medium">
            ⚠️ You have unsaved changes
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield size={20} className="text-blue-500 dark:text-blue-400" />
                Store Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                      validationErrors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.name ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">❌ {validationErrors.name}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will be displayed as your brand name</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                        validationErrors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">❌ {validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                        validationErrors.phone
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">❌ {validationErrors.phone}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>SAR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>UTC</option>
                    <option>GMT+3</option>
                    <option>EST</option>
                    <option>PST</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserIcon size={20} className="text-purple-500 dark:text-purple-400" />
                Admin Profile Picture
              </h3>
              <div className="space-y-4">
                {(tempProfilePicture || profilePicture) && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={tempProfilePicture || profilePicture || ''}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium">Preview</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Upload size={16} />
                    {tempProfilePicture || profilePicture ? 'Change Picture' : 'Upload Picture'}
                  </button>
                  {(tempProfilePicture || profilePicture) && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  capture="environment"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={20} className="text-yellow-500 dark:text-yellow-400" />
                Notifications
              </h3>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationChange(key as keyof typeof notifications)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Palette size={20} className="text-pink-500 dark:text-pink-400" />
                Appearance
              </h3>
              <div className="space-y-3">
                {Object.entries(appearance).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleAppearanceChange(key as keyof typeof appearance)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 p-6">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Store Status</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">Active</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-blue-700 dark:text-blue-300">Uptime</span>
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700 dark:text-blue-300">Last Update</span>
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">Today</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowExport(true)}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  📥 Export Store Data
                </button>
                <button
                  onClick={() => setShowBackup(true)}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  💾 Create Backup
                </button>
                <button
                  onClick={() => setShowActivity(true)}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  📋 View Activity Log
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                >
                  🗑️ Delete Store
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">❓ Need Help?</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                Have questions or need assistance? Our support team is here to help you.
              </p>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                📞 Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Export Store Data Modal */}
        {showExport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">📥 Export Store Data</h3>
                <button
                  onClick={() => setShowExport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Export all your store data in various formats for backup or migration purposes.
                </p>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <span className="text-xl">📊</span>
                    <div>
                      <p className="font-medium text-gray-900">Export as CSV</p>
                      <p className="text-xs text-gray-500">Products, Orders, Customers</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-900">Export as JSON</p>
                      <p className="text-xs text-gray-500">Complete store configuration</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <span className="text-xl">🖼️</span>
                    <div>
                      <p className="font-medium text-gray-900">Export Images & Media</p>
                      <p className="text-xs text-gray-500">All product images and uploads</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowExport(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Backup Modal */}
        {showBackup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">💾 Create Backup</h3>
                <button
                  onClick={() => setShowBackup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Create a complete backup of your store including all data and configurations.
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-gray-900">All Products & Inventory</p>
                        <p className="text-xs text-gray-500">Include all product details and stock levels</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-gray-900">Orders & Transactions</p>
                        <p className="text-xs text-gray-500">Complete order history and payment data</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-gray-900">Customer Data</p>
                        <p className="text-xs text-gray-500">All customer information and profiles</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    📅 Last backup: 2 days ago<br />
                    📦 Size: ~15.4 MB
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowBackup(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Backup Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log Modal */}
        {showActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">📋 Activity Log</h3>
                <button
                  onClick={() => setShowActivity(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { time: '2:45 PM', action: 'Store settings updated', type: 'update' },
                  { time: '2:30 PM', action: 'New order received #1024', type: 'success' },
                  { time: '1:15 PM', action: 'Product inventory adjusted', type: 'update' },
                  { time: '12:00 PM', action: 'Backup created successfully', type: 'success' },
                  { time: '11:30 AM', action: 'Customer added: John Smith', type: 'success' },
                  { time: '10:45 AM', action: 'Settings profile picture updated', type: 'update' },
                ].map((log, idx) => (
                  <div key={idx} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: log.type === 'success' ? '#10b981' : '#3b82f6' }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowActivity(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help & Support Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">📞 Contact Support</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <a
                    href="https://wa.me/966500000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="font-medium text-gray-900">Live Chat (WhatsApp)</p>
                      <p className="text-sm text-gray-600">Chat with our support team (Available 24/7)</p>
                    </div>
                  </a>
                  <a
                    href="mailto:support@ecommerce.com"
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <p className="text-sm text-gray-600">support@ecommerce.com - Response within 24 hours</p>
                    </div>
                  </a>
                  <button className="w-full flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-left">
                    <span className="text-2xl">📚</span>
                    <div>
                      <p className="font-medium text-gray-900">Knowledge Base</p>
                      <p className="text-sm text-gray-600">Browse our comprehensive documentation and FAQs</p>
                    </div>
                  </button>
                  <button className="w-full flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-left">
                    <span className="text-2xl">🎥</span>
                    <div>
                      <p className="font-medium text-gray-900">Video Tutorials</p>
                      <p className="text-sm text-gray-600">Watch step-by-step guides and tutorials</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Store Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-red-600">🗑️ Delete Store</h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    ⚠️ This action cannot be undone. All your store data will be permanently deleted.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Type "DELETE MY STORE" to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStore}
                  disabled={deleteConfirmText !== 'DELETE MY STORE'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Store
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
