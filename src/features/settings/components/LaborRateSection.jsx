import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentLaborRate } from '../laborRateSlice';
import apiClient from '../../../config/apiConfig';
import { formatDate } from '../../../utils/dateUtils';

const LaborRateSection = () => {
    const dispatch = useDispatch();
    const { laborRate, isLoading } = useSelector(state => state.laborRate);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [newRate, setNewRate] = useState('');

    useEffect(() => {
        dispatch(fetchRecentLaborRate());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!newRate || parseFloat(newRate) <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid rate' });
            return;
        }

        setCreating(true);

        try {
            await apiClient.post('/labor-rates', {
                rate: parseFloat(newRate)
            });

            setMessage({ type: 'success', text: 'Labor rate updated successfully!' });
            setNewRate('');
            dispatch(fetchRecentLaborRate());
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update labor rate'
            });
        } finally {
            setCreating(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Labor Rate Management
            </Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Current Labor Rate
                                </Typography>
                                {laborRate ? (
                                    <>
                                        <Typography variant="h3" color="primary" gutterBottom>
                                            {laborRate?.rate}RWF/hr
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Effective from: {formatDate(laborRate.effectiveFrom)}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography color="text.secondary">
                                        No labor rate set
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Set New Rate
                                </Typography>
                                <Box component="form" onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="Rate per Hour"
                                        type="number"
                                        value={newRate}
                                        onChange={(e) => setNewRate(e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={creating ? <CircularProgress size={20} /> : <Save />}
                                        disabled={creating}
                                    >
                                        {creating ? 'Updating...' : 'Update Rate'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default LaborRateSection;