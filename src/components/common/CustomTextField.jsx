import { TextField, FormControl, FormLabel } from '@mui/material';

export const CustomTextField = ({
                                    label,
                                    id,
                                    name,
                                    type = 'text',
                                    placeholder,
                                    value,
                                    onChange,
                                    error,
                                    helperText,
                                    autoComplete,
                                    onKeyUp,
                                    ...props
                                }) => {
    const textFieldStyles = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            '& fieldset': { borderColor: '#d1d5db', borderWidth: 2 },
            '&:hover fieldset': { borderColor: '#9ca3af' },
            '&.Mui-focused fieldset': { borderColor: '#f5d90a' }
        }
    };

    return (
        <FormControl fullWidth {...props}>
            {label && (
                <FormLabel htmlFor={id} sx={{ color: '#000000', fontWeight: 500, mb: 1 }}>
                    {label}
                </FormLabel>
            )}
            <TextField
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyUp={onKeyUp}
                error={!!error}
                helperText={error || helperText}
                autoComplete={autoComplete}
                fullWidth
                variant="outlined"
                sx={textFieldStyles}
            />
        </FormControl>
    );
};
