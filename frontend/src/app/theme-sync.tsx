'use client';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleCookieTheme = () => {
      const match = document.cookie.match(/(^|;\s*)theme-sync=([^;]+)/);
      if (match) {
        const cookieTheme = match[2];
        const currentLocal = localStorage.getItem('theme') || 'system';
        if (cookieTheme !== currentLocal) {
          setTheme(cookieTheme);
        }
      }
    };
    
    handleCookieTheme();
    
    // Optional: listen to focus/visibility changes to sync if changed in another tab
    window.addEventListener('focus', handleCookieTheme);
    return () => window.removeEventListener('focus', handleCookieTheme);
  }, [setTheme]);

  return null;
}
