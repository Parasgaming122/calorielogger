
import React from 'react';
import { type Page } from '../types';
import { Paper, BottomNavigation, BottomNavigationAction, Fab, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface BottomNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigate }) => {
  const handleChange = (event: React.SyntheticEvent, newValue: Page) => {
    onNavigate(newValue);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 'sm', margin: 'auto' }} elevation={3}>
      <BottomNavigation
        showLabels
        value={activePage}
        onChange={handleChange}
      >
        <BottomNavigationAction label="Home" value="dashboard" icon={<HomeIcon />} />
        <BottomNavigationAction label="Calendar" value="calendar" icon={<CalendarMonthIcon />} />
        <Box sx={{ flexGrow: 1 }} /> 
        <BottomNavigationAction label="Progress" value="progress" icon={<TrendingUpIcon />} />
        <BottomNavigationAction label="Log" value="sheet" icon={<ArticleIcon />} />
      </BottomNavigation>
      <Fab 
        color="primary" 
        aria-label="add" 
        onClick={() => onNavigate('add')}
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <AddIcon />
      </Fab>
    </Paper>
  );
};

export default BottomNav;