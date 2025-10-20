import React, { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useLocalStorage } from './hooks/useLocalStorage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useLocalStorage<ThemeMode>('themeMode', 'light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#1d4ed8' : '#60a5fa',
          },
          secondary: {
            main: mode === 'light' ? '#047857' : '#34d399',
          },
          background: {
            default: mode === 'light' ? '#f3f4f6' : '#111827',
            paper: mode === 'light' ? '#ffffff' : '#1f2937',
          },
          error: {
            main: mode === 'light' ? '#d32f2f' : '#f44336',
          },
          warning: {
            main: mode === 'light' ? '#ed6c02' : '#ffa726',
          },
          info: {
            main: mode === 'light' ? '#0288d1' : '#29b6f6',
          },
          success: {
            main: mode === 'light' ? '#2e7d32' : '#66bb6a',
          },
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};