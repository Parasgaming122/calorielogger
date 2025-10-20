
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { useTheme } from '../ThemeContext';
import { Modal, Box, Paper, Typography, TextField, Button, Switch, FormControlLabel, Grid } from '@mui/material';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey, goals, setGoals } = useApp();
  const { mode, toggleTheme } = useTheme();
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [localGoals, setLocalGoals] = useState(goals);

  useEffect(() => {
    setLocalApiKey(apiKey || '');
    setLocalGoals(goals);
  }, [apiKey, goals, isOpen]);

  const handleSave = () => {
    setApiKey(localApiKey);
    setGoals(localGoals);
    onClose();
  };
  
  const handleGoalChange = (field: keyof typeof localGoals, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalGoals(prev => ({ ...prev, [field]: numValue }));
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="settings-modal-title"
    >
      <Paper sx={modalStyle}>
        <Typography id="settings-modal-title" variant="h6" component="h2" gutterBottom>
          Settings
        </Typography>
        
        <TextField
          label="Gemini API Key"
          variant="outlined"
          fullWidth
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          margin="normal"
          type="password"
          helperText="Your key is stored locally in your browser."
        />
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Daily Goals</Typography>
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <TextField label="Calories (kcal)" type="number" value={localGoals.calories} onChange={e => handleGoalChange('calories', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
                 <TextField label="Protein (g)" type="number" value={localGoals.protein} onChange={e => handleGoalChange('protein', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
                 <TextField label="Carbs (g)" type="number" value={localGoals.carbs} onChange={e => handleGoalChange('carbs', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
                 <TextField label="Fats (g)" type="number" value={localGoals.fats} onChange={e => handleGoalChange('fats', e.target.value)} fullWidth />
            </Grid>
        </Grid>
        
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
          label="Dark Mode"
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default SettingsModal;