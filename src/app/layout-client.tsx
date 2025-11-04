'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { isSessionValid } from '@/services/authService';

const publicRoutes = ['/login', '/register'];

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = publicRoutes.includes(pathname);
      const isAuthenticated = isSessionValid();

      if (!isPublicRoute && !isAuthenticated) {
        // User is not authenticated and trying to access protected route
        router.push('/login');
      } else if (isPublicRoute && isAuthenticated) {
        // User is authenticated and trying to access login/register, redirect to dashboard
        router.push('/dashboard');
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading while checking authentication
  if (isCheckingAuth && !publicRoutes.includes(pathname)) {
    return (
      <ProfileProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
          </div>
        </div>
      </ProfileProvider>
    );
  }

  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}
