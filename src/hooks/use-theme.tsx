import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Vérifier d'abord la classe actuelle sur l'élément HTML (appliquée par le script dans index.html)
    const root = window.document.documentElement;
    const hasDarkClass = root.classList.contains('dark');
    
    if (hasDarkClass) {
      return 'dark';
    }
    
    // Sinon, vérifier localStorage
    const stored = localStorage.getItem('theme') as Theme;
    if (stored === 'dark' || stored === 'light') {
      // Appliquer immédiatement au chargement
      if (stored === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      return stored;
    }
    
    // Sinon, utiliser la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    
    // Appliquer immédiatement au chargement
    if (initialTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    
    return initialTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Appliquer le thème à chaque changement
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  return { theme, toggleTheme };
};
