import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Alert, List, ListItem, ListItemText,
    Box, Typography, AlertTitle
} from '@mui/material';
import {Warning} from '@mui/icons-material';
import {checkSimilarParts, checkSimilarSuppliers, clearSimilarChecks} from '../inventorySlice';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const AddPartDialog = ({open, part, onClose, onSubmit}) => {
    const dispatch = useDispatch();
    const {similarParts, similarSuppliers, checkingParts, checkingSuppliers} = useSelector(state => state.inventory);

    const [formData, setFormData] = useState({
        name: '', description: '', quantityAvailable: 0, lowStockThreshold: 10,
        cost: 0, supplierName: '', supplierContact: ''
    });
    const [partTimer, setPartTimer] = useState(null);
    const [supplierTimer, setSupplierTimer] = useState(null);

    useEffect(() => {
        if (open) {
            if (part) {
                setFormData({
                    name: part.name || '',
                    description: part.description || '',
                    quantityAvailable: part.quantityAvailable || 0,
                    lowStockThreshold: part.lowStockThreshold || 10,
                    cost: part.cost || 0,
                    supplierName: part.supplierName || '',
                    supplierContact: part.supplierContact || ''
                });
            } else {
                setFormData({
                    name: '', description: '', quantityAvailable: 0, lowStockThreshold: 10,
                    cost: 0, supplierName: '', supplierContact: ''
                });
            }
            dispatch(clearSimilarChecks());
        }
        return () => {
            dispatch(clearSimilarChecks());
        };
    }, [open, part, dispatch]);

    const handleChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));

        if (field === 'name' || field === 'supplierName') {
            if (field === 'name' && partTimer) clearTimeout(partTimer);
            if (field === 'supplierName' && supplierTimer) clearTimeout(supplierTimer);

            const timer = setTimeout(() => {
                if (field === 'name') {
                    dispatch(checkSimilarParts(value));
                } else {
                    dispatch(checkSimilarSuppliers(value));
                }
            }, 500);
            field === 'name' ? setPartTimer(timer) : setSupplierTimer(timer);
        }
    };

    const handleSelectSupplier = (supplier) => {
        handleChange('supplierName', supplier.name);
        handleChange('supplierContact', supplier.contact || '');
    };

    const isEdit = !!part;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEdit ? 'Edit Part' : 'Add New Part'}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{mt: 2}}>
                    <TextField label="Part Name" required fullWidth value={formData.name}
                               onChange={e => handleChange('name', e.target.value)}/>

                    {similarParts.length > 0 && (
                        <Alert severity="warning" icon={<Warning/>}>
                            <AlertTitle>Similar Parts Exist</AlertTitle>
                            <List dense>{similarParts.map(p => (
                                <ListItem key={p.id}><ListItemText primary={p.name}
                                                                   secondary={`Stock: ${p.quantityAvailable} | Supplier: ${p.supplierName}`}/></ListItem>
                            ))}</List>
                        </Alert>
                    )}
                    {checkingParts && <Box display="flex" alignItems="center" gap={1}><LoadingSpinner/><Typography
                        variant="caption">Checking...</Typography></Box>}

                    <TextField label="Description" multiline rows={4} fullWidth value={formData.description}
                               onChange={e => handleChange('description', e.target.value)}/>

                    {isEdit ? (
                        <TextField label="Quantity Available" type="number" fullWidth value={formData.quantityAvailable}
                                   disabled/>
                    ) : (
                        <TextField label="Initial Quantity" type="number" required fullWidth
                                   value={formData.quantityAvailable}
                                   onChange={e => handleChange('quantityAvailable', +e.target.value || 0)}/>
                    )}

                    <TextField label="Low Stock Threshold" type="number" required fullWidth
                               value={formData.lowStockThreshold}
                               onChange={e => handleChange('lowStockThreshold', +e.target.value || 0)}/>

                    <TextField label="Cost per Unit (RWF)" type="number" required fullWidth value={formData.cost}
                               onChange={e => handleChange('cost', +e.target.value || 0)} inputProps={{step: 0.01}}/>

                    <TextField label="Supplier Name" required fullWidth value={formData.supplierName}
                               onChange={e => handleChange('supplierName', e.target.value)}/>

                    {similarSuppliers.length > 0 && (
                        <Alert severity="info">
                            <AlertTitle>Suggested Suppliers</AlertTitle>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                {similarSuppliers.map(s => (
                                    <Button key={s.name} size="small" variant="outlined"
                                            onClick={() => handleSelectSupplier(s)}>{s.name}</Button>
                                ))}
                            </Box>
                        </Alert>
                    )}
                    {checkingSuppliers &&
                        <Box display="flex" alignItems="center" gap={1}><LoadingSpinner/><Typography variant="caption">Checking
                            suppliers...</Typography></Box>}

                    <TextField label="Supplier Contact" fullWidth value={formData.supplierContact}
                               onChange={e => handleChange('supplierContact', e.target.value)}
                               placeholder="Email or phone"/>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={() => onSubmit(formData, isEdit ? part.id : null)}
                        disabled={!formData.name || !formData.cost || !formData.supplierName}>
                    {isEdit ? 'Update Part' : 'Add Part'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPartDialog;