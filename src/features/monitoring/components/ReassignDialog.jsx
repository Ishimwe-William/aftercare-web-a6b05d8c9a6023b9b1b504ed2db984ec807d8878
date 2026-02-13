import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

const ReassignDialog = ({open, onClose, selectedCase, technicians, newTechnicianId, setNewTechnicianId, onSubmit}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Reassign Technician</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
                    Current: {selectedCase?.technician}
                </Typography>
                <FormControl fullWidth sx={{mt: 1}}>
                    <InputLabel>Select New Technician</InputLabel>
                    <Select
                        value={newTechnicianId}
                        onChange={(e) => setNewTechnicianId(e.target.value)}
                        label="Select New Technician"
                        variant='outlined'>
                        {technicians.map(t => (
                            !t.status ? (
                                <MenuItem key={t.id} value={t.id} disabled>
                                    {t.fullName} (Inactive)
                                </MenuItem>
                            ) : (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.fullName}
                                </MenuItem>
                            )
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onSubmit} disabled={!newTechnicianId}>Reassign</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReassignDialog;