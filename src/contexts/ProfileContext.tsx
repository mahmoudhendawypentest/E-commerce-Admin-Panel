'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProfileContextType {
  profilePicture: string | null;
  setProfilePicture: (picture: string | null) => void;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Load profile picture from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('adminProfilePicture');
      setProfilePicture(savedProfile);
    } catch (e) {
      console.error('Error loading profile picture:', e);
    }
  }, []);

  const refreshProfile = () => {
    try {
      const savedProfile = localStorage.getItem('adminProfilePicture');
      setProfilePicture(savedProfile);
    } catch (e) {
      console.error('Error refreshing profile picture:', e);
    }
  };

  // Listen for profile updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminProfilePicture') {
        setProfilePicture(e.newValue);
      }
    };

    // Also listen for custom events from same tab
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.imageData !== undefined) {
        setProfilePicture(customEvent.detail.imageData || null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ profilePicture, setProfilePicture, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}