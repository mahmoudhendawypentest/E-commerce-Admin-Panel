'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession, isSessionValid, clearSession, getSessionEmail } from '@/services/authService';

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isSessionValid();
      setIsAuthenticated(auth);
      setIsLoading(false);

      if (!auth) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email && password) {
        createSession(email);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    clearSession();
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('userLoggedOut'));
    router.push('/login');
  };

  const getUserEmail = (): string => {
    return getSessionEmail() || 'admin@example.com';
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserEmail,
  };
};