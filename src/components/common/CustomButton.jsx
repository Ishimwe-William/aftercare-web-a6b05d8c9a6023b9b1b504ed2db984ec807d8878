import { Button } from '@mui/material';

export const CustomButton = ({
                                 variant = 'primary',
                                 children,
                                 disabled = false,
                                 onClick,
                                 fullWidth = false,
                                 startIcon,
                                 type = 'button',
                                 ...props
                             }) => {
    const getButtonStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    height: '48px',
                    backgroundColor: '#FDDE11',
                    color: '#000000',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&:hover': {
                        backgroundColor: '#f5d90a'
                    },
                    '&:disabled': {
                        backgroundColor: '#d1d5db',
                        color: '#6b7280'
                    }
                };
            case 'secondary':
                return {
                    height: '48px',
                    backgroundColor: '#D9D9D9',
                    color: '#000000',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&:hover': {
                        backgroundColor: '#D9D9D9'
                    }
                };
            case 'outlined':
                return {
                    height: '48px',
                    borderColor: '#d1d5db',
                    borderWidth: 2,
                    color: '#000000',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&:hover': {
                        borderColor: '#9ca3af',
                        backgroundColor: '#f9fafb'
                    }
                };
            default:
                return {};
        }
    };

    return (
        <Button
            variant={variant === 'outlined' ? 'outlined' : 'contained'}
            onClick={onClick}
            disabled={disabled}
            fullWidth={fullWidth}
            startIcon={startIcon}
            type={type}
            sx={getButtonStyles()}
            {...props}
        >
            {children}
        </Button>
    );
};
