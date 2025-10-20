
import React from 'react';
import { useApp } from '../App';
import { format } from 'date-fns';
import { type FoodEntry } from '../types';

import { Box, IconButton, Typography, Modal, Paper, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface DayDetailModalProps {
    date: Date | null;
    onClose: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ date, onClose }) => {
    const { getLogsForDate } = useApp();
    
    const logEntries = date ? getLogsForDate(date) : [];

    return (
        <Modal open={!!date} onClose={onClose} aria-labelledby="day-log-title">
            <Paper sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 400,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                p: 2
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography id="day-log-title" variant="h6">{date ? format(date, 'MMMM d, yyyy') : ''}</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Box sx={{ overflowY: 'auto', my: 2, spaceY: 1.5 }}>
                    {logEntries.length > 0 ? logEntries.map((entry, index) => (
                    <FoodDetailCard key={index} entry={entry} />
                    )) : <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>No entries for this day.</Typography>}
                </Box>
                {logEntries.length > 0 && <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Calories</Typography>
                    <Chip
                        icon={<LocalFireDepartmentIcon />}
                        label={`${logEntries.reduce((sum, e) => sum + e.calories, 0)} kcal`}
                        color="primary"
                        variant="filled"
                    />
                    </Box>
                </Box>}
            </Paper>
        </Modal>
    );
};


const FoodDetailCard: React.FC<{ entry: FoodEntry }> = ({ entry }) => (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{entry.foodItem}</Typography>
                <Typography variant="body2" color="text.secondary">{entry.quantity}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>{entry.calories} kcal</Typography>
                <Chip size="small" label={`Health: ${entry.healthRating}/10`} sx={{ mt: 0.5, bgcolor: entry.healthRating >= 7 ? 'success.light' : entry.healthRating >= 4 ? 'warning.light' : 'error.light' }} />
            </Box>
        </Box>
        {entry.image && <img src={entry.image} alt={entry.foodItem} style={{ marginTop: 8, borderRadius: 4, maxHeight: 160, width: '100%', objectFit: 'cover' }} />}
    </Paper>
);

export default DayDetailModal;