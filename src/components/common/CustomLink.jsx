import { Link } from '@mui/material';

export const CustomLink = ({ children, onClick, ...props }) => {
    return (
        <Link
            component="button"
            type="button"
            onClick={onClick}
            variant="body2"
            sx={{
                color: '#2563eb',
                textDecorationLine: 'underline',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                ...props.sx
            }}
            {...props}
        >
            {children}
        </Link>
    );
};