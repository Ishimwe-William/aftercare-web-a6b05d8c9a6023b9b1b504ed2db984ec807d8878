import React from 'react';
import { Button, Grid } from '@mui/material';
import { Add, Inventory, ElectricBike } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item>
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/tasks/create')}>
                    Assign New Task
                </Button>
            </Grid>
            <Grid item>
                <Button variant="contained" startIcon={<Inventory />} onClick={() => navigate('/inventory')}>
                    View Inventory
                </Button>
            </Grid>
            <Grid item>
                <Button variant="contained" startIcon={<ElectricBike />} onClick={() => navigate('/vehicles')}>
                    Manage Vehicles
                </Button>
            </Grid>
        </Grid>
    );
};

export default QuickActions;