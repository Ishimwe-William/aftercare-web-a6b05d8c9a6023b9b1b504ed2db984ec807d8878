import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export const CustomDialog = ({
                                 open,
                                 onClose,
                                 title,
                                 children,
                                 actions,
                                 maxWidth = 'sm',
                                 fullWidth = true
                             }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            {actions && (
                <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3 }}>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};
