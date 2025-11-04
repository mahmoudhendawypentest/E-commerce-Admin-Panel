'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (newTheme: Theme) => {
  try {
    const htmlElement = document.documentElement;
    // حذف جميع classes الـ theme القديمة
    htmlElement.classList.remove('dark');
    // إضافة الـ theme الجديد فقط في حالة dark
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
    }
    // تحديث colorScheme
    htmlElement.style.colorScheme = newTheme;
    // حفظ في localStorage
    localStorage.setItem('theme', newTheme);
    console.log('✅ Theme applied:', newTheme, 'Dark class present:', htmlElement.classList.contains('dark'));
  } catch (e) {
    console.error('❌ Error applying theme:', e);
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // تهيئة الـ theme عند تحميل الصفحة
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
      applyTheme(initialTheme);
    } catch (e) {
      console.error('Error initializing theme:', e);
    } finally {
      setMounted(true);
    }
  }, []);

  // تطبيق الـ theme عند التغيير
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}