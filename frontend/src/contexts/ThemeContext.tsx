// Theme Context to manage gloabal theme state and toggle between light and dark modes

// imports
import React from "react";
import { useState, useEffect, ReactNode } from "react";

// init interface for ThemeContextType
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// export ThemeContext
export const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined,
);

// init interface for ThemeProviderProps
interface ThemeProviderProps {
  children: ReactNode;
}

// export ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("isDarkMode");
    if (storedTheme) {
      setIsDarkMode(JSON.parse(storedTheme));
    }
  }, []);

  // Toggle theme and save preference to localStorage
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("isDarkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
