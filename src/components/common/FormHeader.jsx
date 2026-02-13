import { Typography } from '@mui/material';

export const FormHeader = ({ title, subtitle }) => {
    return (
        <>
            <Typography
                component="h1"
                variant="h4"
                sx={{
                    width: '100%',
                    fontSize: 'clamp(2rem, 10vw, 2.15rem)',
                    fontWeight: 600,
                    textAlign: 'center',
                    color: '#000000',
                    mb: 2
                }}
            >
                {title}
            </Typography>
            {subtitle && (
                <Typography sx={{ mb: 2, color: '#6b7280', fontStyle: 'italic', fontSize: '14px' }}>
                    {subtitle}
                </Typography>
            )}
        </>
    );
};