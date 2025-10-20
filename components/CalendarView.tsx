
import React, { useState } from 'react';
import { useApp } from '../App';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import DayDetailModal from './DayDetailModal';

import { Box, IconButton, Typography, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { foodLogs } = useApp();

  const renderHeader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" component="h2">
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    );
  };

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', my: 1 }}>
        {days.map(day => <Typography key={day} variant="caption" color="text.secondary">{day}</Typography>)}
      </Box>
    );
  };

  const getHealthColor = (avgScore: number) => {
    if (avgScore >= 8) return 'success.main';
    if (avgScore >= 6) return 'success.light';
    if (avgScore >= 4) return 'warning.main';
    if (avgScore > 0) return 'error.main';
    return 'grey.400';
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayLog = foodLogs[dateKey] || [];
          const totalCalories = dayLog.reduce((sum, entry) => sum + entry.calories, 0);
          const avgHealthScore = dayLog.length > 0 ? dayLog.reduce((sum, entry) => sum + entry.healthRating, 0) / dayLog.length : 0;
          
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          
          return (
            <Box
              key={day.toString()}
              onClick={() => {if (dayLog.length > 0) setSelectedDate(day)}}
              sx={{
                aspectRatio: '1',
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 2,
                cursor: dayLog.length > 0 ? 'pointer' : 'default',
                bgcolor: isCurrentMonth ? 'background.paper' : 'action.hover',
                color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                border: isCurrentDay ? '2px solid' : '1px solid',
                borderColor: isCurrentDay ? 'primary.main' : 'divider',
                '&:hover': {
                  bgcolor: dayLog.length > 0 ? 'action.selected' : '',
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: isCurrentDay ? 'bold' : 'normal', textAlign:'center' }}>{format(day, 'd')}</Typography>
              {dayLog.length > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ height: 8, width: 8, mx: 'auto', borderRadius: '50%', bgcolor: getHealthColor(avgHealthScore), mb: 0.5 }}></Box>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{totalCalories}</Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };
  
  return (
    <Paper elevation={2} sx={{ p: 1 }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <DayDetailModal date={selectedDate} onClose={() => setSelectedDate(null)} />
    </Paper>
  );
};

export default CalendarView;