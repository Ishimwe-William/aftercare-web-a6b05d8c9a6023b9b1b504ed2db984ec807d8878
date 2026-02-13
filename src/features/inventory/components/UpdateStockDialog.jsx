import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Typography,
    Box,
    IconButton,
    Chip,
    Paper,
    Alert
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const UpdateStockDialog = ({ open, part, onClose, onSubmit }) => {
    const [quantity, setQuantity] = useState(0);
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (open && part) {
            setQuantity(part.quantityAvailable);
            setReason('');
        }
    }, [open, part]);

    if (!part) return null;

    const diff = quantity - part.quantityAvailable;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Update Stock — {part.name}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} mt={2}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">Current Stock</Typography>
                        <Typography variant="h5" fontWeight="bold">{part.quantityAvailable} units</Typography>
                        {diff !== 0 && (
                            <Box mt={1} display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Change</Typography>
                                <Chip label={`${diff > 0 ? '+' : ''}${diff}`} color={diff > 0 ? 'success' : 'error'} />
                            </Box>
                        )}
                    </Paper>

                    <Box>
                        <Typography gutterBottom>Adjust Quantity</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton color="error" onClick={() => setQuantity(Math.max(0, quantity - 10))}><Remove /></IconButton>
                            <IconButton color="error" onClick={() => setQuantity(Math.max(0, quantity - 1))}><Remove /></IconButton>
                            <TextField value={quantity} onChange={e => setQuantity(Math.max(0, +e.target.value || 0))} type="number" sx={{ width: 120 }} />
                            <IconButton color="success" onClick={() => setQuantity(quantity + 1)}><Add /></IconButton>
                            <IconButton color="success" onClick={() => setQuantity(quantity + 10)}><Add /></IconButton>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography gutterBottom>Quick Actions</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {[-10, -5, -1, +1, +5, +10].map(n => (
                                <Button key={n} size="small" variant="outlined" onClick={() => setQuantity(Math.max(0, quantity + n))}>
                                    {n > 0 ? '+' : ''}{n}
                                </Button>
                            ))}
                            <Button size="small" variant="outlined" color="error" onClick={() => setQuantity(0)}>Clear All</Button>
                        </Stack>
                    </Box>

                    <TextField label="Reason (optional)" multiline rows={2} fullWidth value={reason} onChange={e => setReason(e.target.value)} placeholder="Restock, correction, damaged..." />

                    {part.quantityAvailable <= part.lowStockThreshold && (
                        <Alert severity="warning">This part is at or below low stock threshold!</Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={() => onSubmit(part.id, { targetQuantity: quantity, reason })}>
                    Update Stock
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateStockDialog;