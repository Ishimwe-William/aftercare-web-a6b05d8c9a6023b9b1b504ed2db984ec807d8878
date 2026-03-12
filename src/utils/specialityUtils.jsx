// src/utils/specialityUtils.js
// Single source of truth for speciality colours + chip component.
// Import this instead of re-defining in every file.

import React from 'react';
import { Chip, Typography } from '@mui/material';

export const SPECIALITY_COLORS = {
    'Battery Systems':     '#4caf50', // Green
    'Electric Motor':      '#ff9800', // Orange
    'High Voltage':        '#f44336', // Red
    'Electronics & IoT':   '#9c27b0', // Purple
    'Brakes':              '#ff8a65', // Deep Orange (Light)
    'Suspension':          '#ba68c8', // Purple (Light)
    'Tyres & Wheels':      '#81c784', // Green (Light)
    'Bodywork & Chassis':  '#4dd0e1', // Cyan
    'General Maintenance': '#90a4ae', // Blue Grey
};

export const SPECIALITY_OPTIONS = [
    'Battery Systems',        // BMS, battery health, swapping issues
    'Electric Motor',         // Hub motor, mid-drive motor, drivetrain
    'High Voltage',           // Controllers, main wiring harnesses, charging ports
    'Electronics & IoT',      // Smart lockboxes, telematics, dashboard displays
    'Brakes',                 // Brake pads, rotors, hydraulics
    'Suspension',             // Forks, shocks, steering
    'Tyres & Wheels',         // Punctures, wheel truing, replacements
    'Bodywork & Chassis',     // Frame, fairings, seats, physical damage
    'General Maintenance'     // Standard preventative checks
];

/**
 * Coloured chip for a technician's speciality.
 * Renders a dash when speciality is null/empty.
 */
export const SpecialityChip = ({ speciality, sx = {} }) => {
    if (!speciality) {
        return (
            <Typography variant="caption" color="text.secondary">—</Typography>
        );
    }
    const bg = SPECIALITY_COLORS[speciality] ?? '#90a4ae';
    return (
        <Chip
            label={speciality}
            size="small"
            sx={{
                backgroundColor: bg,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.68rem',
                ...sx
            }}
        />
    );
};