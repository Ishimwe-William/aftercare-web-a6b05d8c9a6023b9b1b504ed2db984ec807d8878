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
    color: '#FDDE11',
    marginBottom: '24px',
});

export default function NotFoundPage() {
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
                    404
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        color: '#000000',
                        mb: 4
                    }}
                >
                    Oops! Resource not found.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                    sx={{
                        backgroundColor: '#FDDE11',
                        color: '#000000',
                        '&:hover': {
                            backgroundColor: '#FCDB10',
                        },
                    }}
                >
                    Go Back
                </Button>
            </Box>
        </StyledContainer>
    );
}