import { useState, useCallback } from 'react';

export const useDrawer = (initialState = false) => {
    const [open, setOpen] = useState(initialState);

    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);
    const toggleDrawer = useCallback(() => setOpen(prev => !prev), []);

    return {
        open,
        handleOpen,
        handleClose,
        toggleDrawer,
        setOpen
    };
};