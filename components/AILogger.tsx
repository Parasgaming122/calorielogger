
import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../App';
import { analyzeText, analyzeImage, getNutritionalFeedback } from '../services/geminiService';
import { type FoodEntry } from '../types';
import { format, subDays, parseISO } from 'date-fns';

import { Box, Button, TextField, CircularProgress, Alert, Paper, Typography, IconButton, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Checkbox, ListItemIcon } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

interface AILoggerProps {
  onLogSuccess: () => void;
}

const AILogger: React.FC<AILoggerProps> = ({ onLogSuccess }) => {
  const { addFoodEntry, apiKey, showSnackbar, foodLogs } = useApp();
  const [textInput, setTextInput] = useState('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkedMeals, setCheckedMeals] = useState<Record<string, FoodEntry[]>>({});

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage({
        file,
        preview: URL.createObjectURL(file),
      });
      setError(null);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async () => {
    if (!textInput && !image) {
      setError("Please enter a description or upload an image.");
      return;
    }
    if (!apiKey) {
      setError("Please set your API key in the settings.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let results: FoodEntry[] = [];
      if (image) {
        const base64Image = await toBase64(image.file);
        results = await analyzeImage(base64Image, image.file.type, apiKey, textInput || "Analyze the meal in this image.");
        if (results.length > 0) {
            results.forEach(entry => entry.image = image.preview);
        }
      } else if (textInput) {
        results = await analyzeText(textInput, apiKey);
      }

      if (results && results.length > 0) {
        results.forEach(entry => addFoodEntry(entry));
        setTextInput('');
        setImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        getNutritionalFeedback(results, apiKey)
            .then(feedback => showSnackbar(feedback, 'info'))
            .catch(err => console.error("Could not get feedback:", err));

        onLogSuccess();
      } else {
        setError("Could not identify any food items. Please try again with a clearer description or image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const recentDaysWithLogs = useMemo(() => {
    const days = [];
    for(let i=0; i < 5; i++) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'yyyy-MM-dd');
        if (foodLogs[dateKey] && foodLogs[dateKey].length > 0) {
            days.push({ dateKey, entries: foodLogs[dateKey] });
        }
    }
    return days;
  }, [foodLogs]);

  const handleMealToggle = (dateKey: string, entry: FoodEntry) => {
    setCheckedMeals(prev => {
        const newChecked = {...prev};
        const dayMeals = newChecked[dateKey] || [];
        const existingIndex = dayMeals.findIndex(item => item.foodItem === entry.foodItem && item.quantity === entry.quantity);

        if (existingIndex > -1) {
            newChecked[dateKey] = dayMeals.filter((_, index) => index !== existingIndex);
        } else {
            newChecked[dateKey] = [...dayMeals, entry];
        }
        return newChecked;
    });
  };

  const handleCopyMeals = () => {
    let count = 0;
    Object.values(checkedMeals).forEach(day => {
        day.forEach(entry => {
            addFoodEntry(entry);
            count++;
        });
    });
    if (count > 0) {
        showSnackbar(`Successfully copied ${count} meal(s) to today's log.`, 'success');
        setCheckedMeals({});
        onLogSuccess();
    }
  };
  
  return (
    <>
      <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom>Log Your Meal</Typography>
        
        <Box sx={{ width: '100%', my: 2 }}>
          {image ? (
            <Box sx={{ position: 'relative' }}>
              <img src={image.preview} alt="Meal preview" style={{ borderRadius: 8, width: '100%', maxHeight: 240, objectFit: 'cover' }} />
              <IconButton
                onClick={() => setImage(null)}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)'} }}
              >
                <CloseIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<PhotoCamera />}
              sx={{ height: 160, borderStyle: 'dashed' }}
            >
              Upload a photo
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                hidden
              />
            </Button>
          )}
          
          <TextField
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or describe your meal... e.g., '2 eggs and a slice of toast'"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            sx={{ my: 2 }}
            disabled={isLoading}
          />

          <Box sx={{ position: 'relative' }}>
              <Button
                  variant="contained"
                  fullWidth
                  endIcon={<SendIcon />}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  size="large"
              >
                  Analyze Meal
              </Button>
              {isLoading && (
                  <CircularProgress
                      size={24}
                      sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px',
                      }}
                  />
              )}
          </Box>

          {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
              </Alert>
          )}
        </Box>
      </Paper>
      
      {recentDaysWithLogs.length > 0 && <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Copy from Recent</Typography>
        {recentDaysWithLogs.map(({ dateKey, entries }) => (
            <Accordion key={dateKey}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{format(parseISO(dateKey), "eeee, MMMM d")}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <List dense>
                        {entries.map((entry, index) => (
                           <ListItem key={index} secondaryAction={<Checkbox edge="end" onChange={() => handleMealToggle(dateKey, entry)} checked={!!checkedMeals[dateKey]?.some(item => item.foodItem === entry.foodItem && item.quantity === entry.quantity)} />}>
                             <ListItemIcon><RestaurantMenuIcon fontSize="small" /></ListItemIcon>
                             <ListItemText primary={entry.foodItem} secondary={entry.quantity} />
                           </ListItem>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
        ))}
        <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleCopyMeals}
            sx={{ mt: 2 }}
            disabled={Object.values(checkedMeals).every(day => day.length === 0)}
        >
            Add Selected Items to Today
        </Button>
      </Paper>}
    </>
  );
};

export default AILogger;