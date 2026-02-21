import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggle: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('mrs-deore-theme') as Theme) || 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('mrs-deore-theme', theme);
    }, [theme]);

    const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
};
