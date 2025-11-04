'use client';

import { ReactNode } from 'react';
import { ProfileProvider } from '@/contexts/ProfileContext';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}
