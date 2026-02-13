import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import {Close as CloseIcon} from '@mui/icons-material';
import JsBarcode from 'jsbarcode';
import {
    createMotorcycle,
    updateMotorcycle,
    fetchAllMotorcycles,
    fetchMotorcycleStatistics
} from '../motorcycleSlice';

const VehicleDialog = ({open, mode, motorcycle, onClose}) => {
    const dispatch = useDispatch();
    const {createLoading, createError, updateLoading, updateError, motorcycles: allMotorcycles} = useSelector(
        (state) => state.motorcycles
    );

    const [formData, setFormData] = useState({
        barcode: '',
        model: '',
        plateNumber: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        lastServiceDate: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [barcodeSvg, setBarcodeSvg] = useState('');

    // Reset form when dialog opens
    useEffect(() => {
        if (motorcycle && mode === 'edit') {
            setFormData({
                barcode: motorcycle.qrCode || '',
                model: motorcycle.model || '',
                plateNumber: motorcycle.plateNumber || '',
                ownerName: motorcycle.ownerName || '',
                ownerPhone: motorcycle.ownerPhone || '',
                ownerEmail: motorcycle.ownerEmail || '',
                lastServiceDate: motorcycle.lastServiceDate ? motorcycle.lastServiceDate.split('T')[0] : ''
            });
        } else {
            setFormData({
                barcode: '',
                model: '',
                plateNumber: '',
                ownerName: '',
                ownerPhone: '',
                ownerEmail: '',
                lastServiceDate: ''
            });
        }
        setFormErrors({});
        setSubmitSuccess(false);
        setBarcodeSvg('');
    }, [motorcycle, mode, open]);

    // Generate barcode preview
    useEffect(() => {
        if (formData.barcode) {
            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, formData.barcode, {
                    format: 'CODE128',
                    width: 2,
                    height: 70,
                    displayValue: true,
                    fontSize: 18,
                    margin: 10,
                    background: '#ffffff',
                    lineColor: '#000000'
                });
                setBarcodeSvg(canvas.toDataURL('image/png'));
            } catch (err) {
                setBarcodeSvg('');
            }
        } else {
            setBarcodeSvg('');
        }
    }, [formData.barcode]);

    // Generate unique AMPV-XXXX barcode
    const generateBarcode = () => {
        const usedNumbers = allMotorcycles
            .map(m => {
                const match = (m.qrCode || '').match(/^AMPV-0*(\d+)$/i);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter(n => n !== null);

        let nextNumber = 1;
        while (usedNumbers.includes(nextNumber)) {
            nextNumber++;
        }

        const padded = String(nextNumber).padStart(4, '0');
        const newBarcode = `AMPV-${padded}`;

        setFormData(prev => ({...prev, barcode: newBarcode}));
        setFormErrors(prev => ({...prev, barcode: ''}));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.barcode.trim()) errors.barcode = 'Barcode is required';
        if (!formData.model.trim()) errors.model = 'Model is required';
        if (!formData.plateNumber.trim()) errors.plateNumber = 'Plate Number is required';
        if (formData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
            errors.ownerEmail = 'Invalid email format';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const payload = {
            qrCode: formData.barcode, // backend field
            model: formData.model,
            plateNumber: formData.plateNumber,
            ownerName: formData.ownerName,
            ownerPhone: formData.ownerPhone,
            ownerEmail: formData.ownerEmail,
        };

        if (formData.lastServiceDate) {
            payload.lastServiceDate = formData.lastServiceDate + 'T00:00:00'
        }

        try {
            if (mode === 'create') {
                await dispatch(createMotorcycle(payload)).unwrap();
            } else {
                await dispatch(updateMotorcycle({id: motorcycle.id, data: payload})).unwrap();
            }

            setSubmitSuccess(true);
            dispatch(fetchAllMotorcycles({page: 0, size: 1000}));
            dispatch(fetchMotorcycleStatistics());

            setTimeout(() => onClose(), 1500);
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const handleChange = (field) => (e) => {
        setFormData({...formData, [field]: e.target.value});
        if (formErrors[field]) {
            setFormErrors({...formErrors, [field]: ''});
        }
    };

    const loading = createLoading || updateLoading;
    const error = createError || updateError;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant="h6">
                        {mode === 'create' ? 'Add New Motorcycle' : 'Edit Motorcycle'}
                    </Typography>
                    <IconButton onClick={onClose} size="small" disabled={loading}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {submitSuccess && (
                    <Alert severity="success" sx={{mb: 2}}>
                        Motorcycle {mode === 'create' ? 'created' : 'updated'} successfully!
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {typeof error === 'string' ? error : error.message || 'Operation failed'}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    {/* Barcode + Generate */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{display: 'flex', gap: 1, alignItems: 'flex-start'}}>
                            <TextField
                                fullWidth
                                label="Barcode *"
                                value={formData.barcode}
                                onChange={handleChange('barcode')}
                                error={!!formErrors.barcode}
                                helperText={formErrors.barcode || 'e.g. AMPV-0001'}
                                disabled={loading}
                            />
                            {mode === 'create' && (
                                <Button
                                    variant="outlined"
                                    onClick={generateBarcode}
                                    disabled={loading}
                                    sx={{mt: 0.8, minWidth: 120}}
                                >
                                    Generate
                                </Button>
                            )}
                        </Box>

                        {/* Live Barcode Preview */}
                        {barcodeSvg && (
                            <Box sx={{
                                mt: 2,
                                textAlign: 'center',
                                p: 2,
                                bgcolor: '#fafafa',
                                borderRadius: 1,
                                border: '1px dashed #ccc'
                            }}>
                                <img src={barcodeSvg} alt="Barcode preview" style={{maxWidth: '100%', height: 'auto'}}/>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{mt: 1}}>
                                    {formData.barcode}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Model *"
                            value={formData.model}
                            onChange={handleChange('model')}
                            error={!!formErrors.model}
                            helperText={formErrors.model}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Plate Number *"
                            value={formData.plateNumber}
                            onChange={handleChange('plateNumber')}
                            error={!!formErrors.plateNumber}
                            helperText={formErrors.plateNumber}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Last Service Date"
                            type="date"
                            value={formData.lastServiceDate}
                            InputLabelProps={{shrink: true}}
                            disabled
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 600}}>
                            Owner Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Owner Name" value={formData.ownerName}
                                   onChange={handleChange('ownerName')} disabled={loading}/>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Owner Phone" value={formData.ownerPhone}
                                   onChange={handleChange('ownerPhone')} disabled={loading}/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Owner Email"
                            type="email"
                            value={formData.ownerEmail}
                            onChange={handleChange('ownerEmail')}
                            error={!!formErrors.ownerEmail}
                            helperText={formErrors.ownerEmail}
                            disabled={loading}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20}/>}
                >
                    {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VehicleDialog;