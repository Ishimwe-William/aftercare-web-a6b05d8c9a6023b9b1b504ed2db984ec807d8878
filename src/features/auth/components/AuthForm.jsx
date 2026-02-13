import React, {useEffect, useState} from 'react';
import {Box, Checkbox, FormControlLabel, Divider, Typography} from '@mui/material';
import {GoogleIcon} from "../../../components/layout/CustomIcons";
import ChangePasswordDialog from "./ChangePasswordDialog";
import {CustomTextField} from "../../../components/common/CustomTextField";
import {AuthCard} from "../../../components/common/AuthCard";
import {FormHeader} from "../../../components/common/FormHeader";
import {CustomButton} from "../../../components/common/CustomButton";
import {CustomLink} from "../../../components/common/CustomLink";
import {useGoogleAuth} from "../hooks/useGoogleAuth";
import {useDispatch, useSelector} from 'react-redux';
import {signInWithEmail, signUpWithEmail, clearError} from '../authSlice';
import {useNavigate} from 'react-router-dom';
import LoadingSpinner from "../../../components/common/LoadingSpinner";

export const AuthForm = ({
                             isSignUp = false,
                             onNavigateToSignIn,
                             onNavigateToSignUp
                         }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {isLoading, error, isAuthenticated} = useSelector((state) => state.auth);

    const [localErrors, setLocalErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const {promptAsync} = useGoogleAuth();

    // Clear Redux error when component mounts or when switching between forms
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch, isSignUp]);

    // Navigate to dashboard on successful authentication
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({...prev, [field]: value}));
        if (localErrors[field]) {
            setLocalErrors(prev => ({...prev, [field]: ''}));
        }
        // Clear Redux error when user starts typing
        if (error) {
            dispatch(clearError());
        }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
        }

        if (isSignUp) {
            if (!formData.firstName.trim()) {
                newErrors.firstName = 'First name is required.';
            }
            if (!formData.lastName.trim()) {
                newErrors.lastName = 'Last name is required.';
            }
        }

        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (isSignUp) {
                await dispatch(signUpWithEmail(formData)).unwrap();
                // Show success message or navigate to confirmation
                alert('Registration successful! Please check your email for verification.');
            } else {
                await dispatch(signInWithEmail({
                    email: formData.email,
                    password: formData.password
                })).unwrap();
                // Navigation will be handled by the useEffect above
            }
        } catch (error) {
            // Error is handled by Redux and will be displayed below
            console.error('Authentication error:', error);
        }
    };

    const handleGoogleSignIn = () => {
        dispatch(clearError()); // Clear any existing errors
        promptAsync();
    };

    if (isLoading) return <LoadingSpinner/>;

    return (
        <Box sx={{position: 'relative'}}>
            <AuthCard>
                <FormHeader title={isSignUp ? 'Sign Up' : 'Welcome Back'}/>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    {/* Display Redux error */}
                    {error && (
                        <Typography
                            sx={{
                                color: 'error.main',
                                textAlign: 'center',
                                padding: 1,
                                borderRadius: 1,
                                fontSize: '0.875rem'
                            }}
                        >
                            {error || 'An error occurred.'}
                        </Typography>
                    )}

                    {/* Sign Up specific fields */}
                    {isSignUp && (
                        <>
                            <CustomTextField
                                label="First Name"
                                id="firstName"
                                name="firstName"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChange={handleInputChange('firstName')}
                                error={localErrors.firstName}
                            />

                            <CustomTextField
                                label="Last Name"
                                id="lastName"
                                name="lastName"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChange={handleInputChange('lastName')}
                                error={localErrors.lastName}
                            />
                        </>
                    )}

                    <CustomTextField
                        label="Email"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={localErrors.email}
                        autoComplete="email"
                    />

                    <Box>
                        <CustomTextField
                            label="Password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            error={localErrors.password}
                            autoComplete="current-password"
                            onKeyUp={handleKeyUp}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                    sx={{
                                        color: '#000000',
                                        '&.Mui-checked': {
                                            color: '#000000',
                                        },
                                    }}
                                />
                            }
                            label="Show Password"
                            sx={{color: '#000000', mt: 1}}
                        />
                    </Box>

                    <CustomButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        fullWidth
                    >
                        {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </CustomButton>

                    {!isSignUp && (
                        <CustomLink
                            onClick={() => setShowModal(true)}
                            sx={{alignSelf: 'center'}}
                        >
                            Forgot your password?
                        </CustomLink>
                    )}

                    <Divider sx={{my: 2}}>or</Divider>

                    <CustomButton
                        variant="outlined"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        fullWidth
                        startIcon={<GoogleIcon/>}
                    >
                        Sign in with Google
                    </CustomButton>

                    <Typography sx={{textAlign: 'center', color: '#000000'}}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <CustomLink onClick={isSignUp ? onNavigateToSignIn : onNavigateToSignUp}>
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </CustomLink>
                    </Typography>
                </Box>

                <ChangePasswordDialog
                    handleCloseModal={() => setShowModal(false)}
                    showModal={showModal}
                />
            </AuthCard>
        </Box>
    );
};