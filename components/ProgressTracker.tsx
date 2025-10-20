
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, TextField, Button } from '@mui/material';

const ProgressTracker: React.FC = () => {
  const { weightLogs, addWeightEntry } = useApp();
  const [weightInput, setWeightInput] = useState('');

  const chartData = useMemo(() => {
    return Object.entries(weightLogs)
      .map(([date, data]) => ({
        date: parseISO(date),
        weight: data.weight,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({
        name: format(item.date, 'MMM d'),
        weight: item.weight,
      }));
  }, [weightLogs]);

  const handleAddWeight = () => {
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      addWeightEntry(weight);
      setWeightInput('');
    }
  };

  return (
    <Box sx={{ spaceY: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>Weight & Progress</Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Log Today's Weight</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Weight (kg/lbs)"
            type="number"
            variant="outlined"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
          />
          <Button variant="contained" onClick={handleAddWeight}>
            Save
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, height: 300 }}>
        <Typography variant="h6" gutterBottom>Weight Trend</Typography>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'text.secondary' }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'text.secondary' }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'background.paper', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography color="text.secondary">Log at least two entries to see your progress chart.</Typography>
            </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProgressTracker;
