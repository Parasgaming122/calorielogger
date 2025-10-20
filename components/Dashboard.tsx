import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { format, startOfWeek, addDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Grid, Box, LinearProgress } from '@mui/material';
import { lighten } from '@mui/material/styles';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EggIcon from '@mui/icons-material/Egg';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DayDetailModal from './DayDetailModal';

const Dashboard: React.FC = () => {
  const { foodLogs, goals } = useApp();
  const [modalDate, setModalDate] = useState<Date | null>(null);

  const todayStats = useMemo(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const todayLog = foodLogs[todayKey] || [];
    const stats = todayLog.reduce((acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fats += entry.fats;
      acc.healthScoreSum += entry.healthRating;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, healthScoreSum: 0 });

    const avgHealthScore = todayLog.length > 0 ? (stats.healthScoreSum / todayLog.length) : 0;
    return { ...stats, avgHealthScore };
  }, [foodLogs]);

  const weeklyData = useMemo(() => {
    const data = [];
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayLog = foodLogs[dayKey] || [];
      const totalCalories = dayLog.reduce((sum, entry) => sum + entry.calories, 0);
      data.push({
        name: format(day, 'EEE'),
        calories: totalCalories,
        date: day,
      });
    }
    return data;
  }, [foodLogs]);

  const onBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const date = data.activePayload[0].payload.date;
      setModalDate(date);
    }
  };
  
  const getHealthMessage = (score: number) => {
      if (score >= 8) return { text: "Excellent!", color: "success.main" };
      if (score >= 6) return { text: "Good!", color: "success.light" };
      if (score >= 4) return { text: "Could be better.", color: "warning.main" };
      if (score > 0) return { text: "Needs improvement.", color: "error.main" };
      return { text: "No entries yet.", color: "text.secondary" };
  }
  
  const healthStatus = getHealthMessage(todayStats.avgHealthScore);
  const calorieProgress = Math.min((todayStats.calories / goals.calories) * 100, 100);

  return (
    <Box sx={{ spaceY: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>Today's Summary</Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Calories</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <LocalFireDepartmentIcon />
                <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', mx: 1 }}>{todayStats.calories}</Typography>
                <Typography variant="body1" color="text.secondary">/ {goals.calories} kcal</Typography>
            </Box>
        </Box>
        <LinearProgress variant="determinate" value={calorieProgress} sx={{ height: 10, borderRadius: 5 }} />
      </Paper>

      <Grid container spacing={2} mb={3}>
        <MacroCard icon={<EggIcon color="primary" />} label="Protein" value={todayStats.protein} goal={goals.protein} unit="g" />
        <MacroCard icon={<BreakfastDiningIcon color="secondary"/>} label="Carbs" value={todayStats.carbs} goal={goals.carbs} unit="g" />
        <MacroCard icon={<WaterDropIcon color="warning" />} label="Fats" value={todayStats.fats} goal={goals.fats} unit="g" />
      </Grid>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Daily Health Score</Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: healthStatus.color }}>{healthStatus.text}</Typography>
          <Typography variant="caption" color="text.secondary">Based on the nutritional quality of your food choices today.</Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, height: 300 }}>
        <Typography variant="h6" gutterBottom>This Week's Calorie Trend</Typography>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={onBarClick}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'text.secondary' }} />
              <YAxis tick={{ fill: 'text.secondary' }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'background.paper', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Bar dataKey="calories" fill="#14b8a6" name="Calories" radius={[4, 4, 0, 0]} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
      </Paper>
      <DayDetailModal date={modalDate} onClose={() => setModalDate(null)} />
    </Box>
  );
};

type MuiColor = 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success' | 'inherit' | 'action' | 'disabled' | undefined;

interface MacroCardProps {
    icon: React.ReactElement<{ color?: MuiColor }>;
    label: string;
    value: number;
    goal: number;
    unit: string;
}

const MacroCard: React.FC<MacroCardProps> = ({ icon, label, value, goal, unit }) => {
    const progress = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    const iconColorKey = icon.props.color || 'primary';

    return (
        <Grid item xs={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <Box sx={(theme) => {
                    let mainColor = theme.palette.primary.main;
                    if (iconColorKey && iconColorKey !== 'inherit' && iconColorKey !== 'action' && iconColorKey !== 'disabled' && theme.palette[iconColorKey]) {
                      mainColor = theme.palette[iconColorKey].main;
                    }
                    return {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: `${progress}%`,
                        height: '100%',
                        bgcolor: lighten(mainColor, 0.8),
                        zIndex: 0,
                        transition: 'width 0.5s ease-in-out',
                    };
                }}/>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {icon}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{label}</Typography>
                    <Typography variant="h6">{value}/{goal}{unit}</Typography>
                </Box>
            </Paper>
        </Grid>
    )
};

export default Dashboard;