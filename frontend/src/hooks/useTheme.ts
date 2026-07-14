import { useEffect, useState } from 'react';

const STORAGE_KEY = 'brightcone-theme';

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored === 'dark';
    }

    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  return {
    isDark,
    toggleTheme: () => setIsDark((current) => !current),
  };
}
