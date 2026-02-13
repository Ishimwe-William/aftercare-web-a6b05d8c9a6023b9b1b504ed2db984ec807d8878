import { Card, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Stack)({
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    padding: '16px',
    justifyContent: 'center',
    alignItems: 'center',
});

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    maxWidth: '450px',
    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

export const AuthCard = ({ children }) => {
    return (
        <AuthContainer>
            <StyledCard variant="outlined">
                {children}
            </StyledCard>
        </AuthContainer>
    );
};
