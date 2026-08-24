"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'corporate';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Valeur initiale identique cote serveur et client ('light') pour eviter un
    // mismatch d'hydratation React (erreur #418) : lire localStorage directement
    // dans le useState initializer produisait un rendu client different du HTML
    // genere par le serveur des qu'un theme non-'light' etait sauvegarde, ce qui
    // cassait l'hydratation — et donc tous les clics/saisies clavier — sur
    // l'ensemble de l'application (Sidebar est monte sur toutes les pages).
    const [theme, setThemeState] = useState<Theme>('light');

    useEffect(() => {
        const stored = localStorage.getItem('app-theme') as Theme | null;
        if (stored) setThemeState(stored);
    }, []);

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('app-theme', newTheme);
        document.documentElement.className = newTheme;
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
