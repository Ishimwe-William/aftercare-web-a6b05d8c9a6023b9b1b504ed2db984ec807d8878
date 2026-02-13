import {Outlet} from 'react-router-dom';
import {Box} from '@mui/material';

const AuthLayout = () => (
    <Box>
        <Outlet/>
    </Box>
);

export default AuthLayout;