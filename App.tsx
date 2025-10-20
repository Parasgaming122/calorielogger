
import React, { useState, useCallback, createContext, useContext } from 'react';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import LogSheet from './components/LogSheet';
import AILogger from './components/AILogger';
import BottomNav from './components/BottomNav';
import SettingsModal from './components/SettingsModal';
import ProgressTracker from './components/ProgressTracker';
import { type FoodLog, type FoodEntry, type Page, type UserGoals, type WeightLog } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { format } from 'date-fns';

import { CssBaseline, Container, Box, AppBar, Toolbar, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

interface AppContextType {
  foodLogs: FoodLog;
  apiKey: string | null;
  goals: UserGoals;
  weightLogs: WeightLog;
  addFoodEntry: (entry: FoodEntry, date?: Date) => void;
  updateFoodEntry: (date: string, entryIndex: number, updatedEntry: FoodEntry) => void;
  removeFoodEntry: (date: string, entryIndex: number) => void;
  getLogsForDate: (date: Date) => FoodEntry[];
  setApiKey: (key: string | null) => void;
  setGoals: (goals: UserGoals) => void;
  addWeightEntry: (weight: number, date?: Date) => void;
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

const DEFAULT_GOALS: UserGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fats: 65,
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [foodLogs, setFoodLogs] = useLocalStorage<FoodLog>('foodLogs', {});
  const [apiKey, setApiKey] = useLocalStorage<string | null>('gemini-api-key', null);
  const [goals, setGoals] = useLocalStorage<UserGoals>('userGoals', DEFAULT_GOALS);
  const [weightLogs, setWeightLogs] = useLocalStorage<WeightLog>('weightLogs', {});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const addFoodEntry = useCallback((entry: FoodEntry, date: Date = new Date()) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setFoodLogs(prevLogs => {
      const newLogs = { ...prevLogs };
      const dayLog = newLogs[dateKey] || [];
      newLogs[dateKey] = [...dayLog, entry];
      return newLogs;
    });
  }, [setFoodLogs]);

  const updateFoodEntry = useCallback((dateKey: string, entryIndex: number, updatedEntry: FoodEntry) => {
      setFoodLogs(prevLogs => {
          const newLogs = { ...prevLogs };
          const dayLog = newLogs[dateKey];
          if (dayLog && dayLog[entryIndex]) {
              const newDayLog = [...dayLog];
              newDayLog[entryIndex] = updatedEntry;
              newLogs[dateKey] = newDayLog;
          }
          return newLogs;
      });
  }, [setFoodLogs]);

  const removeFoodEntry = useCallback((dateKey: string, entryIndex: number) => {
      setFoodLogs(prevLogs => {
          const newLogs = { ...prevLogs };
          const dayLog = newLogs[dateKey];
          if (dayLog) {
              const newDayLog = dayLog.filter((_, index) => index !== entryIndex);
              if (newDayLog.length > 0) {
                  newLogs[dateKey] = newDayLog;
              } else {
                  delete newLogs[dateKey];
              }
          }
          return newLogs;
      });
  }, [setFoodLogs]);

  const getLogsForDate = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return foodLogs[dateKey] || [];
  }, [foodLogs]);
  
  const addWeightEntry = useCallback((weight: number, date: Date = new Date()) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      setWeightLogs(prev => ({...prev, [dateKey]: { weight }}));
  }, [setWeightLogs]);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      setSnackbar({ message, severity });
  }, []);

  const handleLogSuccess = () => {
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <CalendarView />;
      case 'sheet': return <LogSheet />;
      case 'add': return <AILogger onLogSuccess={handleLogSuccess} />;
      case 'progress': return <ProgressTracker />;
      default: return <Dashboard />;
    }
  };
  
  const contextValue = {
      foodLogs,
      apiKey,
      goals,
      weightLogs,
      addFoodEntry,
      updateFoodEntry,
      removeFoodEntry,
      getLogsForDate,
      setApiKey,
      setGoals,
      addWeightEntry,
      showSnackbar,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <CssBaseline />
      <Container maxWidth="sm" disableGutters sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Gemini Calorie Logger
            </Typography>
            <IconButton color="inherit" onClick={() => setIsSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, pb: '70px' }}>
          { apiKey ? (
            renderPage()
          ) : (
             <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>Welcome!</Typography>
                <Typography>Please add your Gemini API key in the settings to start logging your meals.</Typography>
             </Box>
          )}
        </Box>
          
        <BottomNav activePage={activePage} onNavigate={setActivePage} />
          
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        <Snackbar 
          open={!!snackbar} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {snackbar && <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>}
        </Snackbar>
      </Container>
    </AppContext.Provider>
  );
};

export default App;