'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header يبدأ من أول الصفحة - ممتد على كل العرض */}
      <Header title={title} />
      {/* الـ Sidebar و Main Content متجاورين */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed على الجانب الأيسر */}
        <div className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <Sidebar />
        </div>
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar />
        </div>
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
