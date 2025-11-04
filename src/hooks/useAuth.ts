'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
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
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
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
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const getUserEmail = (): string => {
    return localStorage.getItem('userEmail') || 'admin@example.com';
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserEmail,
  };
};