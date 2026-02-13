import * as React from 'react';
import {Box, Typography, Button, Container} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useNavigate} from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const StyledContainer = styled(Container)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    py: 4,
});

const StyledIcon = styled(ErrorOutlineIcon)({
    fontSize: '120px',
    color: '#2196f3',
    marginBottom: '24px',
});

export default function NetworkErrorPage() {
    const navigate = useNavigate();

    return (
        <StyledContainer maxWidth="md">
            <Box>
                <StyledIcon/>
                <Typography
                    variant="h1"
                    sx={{
                        color: '#000000',
                        fontSize: 'clamp(4rem, 10vw, 6rem)',
                        fontWeight: 600,
                        mb: 2
                    }}
                >
                    Network Error
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        color: '#000000',
                        mb: 4
                    }}
                >
                    Please check your internet connection and try again.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                    sx={{
                        backgroundColor: '#2196f3',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: '#1e88e5',
                        },
                    }}
                >
                    Go Back
                </Button>
            </Box>
        </StyledContainer>
    );
}