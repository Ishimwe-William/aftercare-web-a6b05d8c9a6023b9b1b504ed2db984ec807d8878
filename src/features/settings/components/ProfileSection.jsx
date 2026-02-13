import React, {useState, useEffect} from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import {Save, Send} from '@mui/icons-material';
import {useDispatch} from 'react-redux';
import {useAuth} from '../../auth/hooks/useAuth';
import {updateProfile} from '../settingsSlice';
import {forgotPassword} from "../../auth/authSlice";

const ProfileSection = () => {
    const {user} = useAuth();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({type: '', text: ''});
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({type: '', text: ''});

        try {
            await dispatch(updateProfile({
                userId: user.id,
                profileData: formData,
                currentUser: user
            })).unwrap();
            setMessage({type: 'success', text: 'Profile updated successfully!'});
        } catch (error) {
            setMessage({
                type: 'error',
                text: error || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendReset = async () => {
        try {
            setLoading(true);
            await dispatch(forgotPassword(user.email));
            setMessage({
                type: 'success',
                text: 'Reset link sent successfully! Check your email for further instructions.'
            });
        } catch (e) {
            setMessage({
                type: 'error',
                text: e.response?.data?.message || "Failed to send reset link. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Profile Information
            </Typography>

            {message.text && (
                <Alert severity={message.type} sx={{mb: 3}}>
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={user?.email || ''}
                        disabled
                        helperText="Email cannot be changed"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Role"
                        value={user?.roles?.[0]?.replace('ROLE_', '') || 'STAFF'}
                        disabled
                        helperText="Role cannot be changed"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={user?.username || ''}
                        disabled
                        helperText="Username cannot be changed"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>

            <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20}/> : <Save/>}
                disabled={loading}
                sx={{mt: 3, mr: 3}}
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
                variant="outlined"
                onClick={handleSendReset}
                startIcon={loading ? <CircularProgress size={20}/> : <Send/>}
                disabled={loading}
                sx={{mt: 3, mr: 3}}
            >
                {loading ? 'Sending...' : 'Send Password Reset Link'}
            </Button>
        </Box>
    );
};

export default ProfileSection;