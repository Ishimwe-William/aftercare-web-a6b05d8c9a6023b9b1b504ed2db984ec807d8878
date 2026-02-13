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
    color: '#f44336',
    marginBottom: '24px',
});

export default function ServerErrorPage() {
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
                    500
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        color: '#000000',
                        mb: 4
                    }}
                >
                    Internal Server Error. Something went wrong on our end.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                        backgroundColor: '#f44336',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: '#d32f2f',
                        },
                    }}
                >
                    Go to Dashboard
                </Button>
            </Box>
        </StyledContainer>
    );
}