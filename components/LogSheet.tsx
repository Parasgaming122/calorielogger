
import React, { useMemo, useState, useCallback } from 'react';
import { useApp } from '../App';
import { format, parseISO } from 'date-fns';
import { type FoodEntry } from '../types';

import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    TableSortLabel, IconButton, TextField, Box, Button, Typography 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

type SortKey = keyof FoodEntry | 'date';
type SortDirection = 'asc' | 'desc';

const LogSheet: React.FC = () => {
    const { foodLogs, updateFoodEntry, removeFoodEntry } = useApp();
    const [editingCell, setEditingCell] = useState<{ dateKey: string; entryIndex: number; field: keyof FoodEntry } | null>(null);
    const [editValue, setEditValue] = useState<string | number>('');

    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'desc' });

    const flatLogs = useMemo(() => {
        return Object.entries(foodLogs)
            .flatMap(([date, entries]) => entries.map((entry, index) => ({ ...entry, date, originalIndex: index })));
    }, [foodLogs]);

    const sortedLogs = useMemo(() => {
        let sortableItems = [...flatLogs];
        sortableItems.sort((a, b) => {
            let aValue, bValue;
            if (sortConfig.key === 'date') {
                aValue = parseISO(a.date);
                bValue = parseISO(b.date);
            } else {
                aValue = a[sortConfig.key as keyof FoodEntry];
                bValue = b[sortConfig.key as keyof FoodEntry];
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [flatLogs, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const handleEditStart = (dateKey: string, entryIndex: number, field: keyof FoodEntry, value: string | number) => {
        setEditingCell({ dateKey, entryIndex, field });
        setEditValue(value);
    };

    const handleEditCancel = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const handleEditSave = () => {
        if (!editingCell) return;
        const { dateKey, entryIndex, field } = editingCell;
        const currentEntry = foodLogs[dateKey][entryIndex];
        
        let finalValue: string | number = editValue;
        if (typeof currentEntry[field] === 'number') {
            finalValue = Number(editValue);
            if (isNaN(finalValue)) {
                console.error("Invalid number format");
                return;
            }
        }
        
        const updatedEntry = { ...currentEntry, [field]: finalValue };
        updateFoodEntry(dateKey, entryIndex, updatedEntry);
        handleEditCancel();
    };

    const exportToCSV = useCallback(() => {
        const headers = ['Date', 'Food Item', 'Quantity', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)', 'Health Rating'];
        const rows = sortedLogs.map(log => [
            log.date,
            `"${log.foodItem.replace(/"/g, '""')}"`,
            `"${log.quantity.replace(/"/g, '""')}"`,
            log.calories,
            log.protein,
            log.carbs,
            log.fats,
            log.healthRating,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `food_log_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [sortedLogs]);
    
    const renderCellContent = (log: typeof sortedLogs[0], field: keyof FoodEntry | 'date') => {
        const { date, originalIndex } = log;
        const isEditing = editingCell?.dateKey === date && editingCell?.entryIndex === originalIndex && editingCell?.field === field;
        
        const value = field === 'date' ? log.date : log[field];

        if (isEditing) {
            return (
                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                        }}
                        sx={{'.MuiInputBase-input': { p: '4px 8px' }}}
                    />
                    <IconButton onClick={handleEditSave} size="small" color="success"><CheckIcon fontSize="inherit" /></IconButton>
                    <IconButton onClick={handleEditCancel} size="small" color="error"><CloseIcon fontSize="inherit" /></IconButton>
                </Box>
            )
        }
        
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', '& .edit-btn': { visibility: 'hidden' }, '&:hover .edit-btn': { visibility: 'visible' } }}>
                <Typography variant="body2" noWrap>{field === 'date' ? format(parseISO(value as string), 'MMM d, yyyy') : value}</Typography>
                 {field !== 'date' && (
                    <IconButton onClick={() => handleEditStart(date, originalIndex, field, value)} size="small" className="edit-btn" sx={{ ml: 1 }}>
                        <EditIcon fontSize="inherit" />
                    </IconButton>
                 )}
            </Box>
        )
    };
    
    const headers: { key: SortKey, label: string, isNumeric?: boolean }[] = [
        { key: 'date', label: 'Date' },
        { key: 'foodItem', label: 'Food' },
        { key: 'quantity', label: 'Qty' },
        { key: 'calories', label: 'Cals', isNumeric: true },
        { key: 'protein', label: 'P (g)', isNumeric: true },
        { key: 'carbs', label: 'C (g)', isNumeric: true },
        { key: 'fats', label: 'F (g)', isNumeric: true },
        { key: 'healthRating', label: 'Rating', isNumeric: true },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h2">Log Sheet</Typography>
                <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={exportToCSV}>
                    Export CSV
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small" aria-label="food log sheet">
                    <TableHead>
                        <TableRow>
                            {headers.map(({ key, label, isNumeric }) => (
                                <TableCell key={key} align={isNumeric ? 'right' : 'left'}>
                                    <TableSortLabel
                                        active={sortConfig.key === key}
                                        direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
                                        onClick={() => requestSort(key)}
                                    >
                                        {label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedLogs.map((log) => (
                            <TableRow key={`${log.date}-${log.originalIndex}`} hover>
                                {headers.map(({ key, isNumeric }) => (
                                    <TableCell key={key} align={isNumeric ? 'right' : 'left'}>
                                        {renderCellContent(log, key)}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <IconButton onClick={() => removeFoodEntry(log.date, log.originalIndex)} color="error" size="small">
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {sortedLogs.length === 0 && <Typography sx={{ textAlign: 'center', p: 4 }}>No food entries yet. Add one to see it here!</Typography>}
            </TableContainer>
        </Box>
    );
};

export default LogSheet;
